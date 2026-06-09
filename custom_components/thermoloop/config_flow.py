"""Config flow for ThermoLoop.

Minimal import-based config flow. User adds ThermoLoop via yaml; HA creates
the config entry from the yaml config.
"""
from __future__ import annotations

from homeassistant import config_entries
from homeassistant.const import CONF_NAME
import voluptuous as vol

from custom_components.thermoloop.const import DOMAIN

DATA_SCHEMA = vol.Schema({
    vol.Required(CONF_NAME, default="ThermoLoop"): str,
})


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input=None):
        if user_input is not None:
            return self.async_create_entry(title=user_input[CONF_NAME], data=user_input)
        return self.async_show_form(step_id="user", data_schema=DATA_SCHEMA)

    async def async_step_import(self, import_config):
        return await self.async_step_user(import_config)
