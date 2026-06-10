"""Control loop: periodic tick that orchestrates sensor reads, brain algorithm, actuator, and status update."""

from __future__ import annotations

import asyncio
import datetime as dt
import logging

from homeassistant.helpers.event import async_track_time_interval
from homeassistant.util import dt as dt_util

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


def _night_window_active(now, start, end):
    """Check if current time falls within the night window (supports wrap past midnight).

    Args:
        now: datetime object to check
        start: datetime.time object or None
        end: datetime.time object or None

    Returns:
        False if either start or end is None, otherwise True if now falls in the window.
    """
    if start is None or end is None:
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
        presence: PresenceTracker | None = None,
        status_sensor: ThermoLoopStatusSensor | None = None,
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
        # Last good (Celsius) reading + its timestamp per sensor, so a sensor
        # that drops to "unavailable" between reports (common for battery
        # sensors that only report on change) doesn't abort the tick.
        self._last_good_temp: dict = {}
        self._lock = asyncio.Lock()

    def _now(self):
        """Return current timezone-aware datetime in HA's configured zone.

        Aware (not naive) so it can be subtracted from HA state ``last_updated``
        timestamps, which are timezone-aware UTC. Override in tests to control time.
        """
        return dt_util.now()

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

    def config_entity_ids(self) -> list[str]:
        """Resolve the entity_ids of the editable config entities to watch.

        Reads ``.entity_id`` from the live entity objects (the number.* targets
        and select.* mode/algorithm) so id suffixes are handled automatically
        rather than hardcoded. Entities without a resolvable id are skipped.
        Used to wire immediate re-ticks when the panel edits a config value.
        """
        keys = ("target_day", "target_night", "mode", "algorithm")
        entities = self._entities()
        ids: list[str] = []
        for key in keys:
            ent = entities.get(key)
            entity_id = getattr(ent, "entity_id", None) if ent is not None else None
            if entity_id:
                ids.append(entity_id)
        return ids

    async def _async_tick_wrapper(self, _now=None) -> None:
        await self.async_tick()

    async def async_tick(self) -> None:
        """Execute one full control cycle."""
        async with self._lock:
            try:
                ci = self._build_input()
                if ci is None:
                    reason = getattr(self, "_incomplete_reason", None) or "incomplete_context"
                    _LOGGER.debug("tick: incomplete context (%s)", reason)
                    if self._status_sensor:
                        await self._status_sensor.update_state(
                            "error", reason=reason,
                            day_sensor=self._temp_sensor_day,
                            night_sensor=self._temp_sensor_night,
                        )
                    return

                decision = self._controller.decide(ci)
                _LOGGER.debug(
                    "tick: sensor=%s temp=%.2f target=%.2f mode=%s age=%.0fs -> send=%s reason=%s",
                    self._active_sensor_id, ci.current_temp, ci.target,
                    ci.mode.value, ci.sensor_age, decision.is_send, decision.reason,
                )

                if decision.is_send:
                    cmd = decision.command
                    success = await self._actuator.apply(cmd)
                    if success:
                        _LOGGER.debug("tick: actuator sent %s (reason=%s)", cmd, cmd.reason)
                        self._last_command_at = ci.now
                        self._hass.bus.async_fire(
                            EVENT_THERMOLOOP_COMMAND,
                            {
                                "command": str(cmd),
                                "reason": cmd.reason,
                                "mode": ci.mode.value,
                                "target": ci.target,
                                "power": cmd.power,
                                "setpoint": cmd.setpoint if cmd.power else None,
                                "fan": cmd.fan.value if cmd.power else None,
                                "ac_mode": cmd.mode.value if cmd.power else None,
                            },
                        )
                        if self._status_sensor:
                            await self._status_sensor.update_state(
                                "active" if cmd.power else "off",
                                mode=ci.mode.value,
                                algorithm=self._algo_name,
                                target=ci.target,
                                active_sensor=self._active_sensor_id,
                                current_temp=ci.current_temp,
                                humidity=self._current_humidity,
                                reason=cmd.reason,
                                setpoint=cmd.setpoint if cmd.power else None,
                                fan=cmd.fan.value if cmd.power else None,
                                ac_mode=cmd.mode.value if cmd.power else None,
                                day_sensor=self._temp_sensor_day,
                                night_sensor=self._temp_sensor_night,
                            )
                    else:
                        # Actuator failed to send command
                        _LOGGER.warning("tick: actuator failed to send %s", cmd)
                        if self._status_sensor:
                            await self._status_sensor.update_state(
                                "error", reason="actuator_failed",
                                day_sensor=self._temp_sensor_day,
                                night_sensor=self._temp_sensor_night,
                            )
                else:
                    if self._status_sensor:
                        # Reflect the actual AC state, not just "no command this
                        # tick": if the AC is (assumed) running, the panel should
                        # read "active" even while we hold; only show idle when
                        # the AC is off.
                        assumed = ci.assumed_state
                        await self._status_sensor.update_state(
                            "active" if assumed.power else "idle",
                            mode=ci.mode.value,
                            algorithm=self._algo_name,
                            target=ci.target,
                            active_sensor=self._active_sensor_id,
                            current_temp=ci.current_temp,
                            humidity=self._current_humidity,
                            reason=decision.reason,
                            setpoint=assumed.setpoint if assumed.power else None,
                            fan=assumed.fan.value if assumed.power else None,
                            ac_mode=assumed.mode.value if assumed.power else None,
                            day_sensor=self._temp_sensor_day,
                            night_sensor=self._temp_sensor_night,
                        )
            except Exception as exc:
                _LOGGER.exception("Control tick failed")
                if self._status_sensor:
                    # Surface the exception type+message so the panel/status is
                    # self-diagnosing instead of an opaque "exception".
                    detail = f"{type(exc).__name__}: {exc}"
                    await self._status_sensor.update_state(
                        "error", reason=f"exception: {detail}"[:160],
                        day_sensor=self._temp_sensor_day,
                        night_sensor=self._temp_sensor_night,
                    )

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

    def _entities(self) -> dict:
        """Read the entity objects from hass.data[DOMAIN][entry_id]["entities"]."""
        entry_data = self._hass.data.get(DOMAIN, {}).get(self._entry_id, {})
        return entry_data.get("entities", {})

    def _assumed_state(self) -> ACState:
        """Read the last-commanded AC state from the actuator."""
        return self._actuator.last_state if self._actuator.last_state is not None else _SAFE_DEFAULT_STATE

    def _build_input(self):
        """Read HA entity states and build a ControlInput for the brain."""
        now = self._now()
        self._incomplete_reason = None

        # Read night window config from entity objects (read datetime.time objects directly)
        entities = self._entities()
        night_start_entity = entities.get("night_start")
        night_end_entity = entities.get("night_end")
        night_start = night_start_entity.native_value if night_start_entity else None
        night_end = night_end_entity.native_value if night_end_entity else None
        is_night = _night_window_active(now, night_start, night_end)

        # Pick sensor by phase
        active_sensor_id = self._temp_sensor_night if is_night else self._temp_sensor_day
        self._active_sensor_id = active_sensor_id

        temp_state = self._hass.states.get(active_sensor_id)
        current_temp = None
        sensor_last_updated = None
        if temp_state is not None and temp_state.state not in (
            "unknown",
            "unavailable",
            "",
            None,
        ):
            try:
                current_temp = float(temp_state.state)
            except (ValueError, TypeError):
                current_temp = None

        if current_temp is not None:
            # Normalize the reading to Celsius. ThermoLoop reasons entirely in
            # degrees C (targets, deadband, IR setpoints), but a sensor may
            # report in Fahrenheit (unit_of_measurement "°F"); without
            # converting, a 70°F room reads as 70°C and the loop slam-cools.
            temp_unit = (temp_state.attributes or {}).get("unit_of_measurement")
            if isinstance(temp_unit, str) and temp_unit.strip().upper().endswith("F"):
                current_temp = (current_temp - 32.0) * 5.0 / 9.0
            sensor_last_updated = getattr(temp_state, "last_updated", None)
            self._last_good_temp[active_sensor_id] = (current_temp, sensor_last_updated)
        else:
            # The sensor is unavailable/unknown/non-numeric. Many battery temp
            # sensors only report on change and drop to "unavailable" when
            # stable, so fall back to the last good reading for THIS sensor
            # rather than aborting; the staleness guard (sensor_age below) still
            # holds if that reading is too old.
            cached = self._last_good_temp.get(active_sensor_id)
            if cached is None:
                observed = "missing" if temp_state is None else temp_state.state
                self._incomplete_reason = f"sensor_unavailable:{active_sensor_id}={observed}"
                _LOGGER.debug(
                    "tick aborted: %s sensor %s is %s and no cached reading",
                    "night" if is_night else "day", active_sensor_id, observed,
                )
                return None
            current_temp, sensor_last_updated = cached
            _LOGGER.debug(
                "sensor %s unavailable; using last-good %.2f°C",
                active_sensor_id, current_temp,
            )

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

        # sensor_last_updated was set above from the live reading or the cache.
        if sensor_last_updated is not None:
            # HA state timestamps are tz-aware; guard against a naive value so
            # the subtraction never raises (offset-naive vs offset-aware).
            if sensor_last_updated.tzinfo is None and now.tzinfo is not None:
                sensor_last_updated = sensor_last_updated.replace(tzinfo=now.tzinfo)
            elif sensor_last_updated.tzinfo is not None and now.tzinfo is None:
                sensor_last_updated = sensor_last_updated.replace(tzinfo=None)
            sensor_age = (now - sensor_last_updated).total_seconds()
        else:
            sensor_age = 0.0

        self._temp_history.append((now.timestamp(), current_temp))
        self._temp_history = self._temp_history[-_TREND_WINDOW:]

        assumed = self._assumed_state()

        # Read target temperatures from entity objects
        day_target_entity = entities.get("target_day")
        day_target = day_target_entity.native_value if day_target_entity and day_target_entity.native_value is not None else 22.0

        night_target_entity = entities.get("target_night")
        night_target = night_target_entity.native_value if night_target_entity and night_target_entity.native_value is not None else 24.0

        target = night_target if is_night else day_target

        # Read mode from entity object
        mode_entity = entities.get("mode")
        mode_str = mode_entity.current_option if mode_entity and mode_entity.current_option is not None else "auto"

        cm_map = {
            "auto": ControlMode.AUTO,
            "off": ControlMode.OFF,
            "away": ControlMode.AWAY,
        }
        control_mode = cm_map.get(mode_str, ControlMode.AUTO)
        if control_mode == ControlMode.AUTO and self._presence and self._presence.is_away:
            control_mode = ControlMode.AWAY

        # Read algorithm from entity object
        algo_entity = entities.get("algorithm")
        algo_str = algo_entity.current_option if algo_entity and algo_entity.current_option is not None else "v0"

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

    def set_presence(self, presence: PresenceTracker | None) -> None:
        """Set the presence tracker (called by __init__ after construction)."""
        self._presence = presence
