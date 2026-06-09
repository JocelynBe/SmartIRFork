"""Guard layer: decide whether a proposed command may actually be sent.

This is where both-direction control is kept from fighting itself and where IR
spam is throttled. The algorithm proposes; the guards dispose.
"""
from __future__ import annotations

from dataclasses import dataclass

from custom_components.thermoloop.contracts import ACCommand, ACState, ControlInput, Decision, Fan, Mode

_FLIP_MODES = {Mode.COOL, Mode.HEAT}

# Fan aggressiveness ranking: used to detect escalation/de-escalation.
_FAN_RANK = {Fan.LOW: 0, Fan.MID: 1, Fan.HIGH: 2, Fan.HIGHEST: 3}


@dataclass(frozen=True)
class GuardConfig:
    deadband: float = 0.3          # deg C; within this, do nothing
    min_dwell_s: float = 600.0     # min seconds before flipping cool<->heat
    min_interval_s: float = 180.0  # min seconds between any two sends
    urgent_error: float = 1.5      # deg C; |error| at/above this overrides interval
    max_sensor_age_s: float = 600.0  # used by the controller, not here


def _same(proposed: ACCommand, state: ACState) -> bool:
    return (
        state.power == proposed.power
        and state.mode == proposed.mode
        and state.setpoint == proposed.setpoint
        and state.fan == proposed.fan
    )


def _is_de_escalation(proposed: ACCommand, state: ACState) -> bool:
    """Check if proposed command is "calmer" (less aggressive) than assumed state.

    De-escalation means:
    - Power is turning off, OR
    - Power stays on but fan rank decreases, OR
    - Power stays on, fan rank same/decreases, AND setpoint moves toward a neutral midpoint
      (for COOL: setpoint increases closer to target; for HEAT: setpoint decreases closer to target)

    This allows the system to settle down when within deadband while blocking further aggression.
    """
    # Turning off is always de-escalation.
    if not proposed.power and state.power:
        return True

    # If proposed power differs from state in ways other than turning off, not a simple de-escalation.
    if proposed.power != state.power:
        return False

    # Both on: check fan and setpoint.
    proposed_fan_rank = _FAN_RANK.get(proposed.fan, 999)
    state_fan_rank = _FAN_RANK.get(state.fan, 999)

    # If proposed fan is more aggressive, it's escalation.
    if proposed_fan_rank > state_fan_rank:
        return False

    # Fan is same or lower (de-escalating). For setpoint, consider direction.
    # A de-escalation in setpoint depends on mode: moving toward comfort (target).
    # We'll use a simpler heuristic: the proposed setpoint should not push further
    # away from a neutral middle point (23C for both cool and heat).
    neutral_point = 23.0
    proposed_distance = abs(proposed.setpoint - neutral_point)
    state_distance = abs(state.setpoint - neutral_point)

    # If proposed setpoint is closer to neutral, it's de-escalating.
    # If same distance but fan is lower, it's still de-escalating.
    if proposed_distance < state_distance:
        return True

    if proposed_distance == state_distance and proposed_fan_rank <= state_fan_rank:
        return True

    return False


def apply_guards(proposed: ACCommand, ci: ControlInput, cfg: GuardConfig) -> Decision:
    state = ci.assumed_state
    error = ci.current_temp - ci.target

    if _same(proposed, state):
        return Decision(None, "hold: no change vs assumed state")

    # Within deadband: only allow de-escalations. Escalations are held to prevent
    # overshooting an already-close-to-target temperature. De-escalations settle
    # the unit toward a calmer state and are always permitted within deadband.
    if abs(error) < cfg.deadband:
        if not _is_de_escalation(proposed, state):
            return Decision(None, f"hold: within deadband (|err| {abs(error):.2f} < {cfg.deadband}) and proposed is escalation")
        # De-escalation within deadband is allowed; continue to dwell/interval checks.

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
