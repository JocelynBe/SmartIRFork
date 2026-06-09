"""Tests for ThermoLoop sensor entities."""
from unittest.mock import MagicMock

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
    assert sensor.entity_id is None


def test_status_sensor_state_defaults_to_idle(mock_hass):
    sensor = ThermoLoopStatusSensor(mock_hass, "entry_id")
    assert sensor.native_value == "idle"


@pytest.mark.asyncio
async def test_update_state_changes_value(mock_hass):
    sensor = ThermoLoopStatusSensor(mock_hass, "entry_id")
    await sensor.update_state("active", mode="cool", algorithm="v0", target=22.0,
                              active_sensor="sensor.room", current_temp=26.5,
                              reason="test")
    assert sensor.native_value == "active"


@pytest.mark.asyncio
async def test_update_state_sets_attributes(mock_hass):
    sensor = ThermoLoopStatusSensor(mock_hass, "entry_id")
    await sensor.update_state("blocked", mode="cool", algorithm="v1", reason="guard")
    attrs = sensor.extra_state_attributes
    assert attrs["mode"] == "cool"
    assert attrs["algorithm"] == "v1"
    assert attrs["reason"] == "guard"


@pytest.mark.asyncio
async def test_update_state_partial_does_not_set_unprovided_attributes(mock_hass):
    sensor = ThermoLoopStatusSensor(mock_hass, "entry_id")
    await sensor.update_state("error", reason="exception")
    attrs = sensor.extra_state_attributes
    assert "reason" in attrs
    assert "mode" not in attrs
    assert "target" not in attrs


@pytest.mark.asyncio
async def test_update_state_with_humidity(mock_hass):
    sensor = ThermoLoopStatusSensor(mock_hass, "entry_id")
    await sensor.update_state("active", mode="cool", humidity=55.0, reason="test")
    assert sensor.extra_state_attributes.get("humidity") == 55.0
