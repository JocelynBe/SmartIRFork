"""Tests for ThermoLoop number entities."""
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.thermoloop.const import DOMAIN
from custom_components.thermoloop.number import ThermoLoopTargetNumber, async_setup_entry


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
async def test_set_target_value_writes_state(mock_hass):
    """async_set_native_value updates the value and writes state synchronously.

    HA's async_write_ha_state is a sync @callback, so it must be called, NOT
    awaited (awaiting it raises 'NoneType object can't be awaited' in real HA).
    """
    entity = ThermoLoopTargetNumber(mock_hass, "entry_id", "day")
    entity.async_write_ha_state = MagicMock()
    await entity.async_set_native_value(25.0)
    assert entity.native_value == 25.0
    entity.async_write_ha_state.assert_called_once()


@pytest.mark.asyncio
async def test_restore_number_value_on_startup(mock_hass):
    """Entity should restore its value from previous state on startup."""
    from tests.thermoloop.conftest import MockNumberData

    entity = ThermoLoopTargetNumber(mock_hass, "entry_id", "day")
    assert entity.native_value == 22.0  # default

    # Mock async_get_last_number_data to return a saved value
    saved_data = MockNumberData(native_value=23.5)
    entity.async_get_last_number_data = AsyncMock(return_value=saved_data)

    # Call async_added_to_hass to trigger restore
    await entity.async_added_to_hass()

    assert entity.native_value == 23.5


@pytest.mark.asyncio
async def test_restore_number_none_state(mock_hass):
    """Entity should keep default if no prior state exists."""
    entity = ThermoLoopTargetNumber(mock_hass, "entry_id", "night")
    assert entity.native_value == 24.0  # default

    entity.async_get_last_number_data = AsyncMock(return_value=None)

    await entity.async_added_to_hass()

    assert entity.native_value == 24.0


@pytest.mark.asyncio
async def test_registration_in_hass_data(mock_hass):
    """Entities should be registered in hass.data for control loop access."""
    mock_hass.data = {}
    entry = MagicMock()
    entry.entry_id = "test_entry_id"
    async_add_entities = AsyncMock()

    await async_setup_entry(mock_hass, entry, async_add_entities)

    # Verify entities are in hass.data
    assert DOMAIN in mock_hass.data
    assert "test_entry_id" in mock_hass.data[DOMAIN]
    assert "entities" in mock_hass.data[DOMAIN]["test_entry_id"]

    store = mock_hass.data[DOMAIN]["test_entry_id"]["entities"]
    assert "target_day" in store
    assert "target_night" in store
    assert isinstance(store["target_day"], ThermoLoopTargetNumber)
    assert isinstance(store["target_night"], ThermoLoopTargetNumber)
    assert store["target_day"].native_value == 22.0
    assert store["target_night"].native_value == 24.0
