"""Tests for ThermoLoop number entities."""
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.thermoloop.number import ThermoLoopTargetNumber


@pytest.fixture
def mock_hass():
    return MagicMock()


def test_target_day_entity(mock_hass):
    entity = ThermoLoopTargetNumber(mock_hass, "entry_id", "day")
    assert entity.unique_id == "thermoloop_target_day_entry_id"
    assert entity.name == "ThermoLoop Target Day"
    assert entity.native_min_value == 16
    assert entity.native_max_value == 30
    assert entity.native_step == 1.0


def test_target_night_entity(mock_hass):
    entity = ThermoLoopTargetNumber(mock_hass, "entry_id", "night")
    assert entity.unique_id == "thermoloop_target_night_entry_id"
    assert entity.name == "ThermoLoop Target Night"
    assert entity.native_min_value == 16
    assert entity.native_max_value == 30


def test_target_day_default_value(mock_hass):
    entity = ThermoLoopTargetNumber(mock_hass, "entry_id", "day")
    assert entity.native_value == 22.0


def test_target_night_default_value(mock_hass):
    entity = ThermoLoopTargetNumber(mock_hass, "entry_id", "night")
    assert entity.native_value == 24.0


@pytest.mark.asyncio
async def test_set_target_value_awaits_write(mock_hass):
    """async_set_native_value should await async_write_ha_state."""
    entity = ThermoLoopTargetNumber(mock_hass, "entry_id", "day")
    entity.async_write_ha_state = AsyncMock()
    await entity.async_set_native_value(25.0)
    assert entity.native_value == 25.0
    entity.async_write_ha_state.assert_awaited()
