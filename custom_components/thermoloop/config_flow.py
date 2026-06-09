"""Config flow for ThermoLoop.

Entity selector config flow. User picks climate entity, day/night
temperature sensors, optional humidity sensors, and presence trackers.
"""
from __future__ import annotations

from homeassistant import config_entries
from homeassistant.const import CONF_NAME
from homeassistant.helpers import selector
import voluptuous as vol

from custom_components.thermoloop.const import (
    CONF_CLIMATE_ENTITY,
    CONF_HUMIDITY_SENSOR_BEDROOM,
    CONF_HUMIDITY_SENSOR_LIVING,
    CONF_PRESENCE_TRACKER,
    CONF_TEMP_SENSOR_BEDROOM,
    CONF_TEMP_SENSOR_LIVING,
    DOMAIN,
)

DATA_SCHEMA = vol.Schema({
    vol.Required(CONF_NAME, default="ThermoLoop"): str,
    vol.Required(CONF_CLIMATE_ENTITY): selector.EntitySelector(
        selector.EntitySelectorConfig(domain="climate")
    ),
    vol.Required(CONF_TEMP_SENSOR_LIVING): selector.EntitySelector(
        selector.EntitySelectorConfig(domain="sensor", device_class="temperature")
    ),
    vol.Required(CONF_TEMP_SENSOR_BEDROOM): selector.EntitySelector(
        selector.EntitySelectorConfig(domain="sensor", device_class="temperature")
    ),
    vol.Optional(CONF_HUMIDITY_SENSOR_LIVING): selector.EntitySelector(
        selector.EntitySelectorConfig(domain="sensor", device_class="humidity")
    ),
    vol.Optional(CONF_HUMIDITY_SENSOR_BEDROOM): selector.EntitySelector(
        selector.EntitySelectorConfig(domain="sensor", device_class="humidity")
    ),
    vol.Optional(CONF_PRESENCE_TRACKER, default=[]): selector.EntitySelector(
        selector.EntitySelectorConfig(domain="device_tracker", multiple=True)
    ),
})


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input=None):
        if user_input is not None:
            return self.async_create_entry(title=user_input[CONF_NAME], data=user_input)
        return self.async_show_form(step_id="user", data_schema=DATA_SCHEMA)

    async def async_step_import(self, import_config):
        return await self.async_step_user(import_config)
