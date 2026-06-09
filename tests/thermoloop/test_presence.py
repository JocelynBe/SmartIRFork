"""Tests for ThermoLoop presence tracker."""
from unittest.mock import MagicMock

import pytest

from custom_components.thermoloop.presence import PresenceTracker


@pytest.fixture
def mock_hass():
    hass = MagicMock()
    hass.states = MagicMock()
    return hass


def test_defaults_to_home_when_no_trackers_configured(mock_hass):
    tracker = PresenceTracker(mock_hass, [])
    assert tracker.is_away is False


def test_away_when_all_tracked_devices_are_away(mock_hass):
    mock_hass.states.get.return_value = MagicMock(state="not_home")
    tracker = PresenceTracker(mock_hass, ["device_tracker.phone1", "device_tracker.phone2"])
    result = tracker.is_away
    assert result is True
    calls = mock_hass.states.get.call_args_list
    assert len(calls) == 2


def test_home_when_any_tracked_device_is_home(mock_hass):
    def state_side_effect(entity_id):
        states = {
            "device_tracker.phone1": MagicMock(state="not_home"),
            "device_tracker.phone2": MagicMock(state="home"),
        }
        return states[entity_id]
    mock_hass.states.get.side_effect = state_side_effect
    tracker = PresenceTracker(mock_hass, ["device_tracker.phone1", "device_tracker.phone2"])
    assert tracker.is_away is False


def test_away_when_all_devices_states_are_unknown(mock_hass):
    def state_side_effect(entity_id):
        states = {
            "device_tracker.phone1": MagicMock(state="unknown"),
            "device_tracker.phone2": MagicMock(state="unknown"),
        }
        return states[entity_id]
    mock_hass.states.get.side_effect = state_side_effect
    tracker = PresenceTracker(mock_hass, ["device_tracker.phone1", "device_tracker.phone2"])
    assert tracker.is_away is True


def test_client_ids_property_returns_configured_devices(mock_hass):
    tracker = PresenceTracker(mock_hass, ["device_tracker.phone1"])
    assert tracker.client_ids == ["device_tracker.phone1"]
