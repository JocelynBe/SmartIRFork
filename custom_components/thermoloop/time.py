"""Time platform for ThermoLoop.

Exposes ``time`` entities for configuring the night window
(start/end), switching between day and night setpoint targets.
"""
from __future__ import annotations

import datetime as dt
import logging

from homeassistant.components.time import TimeEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from custom_components.thermoloop.const import DOMAIN

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the ThermoLoop night window time entities."""
    start_entity = ThermoLoopNightWindowStart(hass, entry.entry_id)
    end_entity = ThermoLoopNightWindowEnd(hass, entry.entry_id)
    async_add_entities([start_entity, end_entity])

    # Register entities in hass.data for control loop access
    store = hass.data.setdefault(DOMAIN, {}).setdefault(entry.entry_id, {}).setdefault("entities", {})
    store["night_start"] = start_entity
    store["night_end"] = end_entity


class ThermoLoopNightWindowStart(RestoreEntity, TimeEntity):
    """Night window start time."""

    _attr_has_entity_name = True

    def __init__(self, hass: HomeAssistant, entry_id: str) -> None:
        self._hass = hass
        self._entry_id = entry_id
        self._attr_unique_id = f"thermoloop_night_window_start_{entry_id}"
        self._attr_name = "ThermoLoop Night Window Start"
        self._attr_native_value = dt.time(22, 0, 0)

    async def async_added_to_hass(self) -> None:
        """Restore state on startup."""
        await super().async_added_to_hass()
        last = await self.async_get_last_state()
        if last is not None:
            try:
                self._attr_native_value = dt.time.fromisoformat(last.state)
            except (ValueError, TypeError):
                pass

    async def async_set_value(self, value: dt.time) -> None:
        self._attr_native_value = value
        self.async_write_ha_state()


class ThermoLoopNightWindowEnd(RestoreEntity, TimeEntity):
    """Night window end time."""

    _attr_has_entity_name = True

    def __init__(self, hass: HomeAssistant, entry_id: str) -> None:
        self._hass = hass
        self._entry_id = entry_id
        self._attr_unique_id = f"thermoloop_night_window_end_{entry_id}"
        self._attr_name = "ThermoLoop Night Window End"
        self._attr_native_value = dt.time(7, 0, 0)

    async def async_added_to_hass(self) -> None:
        """Restore state on startup."""
        await super().async_added_to_hass()
        last = await self.async_get_last_state()
        if last is not None:
            try:
                self._attr_native_value = dt.time.fromisoformat(last.state)
            except (ValueError, TypeError):
                pass

    async def async_set_value(self, value: dt.time) -> None:
        self._attr_native_value = value
        self.async_write_ha_state()
