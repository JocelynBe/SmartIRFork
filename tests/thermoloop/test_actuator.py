"""Tests for the ThermoLoop actuator."""
from unittest.mock import AsyncMock

import pytest

from custom_components.thermoloop.actuator import Actuator
from custom_components.thermoloop.contracts import ACCommand, Fan, Mode


@pytest.fixture
def mock_hass():
    hass = AsyncMock()
    hass.services.async_call = AsyncMock()
    return hass


def _cmd(power=True, mode=Mode.COOL, setpoint=22, fan=Fan.LOW, reason="test") -> ACCommand:
    return ACCommand(power=power, mode=mode, setpoint=setpoint, fan=fan, reason=reason)


@pytest.mark.asyncio
async def test_actuator_turn_off_calls_turn_off_service(mock_hass):
    actuator = Actuator(mock_hass, "climate.my_ac")
    cmd = _cmd(power=False)
    await actuator.apply(cmd)
    mock_hass.services.async_call.assert_called_once_with(
        "climate", "turn_off", {"entity_id": "climate.my_ac"}
    )


@pytest.mark.asyncio
async def test_actuator_cool_mode_sets_hvac_mode(mock_hass):
    actuator = Actuator(mock_hass, "climate.my_ac")
    cmd = _cmd(power=True, mode=Mode.COOL, setpoint=18, fan=Fan.HIGH)
    await actuator.apply(cmd)
    assert mock_hass.services.async_call.call_count == 3
    mock_hass.services.async_call.assert_any_call(
        "climate", "set_hvac_mode", {"entity_id": "climate.my_ac", "hvac_mode": "cool"}
    )
    mock_hass.services.async_call.assert_any_call(
        "climate", "set_temperature", {"entity_id": "climate.my_ac", "temperature": 18}
    )
    mock_hass.services.async_call.assert_any_call(
        "climate", "set_fan_mode", {"entity_id": "climate.my_ac", "fan_mode": "high"}
    )


@pytest.mark.asyncio
async def test_actuator_power_on_does_not_turn_off(mock_hass):
    actuator = Actuator(mock_hass, "climate.my_ac")
    cmd = _cmd(power=True)
    await actuator.apply(cmd)
    for call_args in mock_hass.services.async_call.call_args_list:
        domain, service, _ = call_args[0]
        assert not (domain == "climate" and service == "turn_off")
