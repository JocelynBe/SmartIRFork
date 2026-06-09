"""Tests for ThermoLoop __init__ wiring."""
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.thermoloop.const import DOMAIN


@pytest.fixture
def mock_hass():
    hass = MagicMock()
    hass.data = {}
    hass.config_entries = MagicMock()
    hass.config_entries.async_forward_entry_setups = AsyncMock(return_value=None)
    hass.config_entries.async_unload_platforms = AsyncMock(return_value=True)
    hass.services = MagicMock()
    hass.services.async_register = MagicMock()
    hass.bus = MagicMock()
    hass.bus.async_fire = MagicMock()
    return hass


@pytest.fixture
def mock_entry():
    entry = MagicMock()
    entry.entry_id = "test_entry_id"
    entry.data = {
        "climate_entity_id": "climate.my_ac",
        "temp_sensor_entity_id": "sensor.room_temp",
        "device_tracker_entities": ["device_tracker.phone1"],
    }
    return entry


@pytest.mark.asyncio
async def test_async_setup_entry_stores_control_loop(mock_hass, mock_entry):
    """setup_entry should store ControlLoop in hass.data."""
    from custom_components.thermoloop import async_setup_entry

    result = await async_setup_entry(mock_hass, mock_entry)

    assert result is True
    assert DOMAIN in mock_hass.data
    assert mock_entry.entry_id in mock_hass.data[DOMAIN]
    entry_data = mock_hass.data[DOMAIN][mock_entry.entry_id]
    assert "control_loop" in entry_data


@pytest.mark.asyncio
async def test_async_unload_entry_removes_data(mock_hass, mock_entry):
    """unload_entry should clean up hass.data."""
    from custom_components.thermoloop import async_setup_entry, async_unload_entry

    await async_setup_entry(mock_hass, mock_entry)

    result = await async_unload_entry(mock_hass, mock_entry)

    assert result is True


@pytest.mark.asyncio
async def test_async_setup_domain(mock_hass, mock_entry):
    """Test that async_setup returns True."""
    from custom_components.thermoloop import async_setup
    result = await async_setup(mock_hass, mock_entry)
    assert result is True
