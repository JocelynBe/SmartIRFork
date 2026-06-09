"""Control loop: periodic tick that orchestrates sensor reads, brain algorithm, actuator, and status update."""

from __future__ import annotations

import datetime as dt
import logging

from homeassistant.helpers.event import async_track_time_interval

from custom_components.thermoloop.actuator import Actuator
from custom_components.thermoloop.algorithms import get_algorithm
from custom_components.thermoloop.const import DOMAIN, EVENT_THERMOLOOP_COMMAND
from custom_components.thermoloop.contracts import ACState, ControlInput, ControlMode, Fan, Mode
from custom_components.thermoloop.controller import Controller
from custom_components.thermoloop.guards import GuardConfig
from custom_components.thermoloop.presence import PresenceTracker
from custom_components.thermoloop.sensor import ThermoLoopStatusSensor

_LOGGER = logging.getLogger(__name__)

_TICK_INTERVAL_SECONDS = 60
_TREND_WINDOW = 5

_SAFE_DEFAULT_STATE = ACState(
    power=False, mode=Mode.COOL, setpoint=22, fan=Fan.LOW,
)


def _night_window_active(now, start_str, end_str):
    """Check if current time falls within the night window (supports wrap past midnight)."""
    if not start_str or not end_str:
        return False
    try:
        start = dt.time.fromisoformat(start_str)
        end = dt.time.fromisoformat(end_str)
    except (ValueError, TypeError):
        return False
    current = now.time()
    if start <= end:
        return start <= current < end
    return current >= start or current < end


class ControlLoop:
    """Periodic control tick orchestrating algorithm -> guard -> actuator -> sensor."""

    def __init__(
        self,
        hass,
        entry_id: str,
        temp_sensor_day_entity_id: str,
        temp_sensor_night_entity_id: str,
        actuator: Actuator,
        presence: PresenceTracker,
        status_sensor: ThermoLoopStatusSensor,
        humidity_sensor_day_entity_id: str | None = None,
        humidity_sensor_night_entity_id: str | None = None,
    ) -> None:
        self._hass = hass
        self._entry_id = entry_id
        self._temp_sensor_day = temp_sensor_day_entity_id
        self._temp_sensor_night = temp_sensor_night_entity_id
        self._active_sensor_id: str | None = None
        self._actuator = actuator
        self._presence = presence
        self._status_sensor = status_sensor
        self._humidity_day = humidity_sensor_day_entity_id
        self._humidity_night = humidity_sensor_night_entity_id
        self._current_humidity: float | None = None
        self._controller = Controller(
            algorithm=get_algorithm("v0"), guards=GuardConfig()
        )
        self._algo_name: str = "v0"
        self._unsub_interval = None
        self._interval = dt.timedelta(seconds=_TICK_INTERVAL_SECONDS)
        self._last_command_at: float | None = None
        self._temp_history: list[tuple[float, float]] = []

    def _now(self):
        """Return current datetime. Override in tests to control time."""
        return dt.datetime.now()

    def start(self) -> None:
        """Start periodic tick scheduling."""
        self._unsub_interval = async_track_time_interval(
            self._hass, self._async_tick_wrapper, self._interval
        )

    def stop(self) -> None:
        """Stop periodic tick scheduling."""
        if self._unsub_interval is not None:
            self._unsub_interval()
            self._unsub_interval = None

    async def _async_tick_wrapper(self, _now=None) -> None:
        await self.async_tick()

    async def async_tick(self) -> None:
        """Execute one full control cycle."""
        try:
            ci = self._build_input()
            if ci is None:
                await self._status_sensor.update_state("error", reason="incomplete_context")
                return

            decision = self._controller.decide(ci)

            if decision.is_send:
                cmd = decision.command
                self._last_command_at = ci.now
                await self._actuator.apply(cmd)
                # Store assumed state from actuator
                if self._actuator.last_state is not None:
                    entry_data = self._hass.data.setdefault(DOMAIN, {}).setdefault(self._entry_id, {})
                    entry_data["assumed_state"] = self._actuator.last_state
                self._hass.bus.async_fire(
                    EVENT_THERMOLOOP_COMMAND,
                    {
                        "command": str(cmd),
                        "reason": cmd.reason,
                        "mode": ci.mode.value,
                        "target": ci.target,
                    },
                )
                await self._status_sensor.update_state(
                    "active" if cmd.power else "off",
                    mode=ci.mode.value,
                    algorithm=self._algo_name,
                    target=ci.target,
                    active_sensor=self._active_sensor_id,
                    current_temp=ci.current_temp,
                    humidity=self._current_humidity,
                    reason=cmd.reason,
                )
            else:
                await self._status_sensor.update_state(
                    "idle",
                    mode=ci.mode.value,
                    algorithm=self._algo_name,
                    reason=decision.reason,
                )
        except Exception:
            _LOGGER.exception("Control tick failed")
            await self._status_sensor.update_state("error", reason="exception")

    def _compute_trend(self) -> float:
        """Compute temperature trend (deg C per minute) from recent history."""
        if len(self._temp_history) < 2:
            return 0.0
        first_ts, first_temp = self._temp_history[0]
        last_ts, last_temp = self._temp_history[-1]
        dt_min = (last_ts - first_ts) / 60.0
        if dt_min < 0.1:
            return 0.0
        return (last_temp - first_temp) / dt_min

    def _assumed_state(self) -> ACState:
        """Read the last-commanded AC state from hass.data."""
        entry_data = self._hass.data.get(DOMAIN, {}).get(self._entry_id, {})
        state = entry_data.get("assumed_state")
        return state if state is not None else _SAFE_DEFAULT_STATE

    def _build_input(self):
        """Read HA entity states and build a ControlInput for the brain."""
        now = self._now()

        # Read night window config first (needed for phase detection)
        night_start = self._read_entity(
            f"time.thermoloop_night_window_start_{self._entry_id}"
        )
        night_end = self._read_entity(
            f"time.thermoloop_night_window_end_{self._entry_id}"
        )
        is_night = _night_window_active(now, night_start, night_end)

        # Pick sensor by phase
        active_sensor_id = self._temp_sensor_night if is_night else self._temp_sensor_day
        self._active_sensor_id = active_sensor_id

        temp_state = self._hass.states.get(active_sensor_id)
        if temp_state is None or temp_state.state in (
            "unknown",
            "unavailable",
            "",
            None,
        ):
            return None
        try:
            current_temp = float(temp_state.state)
        except (ValueError, TypeError):
            return None

        # Read humidity from phase-appropriate sensor
        humidity_entity = self._humidity_night if is_night else self._humidity_day
        current_humidity: float | None = None
        if humidity_entity is not None:
            h_state = self._hass.states.get(humidity_entity)
            if h_state is not None and h_state.state not in ("unknown", "unavailable", "", None):
                try:
                    current_humidity = float(h_state.state)
                except (ValueError, TypeError):
                    pass
        self._current_humidity = current_humidity

        sensor_last_updated = getattr(temp_state, "last_updated", None)
        if sensor_last_updated is not None:
            sensor_age = (now - sensor_last_updated).total_seconds()
        else:
            sensor_age = 0.0

        self._temp_history.append((now.timestamp(), current_temp))
        self._temp_history = self._temp_history[-_TREND_WINDOW:]

        assumed = self._assumed_state()

        day_target = self._read_target(
            f"number.thermoloop_target_day_{self._entry_id}", 22.0
        )
        night_target = self._read_target(
            f"number.thermoloop_target_night_{self._entry_id}", 24.0
        )

        target = night_target if is_night else day_target

        mode_str = self._read_entity(
            f"select.thermoloop_mode_{self._entry_id}", "auto"
        )
        cm_map = {
            "auto": ControlMode.AUTO,
            "off": ControlMode.OFF,
            "away": ControlMode.AWAY,
        }
        control_mode = cm_map.get(mode_str, ControlMode.AUTO)
        if control_mode == ControlMode.AUTO and self._presence.is_away:
            control_mode = ControlMode.AWAY

        algo_str = self._read_entity(
            f"select.thermoloop_algorithm_{self._entry_id}", "v0"
        )
        try:
            self._controller.algorithm = get_algorithm(algo_str)
            self._algo_name = algo_str
        except ValueError:
            self._controller.algorithm = get_algorithm("v0")
            self._algo_name = "v0"

        return ControlInput(
            now=now.timestamp(),
            mode=control_mode,
            current_temp=current_temp,
            sensor_age=sensor_age,
            target=target,
            assumed_state=assumed,
            temp_trend=self._compute_trend(),
            last_command_at=self._last_command_at,
        )

    def _read_entity(self, entity_id, default=None):
        """Read an entity's state string, returning default on missing."""
        state = self._hass.states.get(entity_id)
        if state is None or state.state in ("unknown", "unavailable", "", None):
            return default
        return state.state

    def _read_target(self, entity_id, default):
        """Read a number entity as float."""
        raw = self._read_entity(entity_id, str(default))
        try:
            return float(raw)
        except (ValueError, TypeError):
            return default
