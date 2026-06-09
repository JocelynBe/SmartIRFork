"""Tests for ThermoLoop control loop integration."""

import datetime
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.thermoloop.contracts import ACCommand
from custom_components.thermoloop.control_loop import ControlLoop


@pytest.fixture
def mock_hass():
    hass = MagicMock()
    hass.states = MagicMock()
    return hass


@pytest.fixture
def mock_actuator():
    return AsyncMock()


@pytest.fixture
def mock_sensor():
    sensor = MagicMock()
    sensor.update_state = AsyncMock()
    return sensor


@pytest.fixture
def mock_presence():
    presence = MagicMock()
    presence.is_away = False
    return presence


def _state(entity_id=None, state="unknown", attributes=None):
    s = MagicMock()
    s.entity_id = entity_id
    s.state = state
    s.attributes = attributes or {}
    s.last_updated = None
    return s


def _build_loop(mock_hass, mock_actuator, mock_sensor, mock_presence, entry_id="entry_id"):
    return ControlLoop(
        hass=mock_hass,
        entry_id=entry_id,
        climate_entity_id="climate.my_ac",
        temp_sensor_day_entity_id="sensor.room_temp",
        temp_sensor_night_entity_id="sensor.room_temp",
        actuator=mock_actuator,
        presence=mock_presence,
        status_sensor=mock_sensor,
    )


@pytest.mark.asyncio
async def test_async_tick_happy_path(mock_hass, mock_actuator, mock_sensor, mock_presence):
    """Full tick: state reads, algorithm runs, actuator applies, sensor updates."""
    states = {
        "sensor.room_temp": _state("sensor.room_temp", "26.5"),
        "climate.my_ac": _state(
            "climate.my_ac",
            "cool",
            {"hvac_mode": "cool", "temperature": 22, "fan_mode": "low"},
        ),
        "number.thermoloop_target_day_entry_id": _state("number.dummy", "22"),
        "number.thermoloop_target_night_entry_id": _state("number.dummy", "24"),
        "select.thermoloop_mode_entry_id": _state("select.dummy", "auto"),
        "select.thermoloop_algorithm_entry_id": _state("select.dummy", "v0"),
        "time.thermoloop_night_window_start_entry_id": _state("time.dummy", "23:00:00"),
        "time.thermoloop_night_window_end_entry_id": _state("time.dummy", "07:00:00"),
    }
    mock_hass.states.get.side_effect = lambda eid: states.get(eid)

    loop = _build_loop(mock_hass, mock_actuator, mock_sensor, mock_presence)
    await loop.async_tick()

    mock_actuator.apply.assert_called_once()
    cmd = mock_actuator.apply.call_args[0][0]
    assert isinstance(cmd, ACCommand)
    mock_sensor.update_state.assert_called_once()


@pytest.mark.asyncio
async def test_async_tick_away_and_night(mock_hass, mock_actuator, mock_sensor, mock_presence):
    """Night target used during night window when away."""
    mock_presence.is_away = True

    states = {
        "sensor.room_temp": _state("sensor.room_temp", "26.5"),
        "climate.my_ac": _state(
            "climate.my_ac",
            "cool",
            {"hvac_mode": "cool", "temperature": 22, "fan_mode": "low"},
        ),
        "number.thermoloop_target_day_entry_id": _state("number.dummy", "22"),
        "number.thermoloop_target_night_entry_id": _state("number.dummy", "24"),
        "select.thermoloop_mode_entry_id": _state("select.dummy", "auto"),
        "select.thermoloop_algorithm_entry_id": _state("select.dummy", "v0"),
        "time.thermoloop_night_window_start_entry_id": _state("time.dummy", "23:00:00"),
        "time.thermoloop_night_window_end_entry_id": _state("time.dummy", "07:00:00"),
    }
    mock_hass.states.get.side_effect = lambda eid: states.get(eid)

    loop = _build_loop(mock_hass, mock_actuator, mock_sensor, mock_presence)
    loop._now = lambda: datetime.datetime(2024, 6, 15, 23, 30, 0)

    await loop.async_tick()

    mock_actuator.apply.assert_called_once()
    mock_sensor.update_state.assert_called_once()


@pytest.mark.asyncio
async def test_async_tick_missing_states_gracefully(mock_hass, mock_actuator, mock_sensor, mock_presence):
    """No crash when states are missing."""
    mock_hass.states.get.return_value = None

    loop = _build_loop(mock_hass, mock_actuator, mock_sensor, mock_presence)
    await loop.async_tick()

    mock_sensor.update_state.assert_called_once()


@pytest.mark.asyncio
async def test_async_tick_uses_night_sensor_during_night(mock_hass, mock_actuator, mock_sensor, mock_presence):
    """During night window, use bedroom sensor instead of living room."""
    states = {
        "sensor.living_temp": _state("sensor.living_temp", "22.0"),
        "sensor.bedroom_temp": _state("sensor.bedroom_temp", "28.0"),
        "climate.my_ac": _state(
            "climate.my_ac", "cool",
            {"hvac_mode": "cool", "temperature": 22, "fan_mode": "low"},
        ),
        "number.thermoloop_target_day_entry_id": _state("number.dummy", "22"),
        "number.thermoloop_target_night_entry_id": _state("number.dummy", "24"),
        "select.thermoloop_mode_entry_id": _state("select.dummy", "auto"),
        "select.thermoloop_algorithm_entry_id": _state("select.dummy", "v0"),
        "time.thermoloop_night_window_start_entry_id": _state("time.dummy", "23:00:00"),
        "time.thermoloop_night_window_end_entry_id": _state("time.dummy", "07:00:00"),
    }
    mock_hass.states.get.side_effect = lambda eid: states.get(eid)

    loop = ControlLoop(
        hass=mock_hass,
        entry_id="entry_id",
        climate_entity_id="climate.my_ac",
        temp_sensor_day_entity_id="sensor.living_temp",
        temp_sensor_night_entity_id="sensor.bedroom_temp",
        actuator=mock_actuator,
        presence=mock_presence,
        status_sensor=mock_sensor,
    )
    # Force night time
    loop._now = lambda: datetime.datetime(2024, 6, 15, 23, 30, 0)
    await loop.async_tick()

    mock_actuator.apply.assert_called_once()
    # Should have used bedroom temp (28.0), not living temp (22.0)
    # Error = 28 - 24 = +4.0 -> slam cool -> setpoint = MIN_SETPOINT (16)
    cmd = mock_actuator.apply.call_args[0][0]
    assert cmd.setpoint == 16
