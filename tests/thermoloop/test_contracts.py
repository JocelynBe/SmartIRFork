import dataclasses
import pytest
from custom_components.thermoloop.contracts import (
    ACCommand,
    ACState,
    ControlInput,
    ControlMode,
    Decision,
    Fan,
    Mode,
    MAX_SETPOINT,
    MIN_SETPOINT,
)


def _state() -> ACState:
    return ACState(power=True, mode=Mode.COOL, setpoint=22, fan=Fan.MID)


def test_setpoint_bounds_match_mitsubishi_db():
    assert MIN_SETPOINT == 16
    assert MAX_SETPOINT == 30


def test_enums_are_string_valued():
    # Stored later as HA entity states/attributes, so .value must be a plain str.
    assert Mode.COOL.value == "cool"
    assert Fan.HIGHEST.value == "highest"
    assert ControlMode.AWAY.value == "away"


def test_control_input_is_frozen():
    ci = ControlInput(
        now=1000.0,
        mode=ControlMode.AUTO,
        current_temp=23.4,
        sensor_age=5.0,
        target=22.0,
        assumed_state=_state(),
        temp_trend=0.0,
        last_command_at=None,
    )
    assert ci.target == 22.0
    with pytest.raises(dataclasses.FrozenInstanceError):
        ci.target = 99.0  # type: ignore[misc]


def test_decision_is_send_flag():
    cmd = ACCommand(power=True, mode=Mode.COOL, setpoint=18, fan=Fan.HIGH, reason="x")
    assert Decision(command=cmd, reason="x").is_send is True
    assert Decision(command=None, reason="hold").is_send is False
