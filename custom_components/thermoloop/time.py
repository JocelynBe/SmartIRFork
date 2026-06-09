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

from custom_components.thermoloop.const import DOMAIN

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the ThermoLoop night window time entities."""
    async_add_entities([
        ThermoLoopNightWindowStart(hass, entry.entry_id),
        ThermoLoopNightWindowEnd(hass, entry.entry_id),
    ])


class ThermoLoopNightWindowStart(TimeEntity):
    """Night window start time."""

    _attr_has_entity_name = True
    _attr_native_value = dt.time(22, 0, 0)

    def __init__(self, hass: HomeAssistant, entry_id: str) -> None:
        self._hass = hass
        self._entry_id = entry_id
        self._attr_unique_id = f"thermoloop_night_window_start_{entry_id}"
        self._attr_name = "ThermoLoop Night Window Start"

    async def async_set_value(self, value: dt.time) -> None:
        self._attr_native_value = value
        await self.async_write_ha_state()


class ThermoLoopNightWindowEnd(TimeEntity):
    """Night window end time."""

    _attr_has_entity_name = True
    _attr_native_value = dt.time(7, 0, 0)

    def __init__(self, hass: HomeAssistant, entry_id: str) -> None:
        self._hass = hass
        self._entry_id = entry_id
        self._attr_unique_id = f"thermoloop_night_window_end_{entry_id}"
        self._attr_name = "ThermoLoop Night Window End"

    async def async_set_value(self, value: dt.time) -> None:
        self._attr_native_value = value
        await self.async_write_ha_state()
