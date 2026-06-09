from custom_components.thermoloop.algorithms import AggressiveV0
from custom_components.thermoloop.contracts import (
    ACState,
    ControlInput,
    ControlMode,
    Fan,
    Mode,
)
from custom_components.thermoloop.controller import Controller
from custom_components.thermoloop.guards import GuardConfig


def _controller() -> Controller:
    return Controller(algorithm=AggressiveV0(), guards=GuardConfig())


def _ci(mode, current=25.0, sensor_age=1.0, power=True):
    return ControlInput(
        now=10_000.0,
        mode=mode,
        current_temp=current,
        sensor_age=sensor_age,
        target=22.0,
        assumed_state=ACState(power=power, mode=Mode.COOL, setpoint=22, fan=Fan.LOW),
        temp_trend=0.0,
        last_command_at=None,
    )


def test_away_turns_off_a_running_ac():
    d = _controller().decide(_ci(ControlMode.AWAY, power=True))
    assert d.is_send is True
    assert d.command.power is False
    assert "away" in d.reason


def test_off_when_already_off_holds():
    d = _controller().decide(_ci(ControlMode.OFF, power=False))
    assert d.is_send is False
    assert "already off" in d.reason


def test_stale_sensor_fails_safe_to_hold():
    d = _controller().decide(_ci(ControlMode.AUTO, sensor_age=900.0))
    assert d.is_send is False
    assert "stale" in d.reason


def test_auto_delegates_to_algorithm_then_guards():
    # current 25, target 22 -> v0 slam-cool, passes guards (no prior command)
    d = _controller().decide(_ci(ControlMode.AUTO, current=25.0))
    assert d.is_send is True
    assert d.command.mode is Mode.COOL
    assert d.command.setpoint == 16
    assert d.command.fan is Fan.HIGHEST
