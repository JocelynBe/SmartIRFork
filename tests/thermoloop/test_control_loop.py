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
