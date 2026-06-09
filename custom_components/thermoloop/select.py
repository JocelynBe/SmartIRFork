"""Select platform for ThermoLoop.

Exposes ``select`` entities for mode (cool/heat/dry/auto) and
algorithm (standard/aggressive/eco).
"""
from __future__ import annotations

import logging

from homeassistant.components.select import SelectEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from custom_components.thermoloop.const import DOMAIN

_LOGGER = logging.getLogger(__name__)

_MODE_OPTIONS = ["auto", "off", "away"]
_ALGORITHM_OPTIONS = ["v0", "v1"]
_DEFAULTS: dict[str, str] = {"mode": "auto", "algorithm": "v0"}


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the ThermoLoop select entities."""
    async_add_entities([
        ThermoLoopSelect(hass, entry.entry_id, "mode", options=_MODE_OPTIONS),
        ThermoLoopSelect(hass, entry.entry_id, "algorithm",
                         options=_ALGORITHM_OPTIONS),
    ])


class ThermoLoopSelect(SelectEntity):
    """A select entity for ThermoLoop configuration."""

    _attr_has_entity_name = True

    def __init__(
        self,
        hass: HomeAssistant,
        entry_id: str,
        key: str,
        options: list[str],
    ) -> None:
        self._hass = hass
        self._entry_id = entry_id
        self._key = key
        self._attr_unique_id = f"thermoloop_{key}_{entry_id}"
        self._attr_name = f"ThermoLoop {key.capitalize()}"
        self._options = options
        self._attr_current_option = _DEFAULTS.get(key, options[0])
        self._attr_options = options

    async def async_select_option(self, option: str) -> None:
        self._attr_current_option = option
        await self.async_write_ha_state()
