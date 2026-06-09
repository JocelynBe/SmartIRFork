"""Actuator: sends AC commands via Broadlink IR.

Translates a pure `ACCommand` into a raw IR code and sends it via
`remote.send_command` on the configured Broadlink remote entity.
"""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from custom_components.thermoloop.contracts import ACCommand, ACState
from custom_components.thermoloop.ir_codes import generate, generate_power_off

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)


class Actuator:
    """Sends AC commands via Broadlink IR remote entity."""

    def __init__(self, hass: HomeAssistant, broadlink_entity_id: str) -> None:
        self._hass = hass
        self._entity_id = broadlink_entity_id
        self._last_state: ACState | None = None

    @property
    def last_state(self) -> ACState | None:
        return self._last_state

    async def apply(self, cmd: ACCommand) -> bool:
        """Send an ACCommand via Broadlink remote.

        Returns:
            True if the command was sent successfully, False otherwise.
        """
        try:
            code = generate_power_off() if not cmd.power else generate(cmd)
            await self._hass.services.async_call(
                "remote", "send_command",
                {"entity_id": self._entity_id, "command": [f"b64:{code}"]},
                blocking=True,
            )
            self._last_state = ACState(
                power=cmd.power,
                mode=cmd.mode,
                setpoint=cmd.setpoint,
                fan=cmd.fan,
            )
            return True
        except Exception:
            _LOGGER.exception("Failed to send IR command via %s", self._entity_id)
            return False
