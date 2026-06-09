# ThermoLoop Real-HA Integration Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a real-HA integration test suite that catches the two prod bugs (`_now()` naive datetime, `async_write_ha_state()` sync), then fix both bugs with TDD.

**Architecture:** Two separate test trees sharing no process. `tests/thermoloop/` = existing mocked unit tests (unchanged). `tests/integration/` = new real-HA suite via `pytest-homeassistant-custom-component`. After tests prove the bugs, fix the prod code and watch tests go green.

**Tech Stack:** pytest-homeassistant-custom-component, real HomeAssistant 2025.5 primitives, real `hass.states.async_set`, `hass.services.async_register` for the stub remote service.

---

### Task 1: Add integration test dependency

**Files:**
- Modify: `requirements_test.txt`
- Create: `tests/integration/__init__.py` (empty)

- [ ] **Step 1: Add pytest-homeassistant-custom-component to requirements**

Edit `requirements_test.txt`. pytest-hacc's own version scheme is **not** HA's (it ships releases like `0.13.x`), so pin an exact pytest-hacc release whose transitive dependency is `homeassistant==2025.5.*`, matching `manifest.json`:
```
pytest>=8.0
pytest-homeassistant-custom-component==0.13.x   # placeholder: the release that pulls homeassistant 2025.5.*
```

Resolve the placeholder empirically: install, then `pip show homeassistant` and confirm it reports `2025.5.*`. If not, adjust the pin until it does, then freeze the exact pytest-hacc version (an open `>=` would risk pulling a newer HA than the manifest pins).

- [ ] **Step 2: Create empty integration test directory**

```bash
touch tests/integration/__init__.py
```

- [ ] **Step 3: Commit**

```bash
git add requirements_test.txt tests/integration/__init__.py
git commit -m "test: add pytest-homeassistant-custom-component dep and integration dir"
```

---

### Task 2: Create integration test conftest with real-HA fixtures

**Files:**
- Create: `tests/integration/conftest.py`

- [ ] **Step 1: Write the conftest**

Two things the conftest must get right, both learned the hard way:

1. **Do NOT set `pytest_plugins` here.** pytest refuses `pytest_plugins` in any non-top-level conftest (collection aborts), and pytest-hacc auto-registers via its setuptools entry point, so it's unnecessary anyway.
2. **Skip panel registration during setup.** `async_setup_entry` → `async_register_panel` calls `hass.http.async_register_static_paths(...)` and `panel_custom.async_register_panel(...)`. A bare pytest-hacc `hass` has not loaded `http`/`frontend`/`panel_custom`, so this raises and the entry setup fails. Pre-seed `hass.data[DOMAIN]["_panel_registered"] = True` before setup; `async_setup_entry` guards on that flag and skips the panel.

Use `@pytest_asyncio.fixture` for the async fixture so it works regardless of pytest-asyncio mode.

`tests/integration/conftest.py`:
```python
"""Real-HA integration test fixtures for ThermoLoop."""
import pytest
import pytest_asyncio
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.thermoloop.const import (
    CONF_BROADLINK_REMOTE,
    CONF_PRESENCE_TRACKER,
    CONF_TEMP_SENSOR_BEDROOM,
    CONF_TEMP_SENSOR_LIVING,
    DOMAIN,
)


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


@pytest.fixture
def remote_calls():
    """List recording every remote.send_command call."""
    return []


@pytest_asyncio.fixture
async def setup_thermoloop(hass: HomeAssistant, remote_calls):
    """Set up ThermoLoop with a stub remote service and return handles."""

    async def _handle_send_command(call: ServiceCall) -> None:
        remote_calls.append(call.data)

    hass.services.async_register(
        "remote", "send_command", _handle_send_command
    )

    # Skip frontend panel registration: http/frontend/panel_custom are not
    # loaded in a bare test hass, and async_setup_entry guards on this flag.
    hass.data.setdefault(DOMAIN, {})["_panel_registered"] = True

    entry = MockConfigEntry(
        domain=DOMAIN,
        data={
            CONF_BROADLINK_REMOTE: "remote.broadlink_remote",
            CONF_TEMP_SENSOR_LIVING: "sensor.living_temp",
            CONF_TEMP_SENSOR_BEDROOM: "sensor.bedroom_temp",
            CONF_PRESENCE_TRACKER: ["device_tracker.phone1"],
        },
        entry_id="test_entry",
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    control_loop = hass.data[DOMAIN][entry.entry_id]["control_loop"]
    yield entry, control_loop, remote_calls


@pytest.fixture
def status_entity_id(hass: HomeAssistant, setup_thermoloop):
    """Resolve the status sensor's real entity_id via the entity registry.

    The sensor uses has_entity_name=True, so its entity_id is derived from
    its name (sensor.thermoloop_status), NOT from its unique_id. Look it up
    by unique_id to stay robust to slug/collision suffixes.
    """
    entry, _, _ = setup_thermoloop
    registry = er.async_get(hass)
    entity_id = registry.async_get_entity_id(
        "sensor", DOMAIN, f"thermoloop_status_{entry.entry_id}"
    )
    assert entity_id is not None, "status sensor not registered"
    return entity_id
```

- [ ] **Step 2: Verify conftest imports cleanly**

Importing the conftest standalone won't work (it needs pytest-hacc's plugin context), so verify via collection instead:
```bash
python -m pytest tests/integration/ --co -q 2>&1
```
Expected: collection succeeds (no `pytest_plugins`/import errors), even if there are zero tests yet.

- [ ] **Step 3: Commit**

```bash
git add tests/integration/conftest.py
git commit -m "test(thermoloop): add real-HA conftest with setup_thermoloop fixture"
```

---

### Task 3: Write all 6 integration test scenarios

**Files:**
- Create: `tests/integration/test_control_loop_integration.py`

Scenarios 1-3 WILL FAIL on current code. That's the point — they prove the harness catches the prod bugs. Scenarios 4-6 guard the rest of the tick path and go green once Task 4's fixes land.

- [ ] **Step 1: Write all 6 test scenarios**

Key caveat: HA's `State.last_updated` is a property automatically set by the state machine — you don't pass it in the attributes dict. Setting a state via `hass.states.async_set()` gives it a real tz-aware `last_updated` automatically, which is what triggers bug #2 (naive-vs-aware datetime subtraction). Helper entities (time, number, select) get their default states written during setup, but we set them explicitly here for clarity.

Critical rule (from the spec): **never override `control_loop._now`** in these tests. That override is exactly what hid bug #2 in the unit suite, and after the fix it would mask a regression of the very bug this suite exists to catch. Let `_now()` run for real.

Always resolve the status sensor via the `status_entity_id` fixture — its real entity_id is `sensor.thermoloop_status` (derived from the entity name), not `sensor.thermoloop_status_<entry_id>` (that string is only the unique_id). Hardcoding the entry_id suffix yields `None` and produces a false failure masquerading as the prod bug.

`tests/integration/test_control_loop_integration.py`:
```python
"""Integration tests for ThermoLoop ControlLoop against real HA primitives."""
import pytest
from homeassistant.core import HomeAssistant

from custom_components.thermoloop.const import DOMAIN


@pytest.mark.usefixtures("auto_enable_custom_integrations")
class TestControlLoopIntegration:

    # --- Tests that expose the prod bugs (FAIL on current code) ---

    @pytest.mark.asyncio
    async def test_golden_path_smoke(
        self, hass: HomeAssistant, setup_thermoloop, status_entity_id
    ):
        """Run one full tick with valid states; assert no crash and status written."""
        entry, control_loop, _ = setup_thermoloop

        hass.states.async_set("sensor.living_temp", "25.0")
        hass.states.async_set(
            "time.thermoloop_night_window_start_test_entry", "22:00"
        )
        hass.states.async_set(
            "time.thermoloop_night_window_end_test_entry", "07:00"
        )
        hass.states.async_set(
            "number.thermoloop_target_day_test_entry", "22.0"
        )
        hass.states.async_set(
            "number.thermoloop_target_night_test_entry", "24.0"
        )
        hass.states.async_set("select.thermoloop_mode_test_entry", "auto")
        hass.states.async_set(
            "select.thermoloop_algorithm_test_entry", "v0"
        )
        await hass.async_block_till_done()

        await control_loop.async_tick()
        await hass.async_block_till_done()

        status = hass.states.get(status_entity_id)
        assert status is not None

    @pytest.mark.asyncio
    async def test_sensor_age_math(
        self, hass: HomeAssistant, setup_thermoloop
    ):
        """tz-aware last_updated should not crash _build_input."""
        entry, control_loop, _ = setup_thermoloop

        hass.states.async_set("sensor.living_temp", "22.5")
        hass.states.async_set(
            "number.thermoloop_target_day_test_entry", "22.0"
        )
        hass.states.async_set(
            "number.thermoloop_target_night_test_entry", "24.0"
        )
        hass.states.async_set("select.thermoloop_mode_test_entry", "auto")
        hass.states.async_set(
            "select.thermoloop_algorithm_test_entry", "v0"
        )
        await hass.async_block_till_done()

        ci = control_loop._build_input()
        assert ci is not None
        assert ci.current_temp == 22.5

    @pytest.mark.asyncio
    async def test_status_write_commits(
        self, hass: HomeAssistant, setup_thermoloop, status_entity_id
    ):
        """async_write_ha_state should actually write state into the machine."""
        entry, control_loop, _ = setup_thermoloop

        hass.states.async_set("sensor.living_temp", "25.0")
        hass.states.async_set(
            "time.thermoloop_night_window_start_test_entry", "22:00"
        )
        hass.states.async_set(
            "time.thermoloop_night_window_end_test_entry", "07:00"
        )
        hass.states.async_set(
            "number.thermoloop_target_day_test_entry", "22.0"
        )
        hass.states.async_set(
            "number.thermoloop_target_night_test_entry", "24.0"
        )
        hass.states.async_set("select.thermoloop_mode_test_entry", "auto")
        hass.states.async_set(
            "select.thermoloop_algorithm_test_entry", "v0"
        )
        await hass.async_block_till_done()

        await control_loop.async_tick()
        await hass.async_block_till_done()

        status = hass.states.get(status_entity_id)
        assert status is not None
        assert status.state != "unknown"

    # --- Guard tests for remaining tick paths ---

    @pytest.mark.asyncio
    async def test_unavailable_sensor(
        self, hass: HomeAssistant, setup_thermoloop, status_entity_id
    ):
        """Unavailable temp sensor should produce error state, not crash."""
        entry, control_loop, _ = setup_thermoloop

        hass.states.async_set("sensor.living_temp", "unavailable")
        await hass.async_block_till_done()

        await control_loop.async_tick()
        await hass.async_block_till_done()

        # After the fix, the tick must complete and write an error/incomplete
        # status (incomplete context -> "error"). No tolerance for None here:
        # a None means the write crashed, which is the bug we are guarding.
        status = hass.states.get(status_entity_id)
        assert status is not None
        assert status.state == "error"

    @pytest.mark.asyncio
    async def test_night_window_switch(
        self, hass: HomeAssistant, setup_thermoloop
    ):
        """Night window covering the whole day should switch to the night sensor."""
        entry, control_loop, _ = setup_thermoloop

        # Night window 00:00-23:59 guarantees "now" is inside it regardless of
        # wall-clock time, so the night (bedroom) sensor must become active.
        # _now() runs for real — never overridden.
        hass.states.async_set("sensor.bedroom_temp", "24.0")
        hass.states.async_set(
            "time.thermoloop_night_window_start_test_entry", "00:00"
        )
        hass.states.async_set(
            "time.thermoloop_night_window_end_test_entry", "23:59"
        )
        await hass.async_block_till_done()

        await control_loop.async_tick()
        await hass.async_block_till_done()

        assert control_loop._active_sensor_id == "sensor.bedroom_temp"

    @pytest.mark.asyncio
    async def test_send_decision_drives_actuator(
        self, hass: HomeAssistant, setup_thermoloop
    ):
        """Temp gap should produce a send command and store assumed_state."""
        entry, control_loop, remote_calls = setup_thermoloop

        hass.states.async_set("sensor.living_temp", "28.0")
        hass.states.async_set(
            "number.thermoloop_target_day_test_entry", "22.0"
        )
        hass.states.async_set(
            "number.thermoloop_target_night_test_entry", "24.0"
        )
        hass.states.async_set("select.thermoloop_mode_test_entry", "auto")
        hass.states.async_set(
            "select.thermoloop_algorithm_test_entry", "v0"
        )
        hass.states.async_set(
            "time.thermoloop_night_window_start_test_entry", "22:00"
        )
        hass.states.async_set(
            "time.thermoloop_night_window_end_test_entry", "07:00"
        )
        await hass.async_block_till_done()

        await control_loop.async_tick()
        await hass.async_block_till_done()

        assert remote_calls
        data = remote_calls[0]
        assert "command" in data

        assumed = hass.data[DOMAIN][entry.entry_id].get("assumed_state")
        assert assumed is not None
```

> Note on scenarios 4 and 6: their assertions (`status.state == "error"`, `remote_calls` non-empty) describe the **post-fix** contract. Before Task 4 lands they may fail with the tz/await tracebacks rather than the asserted condition. That's expected — they go green once the bugs are fixed. Scenario 5 only inspects `_active_sensor_id`, set before the status write, so it isolates the night-window logic.

- [ ] **Step 2: Run all 6 scenarios — verify 1-3 fail with prod tracebacks**

```bash
python -m pytest tests/integration/ -v 2>&1
```
Expected: scenarios 1-3 FAIL with one of the two prod tracebacks (`can't subtract offset-naive and offset-aware datetimes` or `'NoneType' object can't be awaited`) — **not** a harness/setup error (no `KeyError`, no `None` entity_id). Scenarios 4-6 may also fail with the same tracebacks pre-fix. Record the actual failures to confirm they are the prod bugs, not harness bugs.

- [ ] **Step 3: Commit**

```bash
git add tests/integration/test_control_loop_integration.py
git commit -m "test(thermoloop): add 6 real-HA integration test scenarios"
```

---

### Task 4: Fix prod bugs and make integration tests pass

**Files:**
- Modify: `custom_components/thermoloop/control_loop.py` (`_now()` method)
- Modify: `custom_components/thermoloop/sensor.py` (`update_state` — remove `await`)
- Audit: any other `await async_write_ha_state()` call sites

- [ ] **Step 1: Fix _now() to return tz-aware UTC**

In `custom_components/thermoloop/control_loop.py`:

```python
def _now(self):
    """Return current UTC datetime (timezone-aware).

    Uses homeassistant.util.dt.utcnow() so the result matches real HA
    State.last_updated (tz-aware UTC), avoiding subtraction errors.
    """
    from homeassistant.util import dt as dt_util
    return dt_util.utcnow()
```

- [ ] **Step 2: Fix update_state to not await async_write_ha_state**

In `custom_components/thermoloop/sensor.py:91`:

Change:
```python
await self.async_write_ha_state()
```
To:
```python
self.async_write_ha_state()
```

- [ ] **Step 3: Audit for other await async_write_ha_state call sites**

Search for `await.*async_write_ha_state`:
```bash
rg "await.*async_write_ha_state" custom_components/thermoloop/
```

If found, remove the `await` prefix from each. Expected: only `sensor.py:91` has this pattern.

- [ ] **Step 4: Run integration tests — verify they pass now**

```bash
python -m pytest tests/integration/ -v 2>&1
```
Expected: All 6 scenarios PASS.

- [ ] **Step 5: Verify existing unit tests still pass**

```bash
python -m pytest tests/thermoloop/ -v 2>&1
```
Expected: all existing unit tests PASS (the prod fixes are behavior-preserving for the mocked suite; the `_now()` change returns a tz-aware datetime, which the unit tests either override or don't subtract).

- [ ] **Step 6: Commit**

```bash
git add custom_components/thermoloop/control_loop.py custom_components/thermoloop/sensor.py
git commit -m "fix(thermoloop): _now() tz-aware, async_write_ha_state not awaitable in HA"
```

---

### Task 5: Add CI workflow

**Files:**
- Create: `.github/workflows/tests.yml`

- [ ] **Step 1: Write tests.yml with two jobs**

There is no installable package (no `pyproject.toml`/`setup.py` — this is a `custom_components/` layout), so **do not** `pip install -e .`. Tests import `custom_components.thermoloop...` from the repo root, which pytest already puts on `sys.path` via rootdir. The two jobs run in separate processes, which is what keeps the mocked-unit suite's global `sys.modules` patching from colliding with real HA.

`.github/workflows/tests.yml`:
```yaml
name: Tests

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r requirements_test.txt
      - run: pytest tests/thermoloop/ -v

  integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r requirements_test.txt
      - run: pytest tests/integration/ -v
```

- [ ] **Step 2: Verify CI config is valid YAML**

```bash
python -c "import yaml; yaml.safe_load(open('.github/workflows/tests.yml')); print('OK')"
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/tests.yml
git commit -m "ci: add unit + integration test jobs"
```

---

### Task 6: Final verification and push

- [ ] **Step 1: Final test sweep**

Run the two suites as **separate processes** (they cannot share one — the mocked-unit conftest patches `sys.modules["homeassistant"]` globally at import time):
```bash
python -m pytest tests/thermoloop/ -v && python -m pytest tests/integration/ -v
```
Expected: all unit tests PASS, all 6 integration tests PASS.

- [ ] **Step 2: Push everything**

```bash
git push
```
