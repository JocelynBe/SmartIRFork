"""Tests for ThermoLoop __init__ wiring."""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.thermoloop.const import (
    CONF_BROADLINK_REMOTE,
    CONF_PRESENCE_TRACKER,
    CONF_TEMP_SENSOR_BEDROOM,
    CONF_TEMP_SENSOR_LIVING,
    DOMAIN,
)


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
    hass.http = MagicMock()
    hass.http.async_register_static_paths = AsyncMock(return_value=None)
    return hass


@pytest.fixture
def mock_entry():
    entry = MagicMock()
    entry.entry_id = "test_entry_id"
    entry.data = {
        CONF_BROADLINK_REMOTE: "remote.broadlink",
        CONF_TEMP_SENSOR_LIVING: "sensor.room_temp",
        CONF_TEMP_SENSOR_BEDROOM: "sensor.bedroom_temp",
        CONF_PRESENCE_TRACKER: ["device_tracker.phone1"],
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
    """unload_entry should clean up hass.data and remove service."""
    from custom_components.thermoloop import async_setup_entry, async_unload_entry

    await async_setup_entry(mock_hass, mock_entry)

    result = await async_unload_entry(mock_hass, mock_entry)

    assert result is True
    # When no entries remain, the tick service should be removed
    mock_hass.services.async_remove.assert_called_once_with("thermoloop", "tick")


@pytest.mark.asyncio
async def test_async_setup_domain(mock_hass, mock_entry):
    """Test that async_setup returns True."""
    from custom_components.thermoloop import async_setup
    result = await async_setup(mock_hass, mock_entry)
    assert result is True
