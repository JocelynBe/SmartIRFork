"""Tests for Mitsubishi IR code generation."""
import base64

from custom_components.thermoloop.contracts import ACCommand, Fan, Mode
from custom_components.thermoloop.ir_codes import generate, generate_power_off


def test_generate_power_off_returns_nonempty():
    code = generate_power_off()
    assert isinstance(code, str)
    assert len(code) > 0


def test_generate_returns_base64_string():
    cmd = ACCommand(power=True, mode=Mode.COOL, setpoint=22, fan=Fan.LOW, reason="test")
    code = generate(cmd)
    assert isinstance(code, str)
    assert len(code) > 0
    # Verify it's valid base64
    decoded = base64.b64decode(code)
    assert len(decoded) > 0


def test_generate_differs_by_mode():
    cool = ACCommand(power=True, mode=Mode.COOL, setpoint=22, fan=Fan.LOW, reason="test")
    heat = ACCommand(power=True, mode=Mode.HEAT, setpoint=22, fan=Fan.LOW, reason="test")
    assert generate(cool) != generate(heat)


def test_generate_differs_by_temperature():
    low = ACCommand(power=True, mode=Mode.COOL, setpoint=16, fan=Fan.LOW, reason="test")
    high = ACCommand(power=True, mode=Mode.COOL, setpoint=30, fan=Fan.LOW, reason="test")
    assert generate(low) != generate(high)


def test_generate_differs_by_fan():
    low = ACCommand(power=True, mode=Mode.COOL, setpoint=22, fan=Fan.LOW, reason="test")
    high = ACCommand(power=True, mode=Mode.COOL, setpoint=22, fan=Fan.HIGH, reason="test")
    assert generate(low) != generate(high)


def test_generate_dry_mode_works():
    cmd = ACCommand(power=True, mode=Mode.DRY, setpoint=24, fan=Fan.LOW, reason="test")
    code = generate(cmd)
    assert len(code) > 0


def test_generate_all_fan_speeds():
    for fan in Fan:
        cmd = ACCommand(power=True, mode=Mode.COOL, setpoint=22, fan=fan, reason="test")
        code = generate(cmd)
        assert len(code) > 0


def test_generate_all_temperatures():
    for temp in range(16, 31):
        cmd = ACCommand(power=True, mode=Mode.COOL, setpoint=temp, fan=Fan.LOW, reason="test")
        code = generate(cmd)
        assert len(code) > 0
