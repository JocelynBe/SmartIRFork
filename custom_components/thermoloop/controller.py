"""The composed control brain: ControlInput -> Decision.

Order of reasoning, fail-safe biased toward doing nothing:
  1. OFF/AWAY  -> turn the AC off if it is on, else hold.
  2. stale active sensor -> hold (never act on data we don't trust).
  3. otherwise -> algorithm proposes, guards dispose.
"""
from __future__ import annotations

from dataclasses import dataclass

from .algorithms import Algorithm
from .contracts import ACCommand, ControlInput, ControlMode, Decision
from .guards import GuardConfig, apply_guards


@dataclass
class Controller:
    algorithm: Algorithm
    guards: GuardConfig

    def decide(self, ci: ControlInput) -> Decision:
        if ci.mode in (ControlMode.OFF, ControlMode.AWAY):
            state = ci.assumed_state
            if state.power:
                off = ACCommand(False, state.mode, state.setpoint, state.fan,
                                f"{ci.mode.value}: turn off")
                return Decision(off, off.reason)
            return Decision(None, f"hold: {ci.mode.value}, already off")

        if ci.sensor_age > self.guards.max_sensor_age_s:
            return Decision(None, f"hold: sensor stale ({ci.sensor_age:.0f}s)")

        proposed = self.algorithm.compute(ci)
        return apply_guards(proposed, ci, self.guards)
