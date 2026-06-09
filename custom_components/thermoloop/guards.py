"""Guard layer: decide whether a proposed command may actually be sent.

This is where both-direction control is kept from fighting itself and where IR
spam is throttled. The algorithm proposes; the guards dispose.
"""
from __future__ import annotations

from dataclasses import dataclass

from custom_components.thermoloop.contracts import ACCommand, ControlInput, Decision, Mode

_FLIP_MODES = {Mode.COOL, Mode.HEAT}


@dataclass(frozen=True)
class GuardConfig:
    deadband: float = 0.3          # deg C; within this, do nothing
    min_dwell_s: float = 600.0     # min seconds before flipping cool<->heat
    min_interval_s: float = 180.0  # min seconds between any two sends
    urgent_error: float = 1.5      # deg C; |error| at/above this overrides interval
    max_sensor_age_s: float = 600.0  # used by the controller, not here


def _same(proposed: ACCommand, state) -> bool:
    return (
        state.power == proposed.power
        and state.mode == proposed.mode
        and state.setpoint == proposed.setpoint
        and state.fan == proposed.fan
    )


def apply_guards(proposed: ACCommand, ci: ControlInput, cfg: GuardConfig) -> Decision:
    state = ci.assumed_state
    error = ci.current_temp - ci.target

    if _same(proposed, state):
        return Decision(None, "hold: no change vs assumed state")

    if abs(error) < cfg.deadband:
        return Decision(None, f"hold: within deadband (|err| {abs(error):.2f} < {cfg.deadband})")

    flipping = (
        state.power and proposed.power
        and proposed.mode != state.mode
        and {state.mode, proposed.mode} <= _FLIP_MODES
    )
    if flipping and ci.last_command_at is not None:
        since = ci.now - ci.last_command_at
        if since < cfg.min_dwell_s:
            return Decision(None, f"hold: dwell {since:.0f}s < {cfg.min_dwell_s:.0f}s before cool<->heat flip")

    if ci.last_command_at is not None:
        since = ci.now - ci.last_command_at
        if since < cfg.min_interval_s and abs(error) < cfg.urgent_error:
            return Decision(None, f"hold: interval {since:.0f}s < {cfg.min_interval_s:.0f}s")

    return Decision(proposed, proposed.reason)
