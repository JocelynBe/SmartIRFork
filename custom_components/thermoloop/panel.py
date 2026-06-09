"""Panel registration for ThermoLoop sidebar panel."""
from __future__ import annotations

import logging
import os

from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

_PANEL_URL = "/thermoloop-panel"
_PANEL_JS = "thermoloop-panel.js"
_SIDEBAR_TITLE = "ThermoLoop"
_SIDEBAR_ICON = "mdi:thermostat"


async def async_register_panel(hass: HomeAssistant) -> None:
    """Register the ThermoLoop sidebar panel and static path."""
    www_path = os.path.join(os.path.dirname(__file__), "www")

    await hass.http.async_register_static_paths([
        StaticPathConfig(_PANEL_URL, www_path, True),
    ])

    await hass.components.panel_custom.async_register_panel(
        hass=hass,
        frontend_url_path="thermoloop",
        webcomponent_name="thermoloop-panel",
        sidebar_title=_SIDEBAR_TITLE,
        sidebar_icon=_SIDEBAR_ICON,
        module_url=f"{_PANEL_URL}/{_PANEL_JS}",
        embed_iframe=False,
        require_admin=True,
    )

    _LOGGER.debug("ThermoLoop panel registered")


async def async_remove_panel(hass: HomeAssistant) -> None:
    """Remove the ThermoLoop sidebar panel."""
    try:
        hass.components.frontend.async_remove_panel("thermoloop")
    except Exception:
        _LOGGER.debug("Could not remove panel (may already be gone)")
