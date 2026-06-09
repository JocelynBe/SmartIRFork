"""Tests for ThermoLoop time entities."""
import datetime
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.thermoloop.const import DOMAIN
from custom_components.thermoloop.time import (
    ThermoLoopNightWindowStart,
    ThermoLoopNightWindowEnd,
    async_setup_entry,
)


@pytest.fixture
def mock_hass():
    return MagicMock()


@pytest.fixture
def night_start(mock_hass):
    return ThermoLoopNightWindowStart(mock_hass, "entry_id")


@pytest.fixture
def night_end(mock_hass):
    return ThermoLoopNightWindowEnd(mock_hass, "entry_id")


class TestNightStart:

    def test_default_value(self, night_start):
        assert night_start.native_value == datetime.time(22, 0, 0)

    def test_name(self, night_start):
        assert night_start.name == "ThermoLoop Night Window Start"

    def test_unique_id(self, night_start):
        assert night_start.unique_id == "thermoloop_night_window_start_entry_id"


class TestNightEnd:

    def test_default_value(self, night_end):
        assert night_end.native_value == datetime.time(7, 0, 0)

    def test_name(self, night_end):
        assert night_end.name == "ThermoLoop Night Window End"

    def test_unique_id(self, night_end):
        assert night_end.unique_id == "thermoloop_night_window_end_entry_id"


@pytest.mark.asyncio
async def test_set_night_start(mock_hass):
    entity = ThermoLoopNightWindowStart(mock_hass, "entry_id")
    await entity.async_set_value(datetime.time(22, 30, 0))
    assert entity.native_value == datetime.time(22, 30, 0)


@pytest.mark.asyncio
async def test_set_night_end(mock_hass):
    entity = ThermoLoopNightWindowEnd(mock_hass, "entry_id")
    await entity.async_set_value(datetime.time(6, 30, 0))
    assert entity.native_value == datetime.time(6, 30, 0)


@pytest.mark.asyncio
async def test_restore_night_start_on_startup(mock_hass):
    """Entity should restore its time from previous state on startup."""
    from tests.thermoloop.conftest import MockState

    entity = ThermoLoopNightWindowStart(mock_hass, "entry_id")
    assert entity.native_value == datetime.time(22, 0, 0)  # default

    # Mock async_get_last_state to return a saved time
    saved_state = MockState(state="23:30:00")
    entity.async_get_last_state = AsyncMock(return_value=saved_state)

    # Call async_added_to_hass to trigger restore
    await entity.async_added_to_hass()

    assert entity.native_value == datetime.time(23, 30, 0)


@pytest.mark.asyncio
async def test_restore_night_end_on_startup(mock_hass):
    """Entity should restore its time from previous state on startup."""
    from tests.thermoloop.conftest import MockState

    entity = ThermoLoopNightWindowEnd(mock_hass, "entry_id")
    assert entity.native_value == datetime.time(7, 0, 0)  # default

    # Mock async_get_last_state to return a saved time
    saved_state = MockState(state="06:30:00")
    entity.async_get_last_state = AsyncMock(return_value=saved_state)

    await entity.async_added_to_hass()

    assert entity.native_value == datetime.time(6, 30, 0)


@pytest.mark.asyncio
async def test_restore_time_invalid_state(mock_hass):
    """Entity should keep default if prior state is invalid ISO format."""
    from tests.thermoloop.conftest import MockState

    entity = ThermoLoopNightWindowStart(mock_hass, "entry_id")
    assert entity.native_value == datetime.time(22, 0, 0)

    # Mock async_get_last_state to return an invalid time string
    saved_state = MockState(state="not a valid time")
    entity.async_get_last_state = AsyncMock(return_value=saved_state)

    await entity.async_added_to_hass()

    # Should keep default since saved state is invalid
    assert entity.native_value == datetime.time(22, 0, 0)


@pytest.mark.asyncio
async def test_restore_time_none_state(mock_hass):
    """Entity should keep default if no prior state exists."""
    entity = ThermoLoopNightWindowEnd(mock_hass, "entry_id")
    assert entity.native_value == datetime.time(7, 0, 0)

    entity.async_get_last_state = AsyncMock(return_value=None)

    await entity.async_added_to_hass()

    assert entity.native_value == datetime.time(7, 0, 0)


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
    assert "night_start" in store
    assert "night_end" in store
    assert isinstance(store["night_start"], ThermoLoopNightWindowStart)
    assert isinstance(store["night_end"], ThermoLoopNightWindowEnd)
    assert store["night_start"].native_value == datetime.time(22, 0, 0)
    assert store["night_end"].native_value == datetime.time(7, 0, 0)
