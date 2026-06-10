"""Sensor platform for ThermoLoop.

The ``sensor.thermoloop_status`` diagnostic entity reports the last command
state, active sensor, current vs target, algorithm, and presence. Its
state history is the command timeline the panel overlays markers from.
"""
from __future__ import annotations

import logging

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_IDLE
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from custom_components.thermoloop.const import (
    ATTR_AC_MODE,
    ATTR_ACTIVE_SENSOR,
    ATTR_ALGORITHM,
    ATTR_CURRENT_TEMP,
    ATTR_DAY_SENSOR,
    ATTR_FAN,
    ATTR_HUMIDITY,
    ATTR_MODE,
    ATTR_NIGHT_SENSOR,
    ATTR_REASON,
    ATTR_SETPOINT,
    ATTR_TARGET,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the ThermoLoop status sensor."""
    sensor = ThermoLoopStatusSensor(hass, entry.entry_id)
    hass.data.setdefault(DOMAIN, {}).setdefault(entry.entry_id, {})
    hass.data[DOMAIN][entry.entry_id]["status_sensor"] = sensor
    async_add_entities([sensor])


class ThermoLoopStatusSensor(SensorEntity):
    """Reports the last command and current control state."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, hass: HomeAssistant, entry_id: str) -> None:
        self._hass = hass
        self._entry_id = entry_id
        self._attr_unique_id = f"thermoloop_status_{entry_id}"
        self._attr_name = "ThermoLoop Status"
        self._attr_native_value = STATE_IDLE
        self._attributes: dict = {}

    @property
    def extra_state_attributes(self) -> dict:
        return self._attributes

    async def update_state(
        self,
        state: str,
        *,
        mode: str | None = None,
        algorithm: str | None = None,
        target: float | None = None,
        active_sensor: str | None = None,
        current_temp: float | None = None,
        humidity: float | None = None,
        reason: str | None = None,
        setpoint: float | None = None,
        fan: str | None = None,
        ac_mode: str | None = None,
        day_sensor: str | None = None,
        night_sensor: str | None = None,
    ) -> None:
        """Update the sensor state and attributes."""
        self._attr_native_value = state
        attrs = {}
        if mode is not None:
            attrs[ATTR_MODE] = mode
        if algorithm is not None:
            attrs[ATTR_ALGORITHM] = algorithm
        if target is not None:
            attrs[ATTR_TARGET] = target
        if active_sensor is not None:
            attrs[ATTR_ACTIVE_SENSOR] = active_sensor
        if current_temp is not None:
            attrs[ATTR_CURRENT_TEMP] = current_temp
        if humidity is not None:
            attrs[ATTR_HUMIDITY] = humidity
        if reason is not None:
            attrs[ATTR_REASON] = reason
        if setpoint is not None:
            attrs[ATTR_SETPOINT] = setpoint
        if fan is not None:
            attrs[ATTR_FAN] = fan
        if ac_mode is not None:
            attrs[ATTR_AC_MODE] = ac_mode
        if day_sensor is not None:
            attrs[ATTR_DAY_SENSOR] = day_sensor
        if night_sensor is not None:
            attrs[ATTR_NIGHT_SENSOR] = night_sensor
        self._attributes = attrs
        self.async_write_ha_state()
