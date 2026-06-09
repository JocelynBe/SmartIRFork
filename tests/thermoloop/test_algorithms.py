from custom_components.thermoloop.algorithms import AggressiveV0
from custom_components.thermoloop.contracts import (
    ACState,
    ControlInput,
    ControlMode,
    Fan,
    Mode,
)


def _ci(current: float, target: float = 22.0, trend: float = 0.0) -> ControlInput:
    return ControlInput(
        now=1000.0,
        mode=ControlMode.AUTO,
        current_temp=current,
        sensor_age=1.0,
        target=target,
        assumed_state=ACState(power=False, mode=Mode.COOL, setpoint=22, fan=Fan.LOW),
        temp_trend=trend,
        last_command_at=None,
    )


def test_v0_slam_cool_when_far_above_target():
    cmd = AggressiveV0().compute(_ci(current=26.0, target=22.0))  # +4.0
    assert cmd.power is True
    assert cmd.mode is Mode.COOL
    assert cmd.setpoint == 16
    assert cmd.fan is Fan.HIGHEST


def test_v0_maintain_cool_when_just_above_target():
    cmd = AggressiveV0().compute(_ci(current=22.6, target=22.0))  # +0.6, within approach band
    assert cmd.mode is Mode.COOL
    assert cmd.setpoint == 22
    assert cmd.fan is Fan.MID


def test_v0_slam_heat_when_far_below_target():
    cmd = AggressiveV0().compute(_ci(current=18.0, target=22.0))  # -4.0
    assert cmd.mode is Mode.HEAT
    assert cmd.setpoint == 30
    assert cmd.fan is Fan.HIGHEST


def test_v0_maintain_heat_when_just_below_target():
    cmd = AggressiveV0().compute(_ci(current=21.4, target=22.0))  # -0.6
    assert cmd.mode is Mode.HEAT
    assert cmd.setpoint == 22
    assert cmd.fan is Fan.MID


def test_v0_on_target_settles_low_fan():
    cmd = AggressiveV0().compute(_ci(current=22.0, target=22.0))
    assert cmd.fan is Fan.LOW
    assert cmd.setpoint == 22
