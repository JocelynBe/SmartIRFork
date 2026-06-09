"""Tests for ThermoLoop select entities."""
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.thermoloop.const import DOMAIN
from custom_components.thermoloop.select import ThermoLoopSelect, async_setup_entry


@pytest.fixture
def mock_hass():
    return MagicMock()


@pytest.fixture
def mode_entity(mock_hass):
    return ThermoLoopSelect(mock_hass, "entry_id", "mode",
                            options=["auto", "off", "away"])


@pytest.fixture
def algo_entity(mock_hass):
    return ThermoLoopSelect(mock_hass, "entry_id", "algorithm",
                            options=["v0", "v1"])


class TestModeSelect:

    def test_default_value(self, mode_entity):
        assert mode_entity.current_option == "auto"

    def test_unique_id(self, mode_entity):
        assert mode_entity.unique_id == "thermoloop_mode_entry_id"

    def test_name(self, mode_entity):
        assert mode_entity.name == "ThermoLoop Mode"

    def test_options(self, mode_entity):
        assert mode_entity.options == ["auto", "off", "away"]

    @pytest.mark.asyncio
    async def test_set_option(self, mode_entity):
        await mode_entity.async_select_option("off")
        assert mode_entity.current_option == "off"


class TestAlgorithmSelect:

    def test_default_value(self, algo_entity):
        assert algo_entity.current_option == "v0"

    def test_unique_id(self, algo_entity):
        assert algo_entity.unique_id == "thermoloop_algorithm_entry_id"

    def test_name(self, algo_entity):
        assert algo_entity.name == "ThermoLoop Algorithm"

    def test_options(self, algo_entity):
        assert algo_entity.options == ["v0", "v1"]


@pytest.mark.asyncio
async def test_restore_select_value_on_startup(mock_hass):
    """Entity should restore its option from previous state on startup."""
    from tests.thermoloop.conftest import MockState

    entity = ThermoLoopSelect(mock_hass, "entry_id", "mode",
                              options=["auto", "off", "away"])
    assert entity.current_option == "auto"  # default

    # Mock async_get_last_state to return a saved option
    saved_state = MockState(state="off")
    entity.async_get_last_state = AsyncMock(return_value=saved_state)

    # Call async_added_to_hass to trigger restore
    await entity.async_added_to_hass()

    assert entity.current_option == "off"


@pytest.mark.asyncio
async def test_restore_select_invalid_state(mock_hass):
    """Entity should keep default if prior state is not in options."""
    from tests.thermoloop.conftest import MockState

    entity = ThermoLoopSelect(mock_hass, "entry_id", "algorithm",
                              options=["v0", "v1"])
    assert entity.current_option == "v0"

    # Mock async_get_last_state to return an invalid option
    saved_state = MockState(state="invalid_option")
    entity.async_get_last_state = AsyncMock(return_value=saved_state)

    await entity.async_added_to_hass()

    # Should keep default since saved state is not in options
    assert entity.current_option == "v0"


@pytest.mark.asyncio
async def test_restore_select_none_state(mock_hass):
    """Entity should keep default if no prior state exists."""
    entity = ThermoLoopSelect(mock_hass, "entry_id", "mode",
                              options=["auto", "off", "away"])
    assert entity.current_option == "auto"

    entity.async_get_last_state = AsyncMock(return_value=None)

    await entity.async_added_to_hass()

    assert entity.current_option == "auto"


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
    assert "mode" in store
    assert "algorithm" in store
    assert isinstance(store["mode"], ThermoLoopSelect)
    assert isinstance(store["algorithm"], ThermoLoopSelect)
    assert store["mode"].current_option == "auto"
    assert store["algorithm"].current_option == "v0"
