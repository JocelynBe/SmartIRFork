"""ThermoLoop: closed-loop smart-thermostat layer for Home Assistant."""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from homeassistant.const import Platform

from .actuator import Actuator
from .const import DOMAIN
from .control_loop import ControlLoop
from .presence import PresenceTracker

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant

    from .sensor import ThermoLoopStatusSensor

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [
    Platform.SENSOR,
    Platform.NUMBER,
    Platform.SELECT,
    Platform.TIME,
]


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the ThermoLoop domain."""
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up ThermoLoop from a config entry."""
    climate_entity_id: str = entry.data["climate_entity_id"]
    temp_sensor_entity_id: str = entry.data["temp_sensor_entity_id"]
    device_tracker_entities: list[str] = entry.data.get("device_tracker_entities", [])

    actuator = Actuator(hass, climate_entity_id)
    presence = PresenceTracker(hass, device_tracker_entities)

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {}

    # Forward setup to entity platforms
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Retrieve status sensor stored by sensor platform
    entry_data = hass.data[DOMAIN][entry.entry_id]
    status_sensor: ThermoLoopStatusSensor | None = entry_data.get("status_sensor")

    control_loop = ControlLoop(
        hass=hass,
        entry_id=entry.entry_id,
        climate_entity_id=climate_entity_id,
        temp_sensor_entity_id=temp_sensor_entity_id,
        actuator=actuator,
        presence=presence,
        status_sensor=status_sensor,
    )
    entry_data["control_loop"] = control_loop

    control_loop.start()

    # Register service
    async def handle_tick(call):
        await control_loop.async_tick()

    hass.services.async_register(DOMAIN, "tick", handle_tick)

    _LOGGER.debug("ThermoLoop setup complete for entry %s", entry.entry_id)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    entry_data = hass.data[DOMAIN].get(entry.entry_id, {})
    control_loop = entry_data.get("control_loop")
    if control_loop is not None:
        control_loop.stop()
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
    return True
