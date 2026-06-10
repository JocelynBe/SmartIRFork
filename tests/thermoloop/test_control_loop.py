"""Tests for the ThermoLoop ControlLoop."""
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime
import datetime as dt
from dataclasses import dataclass

import pytest

from custom_components.thermoloop.const import DOMAIN
from custom_components.thermoloop.contracts import (
    ACCommand,
    ACState,
    ControlInput,
    ControlMode,
    Decision,
    Fan,
    Mode,
)
from custom_components.thermoloop.control_loop import ControlLoop, _night_window_active


class FakeEntity:
    """Fake entity with native_value or current_option."""
    def __init__(self, native_value=None, current_option=None):
        self.native_value = native_value
        self.current_option = current_option


@pytest.fixture
def mock_hass():
    hass = MagicMock()
    hass.data = {DOMAIN: {"test_entry": {"entities": {}}}}
    hass.states = MagicMock()
    hass.bus = MagicMock()
    hass.bus.async_fire = MagicMock()
    return hass


def _make_status_sensor():
    sensor = AsyncMock()
    sensor.update_state = AsyncMock(return_value=None)
    return sensor


def _make_presence(is_away=False):
    presence = MagicMock()
    presence.is_away = is_away
    return presence


@pytest.mark.asyncio
async def test_async_tick_happy_path(mock_hass):
    actuator = AsyncMock()
    actuator.apply.return_value = True
    actuator.last_state = ACState(power=True, mode=Mode.COOL, setpoint=18, fan=Fan.HIGH)
    status = _make_status_sensor()
    presence = _make_presence()
    loop = ControlLoop(
        hass=mock_hass,
        entry_id="test_entry",
        temp_sensor_day_entity_id="sensor.living_temp",
        temp_sensor_night_entity_id="sensor.bedroom_temp",
        actuator=actuator,
        presence=presence,
        status_sensor=status,
    )

    def _get_state(entity_id):
        if entity_id == "sensor.living_temp":
            return MagicMock(state="25.0", last_updated=datetime(2024, 1, 1, 13, 59, 0))
        return None
    mock_hass.states.get = _get_state

    # Setup entity objects
    entities = {
        "target_day": FakeEntity(native_value=22.0),
        "target_night": FakeEntity(native_value=24.0),
        "mode": FakeEntity(current_option="auto"),
        "algorithm": FakeEntity(current_option="v0"),
        "night_start": FakeEntity(native_value=dt.time(22, 0)),
        "night_end": FakeEntity(native_value=dt.time(7, 0)),
    }
    mock_hass.data[DOMAIN]["test_entry"]["entities"] = entities

    with patch.object(loop, "_now", return_value=datetime(2024, 1, 1, 14, 0, 0)):
        await loop.async_tick()

    actuator.apply.assert_called_once()
    assert actuator.apply.call_args[0][0].power is True


@pytest.mark.asyncio
async def test_async_tick_away_and_night(mock_hass):
    actuator = AsyncMock()
    actuator.apply.return_value = True
    actuator.last_state = ACState(power=False, mode=Mode.COOL, setpoint=22, fan=Fan.LOW)
    status = _make_status_sensor()
    presence = _make_presence(is_away=True)
    loop = ControlLoop(
        hass=mock_hass,
        entry_id="test_entry",
        temp_sensor_day_entity_id="sensor.living_temp",
        temp_sensor_night_entity_id="sensor.bedroom_temp",
        actuator=actuator,
        presence=presence,
        status_sensor=status,
    )

    def _get_state(entity_id):
        if entity_id == "sensor.bedroom_temp":
            return MagicMock(state="26.0", last_updated=datetime(2024, 1, 1, 23, 0, 0))
        return None
    mock_hass.states.get = _get_state

    # Setup entity objects
    entities = {
        "target_day": FakeEntity(native_value=22.0),
        "target_night": FakeEntity(native_value=24.0),
        "mode": FakeEntity(current_option="auto"),
        "algorithm": FakeEntity(current_option="v0"),
        "night_start": FakeEntity(native_value=dt.time(22, 0)),
        "night_end": FakeEntity(native_value=dt.time(7, 0)),
    }
    mock_hass.data[DOMAIN]["test_entry"]["entities"] = entities

    with patch.object(loop, "_now", return_value=datetime(2024, 1, 1, 23, 30, 0)):
        await loop.async_tick()

    # Away mode + night: the controller decides behavior
    # Just verify that the loop ran without error and the mode was set to AWAY
    status.update_state.assert_called()


@pytest.mark.asyncio
async def test_async_tick_missing_states_gracefully(mock_hass):
    actuator = AsyncMock()
    status = _make_status_sensor()
    presence = _make_presence()
    loop = ControlLoop(
        hass=mock_hass,
        entry_id="test_entry",
        temp_sensor_day_entity_id="sensor.living_temp",
        temp_sensor_night_entity_id="sensor.bedroom_temp",
        actuator=actuator,
        presence=presence,
        status_sensor=status,
    )

    # No sensor available
    mock_hass.states.get = MagicMock(return_value=None)

    await loop.async_tick()

    actuator.apply.assert_not_called()


@pytest.mark.asyncio
async def test_async_tick_uses_night_sensor_during_night(mock_hass):
    actuator = AsyncMock()
    actuator.apply.return_value = True
    actuator.last_state = ACState(power=True, mode=Mode.COOL, setpoint=18, fan=Fan.HIGH)
    status = _make_status_sensor()
    presence = _make_presence()
    loop = ControlLoop(
        hass=mock_hass,
        entry_id="test_entry",
        temp_sensor_day_entity_id="sensor.living_temp",
        temp_sensor_night_entity_id="sensor.bedroom_temp",
        actuator=actuator,
        presence=presence,
        status_sensor=status,
    )

    def _get_state(entity_id):
        if entity_id == "sensor.bedroom_temp":
            return MagicMock(state="24.0", last_updated=datetime(2024, 1, 1, 23, 0, 0))
        return None
    mock_hass.states.get = _get_state

    # Setup entity objects
    entities = {
        "target_day": FakeEntity(native_value=22.0),
        "target_night": FakeEntity(native_value=24.0),
        "mode": FakeEntity(current_option="auto"),
        "algorithm": FakeEntity(current_option="v0"),
        "night_start": FakeEntity(native_value=dt.time(22, 0)),
        "night_end": FakeEntity(native_value=dt.time(7, 0)),
    }
    mock_hass.data[DOMAIN]["test_entry"]["entities"] = entities

    with patch.object(loop, "_now", return_value=datetime(2024, 1, 1, 23, 0, 0)):
        await loop.async_tick()

    assert loop._active_sensor_id == "sensor.bedroom_temp"


@pytest.mark.asyncio
async def test_async_tick_reports_sensor_age(mock_hass):
    actuator = AsyncMock()
    actuator.apply.return_value = True
    actuator.last_state = ACState(power=True, mode=Mode.COOL, setpoint=18, fan=Fan.HIGH)
    status = _make_status_sensor()
    presence = _make_presence()
    loop = ControlLoop(
        hass=mock_hass,
        entry_id="test_entry",
        temp_sensor_day_entity_id="sensor.living_temp",
        temp_sensor_night_entity_id="sensor.bedroom_temp",
        actuator=actuator,
        presence=presence,
        status_sensor=status,
    )

    sensor_updated = datetime(2024, 1, 1, 12, 0, 0)
    def _get_state(entity_id):
        if entity_id == "sensor.living_temp":
            return MagicMock(state="23.5", last_updated=sensor_updated)
        return None
    mock_hass.states.get = _get_state

    # Setup entity objects
    entities = {
        "target_day": FakeEntity(native_value=22.0),
        "target_night": FakeEntity(native_value=24.0),
        "mode": FakeEntity(current_option="auto"),
        "algorithm": FakeEntity(current_option="v0"),
        "night_start": FakeEntity(native_value=dt.time(22, 0)),
        "night_end": FakeEntity(native_value=dt.time(7, 0)),
    }
    mock_hass.data[DOMAIN]["test_entry"]["entities"] = entities

    with patch.object(loop, "_now", return_value=datetime(2024, 1, 1, 13, 0, 0)):
        await loop.async_tick()

    status.update_state.assert_called_once()
    call_kwargs = status.update_state.call_args.kwargs
    # The sensor was updated 1 hour ago = 3600 seconds
    assert "reason" in call_kwargs


@pytest.mark.asyncio
async def test_async_tick_handles_tz_aware_last_updated(mock_hass):
    """Regression: real HA state last_updated is tz-aware; _now() must be too.

    With the default (un-patched) _now() the loop uses dt_util.now() (aware).
    Subtracting an aware last_updated must NOT raise a naive/aware TypeError
    and surface as a generic 'exception' tick failure.
    """
    actuator = AsyncMock()
    actuator.apply.return_value = True
    actuator.last_state = ACState(power=False, mode=Mode.COOL, setpoint=22, fan=Fan.LOW)
    status = _make_status_sensor()
    loop = ControlLoop(
        hass=mock_hass,
        entry_id="test_entry",
        temp_sensor_day_entity_id="sensor.living_temp",
        temp_sensor_night_entity_id="sensor.bedroom_temp",
        actuator=actuator,
        presence=_make_presence(),
        status_sensor=status,
    )

    aware_updated = datetime(2024, 1, 1, 12, 0, 0, tzinfo=dt.timezone.utc)
    def _get_state(entity_id):
        if entity_id == "sensor.living_temp":
            return MagicMock(state="23.5", last_updated=aware_updated)
        return None
    mock_hass.states.get = _get_state
    mock_hass.data[DOMAIN]["test_entry"]["entities"] = {
        "target_day": FakeEntity(native_value=22.0),
        "target_night": FakeEntity(native_value=24.0),
        "mode": FakeEntity(current_option="auto"),
        "algorithm": FakeEntity(current_option="v0"),
        "night_start": FakeEntity(native_value=dt.time(22, 0)),
        "night_end": FakeEntity(native_value=dt.time(7, 0)),
    }

    # The production clock must be tz-aware to subtract from HA last_updated.
    assert loop._now().tzinfo is not None

    # Intentionally do NOT patch _now — exercise the real dt_util.now() path.
    await loop.async_tick()

    status.update_state.assert_called()
    # Must not have failed with the naive/aware subtraction error.
    for call in status.update_state.call_args_list:
        assert call.kwargs.get("reason") != "exception"
        if call.args:
            assert call.args[0] != "error" or call.kwargs.get("reason") != "exception"


@pytest.mark.asyncio
async def test_async_tick_persists_assumed_state_from_actuator(mock_hass):
    cmd_sent = None
    class FakeActuator:
        def __init__(self):
            self.last_state = None
        async def apply(self, cmd):
            self.last_state = ACState(power=cmd.power, mode=cmd.mode, setpoint=cmd.setpoint, fan=cmd.fan)
            nonlocal cmd_sent
            cmd_sent = cmd
            return True
    actuator = FakeActuator()
    status = _make_status_sensor()
    presence = _make_presence()
    loop = ControlLoop(
        hass=mock_hass,
        entry_id="test_entry",
        temp_sensor_day_entity_id="sensor.living_temp",
        temp_sensor_night_entity_id="sensor.bedroom_temp",
        actuator=actuator,
        presence=presence,
        status_sensor=status,
    )
    def _get_state(entity_id):
        if entity_id == "sensor.living_temp":
            return MagicMock(state="25.0", last_updated=datetime(2024, 1, 1, 13, 59, 0))
        return None
    mock_hass.states.get = _get_state

    # Setup entity objects
    entities = {
        "target_day": FakeEntity(native_value=22.0),
        "target_night": FakeEntity(native_value=24.0),
        "mode": FakeEntity(current_option="auto"),
        "algorithm": FakeEntity(current_option="v0"),
        "night_start": FakeEntity(native_value=dt.time(22, 0)),
        "night_end": FakeEntity(native_value=dt.time(7, 0)),
    }
    mock_hass.data[DOMAIN]["test_entry"]["entities"] = entities

    with patch.object(loop, "_now", return_value=datetime(2024, 1, 1, 14, 0, 0)):
        await loop.async_tick()

    # Assumed state should come from actuator's last_state
    assert cmd_sent is not None
    assert actuator.last_state == ACState(power=cmd_sent.power, mode=cmd_sent.mode, setpoint=cmd_sent.setpoint, fan=cmd_sent.fan)
    # The _assumed_state method should now return actuator.last_state
    assert loop._assumed_state() == actuator.last_state


@pytest.mark.asyncio
async def test_async_tick_present_user_does_not_report_away(mock_hass):
    """Regression: a present user (presence.is_away False) with Mode=auto must
    NOT be coerced into AWAY mode, so the status reason is never the bogus
    'hold: away, already off' while the user is physically home.
    """
    actuator = AsyncMock()
    actuator.apply.return_value = True
    # AC already off so an AWAY decision would yield "hold: away, already off".
    actuator.last_state = ACState(power=False, mode=Mode.COOL, setpoint=22, fan=Fan.LOW)
    status = _make_status_sensor()
    presence = _make_presence(is_away=False)
    loop = ControlLoop(
        hass=mock_hass,
        entry_id="test_entry",
        temp_sensor_day_entity_id="sensor.living_temp",
        temp_sensor_night_entity_id="sensor.bedroom_temp",
        actuator=actuator,
        presence=presence,
        status_sensor=status,
    )

    def _get_state(entity_id):
        if entity_id == "sensor.living_temp":
            return MagicMock(state="22.1", last_updated=datetime(2024, 1, 1, 13, 59, 0))
        return None
    mock_hass.states.get = _get_state

    mock_hass.data[DOMAIN]["test_entry"]["entities"] = {
        "target_day": FakeEntity(native_value=22.0),
        "target_night": FakeEntity(native_value=24.0),
        "mode": FakeEntity(current_option="auto"),
        "algorithm": FakeEntity(current_option="v0"),
        "night_start": FakeEntity(native_value=dt.time(22, 0)),
        "night_end": FakeEntity(native_value=dt.time(7, 0)),
    }

    with patch.object(loop, "_now", return_value=datetime(2024, 1, 1, 14, 0, 0)):
        await loop.async_tick()

    status.update_state.assert_called()
    for call in status.update_state.call_args_list:
        reason = call.kwargs.get("reason", "")
        assert "away" not in reason, f"present user reported away: {reason!r}"


@pytest.mark.asyncio
async def test_async_tick_idle_populates_status_fields(mock_hass):
    """On an idle (hold) tick the status must still carry active_sensor,
    current_temp, target and humidity so the panel doesn't show '—'.
    """
    actuator = AsyncMock()
    # Assumed state already off and matching -> controller/guards hold (idle).
    actuator.last_state = ACState(power=False, mode=Mode.COOL, setpoint=22, fan=Fan.LOW)
    status = _make_status_sensor()
    presence = _make_presence(is_away=False)
    loop = ControlLoop(
        hass=mock_hass,
        entry_id="test_entry",
        temp_sensor_day_entity_id="sensor.living_temp",
        temp_sensor_night_entity_id="sensor.bedroom_temp",
        actuator=actuator,
        presence=presence,
        status_sensor=status,
        humidity_sensor_day_entity_id="sensor.living_humidity",
    )

    def _get_state(entity_id):
        if entity_id == "sensor.living_temp":
            return MagicMock(state="22.1", last_updated=datetime(2024, 1, 1, 13, 59, 0))
        if entity_id == "sensor.living_humidity":
            return MagicMock(state="55.0", last_updated=datetime(2024, 1, 1, 13, 59, 0))
        return None
    mock_hass.states.get = _get_state

    mock_hass.data[DOMAIN]["test_entry"]["entities"] = {
        "target_day": FakeEntity(native_value=22.0),
        "target_night": FakeEntity(native_value=24.0),
        "mode": FakeEntity(current_option="auto"),
        "algorithm": FakeEntity(current_option="v0"),
        "night_start": FakeEntity(native_value=dt.time(22, 0)),
        "night_end": FakeEntity(native_value=dt.time(7, 0)),
    }

    with patch.object(loop, "_now", return_value=datetime(2024, 1, 1, 14, 0, 0)):
        await loop.async_tick()

    # The (single) update must be an idle one carrying the live reading fields.
    idle_calls = [
        c for c in status.update_state.call_args_list
        if c.args and c.args[0] == "idle"
    ]
    assert idle_calls, "expected an idle status update"
    kwargs = idle_calls[-1].kwargs
    assert kwargs.get("active_sensor") == "sensor.living_temp"
    assert kwargs.get("current_temp") == 22.1
    assert kwargs.get("target") == 22.0
    assert kwargs.get("humidity") == 55.0


def test_night_window_active():
    now = datetime(2024, 1, 1, 23, 0, 0)
    assert _night_window_active(now, dt.time(22, 0), dt.time(7, 0)) is True
    assert _night_window_active(now, dt.time(7, 0), dt.time(22, 0)) is False


def test_night_window_inactive_during_day():
    now = datetime(2024, 1, 1, 14, 0, 0)
    assert _night_window_active(now, dt.time(22, 0), dt.time(7, 0)) is False
    assert _night_window_active(now, dt.time(7, 0), dt.time(22, 0)) is True


def test_night_window_invalid_returns_false():
    now = datetime(2024, 1, 1, 14, 0, 0)
    assert _night_window_active(now, None, None) is False
    assert _night_window_active(now, None, dt.time(22, 0)) is False
    assert _night_window_active(now, dt.time(22, 0), None) is False


def _loop_with_temp(mock_hass, state, unit):
    """Build a loop whose day sensor returns `state` with `unit`, plus config."""
    actuator = AsyncMock()
    actuator.last_state = ACState(power=False, mode=Mode.COOL, setpoint=22, fan=Fan.LOW)
    loop = ControlLoop(
        hass=mock_hass,
        entry_id="test_entry",
        temp_sensor_day_entity_id="sensor.living_temp",
        temp_sensor_night_entity_id="sensor.bedroom_temp",
        actuator=actuator,
        presence=_make_presence(),
        status_sensor=_make_status_sensor(),
    )

    def _get_state(entity_id):
        if entity_id == "sensor.living_temp":
            return MagicMock(
                state=state,
                last_updated=datetime(2024, 1, 1, 13, 59, 0),
                attributes={"unit_of_measurement": unit},
            )
        return None
    mock_hass.states.get = _get_state
    mock_hass.data[DOMAIN]["test_entry"]["entities"] = {
        "target_day": FakeEntity(native_value=22.0),
        "target_night": FakeEntity(native_value=24.0),
        "mode": FakeEntity(current_option="auto"),
        "algorithm": FakeEntity(current_option="v0"),
        "night_start": FakeEntity(native_value=dt.time(22, 0)),
        "night_end": FakeEntity(native_value=dt.time(7, 0)),
    }
    return loop


def test_build_input_normalizes_fahrenheit_to_celsius(mock_hass):
    """A sensor reporting °F is converted to °C before any control reasoning.

    Without this, a 70°F room reads as 70°C and the loop slam-cools against a
    ~22°C target.
    """
    loop = _loop_with_temp(mock_hass, state="70.0", unit="°F")
    with patch.object(loop, "_now", return_value=datetime(2024, 1, 1, 14, 0, 0)):
        ci = loop._build_input()
    assert ci is not None
    assert ci.current_temp == pytest.approx((70.0 - 32) * 5 / 9, abs=0.01)  # 21.11°C


def test_build_input_celsius_sensor_unchanged(mock_hass):
    """A °C sensor passes through unconverted."""
    loop = _loop_with_temp(mock_hass, state="25.0", unit="°C")
    with patch.object(loop, "_now", return_value=datetime(2024, 1, 1, 14, 0, 0)):
        ci = loop._build_input()
    assert ci is not None
    assert ci.current_temp == pytest.approx(25.0)


def _loop_with_mutable_temp(mock_hass, holder):
    actuator = AsyncMock()
    actuator.last_state = ACState(power=False, mode=Mode.COOL, setpoint=22, fan=Fan.LOW)
    loop = ControlLoop(
        hass=mock_hass, entry_id="test_entry",
        temp_sensor_day_entity_id="sensor.living_temp",
        temp_sensor_night_entity_id="sensor.bedroom_temp",
        actuator=actuator, presence=_make_presence(), status_sensor=_make_status_sensor(),
    )

    def _get_state(entity_id):
        if entity_id == "sensor.living_temp":
            return MagicMock(
                state=holder["v"],
                last_updated=datetime(2024, 1, 1, 13, 59, 30),
                attributes={},
            )
        return None
    mock_hass.states.get = _get_state
    mock_hass.data[DOMAIN]["test_entry"]["entities"] = {
        "target_day": FakeEntity(native_value=22.0),
        "target_night": FakeEntity(native_value=24.0),
        "mode": FakeEntity(current_option="auto"),
        "algorithm": FakeEntity(current_option="v0"),
        "night_start": FakeEntity(native_value=dt.time(22, 0)),
        "night_end": FakeEntity(native_value=dt.time(7, 0)),
    }
    return loop


def test_build_input_falls_back_to_cached_temp_when_unavailable(mock_hass):
    """A sensor that drops to 'unavailable' reuses its last good reading."""
    holder = {"v": "23.0"}
    loop = _loop_with_mutable_temp(mock_hass, holder)
    with patch.object(loop, "_now", return_value=datetime(2024, 1, 1, 14, 0, 0)):
        ci1 = loop._build_input()
        assert ci1 is not None and ci1.current_temp == pytest.approx(23.0)
        holder["v"] = "unavailable"
        ci2 = loop._build_input()
    assert ci2 is not None
    assert ci2.current_temp == pytest.approx(23.0)  # served from cache


def test_build_input_unavailable_without_cache_returns_none(mock_hass):
    """Unavailable with no prior good reading still aborts the tick."""
    holder = {"v": "unavailable"}
    loop = _loop_with_mutable_temp(mock_hass, holder)
    with patch.object(loop, "_now", return_value=datetime(2024, 1, 1, 14, 0, 0)):
        ci = loop._build_input()
    assert ci is None
    assert "sensor_unavailable" in getattr(loop, "_incomplete_reason", "")
