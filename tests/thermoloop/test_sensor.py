"""Tests for ThermoLoop sensor entities."""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.thermoloop.const import DOMAIN
from custom_components.thermoloop.sensor import ThermoLoopStatusSensor


@pytest.fixture
def mock_hass():
    hass = MagicMock()
    hass.data = {DOMAIN: {}}
    return hass


def test_status_sensor_has_correct_attributes(mock_hass):
    sensor = ThermoLoopStatusSensor(mock_hass, "entry_id")
    assert sensor.unique_id == "thermoloop_status_entry_id"
    assert sensor.name == "ThermoLoop Status"
    assert sensor.entity_id is None  # set when added to HA


def test_status_sensor_state_defaults_to_idle(mock_hass):
    sensor = ThermoLoopStatusSensor(mock_hass, "entry_id")
    assert sensor.native_value == "idle"
