"""Tests for ThermoLoop select entities."""
from unittest.mock import MagicMock

import pytest

from custom_components.thermoloop.select import ThermoLoopSelect


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

    def test_set_option(self, mode_entity):
        mode_entity.async_select_option("off")
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
