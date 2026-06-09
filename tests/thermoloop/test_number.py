"""Tests for ThermoLoop number entities."""
from unittest.mock import MagicMock

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
