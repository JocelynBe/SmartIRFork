"""Tests for ThermoLoop event-driven presence tracker."""
from unittest.mock import MagicMock, patch

import pytest

from custom_components.thermoloop.presence import PresenceTracker


@pytest.fixture
def mock_hass():
    hass = MagicMock()
    hass.states = MagicMock()
    return hass


@patch('custom_components.thermoloop.presence.async_track_state_change_event')
def test_init_no_trackers(mock_evt, mock_hass):
    tracker = PresenceTracker(mock_hass, [], None)
    assert not tracker.is_away
    assert tracker.client_ids == []
    mock_evt.assert_not_called()


@patch('custom_components.thermoloop.presence.async_track_state_change_event')
def test_init_with_trackers(mock_evt, mock_hass):
    cb = MagicMock()
    tracker = PresenceTracker(
        mock_hass, ["device_tracker.phone1"], cb
    )
    assert tracker.client_ids == ["device_tracker.phone1"]


@patch('custom_components.thermoloop.presence.async_track_state_change_event')
def test_init_registers_callbacks(mock_evt, mock_hass):
    cb = MagicMock()
    mock_evt.return_value = lambda: None
    tracker = PresenceTracker(
        mock_hass, ["device_tracker.phone1", "device_tracker.phone2"], cb
    )
    assert mock_evt.call_count == 2
    assert len(tracker._unsubs) == 2


def test_away_when_all_tracked_devices_are_away(mock_hass):
    def state_side_effect(eid):
        s = MagicMock()
        s.state = "not_home"
        return s
    mock_hass.states.get.side_effect = state_side_effect
    tracker = PresenceTracker(mock_hass, ["device_tracker.phone1", "device_tracker.phone2"], None)
    assert tracker.is_away is True


def test_home_when_any_device_is_home(mock_hass):
    def state_side_effect(eid):
        s = MagicMock(state="home")
        return s
    mock_hass.states.get.side_effect = state_side_effect
    tracker = PresenceTracker(mock_hass, ["device_tracker.phone1"], None)
    assert tracker.is_away is False


class _FakeEvent:
    def __init__(self, entity_id, old_state, new_state):
        self.data = {
            "entity_id": entity_id,
            "old_state": old_state,
            "new_state": new_state,
        }


@patch('custom_components.thermoloop.presence.async_track_state_change_event')
def test_presence_callback_fires_on_transition(mock_evt, mock_hass):
    cb = MagicMock()
    mock_hass.states.get.return_value = MagicMock(state="home")
    tracker = PresenceTracker(
        mock_hass, ["device_tracker.phone1"], cb
    )
    mock_hass.states.get.return_value = MagicMock(state="not_home")
    new_state = MagicMock(state="not_home")
    old_state = MagicMock(state="home")
    tracker._handle_state_change(
        _FakeEvent("device_tracker.phone1", old_state, new_state)
    )
    cb.assert_called_once_with("away")
