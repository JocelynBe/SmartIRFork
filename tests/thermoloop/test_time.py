"""Tests for ThermoLoop time entities."""
import datetime
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
