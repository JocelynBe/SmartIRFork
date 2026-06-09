"""Presence tracker for ThermoLoop.

Determines home/away state by checking HA device_tracker entities.
Used by the control loop to switch between day and night setpoints.
"""
from __future__ import annotations

import logging

from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)


class PresenceTracker:
    """Tracks occupancy via HA device_tracker entity states."""

    def __init__(self, hass: HomeAssistant, client_ids: list[str]) -> None:
        self._hass = hass
        self._client_ids = client_ids

    @property
    def is_away(self) -> bool:
        """True if all tracked devices are away/unknown."""
        if not self._client_ids:
            return False
        for eid in self._client_ids:
            state = self._hass.states.get(eid)
            if state is None or state.state in ("not_home", "unknown"):
                continue
            return False
        return True

    @property
    def client_ids(self) -> list[str]:
        return list(self._client_ids)
