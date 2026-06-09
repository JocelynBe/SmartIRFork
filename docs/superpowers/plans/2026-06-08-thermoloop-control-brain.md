# ThermoLoop Control Brain — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the pure-Python decision core of ThermoLoop — given a snapshot of the room, decide the next discrete air-conditioner command — with no Home Assistant dependencies and full unit-test coverage.

**Architecture:** Three pure layers. **Contracts** (frozen dataclasses + enums) define the data. **Algorithms** (strategy pattern: `v0` aggressive hysteresis, `v1` proportional+trend) map a `ControlInput` to a *desired* `ACCommand`. **Guards** + **Controller** wrap the algorithm with anti-cycling/safety rules and produce a final `Decision` (send a command, or hold). Nothing here imports `homeassistant`; the whole thing runs under plain `pytest`.

**Tech Stack:** Python 3.11+ (HA 2025.5 baseline), `dataclasses`, `enum`, `typing.Protocol`, `pytest`.

This is **Plan 1 of 3**. Plan 2 (HA wiring) and Plan 3 (panel) consume the contracts finalized here. See `docs/superpowers/specs/2026-06-08-thermoloop-design.md`.

---

## File Structure

All paths relative to repo root `/Users/jocelyn/src/SmartIRFork`.

- Create: `custom_components/thermoloop/__init__.py` — package marker (empty in this plan; HA wiring added in Plan 2).
- Create: `custom_components/thermoloop/contracts.py` — L0 enums + dataclasses (`Mode`, `Fan`, `ControlMode`, `ACState`, `ControlInput`, `ACCommand`, `Decision`, setpoint bounds).
- Create: `custom_components/thermoloop/algorithms.py` — `Algorithm` protocol, `AggressiveV0`, `ProportionalV1`, `get_algorithm`, helpers (`clamp`, `fan_for_magnitude`).
- Create: `custom_components/thermoloop/guards.py` — `GuardConfig`, `apply_guards`.
- Create: `custom_components/thermoloop/controller.py` — `Controller.decide`.
- Create: `tests/thermoloop/__init__.py` — empty.
- Create: `tests/thermoloop/test_contracts.py`, `test_algorithms.py`, `test_guards.py`, `test_controller.py`.
- Create: `requirements_test.txt` — `pytest`.

Why these boundaries: the brain splits by responsibility — *what the data is* (contracts), *what we'd ideally do* (algorithms), *whether we're allowed to do it* (guards), *the composed decision* (controller). Each file is small and holdable in context, and each is tested independently.

---

### Task 1: Project test scaffolding + contracts

**Files:**
- Create: `requirements_test.txt`
- Create: `custom_components/thermoloop/__init__.py`
- Create: `custom_components/thermoloop/contracts.py`
- Test: `tests/thermoloop/__init__.py`, `tests/thermoloop/test_contracts.py`

- [ ] **Step 1: Create the empty package markers and test deps**

Create `custom_components/thermoloop/__init__.py` with exactly:

```python
"""ThermoLoop: closed-loop smart-thermostat layer for Home Assistant."""
```

Create `tests/thermoloop/__init__.py` as an empty file (zero bytes).

Create `requirements_test.txt`:

```text
pytest>=8.0
```

- [ ] **Step 2: Write the failing test**

Create `tests/thermoloop/test_contracts.py`:

```python
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
    import dataclasses
    import pytest
    with pytest.raises(dataclasses.FrozenInstanceError):
        ci.target = 99.0  # type: ignore[misc]


def test_decision_is_send_flag():
    cmd = ACCommand(power=True, mode=Mode.COOL, setpoint=18, fan=Fan.HIGH, reason="x")
    assert Decision(command=cmd, reason="x").is_send is True
    assert Decision(command=None, reason="hold").is_send is False
```

- [ ] **Step 3: Run test to verify it fails**

Run: `python -m pytest tests/thermoloop/test_contracts.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'custom_components.thermoloop.contracts'`.

- [ ] **Step 4: Write minimal implementation**

Create `custom_components/thermoloop/contracts.py`:

```python
"""L0 contracts for the ThermoLoop control brain.

Pure data only. No Home Assistant imports — this module must be importable and
testable on its own. The control surface (modes, fan tiers, setpoint range)
mirrors the Mitsubishi entries in the SmartIR code DB.
"""
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Optional

# AC hardware bounds, from the Mitsubishi code DB (codes/climate/112x.json).
MIN_SETPOINT = 16
MAX_SETPOINT = 30


class Mode(str, Enum):
    COOL = "cool"
    HEAT = "heat"
    DRY = "dry"


class Fan(str, Enum):
    LOW = "low"
    MID = "mid"
    HIGH = "high"
    HIGHEST = "highest"


class ControlMode(str, Enum):
    """Effective operating mode the loop feeds the brain.

    The loop derives this from the user's ``select.thermoloop_mode`` and phone
    presence: OFF if explicitly off; AWAY if explicitly away or the phone is
    away; otherwise AUTO.
    """

    AUTO = "auto"
    OFF = "off"
    AWAY = "away"


@dataclass(frozen=True)
class ACState:
    """The AC state we *assume* is in effect (IR is open-loop: never confirmed)."""

    power: bool
    mode: Mode
    setpoint: int
    fan: Fan


@dataclass(frozen=True)
class ControlInput:
    """Everything the brain needs for one tick. Assembled by the loop (Plan 2)."""

    now: float                      # epoch seconds
    mode: ControlMode               # effective operating mode
    current_temp: float             # active sensor reading, deg C
    sensor_age: float               # seconds since that reading was produced
    target: float                   # target for the active phase, deg C
    assumed_state: ACState          # last command we believe is in effect
    temp_trend: float               # signed slope, deg C per minute
    last_command_at: Optional[float]  # epoch seconds of last send, or None


@dataclass(frozen=True)
class ACCommand:
    """A concrete, discrete command to send to the AC."""

    power: bool
    mode: Mode
    setpoint: int
    fan: Fan
    reason: str


@dataclass(frozen=True)
class Decision:
    """The brain's output: a command to send, or a hold (``command is None``)."""

    command: Optional[ACCommand]
    reason: str

    @property
    def is_send(self) -> bool:
        return self.command is not None
```

- [ ] **Step 5: Run test to verify it passes**

Run: `python -m pytest tests/thermoloop/test_contracts.py -v`
Expected: PASS (4 passed).

- [ ] **Step 6: Commit**

```bash
git add requirements_test.txt custom_components/thermoloop/__init__.py custom_components/thermoloop/contracts.py tests/thermoloop/__init__.py tests/thermoloop/test_contracts.py
git commit -m "feat(thermoloop): add control-brain contracts (L0)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: v0 algorithm — aggressive hysteresis

**Files:**
- Create: `custom_components/thermoloop/algorithms.py`
- Test: `tests/thermoloop/test_algorithms.py`

- [ ] **Step 1: Write the failing test**

Create `tests/thermoloop/test_algorithms.py`:

```python
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m pytest tests/thermoloop/test_algorithms.py -v`
Expected: FAIL — `ImportError: cannot import name 'AggressiveV0'`.

- [ ] **Step 3: Write minimal implementation**

Create `custom_components/thermoloop/algorithms.py`:

```python
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python -m pytest tests/thermoloop/test_algorithms.py -v`
Expected: PASS (5 passed).

- [ ] **Step 5: Commit**

```bash
git add custom_components/thermoloop/algorithms.py tests/thermoloop/test_algorithms.py
git commit -m "feat(thermoloop): add v0 aggressive-hysteresis algorithm

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: v1 algorithm — proportional + trend

**Files:**
- Modify: `custom_components/thermoloop/algorithms.py`
- Test: `tests/thermoloop/test_algorithms.py` (append)

- [ ] **Step 1: Write the failing test**

Append to `tests/thermoloop/test_algorithms.py`:

```python
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m pytest tests/thermoloop/test_algorithms.py -k v1 -v`
Expected: FAIL — `ImportError: cannot import name 'ProportionalV1'`.

- [ ] **Step 3: Write minimal implementation**

Append to `custom_components/thermoloop/algorithms.py`:

```python
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python -m pytest tests/thermoloop/test_algorithms.py -v`
Expected: PASS (9 passed total).

- [ ] **Step 5: Commit**

```bash
git add custom_components/thermoloop/algorithms.py tests/thermoloop/test_algorithms.py
git commit -m "feat(thermoloop): add v1 proportional+trend algorithm

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Algorithm registry — `get_algorithm`

**Files:**
- Modify: `custom_components/thermoloop/algorithms.py`
- Test: `tests/thermoloop/test_algorithms.py` (append)

- [ ] **Step 1: Write the failing test**

Append to `tests/thermoloop/test_algorithms.py`:

```python
import pytest

from custom_components.thermoloop.algorithms import get_algorithm


def test_get_algorithm_returns_named_strategy():
    assert get_algorithm("v0").name == "v0"
    assert get_algorithm("v1").name == "v1"


def test_get_algorithm_unknown_name_raises():
    with pytest.raises(ValueError, match="unknown algorithm"):
        get_algorithm("newton")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m pytest tests/thermoloop/test_algorithms.py -k get_algorithm -v`
Expected: FAIL — `ImportError: cannot import name 'get_algorithm'`.

- [ ] **Step 3: Write minimal implementation**

Append to `custom_components/thermoloop/algorithms.py`:

```python
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python -m pytest tests/thermoloop/test_algorithms.py -v`
Expected: PASS (11 passed total).

- [ ] **Step 5: Commit**

```bash
git add custom_components/thermoloop/algorithms.py tests/thermoloop/test_algorithms.py
git commit -m "feat(thermoloop): add algorithm registry lookup

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Guards — anti-cycling + safety

**Files:**
- Create: `custom_components/thermoloop/guards.py`
- Test: `tests/thermoloop/test_guards.py`

- [ ] **Step 1: Write the failing test**

Create `tests/thermoloop/test_guards.py`:

```python
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m pytest tests/thermoloop/test_guards.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'custom_components.thermoloop.guards'`.

- [ ] **Step 3: Write minimal implementation**

Create `custom_components/thermoloop/guards.py`:

```python
"""Guard layer: decide whether a proposed command may actually be sent.

This is where both-direction control is kept from fighting itself and where IR
spam is throttled. The algorithm proposes; the guards dispose.
"""
from __future__ import annotations

from dataclasses import dataclass

from .contracts import ACCommand, ControlInput, Decision, Mode

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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python -m pytest tests/thermoloop/test_guards.py -v`
Expected: PASS (7 passed).

- [ ] **Step 5: Commit**

```bash
git add custom_components/thermoloop/guards.py tests/thermoloop/test_guards.py
git commit -m "feat(thermoloop): add anti-cycling + throttle guards

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Controller — compose mode handling + staleness + algorithm + guards

**Files:**
- Create: `custom_components/thermoloop/controller.py`
- Test: `tests/thermoloop/test_controller.py`

- [ ] **Step 1: Write the failing test**

Create `tests/thermoloop/test_controller.py`:

```python
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m pytest tests/thermoloop/test_controller.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'custom_components.thermoloop.controller'`.

- [ ] **Step 3: Write minimal implementation**

Create `custom_components/thermoloop/controller.py`:

```python
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python -m pytest tests/thermoloop/test_controller.py -v`
Expected: PASS (4 passed).

- [ ] **Step 5: Run the whole brain suite**

Run: `python -m pytest tests/thermoloop -v`
Expected: PASS (24 passed: 4 contracts + 11 algorithms + 7 guards + 4 controller; the offset of one between counts is fine if a future tweak adds/removes a case — the bar is "all green").

- [ ] **Step 6: Commit**

```bash
git add custom_components/thermoloop/controller.py tests/thermoloop/test_controller.py
git commit -m "feat(thermoloop): add composed controller (mode + staleness + algo + guards)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage (against `2026-06-08-thermoloop-design.md`):**
- §4 L0 contracts → Task 1. (`ControlInput` drops phone/phase concepts by design: the loop in Plan 2 resolves phase→target/sensor and presence→`ControlMode`, keeping the brain phone-agnostic per P4.)
- §4 L2 algorithms v0/v1 → Tasks 2–4. Both-direction (cool when warm, heat when cold) covered in both.
- §4 L2 guards (deadband, min dwell, min interval + urgent override, dedupe) → Task 5. Constants match §4 defaults (0.3 / 600s / 180s / 1.5).
- §4 L2 `Controller.decide` composition + §3 both-direction anti-cycling + §7 fail-safe (stale sensor → hold, away → off) → Task 6.
- §7 "open-loop honesty": reasons say what we *send*; `ACState` docstring notes it is *assumed*, never confirmed.
- **Out of scope here (correctly deferred):** `Actuator`, `ControlLoop`, `PresenceTracker`, helper entities, `sensor.thermoloop_status`, domain repackage, the panel — all Plan 2/Plan 3. The recorder/logbook persistence and retention caveat are Plan 2 concerns.

**Placeholder scan:** none — every code/test step contains complete, runnable content.

**Type consistency:** `ControlInput`, `ACState`, `ACCommand`, `Decision`, `Mode`, `Fan`, `ControlMode`, `MIN_SETPOINT`/`MAX_SETPOINT` are defined once in Task 1 and used verbatim in Tasks 2–6. `Algorithm` protocol (`.name`, `.compute`) is honored by `AggressiveV0`/`ProportionalV1` and consumed by `Controller`. `GuardConfig.max_sensor_age_s` is defined in Task 5 and read by the controller in Task 6. `apply_guards(proposed, ci, cfg)` signature is stable across guard and controller usage.
