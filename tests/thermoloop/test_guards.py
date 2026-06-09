from custom_components.thermoloop.contracts import (
    ACCommand,
    ACState,
    ControlInput,
    ControlMode,
    Fan,
    Mode,
)
from custom_components.thermoloop.guards import GuardConfig, apply_guards

CFG = GuardConfig()  # defaults


def _ci(current, target, assumed, last_command_at, now=10_000.0):
    return ControlInput(
        now=now,
        mode=ControlMode.AUTO,
        current_temp=current,
        sensor_age=1.0,
        target=target,
        assumed_state=assumed,
        temp_trend=0.0,
        last_command_at=last_command_at,
    )


def test_dedupe_holds_when_proposed_equals_assumed():
    state = ACState(power=True, mode=Mode.COOL, setpoint=18, fan=Fan.HIGH)
    proposed = ACCommand(True, Mode.COOL, 18, Fan.HIGH, "same")
    d = apply_guards(proposed, _ci(25.0, 22.0, state, None), CFG)
    assert d.is_send is False
    assert "no change" in d.reason


def test_deadband_holds_small_error():
    state = ACState(power=True, mode=Mode.COOL, setpoint=22, fan=Fan.LOW)
    proposed = ACCommand(True, Mode.COOL, 21, Fan.MID, "tweak")
    # |error| = 0.2 < deadband 0.3 -> hold
    d = apply_guards(proposed, _ci(22.2, 22.0, state, None), CFG)
    assert d.is_send is False
    assert "deadband" in d.reason


def test_min_dwell_blocks_cool_to_heat_flip():
    state = ACState(power=True, mode=Mode.COOL, setpoint=18, fan=Fan.HIGH)
    proposed = ACCommand(True, Mode.HEAT, 26, Fan.MID, "flip")
    # last command 60s ago, dwell is 600s -> blocked
    d = apply_guards(proposed, _ci(20.0, 22.0, state, last_command_at=10_000.0 - 60), CFG)
    assert d.is_send is False
    assert "dwell" in d.reason


def test_min_dwell_allows_flip_after_dwell_elapses():
    state = ACState(power=True, mode=Mode.COOL, setpoint=18, fan=Fan.HIGH)
    proposed = ACCommand(True, Mode.HEAT, 26, Fan.MID, "flip")
    d = apply_guards(proposed, _ci(20.0, 22.0, state, last_command_at=10_000.0 - 700), CFG)
    assert d.is_send is True


def test_min_interval_throttles_small_change():
    state = ACState(power=True, mode=Mode.COOL, setpoint=20, fan=Fan.MID)
    proposed = ACCommand(True, Mode.COOL, 19, Fan.MID, "small step")
    # 60s since last, interval 180s, error +0.6 < urgent 1.5 -> throttled
    d = apply_guards(proposed, _ci(22.6, 22.0, state, last_command_at=10_000.0 - 60), CFG)
    assert d.is_send is False
    assert "interval" in d.reason


def test_urgent_error_overrides_min_interval():
    state = ACState(power=True, mode=Mode.COOL, setpoint=20, fan=Fan.MID)
    proposed = ACCommand(True, Mode.COOL, 16, Fan.HIGHEST, "slam")
    # 60s since last but error +3.0 >= urgent 1.5 -> allowed through
    d = apply_guards(proposed, _ci(25.0, 22.0, state, last_command_at=10_000.0 - 60), CFG)
    assert d.is_send is True


def test_clean_command_passes_through_with_its_reason():
    state = ACState(power=False, mode=Mode.COOL, setpoint=22, fan=Fan.LOW)
    proposed = ACCommand(True, Mode.COOL, 16, Fan.HIGHEST, "v0 slam-cool (err +4.0)")
    d = apply_guards(proposed, _ci(26.0, 22.0, state, last_command_at=None), CFG)
    assert d.is_send is True
    assert d.reason == "v0 slam-cool (err +4.0)"
