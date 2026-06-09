"""Actuator: the only HA-touching layer in the brain-to-AC pipeline.

Translates a pure `ACCommand` into concrete `climate.*` service calls on
the configured SmartIR climate entity.
"""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from custom_components.thermoloop.contracts import ACCommand, Fan, Mode

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

_FAN_MAP = {
    Fan.LOW: "low",
    Fan.MID: "mid",
    Fan.HIGH: "high",
    Fan.HIGHEST: "highest",
}

_MODE_MAP = {
    Mode.COOL: "cool",
    Mode.HEAT: "heat",
    Mode.DRY: "dry",
}


class Actuator:
    """Sends discrete AC commands to a Home Assistant climate entity."""

    def __init__(self, hass: HomeAssistant, entity_id: str) -> None:
        self._hass = hass
        self._entity_id = entity_id

    async def apply(self, cmd: ACCommand) -> None:
        """Apply an ACCommand to the climate entity via service calls."""
        if not cmd.power:
            await self._hass.services.async_call(
                "climate", "turn_off",
                {"entity_id": self._entity_id},
            )
            return

        await self._hass.services.async_call(
            "climate", "set_hvac_mode",
            {"entity_id": self._entity_id, "hvac_mode": _MODE_MAP[cmd.mode]},
        )
        await self._hass.services.async_call(
            "climate", "set_temperature",
            {"entity_id": self._entity_id, "temperature": cmd.setpoint},
        )
        await self._hass.services.async_call(
            "climate", "set_fan_mode",
            {"entity_id": self._entity_id, "fan_mode": _FAN_MAP[cmd.fan]},
        )

        _LOGGER.debug("Sent: %s", cmd)
