"""Panel registration for ThermoLoop sidebar panel."""
from __future__ import annotations

import hashlib
import logging
import os

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

_PANEL_URL = "/thermoloop-panel"
_PANEL_JS = "thermoloop-panel.js"
_SIDEBAR_TITLE = "ThermoLoop"
_SIDEBAR_ICON = "mdi:thermostat"


def _bundle_version() -> str:
    """Short content hash of the panel bundle, used to bust browser cache.

    Without a per-build query string, browsers (and HA's module loader) keep
    serving a previously cached panel module after an update, which silently
    masks fixes. Hashing the file content makes the URL change whenever the
    bundle changes. Computed once at import (integration modules are imported
    off the event loop), so this never blocks the loop.
    """
    js_path = os.path.join(os.path.dirname(__file__), "www", _PANEL_JS)
    try:
        with open(js_path, "rb") as fh:
            return hashlib.md5(fh.read()).hexdigest()[:8]
    except OSError:
        return "dev"


_BUNDLE_VERSION = _bundle_version()


async def async_register_panel(hass: HomeAssistant) -> None:
    """Register the ThermoLoop sidebar panel and static path."""
    www_path = os.path.join(os.path.dirname(__file__), "www")

    await hass.http.async_register_static_paths([
        StaticPathConfig(_PANEL_URL, www_path, True),
    ])

    await panel_custom.async_register_panel(
        hass=hass,
        frontend_url_path="thermoloop",
        webcomponent_name="thermoloop-panel",
        sidebar_title=_SIDEBAR_TITLE,
        sidebar_icon=_SIDEBAR_ICON,
        module_url=f"{_PANEL_URL}/{_PANEL_JS}?v={_BUNDLE_VERSION}",
        embed_iframe=False,
        require_admin=True,
    )

    _LOGGER.debug("ThermoLoop panel registered (bundle v%s)", _BUNDLE_VERSION)


async def async_remove_panel(hass: HomeAssistant) -> None:
    """Remove the ThermoLoop sidebar panel."""
    try:
        await frontend.async_remove_panel(hass, "thermoloop")
    except Exception:
        _LOGGER.debug("Could not remove panel (may already be gone)")
