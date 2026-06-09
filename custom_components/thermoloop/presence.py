"""Event-driven presence tracker for ThermoLoop.

Listens to device_tracker state changes via async_track_state_change_event
and fires a callback when presence transitions (home -> away, away -> home).
"""
from __future__ import annotations

import logging
from typing import Callable

from homeassistant.core import HomeAssistant, State
from homeassistant.helpers.event import async_track_state_change_event

_LOGGER = logging.getLogger(__name__)


class PresenceTracker:
    """Event-driven occupancy tracker."""

    def __init__(
        self,
        hass: HomeAssistant,
        client_ids: list[str],
        callback: Callable[[str], None] | None = None,
    ) -> None:
        self._hass = hass
        self._client_ids = list(client_ids)
        self._callback = callback
        self._unsubs: list[Callable] = []
        self._was_away: bool = self._compute_away()

        if callback is not None:
            for eid in client_ids:
                unsub = async_track_state_change_event(
                    hass, [eid], self._handle_state_change
                )
                self._unsubs.append(unsub)

    def _handle_state_change(self, event) -> None:
        data = event.data
        new_state: State | None = data.get("new_state")
        if new_state is None:
            return
        now_away = self._compute_away()
        if self._was_away != now_away:
            transition = "away" if now_away else "home"
            _LOGGER.debug("Presence transition: %s", transition)
            if self._callback:
                self._callback(transition)
            self._was_away = now_away

    @property
    def is_away(self) -> bool:
        return self._compute_away()

    def _compute_away(self) -> bool:
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

    def stop(self) -> None:
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
