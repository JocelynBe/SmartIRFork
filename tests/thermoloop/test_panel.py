"""Tests for panel registration."""
from unittest.mock import AsyncMock, MagicMock, patch
import pytest


@pytest.fixture
def mock_hass():
    hass = MagicMock()
    hass.data = {}
    hass.http = MagicMock()
    hass.http.async_register_static_paths = AsyncMock(return_value=None)
    return hass


@pytest.mark.asyncio
@patch('custom_components.thermoloop.panel.panel_custom.async_register_panel', new_callable=AsyncMock)
async def test_register_panel_registers_static_paths(mock_register, mock_hass):
    from custom_components.thermoloop.panel import async_register_panel
    await async_register_panel(mock_hass)
    mock_hass.http.async_register_static_paths.assert_awaited_once()


@pytest.mark.asyncio
@patch('custom_components.thermoloop.panel.panel_custom.async_register_panel', new_callable=AsyncMock)
async def test_register_panel_calls_panel_custom(mock_register, mock_hass):
    from custom_components.thermoloop.panel import async_register_panel
    await async_register_panel(mock_hass)
    mock_register.assert_awaited_once()


@pytest.mark.asyncio
@patch('custom_components.thermoloop.panel.panel_custom.async_register_panel', new_callable=AsyncMock)
async def test_register_panel_uses_correct_args(mock_register, mock_hass):
    from custom_components.thermoloop.panel import async_register_panel
    await async_register_panel(mock_hass)
    _args, kwargs = mock_register.call_args
    assert kwargs.get("frontend_url_path") == "thermoloop"
    assert kwargs.get("sidebar_title") == "ThermoLoop"
    assert kwargs.get("sidebar_icon") == "mdi:thermostat"


@pytest.mark.asyncio
@patch('custom_components.thermoloop.panel.frontend.async_remove_panel', new_callable=AsyncMock)
async def test_remove_panel_calls_frontend(mock_remove, mock_hass):
    from custom_components.thermoloop.panel import async_remove_panel
    await async_remove_panel(mock_hass)
    mock_remove.assert_called_once_with(mock_hass, "thermoloop")
