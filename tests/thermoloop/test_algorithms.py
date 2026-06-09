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


from custom_components.thermoloop.algorithms import ProportionalV1


def test_v1_cools_with_setpoint_below_target_when_warm_and_stable():
    # err +2.0, no trend -> eff +2.0 -> setpoint = round(22 - 2) = 20, cool
    cmd = ProportionalV1().compute(_ci(current=24.0, target=22.0, trend=0.0))
    assert cmd.mode is Mode.COOL
    assert cmd.setpoint == 20
    assert cmd.fan is Fan.HIGH  # |2.0| -> HIGH


def test_v1_rising_trend_makes_it_more_aggressive():
    # err +1.0, trend +0.2 C/min, lookahead 10 -> eff = 1.0 + 0.2*10 = 3.0
    # setpoint = round(22 - 3) = 19; |3.0| -> HIGHEST
    cmd = ProportionalV1().compute(_ci(current=23.0, target=22.0, trend=0.2))
    assert cmd.mode is Mode.COOL
    assert cmd.setpoint == 19
    assert cmd.fan is Fan.HIGHEST


def test_v1_heats_with_setpoint_above_target_when_cold():
    # err -2.0 -> eff -2.0 -> setpoint = round(22 - (-2)) = 24, heat
    cmd = ProportionalV1().compute(_ci(current=20.0, target=22.0, trend=0.0))
    assert cmd.mode is Mode.HEAT
    assert cmd.setpoint == 24
    assert cmd.fan is Fan.HIGH


def test_v1_clamps_setpoint_to_hardware_bounds():
    # huge positive eff would push setpoint below 16
    cmd = ProportionalV1().compute(_ci(current=40.0, target=22.0, trend=0.0))
    assert cmd.setpoint == 16
    cmd2 = ProportionalV1().compute(_ci(current=0.0, target=22.0, trend=0.0))
    assert cmd2.setpoint == 30


import pytest

from custom_components.thermoloop.algorithms import get_algorithm


def test_get_algorithm_returns_named_strategy():
    assert get_algorithm("v0").name == "v0"
    assert get_algorithm("v1").name == "v1"


def test_get_algorithm_unknown_name_raises():
    with pytest.raises(ValueError, match="unknown algorithm"):
        get_algorithm("newton")
