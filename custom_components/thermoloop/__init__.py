"""ThermoLoop: closed-loop smart-thermostat layer for Home Assistant."""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from homeassistant.const import Platform

from custom_components.thermoloop.actuator import Actuator
from custom_components.thermoloop.panel import async_register_panel, async_remove_panel
from custom_components.thermoloop.const import (
    CONF_BROADLINK_REMOTE,
    CONF_HUMIDITY_SENSOR_BEDROOM,
    CONF_HUMIDITY_SENSOR_LIVING,
    CONF_PRESENCE_TRACKER,
    CONF_TEMP_SENSOR_BEDROOM,
    CONF_TEMP_SENSOR_LIVING,
    DOMAIN,
)
from custom_components.thermoloop.control_loop import ControlLoop
from custom_components.thermoloop.presence import PresenceTracker

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
    broadlink_remote_id: str = entry.data[CONF_BROADLINK_REMOTE]
    temp_sensor_day: str = entry.data[CONF_TEMP_SENSOR_LIVING]
    temp_sensor_night: str = entry.data[CONF_TEMP_SENSOR_BEDROOM]
    humidity_sensor_living: str | None = entry.data.get(CONF_HUMIDITY_SENSOR_LIVING)
    humidity_sensor_bedroom: str | None = entry.data.get(CONF_HUMIDITY_SENSOR_BEDROOM)
    device_tracker_entities: list[str] = entry.data.get(CONF_PRESENCE_TRACKER, [])

    actuator = Actuator(hass, broadlink_remote_id)

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {"entities": {}}

    # Forward setup to entity platforms
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Retrieve status sensor stored by sensor platform
    entry_data = hass.data[DOMAIN][entry.entry_id]
    status_sensor: ThermoLoopStatusSensor | None = entry_data.get("status_sensor")

    # Create control loop first (without presence)
    control_loop = ControlLoop(
        hass=hass,
        entry_id=entry.entry_id,
        temp_sensor_day_entity_id=temp_sensor_day,
        temp_sensor_night_entity_id=temp_sensor_night,
        actuator=actuator,
        presence=None,
        status_sensor=status_sensor,
        humidity_sensor_day_entity_id=humidity_sensor_living,
        humidity_sensor_night_entity_id=humidity_sensor_bedroom,
    )
    entry_data["control_loop"] = control_loop

    # Event-driven presence: callback fires control_loop.async_tick on transition
    async def _on_presence(transition: str) -> None:
        await control_loop.async_tick()

    # Create presence tracker with callback
    presence = PresenceTracker(hass, device_tracker_entities, _on_presence)
    entry_data["presence"] = presence

    # Set presence in control loop via public method
    control_loop.set_presence(presence)

    control_loop.start()

    # Register service
    async def handle_tick(call):
        await control_loop.async_tick()

    hass.services.async_register(DOMAIN, "tick", handle_tick)

    if not hass.data[DOMAIN].get("_panel_registered"):
        await async_register_panel(hass)
        hass.data[DOMAIN]["_panel_registered"] = True

    _LOGGER.debug("ThermoLoop setup complete for entry %s", entry.entry_id)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    entry_data = hass.data[DOMAIN].get(entry.entry_id, {})
    presence = entry_data.get("presence")
    if presence is not None:
        presence.stop()
    control_loop = entry_data.get("control_loop")
    if control_loop is not None:
        control_loop.stop()
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
        remaining = [k for k in hass.data[DOMAIN] if k != "_panel_registered"]
        if not remaining:
            # Remove the tick service when no entries remain
            hass.services.async_remove(DOMAIN, "tick")
            await async_remove_panel(hass)
            hass.data[DOMAIN].pop("_panel_registered", None)
    return True
