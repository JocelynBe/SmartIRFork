"""Tests for panel registration."""
from unittest.mock import AsyncMock, MagicMock
import pytest


@pytest.fixture
def mock_hass():
    hass = MagicMock()
    hass.data = {}
    hass.http = MagicMock()
    hass.http.async_register_static_paths = AsyncMock(return_value=None)
    hass.components.panel_custom = MagicMock()
    hass.components.panel_custom.async_register_panel = AsyncMock()
    hass.components.frontend = MagicMock()
    hass.components.frontend.async_remove_panel = MagicMock()
    return hass


@pytest.mark.asyncio
async def test_register_panel_registers_static_paths(mock_hass):
    from custom_components.thermoloop.panel import async_register_panel
    await async_register_panel(mock_hass)
    mock_hass.http.async_register_static_paths.assert_awaited_once()


@pytest.mark.asyncio
async def test_register_panel_calls_panel_custom(mock_hass):
    from custom_components.thermoloop.panel import async_register_panel
    await async_register_panel(mock_hass)
    mock_hass.components.panel_custom.async_register_panel.assert_awaited_once()


@pytest.mark.asyncio
async def test_register_panel_uses_correct_args(mock_hass):
    from custom_components.thermoloop.panel import async_register_panel
    await async_register_panel(mock_hass)
    _args, kwargs = mock_hass.components.panel_custom.async_register_panel.call_args
    assert kwargs.get("frontend_url_path") == "thermoloop"
    assert kwargs.get("sidebar_title") == "ThermoLoop"
    assert kwargs.get("sidebar_icon") == "mdi:thermostat"


@pytest.mark.asyncio
async def test_remove_panel_calls_frontend(mock_hass):
    from custom_components.thermoloop.panel import async_remove_panel
    await async_remove_panel(mock_hass)
    mock_hass.components.frontend.async_remove_panel.assert_called_once_with("thermoloop")
