"""Tests for IR code lookup from the bundled SmartIR code database."""
import base64
import json
import os

from custom_components.thermoloop.contracts import ACCommand, Fan, Mode
from custom_components.thermoloop.ir_codes import (
    DEVICE_CODE,
    generate,
    generate_power_off,
)

_CODES = json.load(
    open(
        os.path.join(
            os.path.dirname(__file__), "..", "..",
            "custom_components", "thermoloop", "codes", "climate", f"{DEVICE_CODE}.json",
        )
    )
)["commands"]


def _cmd(power=True, mode=Mode.COOL, setpoint=22, fan=Fan.HIGH):
    return ACCommand(power=power, mode=mode, setpoint=setpoint, fan=fan, reason="test")


def test_power_off_matches_database():
    assert generate_power_off() == _CODES["off"]


def test_generate_matches_database_entry():
    assert generate(_cmd(mode=Mode.COOL, fan=Fan.HIGH, setpoint=22)) == _CODES["cool"]["high"]["22"]


def test_generate_returns_valid_base64():
    code = generate(_cmd())
    assert isinstance(code, str) and code
    assert len(base64.b64decode(code)) > 0


def test_power_false_returns_off_code():
    assert generate(_cmd(power=False)) == _CODES["off"]


def test_differs_by_mode():
    assert generate(_cmd(mode=Mode.COOL)) != generate(_cmd(mode=Mode.HEAT))


def test_differs_by_temperature():
    assert generate(_cmd(setpoint=16)) != generate(_cmd(setpoint=30))


def test_differs_by_fan():
    assert generate(_cmd(fan=Fan.LOW)) != generate(_cmd(fan=Fan.HIGH))


def test_all_modes_fans_temps_resolve():
    for mode in (Mode.COOL, Mode.HEAT, Mode.DRY):
        for fan in Fan:
            for temp in range(16, 31):
                code = generate(_cmd(mode=mode, fan=fan, setpoint=temp))
                assert isinstance(code, str) and len(code) > 0


def test_temperature_is_clamped_to_database_range():
    assert generate(_cmd(setpoint=10)) == _CODES["cool"]["high"]["16"]
    assert generate(_cmd(setpoint=40)) == _CODES["cool"]["high"]["30"]
