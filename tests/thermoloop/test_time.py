"""Tests for ThermoLoop time entities."""
from unittest.mock import MagicMock

import pytest

from custom_components.thermoloop.time import ThermoLoopNightWindowStart, ThermoLoopNightWindowEnd


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
        assert night_start.native_value == "23:00:00"

    def test_name(self, night_start):
        assert night_start.name == "ThermoLoop Night Window Start"

    def test_unique_id(self, night_start):
        assert night_start.unique_id == "thermoloop_night_window_start_entry_id"


class TestNightEnd:

    def test_default_value(self, night_end):
        assert night_end.native_value == "07:00:00"

    def test_name(self, night_end):
        assert night_end.name == "ThermoLoop Night Window End"

    def test_unique_id(self, night_end):
        assert night_end.unique_id == "thermoloop_night_window_end_entry_id"


def test_set_night_start(mock_hass):
    entity = ThermoLoopNightWindowStart(mock_hass, "entry_id")
    entity.async_set_value("22:00:00")
    assert entity.native_value == "22:00:00"


def test_set_night_end(mock_hass):
    entity = ThermoLoopNightWindowEnd(mock_hass, "entry_id")
    entity.async_set_value("06:30:00")
    assert entity.native_value == "06:30:00"
