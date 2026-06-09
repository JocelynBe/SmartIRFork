# ThermoLoop: Real-HA Integration Test Suite — Design

**Date:** 2026-06-09
**Status:** Approved (design); implementation pending
**Rigor level (P9):** Level 1–2 — internal test infrastructure with meaningful blast radius (it gates every ship).

## Problem

Two bugs reached production despite a full unit-test suite:

1. `TypeError: 'NoneType' object can't be awaited` — `control_loop.py` (status update path) does
   `await self._status_sensor.update_state(...)`, which does `await self.async_write_ha_state()`.
   Real Home Assistant's `Entity.async_write_ha_state` is a **synchronous** `@callback` method
   returning `None`; awaiting it raises.

2. `TypeError: can't subtract offset-naive and offset-aware datetimes` — `control_loop._build_input`
   computes `sensor_age = (now - sensor_last_updated).total_seconds()`. `ControlLoop._now()` returns
   naive `datetime.datetime.now()`, but real HA `State.last_updated` is **timezone-aware UTC**.

### Root cause

`tests/thermoloop/conftest.py` replaces the entire `homeassistant` module hierarchy with hand-written
fakes injected into `sys.modules`. Those fakes are **more forgiving than real HA**:

- `MockSensorEntity.async_write_ha_state` is defined `async def` (real HA: synchronous), hiding bug #1.
- `State` is a bare `MagicMock`, so `last_updated` is never a real tz-aware datetime, hiding bug #2.
- Unit tests additionally override `ControlLoop._now()`, removing the naive-datetime from the equation.

This is a **fidelity gap**: no quantity of additional mock-based tests catches this class of bug. Only
running against real HA primitives does.

## Goals

- A test suite that exercises ThermoLoop against **real Home Assistant** primitives (real state machine,
  real entity base classes, real config-entry setup, real event loop), such that bugs #1 and #2 — and
  future bugs of the same class — fail a test before shipping.
- Zero change to the existing fast mocked unit suite.

## Non-goals

- Replacing the existing mocked unit tests (kept as the fast inner loop).
- Testing real Broadlink IR hardware (no device in CI).
- The prod-code fixes themselves — those are an immediate follow-up step (see "Follow-up", below), kept
  separate so this spec is purely about the harness that reveals the bugs.

## Chosen approach

Adopt **`pytest-homeassistant-custom-component`** (pytest-hacc), the official test harness for HA custom
components, as a **separate integration-test suite** alongside the existing unit tests.

Tradeoff accepted by the user: pytest-hacc pulls in the full `homeassistant` package as a test
dependency (heavy, pinned to an HA release). It runs in its own CI job.

## The isolation constraint (drives the structure)

`tests/thermoloop/conftest.py` executes `sys.modules["homeassistant"] = ha_mod` **at import time**. Once
pytest collects that file, the real `homeassistant` package is shadowed for the entire Python process.
pytest-hacc requires the real package. **The two suites therefore cannot share a pytest process.**

Resolution: two test trees, run as two separate commands / CI jobs.

```
tests/
  thermoloop/        # existing fast mocked unit tests — UNCHANGED
    conftest.py      # injects homeassistant mocks (process-global)
  integration/       # NEW real-HA suite
    conftest.py      # real hass via pytest-hacc
    test_control_loop_integration.py
```

- `pytest tests/thermoloop` — fast mocked unit tests.
- `pytest tests/integration` — real-HA integration tests.

These are never invoked in the same process.

## Components

### Dependencies

- `requirements_test.txt` gains `pytest-homeassistant-custom-component`, pinned to a version matching the
  HA release declared in `manifest.json` (`homeassistant: 2025.5.0`).

### `tests/integration/conftest.py`

- `pytest_plugins = "pytest_homeassistant_custom_component"` — provides the real `hass` fixture.
- An autouse `enable_custom_integrations` fixture so HA will load `custom_components/thermoloop`.
- `setup_thermoloop` fixture:
  - Builds a `MockConfigEntry(domain="thermoloop", data={...})` with real entity-id strings for the
    Broadlink remote, day/night temp sensors, and (optionally) humidity sensors.
  - Adds it to `hass` and runs `async_setup_entry` through the real config-entries machinery, so all four
    platforms (sensor, number, select, time) register real entities and the real `ControlLoop` is built.
  - Yields a handle exposing the entry, the `ControlLoop`, and the recorded `remote.send_command` calls.

### Faking only the true external boundary

The single boundary with no real device in CI is `remote.send_command` (issued in `actuator.Actuator.apply`).
Register a stub `remote.send_command` service on the real `hass` that appends each call to a list.
Everything else — IR-code generation, assumed-state write to `hass.data`, the `EVENT_THERMOLOOP_COMMAND`
fire, and the status-sensor `async_write_ha_state` — runs for real.

## Test scenarios

All scenarios drive real tz-aware states via `hass.states.async_set(...)` and call the real
`control_loop.async_tick()`. **`_now()` is never overridden** — that override is precisely what hid bug #2.

1. **Golden path / smoke** — valid tz-aware temp state, run one tick; assert it completes with **no
   exception** and `sensor.thermoloop_status` has been updated. (Reproduces both bugs on current code.)
2. **Sensor-age math** — real tz-aware `last_updated`; assert `now - last_updated` succeeds. (Targets bug #2.)
3. **Status write commits** — assert `async_write_ha_state` actually writes state into the real machine
   (state readable via `hass.states.get("sensor.thermoloop_status")`). (Targets bug #1.)
4. **Unavailable sensor** — temp state `unavailable` → tick yields `error`/`incomplete_context`, no crash.
5. **Night-window switch** — set night window start/end + bedroom sensor; assert the night sensor becomes
   the active sensor.
6. **Send decision → actuator** — drive a target/current-temp gap that yields a send; assert the stub
   `remote.send_command` was called and `assumed_state` was stored in `hass.data`.

### Expectation: tests fail first

On the current (unfixed) code, scenarios 1–3 **fail with the exact production tracebacks**. That failure
is the deliverable's proof of value. Scenarios 4–6 guard the surrounding tick behavior.

## CI

Add a CI job (separate process from the mocked unit tests) that runs `pytest tests/integration`. The
existing/forthcoming mocked-unit job runs `pytest tests/thermoloop`. No GitHub Actions test workflow
exists yet (`.github/workflows/` has only `codeql.yml`), so a `tests.yml` workflow with two jobs is part
of this work.

## Follow-up (separate step, immediately after harness lands)

Once scenarios 1–3 are red, apply the prod fixes and watch them go green:

- `ControlLoop._now()` → return tz-aware time (`homeassistant.util.dt.now()` / `dt_util.utcnow()`).
- `sensor.py` `update_state` → `self.async_write_ha_state()` (no `await`); audit `control_loop.py` and any
  other call sites for the same erroneous `await`.

## Testing the tests (P3)

Each scenario is independently runnable and asserts one observable behavior of the real system. Reading
the scenario list top-to-bottom is the specification of the tick path's externally-visible contract.
