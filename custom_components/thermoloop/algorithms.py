"""Control algorithms: ControlInput -> desired ACCommand (ignoring timing/guards).

Strategy pattern. Each algorithm decides only what the *ideal* next command is;
the guard layer (guards.py) decides whether it is actually allowed to be sent.
"""
from __future__ import annotations

from typing import Protocol

from .contracts import (
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
