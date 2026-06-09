"""Tests for the ThermoLoop actuator (Broadlink direct IR)."""
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.thermoloop.actuator import Actuator
from custom_components.thermoloop.contracts import ACCommand, ACState, Fan, Mode


@pytest.fixture
def mock_hass():
    hass = MagicMock()
    hass.services = MagicMock()
    hass.services.async_call = AsyncMock(return_value=None)
    return hass


def _cmd(power=True, mode=Mode.COOL, setpoint=22, fan=Fan.LOW, reason="test") -> ACCommand:
    return ACCommand(power=power, mode=mode, setpoint=setpoint, fan=fan, reason=reason)


@pytest.mark.asyncio
async def test_actuator_sends_remote_command(mock_hass):
    actuator = Actuator(mock_hass, "remote.rm4_mini")
    cmd = _cmd()
    result = await actuator.apply(cmd)
    assert result is True
    mock_hass.services.async_call.assert_called_once()
    args, _ = mock_hass.services.async_call.call_args
    assert args[0] == "remote"
    assert args[1] == "send_command"
    assert args[2]["entity_id"] == "remote.rm4_mini"
    assert "b64:" in args[2]["command"][0]
    assert actuator.last_state == ACState(power=True, mode=Mode.COOL, setpoint=22, fan=Fan.LOW)


@pytest.mark.asyncio
async def test_actuator_power_off_sends_off_code(mock_hass):
    actuator = Actuator(mock_hass, "remote.rm4_mini")
    cmd = _cmd(power=False)
    result = await actuator.apply(cmd)
    assert result is True
    mock_hass.services.async_call.assert_called_once()
    args, _ = mock_hass.services.async_call.call_args
    assert "b64:" in args[2]["command"][0]


@pytest.mark.asyncio
async def test_actuator_uses_correct_broadlink_entity(mock_hass):
    actuator = Actuator(mock_hass, "remote.living_room_ir")
    cmd = _cmd()
    result = await actuator.apply(cmd)
    assert result is True
    args, _ = mock_hass.services.async_call.call_args
    assert args[2]["entity_id"] == "remote.living_room_ir"


@pytest.mark.asyncio
async def test_actuator_error_does_not_raise(mock_hass):
    mock_hass.services.async_call = AsyncMock(side_effect=Exception("service error"))
    actuator = Actuator(mock_hass, "remote.rm4_mini")
    cmd = _cmd()
    # Should not raise — errors are logged, and returns False
    result = await actuator.apply(cmd)
    assert result is False
    assert actuator.last_state is None
