"""Control algorithms: ControlInput -> desired ACCommand (ignoring timing/guards).

Strategy pattern. Each algorithm decides only what the *ideal* next command is;
the guard layer (guards.py) decides whether it is actually allowed to be sent.
"""
from __future__ import annotations

from typing import Protocol

from custom_components.thermoloop.contracts import (
    ACCommand,
    ControlInput,
    Fan,
    MAX_SETPOINT,
    MIN_SETPOINT,
    Mode,
)

# v0 tuning: beyond this distance from target we "slam"; within it we "maintain".
APPROACH_BAND = 1.5


def clamp(value: int, low: int, high: int) -> int:
    return max(low, min(high, value))


def fan_for_magnitude(magnitude: float) -> Fan:
    """Map an absolute error magnitude (deg C) to a fan tier."""
    if magnitude < 0.5:
        return Fan.LOW
    if magnitude < 1.5:
        return Fan.MID
    if magnitude < 3.0:
        return Fan.HIGH
    return Fan.HIGHEST


class Algorithm(Protocol):
    name: str

    def compute(self, ci: ControlInput) -> ACCommand: ...


class AggressiveV0:
    """Bang-bang hysteresis: slam toward target when far, settle when near."""

    name = "v0"

    def compute(self, ci: ControlInput) -> ACCommand:
        error = ci.current_temp - ci.target  # + = too warm, - = too cold
        maintain_setpoint = clamp(round(ci.target), MIN_SETPOINT, MAX_SETPOINT)

        if error > 0:  # too warm -> cool
            if error >= APPROACH_BAND:
                return ACCommand(True, Mode.COOL, MIN_SETPOINT, Fan.HIGHEST,
                                 f"v0 slam-cool (err +{error:.1f})")
            return ACCommand(True, Mode.COOL, maintain_setpoint, Fan.MID,
                             f"v0 maintain-cool (err +{error:.1f})")

        if error < 0:  # too cold -> heat
            if -error >= APPROACH_BAND:
                return ACCommand(True, Mode.HEAT, MAX_SETPOINT, Fan.HIGHEST,
                                 f"v0 slam-heat (err {error:.1f})")
            return ACCommand(True, Mode.HEAT, maintain_setpoint, Fan.MID,
                             f"v0 maintain-heat (err {error:.1f})")

        # exactly on target: hold position, quiet fan, keep a sensible mode
        mode = ci.assumed_state.mode if ci.assumed_state.power else Mode.COOL
        return ACCommand(True, mode, maintain_setpoint, Fan.LOW, "v0 on-target")


# v1 tuning: how strongly the temperature trend feeds the effective error.
TREND_GAIN = 1.0
TREND_LOOKAHEAD_MIN = 10.0


class ProportionalV1:
    """Proportional response with trend anticipation, mapped to discrete steps."""

    name = "v1"

    def compute(self, ci: ControlInput) -> ACCommand:
        error = ci.current_temp - ci.target
        eff = error + TREND_GAIN * ci.temp_trend * TREND_LOOKAHEAD_MIN

        if eff == 0:
            mode = ci.assumed_state.mode if ci.assumed_state.power else Mode.COOL
            setpoint = clamp(round(ci.target), MIN_SETPOINT, MAX_SETPOINT)
            return ACCommand(True, mode, setpoint, Fan.LOW,
                             f"v1 on-target (err {error:+.1f}, trend {ci.temp_trend:+.2f})")

        mode = Mode.COOL if eff > 0 else Mode.HEAT
        # eff>0 (warm): setpoint below target; eff<0 (cold): above target.
        setpoint = clamp(round(ci.target - eff), MIN_SETPOINT, MAX_SETPOINT)
        fan = fan_for_magnitude(abs(eff))
        return ACCommand(True, mode, setpoint, fan,
                         f"v1 eff {eff:+.1f} (err {error:+.1f}, trend {ci.temp_trend:+.2f})")


_ALGORITHMS: dict[str, type] = {
    AggressiveV0.name: AggressiveV0,
    ProportionalV1.name: ProportionalV1,
}


def get_algorithm(name: str) -> Algorithm:
    """Look up an algorithm strategy by its ``select.thermoloop_algorithm`` value."""
    try:
        return _ALGORITHMS[name]()
    except KeyError:
        raise ValueError(f"unknown algorithm: {name!r} (expected one of {sorted(_ALGORITHMS)})")
