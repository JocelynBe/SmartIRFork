# ThermoLoop HA Completion — Plan 3

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the HA integration layer with proper config flow, dual-sensor day/night switching, event-driven presence, sensor freshness tracking, and humidity support.

**Architecture:** 6 tasks, each producing a failing test first, then implementation. Tasks are sequential (each depends on the prior). Config flow is the prerequisite for all entity-selection features.

**Tech Stack:** HA config_entries with entity selectors, `async_track_state_change` for event-driven presence, `last_updated` from HA state for sensor age.

**Current test count:** 68 passing, 0 warnings

## Prerequisite: Conftest mocks

Before any task, add missing mocks to `tests/thermoloop/conftest.py`:

**1. `async_track_state_change`** (needed by Task 2)

Add after the `async_track_time_interval` mock (~line 44):
```python
ha_mod.helpers.event.async_track_state_change = MagicMock(return_value=MagicMock())
```

**2. `homeassistant.helpers.selector`** (needed by Task 1)

Add after the helpers section (~line 35):
```python
ha_mod.helpers.selector = types.ModuleType("homeassistant.helpers.selector")
ha_mod.helpers.selector.EntitySelector = MagicMock
ha_mod.helpers.selector.EntitySelectorConfig = MagicMock
```

**3. `last_updated` on mocked State** (needed by Task 4)

The `_state` helper and `MagicMock(state=...)` calls don't set `last_updated`. The `_state()` function or the `MagicMock` for states should set `last_updated = None` by default so `getattr` doesn't raise.

---
## File Structure

| File | Responsibility | Status |
|------|---------------|--------|
| `custom_components/thermoloop/const.py` | Constants — add `ATTR_HUMIDITY` | Modify |
| `custom_components/thermoloop/config_flow.py` | Config flow with entity selectors | Rewrite |
| `custom_components/thermoloop/presence.py` | Event-driven presence tracker | Rewrite |
| `custom_components/thermoloop/sensor.py` | Status sensor — add humidity attr | Modify |
| `custom_components/thermoloop/control_loop.py` | Dual-sensor, age tracking, humidity | Modify |
| `custom_components/thermoloop/number.py` | Fix missing await | Modify |
| `custom_components/thermoloop/__init__.py` | Pass both sensor IDs, register presence callback | Modify |
| `tests/thermoloop/test_config_flow.py` | Config flow tests | Create |
| `tests/thermoloop/test_presence.py` | Event-driven presence tests | Rewrite |

### Task 1: Config flow with entity selectors

**Files:**
- Rewrite: `custom_components/thermoloop/config_flow.py`
- Create: `tests/thermoloop/test_config_flow.py`

- [ ] **Step 1: Write the failing test**

Create `tests/thermoloop/test_config_flow.py` with pure-Python schema validation tests (no HA test framework needed):

```python
"""Tests for ThermoLoop config flow (schema validation)."""
from custom_components.thermoloop.config_flow import ConfigFlow, DATA_SCHEMA
from custom_components.thermoloop.const import (
    CONF_CLIMATE_ENTITY,
    CONF_PRESENCE_TRACKER,
    CONF_TEMP_SENSOR_BEDROOM,
    CONF_TEMP_SENSOR_LIVING,
    DOMAIN,
)


def test_config_flow_domain():
    assert ConfigFlow.domain == DOMAIN


def test_config_flow_version():
    assert ConfigFlow.VERSION == 1


def test_schema_has_required_keys():
    assert CONF_CLIMATE_ENTITY in DATA_SCHEMA.schema
    assert CONF_TEMP_SENSOR_LIVING in DATA_SCHEMA.schema
    assert CONF_TEMP_SENSOR_BEDROOM in DATA_SCHEMA.schema
    assert CONF_PRESENCE_TRACKER in DATA_SCHEMA.schema
```

- [ ] **Step 2: Run test to verify it fails**

```bash
python3 -m pytest tests/thermoloop/test_config_flow.py -v
```

- [ ] **Step 3: Rewrite config_flow.py**

```python
"""Config flow for ThermoLoop.

Entity selector config flow. User picks climate entity, day/night
temperature sensors, optional humidity sensors, and presence trackers.
"""
from __future__ import annotations

from homeassistant import config_entries
from homeassistant.const import CONF_NAME
from homeassistant.helpers import selector
import voluptuous as vol

from custom_components.thermoloop.const import (
    CONF_CLIMATE_ENTITY,
    CONF_HUMIDITY_SENSOR_BEDROOM,
    CONF_HUMIDITY_SENSOR_LIVING,
    CONF_PRESENCE_TRACKER,
    CONF_TEMP_SENSOR_BEDROOM,
    CONF_TEMP_SENSOR_LIVING,
    DOMAIN,
)

DATA_SCHEMA = vol.Schema({
    vol.Required(CONF_NAME, default="ThermoLoop"): str,
    vol.Required(CONF_CLIMATE_ENTITY): selector.EntitySelector(
        selector.EntitySelectorConfig(domain="climate")
    ),
    vol.Required(CONF_TEMP_SENSOR_LIVING): selector.EntitySelector(
        selector.EntitySelectorConfig(domain="sensor", device_class="temperature")
    ),
    vol.Required(CONF_TEMP_SENSOR_BEDROOM): selector.EntitySelector(
        selector.EntitySelectorConfig(domain="sensor", device_class="temperature")
    ),
    vol.Optional(CONF_HUMIDITY_SENSOR_LIVING): selector.EntitySelector(
        selector.EntitySelectorConfig(domain="sensor", device_class="humidity")
    ),
    vol.Optional(CONF_HUMIDITY_SENSOR_BEDROOM): selector.EntitySelector(
        selector.EntitySelectorConfig(domain="sensor", device_class="humidity")
    ),
    vol.Optional(CONF_PRESENCE_TRACKER, default=[]): selector.EntitySelector(
        selector.EntitySelectorConfig(
            domain="device_tracker",
            multiple=True,
        )
    ),
})


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input=None):
        if user_input is not None:
            return self.async_create_entry(
                title=user_input[CONF_NAME], data=user_input
            )
        return self.async_show_form(step_id="user", data_schema=DATA_SCHEMA)

    async def async_step_import(self, import_config):
        return await self.async_step_user(import_config)
```

- [ ] **Step 4: Run test to verify it passes**

```bash
python3 -m pytest tests/thermoloop/test_config_flow.py -v
```

- [ ] **Step 5: Run full suite**

```bash
python3 -m pytest tests/thermoloop -v
```

- [ ] **Step 6: Commit**

```bash
git add custom_components/thermoloop/config_flow.py tests/thermoloop/test_config_flow.py
git commit -m "feat(thermoloop): config flow with entity selectors for all sensors"
```

---

### Task 2: Event-driven presence tracker

**Files:**
- Rewrite: `custom_components/thermoloop/presence.py`
- Rewrite: `tests/thermoloop/test_presence.py`
- Modify: `custom_components/thermoloop/__init__.py`

The current `PresenceTracker` is polling-based (`is_away` property checks `hass.states.get`). Replace with event-driven: register `async_track_state_change` callbacks on each device_tracker entity and fire a callback when presence transitions.

- [ ] **Step 1: Read current presence.py**

```bash
cat custom_components/thermoloop/presence.py
```

- [ ] **Step 2: Rewrite test_presence.py**

```python
"""Tests for ThermoLoop event-driven presence tracker."""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.thermoloop.presence import PresenceTracker


@pytest.fixture
def mock_hass():
    hass = MagicMock()
    hass.states = MagicMock()
    return hass


def test_init_no_trackers(mock_hass):
    tracker = PresenceTracker(mock_hass, [], None)
    assert not tracker.is_away
    assert tracker.client_ids == []


def test_init_with_trackers(mock_hass):
    cb = MagicMock()
    tracker = PresenceTracker(
        mock_hass, ["device_tracker.phone1"], cb
    )
    assert tracker.client_ids == ["device_tracker.phone1"]


def test_init_registers_callbacks(mock_hass):
    cb = MagicMock()
    tracker = PresenceTracker(
        mock_hass, ["device_tracker.phone1", "device_tracker.phone2"], cb
    )
    # Should have registered async_track_state_change for each
    # (unsubs are stored in _unsubs list, 1 per entity)
    assert len(tracker._unsubs) == 2


def test_away_when_all_tracked_devices_are_away(mock_hass):
    def state_side_effect(eid):
        s = MagicMock()
        s.state = "not_home"
        return s
    mock_hass.states.get.side_effect = state_side_effect
    tracker = PresenceTracker(mock_hass, ["device_tracker.phone1", "device_tracker.phone2"], None)
    assert tracker.is_away is True


def test_home_when_any_device_is_home(mock_hass):
    def state_side_effect(eid):
        s = MagicMock(state="home")
        return s
    mock_hass.states.get.side_effect = state_side_effect
    tracker = PresenceTracker(mock_hass, ["device_tracker.phone1"], None)
    assert tracker.is_away is False


def test_presence_callback_fires_on_transition(mock_hass):
    cb = MagicMock()
    # At init, the device is home — _was_away computed as False
    mock_hass.states.get.return_value = MagicMock(state="home")
    tracker = PresenceTracker(
        mock_hass, ["device_tracker.phone1"], cb
    )
    # Simulate state change: device goes to not_home
    mock_hass.states.get.return_value = MagicMock(state="not_home")
    new_state = MagicMock(state="not_home")
    old_state = MagicMock(state="home")
    tracker._handle_state_change("device_tracker.phone1", old_state, new_state)
    cb.assert_called_once_with("away")
```

- [ ] **Step 3: Run test to verify it fails**

```bash
python3 -m pytest tests/thermoloop/test_presence.py -v
```

- [ ] **Step 4: Rewrite presence.py**

```python
"""Event-driven presence tracker for ThermoLoop.

Listens to device_tracker state changes via async_track_state_change
and fires a callback when presence transitions (home -> away, away -> home).
"""
from __future__ import annotations

import logging
from typing import Callable

from homeassistant.core import HomeAssistant, State
from homeassistant.helpers.event import async_track_state_change

_LOGGER = logging.getLogger(__name__)


class PresenceTracker:
    """Event-driven occupancy tracker."""

    def __init__(
        self,
        hass: HomeAssistant,
        client_ids: list[str],
        callback: Callable[[str], None] | None = None,
    ) -> None:
        self._hass = hass
        self._client_ids = list(client_ids)
        self._callback = callback
        self._unsubs: list[Callable] = []
        self._was_away: bool = self._compute_away()

        if callback is not None:
            for eid in client_ids:
                unsub = async_track_state_change(
                    hass, eid, self._handle_state_change
                )
                self._unsubs.append(unsub)

    def _handle_state_change(
        self,
        entity_id: str,
        old_state: State | None,
        new_state: State | None,
    ) -> None:
        if new_state is None:
            return
        now_away = self._compute_away()
        if self._was_away != now_away:
            transition = "away" if now_away else "home"
            _LOGGER.debug("Presence transition: %s", transition)
            if self._callback:
                self._callback(transition)
            self._was_away = now_away

    @property
    def is_away(self) -> bool:
        return self._compute_away()

    def _compute_away(self) -> bool:
        if not self._client_ids:
            return False
        for eid in self._client_ids:
            state = self._hass.states.get(eid)
            if state is None or state.state in ("not_home", "unknown"):
                continue
            return False
        return True

    @property
    def client_ids(self) -> list[str]:
        return list(self._client_ids)

    def stop(self) -> None:
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
```

- [ ] **Step 5: Run test to verify it passes**

```bash
python3 -m pytest tests/thermoloop/test_presence.py -v
```

- [ ] **Step 6: Wire presence callback in __init__.py**

Add `PresenceTracker` callback that re-runs the control loop on transition:

```python
# In async_setup_entry, after creating presence:
async def _on_presence(transition: str) -> None:
    """Re-evaluate control on presence transition."""
    await control_loop.async_tick()

presence = PresenceTracker(hass, device_tracker_entities, _on_presence)
```

And in `async_unload_entry`:

```python
if presence is not None:
    presence.stop()
```

- [ ] **Step 7: Run full suite**

```bash
python3 -m pytest tests/thermoloop -v
```

- [ ] **Step 8: Commit**

```bash
git add custom_components/thermoloop/presence.py custom_components/thermoloop/__init__.py tests/thermoloop/test_presence.py
git commit -m "feat(thermoloop): event-driven presence tracker with transition callbacks"
```

---

### Task 3: Dual-sensor day/night switching

**Files:**
- Modify: `custom_components/thermoloop/control_loop.py`
- Modify: `custom_components/thermoloop/__init__.py`
- Modify: `tests/thermoloop/test_control_loop.py`

- [ ] **Step 1: Write the failing test**

Add to `tests/thermoloop/test_control_loop.py`:

```python
@pytest.mark.asyncio
async def test_async_tick_uses_night_sensor_during_night(mock_hass, mock_actuator, mock_sensor, mock_presence):
    """During night window, use bedroom sensor instead of living room."""
    states = {
        "sensor.living_temp": _state("sensor.living_temp", "26.5"),
        "sensor.bedroom_temp": _state("sensor.bedroom_temp", "24.0"),
        "climate.my_ac": _state(
            "climate.my_ac", "cool",
            {"hvac_mode": "cool", "temperature": 22, "fan_mode": "low"},
        ),
        "number.thermoloop_target_day_entry_id": _state("number.dummy", "22"),
        "number.thermoloop_target_night_entry_id": _state("number.dummy", "24"),
        "select.thermoloop_mode_entry_id": _state("select.dummy", "auto"),
        "select.thermoloop_algorithm_entry_id": _state("select.dummy", "v0"),
        "time.thermoloop_night_window_start_entry_id": _state("time.dummy", "23:00:00"),
        "time.thermoloop_night_window_end_entry_id": _state("time.dummy", "07:00:00"),
    }
    mock_hass.states.get.side_effect = lambda eid: states.get(eid)

    loop = ControlLoop(
        hass=mock_hass,
        entry_id="entry_id",
        climate_entity_id="climate.my_ac",
        temp_sensor_day_entity_id="sensor.living_temp",
        temp_sensor_night_entity_id="sensor.bedroom_temp",
        actuator=mock_actuator,
        presence=mock_presence,
        status_sensor=mock_sensor,
    )
    # Force night time
    loop._now = lambda: datetime.datetime(2024, 6, 15, 23, 30, 0)
    await loop.async_tick()

    mock_actuator.apply.assert_called_once()
    # Should have used bedroom temp (24.0), not living temp (26.5)
    # With target 24.0 and current 24.0, error is 0 -> on target
    cmd = mock_actuator.apply.call_args[0][0]
    assert cmd.setpoint == 24
```

- [ ] **Step 2: Run test to verify it fails**

```bash
python3 -m pytest tests/thermoloop/test_control_loop.py::test_async_tick_uses_night_sensor_during_night -v
```

- [ ] **Step 3: Update `__init__.py` to pass both sensor IDs**

```python
# In async_setup_entry:
temp_sensor_day: str = entry.data[CONF_TEMP_SENSOR_LIVING]
temp_sensor_night: str = entry.data[CONF_TEMP_SENSOR_BEDROOM]

...

control_loop = ControlLoop(
    ...
    temp_sensor_day_entity_id=temp_sensor_day,
    temp_sensor_night_entity_id=temp_sensor_night,
    ...
)
```

- [ ] **Step 4: Update constructor, `_build_loop`, `_build_input`, and `async_tick` atomically**

These changes must happen together — changing the constructor without updating `_build_loop` would break existing tests.

**4a. Update `ControlLoop.__init__`** in `control_loop.py`:

```python
def __init__(
    self,
    hass,
    entry_id: str,
    climate_entity_id: str,
    temp_sensor_day_entity_id: str,
    temp_sensor_night_entity_id: str,
    actuator: Actuator,
    presence: PresenceTracker,
    status_sensor: ThermoLoopStatusSensor,
) -> None:
    self._hass = hass
    self._entry_id = entry_id
    self._climate_entity_id = climate_entity_id
    self._temp_sensor_day = temp_sensor_day_entity_id
    self._temp_sensor_night = temp_sensor_night_entity_id
    self._active_sensor_id: str | None = None
    self._actuator = actuator
    self._presence = presence
    self._status_sensor = status_sensor
    self._controller = Controller(
        algorithm=get_algorithm("v0"), guards=GuardConfig()
    )
    self._algo_name: str = "v0"
    self._unsub_interval = None
    self._interval = dt.timedelta(seconds=_TICK_INTERVAL_SECONDS)
    self._last_command_at: float | None = None
    self._temp_history: list[tuple[float, float]] = []
```

Remove the old `self._temp_sensor_entity_id = temp_sensor_entity_id` line.

**4b. Update `_build_loop` helper** in `tests/thermoloop/test_control_loop.py`:

```python
def _build_loop(mock_hass, mock_actuator, mock_sensor, mock_presence, entry_id="entry_id"):
    return ControlLoop(
        hass=mock_hass,
        entry_id=entry_id,
        climate_entity_id="climate.my_ac",
        temp_sensor_day_entity_id="sensor.room_temp",
        temp_sensor_night_entity_id="sensor.room_temp",
        actuator=mock_actuator,
        presence=mock_presence,
        status_sensor=mock_sensor,
    )
```

**4c. Update `_build_input`** — replace `temp_state = self._hass.states.get(self._temp_sensor_entity_id)` with:

```python
active_sensor_id = self._temp_sensor_night if is_night else self._temp_sensor_day
self._active_sensor_id = active_sensor_id
temp_state = self._hass.states.get(active_sensor_id)
```

Move this BEFORE `is_night` is computed (or use a forward declaration). The `is_night` variable is already computed from `night_start`/`night_end` which are read from HA entities. Move `is_night` computation above `temp_state`:

```python
# Compute night phase
night_start = self._read_entity(...)
night_end = self._read_entity(...)
is_night = _night_window_active(self._now(), night_start, night_end)

# Pick sensor by phase
active_sensor_id = self._temp_sensor_night if is_night else self._temp_sensor_day
self._active_sensor_id = active_sensor_id
temp_state = self._hass.states.get(active_sensor_id)
```

**4d. Fix `async_tick` active_sensor reference** — change in `update_state` call:

```python
# Before:
active_sensor=self._temp_sensor_entity_id,
# After:
active_sensor=self._active_sensor_id,
```

- [ ] **Step 6: Run test to verify it passes**

```bash
python3 -m pytest tests/thermoloop/test_control_loop.py::test_async_tick_uses_night_sensor_during_night -v
```

- [ ] **Step 7: Run full suite**

```bash
python3 -m pytest tests/thermoloop -v
```

- [ ] **Step 8: Commit**

```bash
git add custom_components/thermoloop/control_loop.py custom_components/thermoloop/__init__.py tests/thermoloop/test_control_loop.py
git commit -m "feat(thermoloop): dual-sensor day/night phase switching"
```

---

### Task 4: Sensor freshness tracking

**Files:**
- Modify: `custom_components/thermoloop/control_loop.py`
- Modify: `tests/thermoloop/test_control_loop.py`

Currently `sensor_age` is hardcoded to `1.0`. Compute actual age from `last_updated` timestamp on the sensor state.

- [ ] **Step 1: Write the failing test**

```python
@pytest.mark.asyncio
async def test_async_tick_reports_sensor_age(mock_hass, mock_actuator, mock_sensor, mock_presence):
    """Sensor age should be computed from last_updated."""
    now = datetime.datetime(2024, 6, 15, 12, 0, 0)
    old = datetime.datetime(2024, 6, 15, 11, 50, 0)  # 600s ago

    def get_state(eid):
        if eid == "sensor.room_temp":
            s = _state("sensor.room_temp", "26.5")
            s.last_updated = old
            return s
        if eid == "climate.my_ac":
            s = _state("climate.my_ac", "cool",
                       {"hvac_mode": "cool", "temperature": 22, "fan_mode": "low"})
            s.last_updated = now
            return s
        return _state(eid, "auto" if "select" in eid else "22")
    mock_hass.states.get.side_effect = get_state

    loop = _build_loop(mock_hass, mock_actuator, mock_sensor, mock_presence)
    loop._now = lambda: now

    with patch.object(loop._controller, 'decide', wraps=loop._controller.decide) as spy:
        await loop.async_tick()
        ci = spy.call_args[0][0]
        assert ci.sensor_age == 600.0
```

Note: `State` objects in HA have `last_updated` as a `datetime.datetime` attribute. The mock needs to provide this.

- [ ] **Step 2: Compute sensor age in `_build_input`**

Replace the hardcoded `sensor_age=1.0` in the `ControlInput(...)` construction (line ~228):

```python
# After getting temp_state and current_temp:
sensor_last_updated = getattr(temp_state, "last_updated", None)
if sensor_last_updated is not None:
    sensor_age = (now - sensor_last_updated).total_seconds()
else:
    sensor_age = 0.0
```

Then change the `ControlInput` call from `sensor_age=1.0` to `sensor_age=sensor_age`.

- [ ] **Step 3: Run test to verify it passes**

- [ ] **Step 4: Commit**

```bash
git add custom_components/thermoloop/control_loop.py tests/thermoloop/test_control_loop.py
git commit -m "feat(thermoloop): compute sensor_age from last_updated timestamp"
```

---

### Task 5: Humidity sensor wiring

**Files:**
- Modify: `custom_components/thermoloop/const.py`
- Modify: `custom_components/thermoloop/sensor.py`
- Modify: `custom_components/thermoloop/control_loop.py`
- Modify: `custom_components/thermoloop/__init__.py`
- Modify: `tests/thermoloop/test_sensor.py`
- Modify: `tests/thermoloop/test_control_loop.py`

- [ ] **Step 1: Add ATTR_HUMIDITY to const.py**

```python
ATTR_HUMIDITY = "humidity"
```

- [ ] **Step 2: Add humidity to status sensor**

In `sensor.py`, add a `humidity` parameter to `update_state`:

```python
async def update_state(
    self,
    state: str,
    *,
    mode: str | None = None,
    algorithm: str | None = None,
    target: float | None = None,
    active_sensor: str | None = None,
    current_temp: float | None = None,
    humidity: float | None = None,
    reason: str | None = None,
) -> None:
    ...
    if humidity is not None:
        attrs[ATTR_HUMIDITY] = humidity
```

- [ ] **Step 3: Write test for humidity attribute**

```python
@pytest.mark.asyncio
async def test_update_state_with_humidity(mock_hass):
    sensor = ThermoLoopStatusSensor(mock_hass, "entry_id")
    await sensor.update_state("active", mode="cool", humidity=55.0, reason="test")
    assert sensor.extra_state_attributes.get("humidity") == 55.0
```

- [ ] **Step 4: Wire humidity sensors in __init__.py**

```python
humidity_sensor_living: str | None = entry.data.get(CONF_HUMIDITY_SENSOR_LIVING)
humidity_sensor_bedroom: str | None = entry.data.get(CONF_HUMIDITY_SENSOR_BEDROOM)
```

Pass both to `ControlLoop` constructor, which now accepts `humidity_sensor_day_entity_id` and `humidity_sensor_night_entity_id` (both `str | None`):

```python
control_loop = ControlLoop(
    ...
    humidity_sensor_day_entity_id=humidity_sensor_living,
    humidity_sensor_night_entity_id=humidity_sensor_bedroom,
    ...
)
```

**ControlLoop constructor signature update** (in `control_loop.py`):

```python
def __init__(
    self,
    hass,
    entry_id: str,
    climate_entity_id: str,
    temp_sensor_day_entity_id: str,
    temp_sensor_night_entity_id: str,
    actuator: Actuator,
    presence: PresenceTracker,
    status_sensor: ThermoLoopStatusSensor,
    humidity_sensor_day_entity_id: str | None = None,
    humidity_sensor_night_entity_id: str | None = None,
) -> None:
    ...
    self._humidity_day = humidity_sensor_day_entity_id
    self._humidity_night = humidity_sensor_night_entity_id
```

Also update `_build_loop` in tests to pass the new params.

**Test helper update** in `test_control_loop.py`:

```python
def _build_loop(mock_hass, mock_actuator, mock_sensor, mock_presence, entry_id="entry_id"):
    return ControlLoop(
        ...
        humidity_sensor_day_entity_id=None,
        humidity_sensor_night_entity_id=None,
    )
```

- [ ] **Step 5: Read humidity in control_loop._build_input**

```python
# After determining active sensor:
humidity_entity = self._humidity_night if is_night else self._humidity_day
current_humidity: float | None = None
if humidity_entity is not None:
    h_state = self._hass.states.get(humidity_entity)
    if h_state is not None and h_state.state not in ("unknown", "unavailable", "", None):
        try:
            current_humidity = float(h_state.state)
        except (ValueError, TypeError):
            pass
```

Pass `humidity=current_humidity` in `update_state` call.

- [ ] **Step 6: Run full suite**

- [ ] **Step 7: Commit**

```bash
git add custom_components/thermoloop/const.py custom_components/thermoloop/sensor.py custom_components/thermoloop/control_loop.py custom_components/thermoloop/__init__.py tests/thermoloop/test_sensor.py tests/thermoloop/test_control_loop.py
git commit -m "feat(thermoloop): humidity sensor wiring through status sensor"
```

---

### Task 6: Fix missing await in number.py

**Files:**
- Modify: `custom_components/thermoloop/number.py`
- Modify: `tests/thermoloop/test_number.py`

- [ ] **Step 1: Write the failing test**

```python
@pytest.mark.asyncio
async def test_set_target_value_awaits_write(mock_hass):
    """async_set_native_value should await async_write_ha_state."""
    entity = ThermoLoopTargetNumber(mock_hass, "entry_id", "day")
    entity.async_write_ha_state = AsyncMock()
    await entity.async_set_native_value(25.0)
    assert entity.native_value == 25.0
    entity.async_write_ha_state.assert_awaited()
```

- [ ] **Step 2: Fix number.py**

```python
async def async_set_native_value(self, value: float) -> None:
    self._attr_native_value = value
    await self.async_write_ha_state()
```

- [ ] **Step 3: Run full suite**

```bash
python3 -m pytest tests/thermoloop -v
```

- [ ] **Step 4: Commit**

```bash
git add custom_components/thermoloop/number.py tests/thermoloop/test_number.py
git commit -m "fix(thermoloop): await async_write_ha_state in async_set_native_value"
```

---

## Self-Review Checklist

1. **Spec coverage:** Config flow entities from §2.4, dual-sensor from §2.3 (Goal 3), event-driven presence from §2.2 (Goal 2), sensor freshness from L3 controller, humidity from §6, await fix from Plan 2 review.
2. **Placeholder scan:** No TBD, TODO, or "implement later" — all code is concrete.
3. **Type consistency:** `temp_sensor_day_entity_id` / `temp_sensor_night_entity_id` used consistently across init.py, control_loop.py, and tests. `ATTR_HUMIDITY` matches naming convention of existing ATTR_* constants.
