"""Number platform for ThermoLoop.

Exposes day and night target temperatures as ``number`` entities, giving
UI editing, history, and automatability for free.
"""
from __future__ import annotations

import logging

from homeassistant.components.number import NumberEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfTemperature
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .contracts import MAX_SETPOINT, MIN_SETPOINT
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

_DEFAULT_TARGETS = {"day": 22.0, "night": 24.0}


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the ThermoLoop target number entities."""
    async_add_entities([
        ThermoLoopTargetNumber(hass, entry.entry_id, "day"),
        ThermoLoopTargetNumber(hass, entry.entry_id, "night"),
    ])


class ThermoLoopTargetNumber(NumberEntity):
    """A target temperature for day or night phase."""

    _attr_has_entity_name = True
    _attr_native_unit_of_measurement = UnitOfTemperature.CELSIUS
    _attr_native_min_value = float(MIN_SETPOINT)
    _attr_native_max_value = float(MAX_SETPOINT)
    _attr_native_step = 1.0

    def __init__(self, hass: HomeAssistant, entry_id: str, phase: str) -> None:
        self._hass = hass
        self._entry_id = entry_id
        self._phase = phase
        self._attr_unique_id = f"thermoloop_target_{phase}_{entry_id}"
        self._attr_name = f"ThermoLoop Target {phase.capitalize()}"
        self._attr_native_value = _DEFAULT_TARGETS[phase]

    async def async_set_native_value(self, value: float) -> None:
        """Set the target temperature."""
        self._attr_native_value = value
        self.async_write_ha_state()
