# ThermoLoop HA Wiring — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the pure-Python ThermoLoop control brain into Home Assistant — domain registration, actuator, helper entities, control loop, presence tracking.

**Architecture:** Layer the integration as a yaml-configured custom component. `Actuator` maps `ACCommand` → `climate.*` service calls. `ControlLoop` runs a periodic tick (~60s) gathering sensor/presence states from `hass`, feeds `Controller.decide`, applies the result. `PresenceTracker` listens to a `device_tracker` and flips the mode. Helper entities (`number`, `select`, `time`, `sensor`) expose tunables as first-class HA entities with native UI + history. All HA-specific code is isolated in its own files; the brain (`contracts`, `algorithms`, `guards`, `controller`) remains import-free of HA.

**Tech Stack:** Home Assistant 2025.5+, Python 3.12+ (brain runs on 3.9+), `pytest`, `pytest-homeassistant-custom-component` (for integration tests).

---

## File Structure

All paths relative to repo root `/Users/jocelyn/src/SmartIRFork`.

**New files:**
- `custom_components/thermoloop/manifest.json` — domain metadata
- `custom_components/thermoloop/config_flow.py` — minimal import-based config flow
- `custom_components/thermoloop/actuator.py` — maps ACCommand to climate service calls
- `custom_components/thermoloop/sensor.py` — `sensor.thermoloop_status` diagnostic entity
- `custom_components/thermoloop/number.py` — `number.thermoloop_target_day`, `_night`
- `custom_components/thermoloop/select.py` — `select.thermoloop_algorithm`, `_mode`
- `custom_components/thermoloop/time.py` — `time.thermoloop_night_start`, `_end`
- `custom_components/thermoloop/presence.py` — `PresenceTracker`
- `custom_components/thermoloop/loop.py` — `ControlLoop` periodic tick

**Modified files:**
- `custom_components/thermoloop/__init__.py` — domain constants, `async_setup`, `async_setup_entry`, `async_unload_entry`
- `requirements_test.txt` — add `pytest-homeassistant-custom-component`

**Test files:**
- `tests/thermoloop/test_actuator.py`
- `tests/thermoloop/test_sensor.py`
- `tests/thermoloop/test_number.py`
- `tests/thermoloop/test_select.py`
- `tests/thermoloop/test_time.py`
- `tests/thermoloop/test_presence.py`
- `tests/thermoloop/test_loop.py`

**Why these boundaries:** Each HA concern gets its own file matching the HA platform pattern. The actuator is the only seam where brain output touches HA, and it's isolated for mock testing. The loop is the orchestrator — it composes everything but knows only the contracts.

---

### Task 1: Domain registration + manifest

**Files:**
- Create: `custom_components/thermoloop/manifest.json`
- Modify: `custom_components/thermoloop/__init__.py`
- Create: `custom_components/thermoloop/config_flow.py`

- [ ] **Step 1: Create manifest.json and hacs.json**

Create `custom_components/thermoloop/hacs.json`:

```json
{
  "name": "ThermoLoop",
  "content_in_root": false,
  "render_readme": true,
  "domains": ["thermoloop"],
  "country": ["US"]
}
```

Create `custom_components/thermoloop/manifest.json`:

```json
{
  "domain": "thermoloop",
  "name": "ThermoLoop",
  "documentation": "https://github.com/JocelynBe/SmartIRFork",
  "dependencies": [],
  "codeowners": ["@JocelynBe"],
  "requirements": [],
  "homeassistant": "2025.5.0",
  "version": "0.1.0",
  "config_flow": true,
  "iot_class": "local_polling"
}
```

- [ ] **Step 2: Write the config flow**

Create `config_flow.py`:

```python
"""Config flow for ThermoLoop.

Minimal import-based config flow. User adds ThermoLoop via yaml; HA creates
the config entry from the yaml config.
"""
from __future__ import annotations

from homeassistant import config_entries
from homeassistant.const import CONF_NAME
import voluptuous as vol

from .const import DOMAIN

DATA_SCHEMA = vol.Schema({
    vol.Required(CONF_NAME, default="ThermoLoop"): str,
})


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input=None):
        if user_input is not None:
            return self.async_create_entry(title=user_input[CONF_NAME], data=user_input)
        return self.async_show_form(step_id="user", data_schema=DATA_SCHEMA)

    async def async_step_import(self, import_config):
        return await self.async_step_user(import_config)
```

- [ ] **Step 3: Create constants file**

Create `custom_components/thermoloop/const.py`:

```python
"""Constants for ThermoLoop."""
from __future__ import annotations

DOMAIN = "thermoloop"

CONF_CLIMATE_ENTITY = "climate_entity"
CONF_TEMP_SENSOR_LIVING = "temperature_sensor_living"
CONF_TEMP_SENSOR_BEDROOM = "temperature_sensor_bedroom"
CONF_HUMIDITY_SENSOR_LIVING = "humidity_sensor_living"
CONF_HUMIDITY_SENSOR_BEDROOM = "humidity_sensor_bedroom"
CONF_PRESENCE_TRACKER = "presence_tracker"

EVENT_THERMOLOOP_COMMAND = "thermoloop_command"

ATTR_MODE = "mode"
ATTR_ALGORITHM = "algorithm"
ATTR_TARGET = "target"
ATTR_ACTIVE_SENSOR = "active_sensor"
ATTR_CURRENT_TEMP = "current_temp"
ATTR_REASON = "reason"
```

- [ ] **Step 4: Write the failing test for constants**

Create `tests/thermoloop/test_const.py`:

```python
from custom_components.thermoloop.const import DOMAIN, CONF_CLIMATE_ENTITY


def test_domain_is_thermoloop():
    assert DOMAIN == "thermoloop"


def test_config_keys_are_defined():
    assert CONF_CLIMATE_ENTITY == "climate_entity"
```

- [ ] **Step 5: Run test**

Run: `python3 -m pytest tests/thermoloop/test_const.py -v`
Expected: Since const.py doesn't exist yet — FAIL with ModuleNotFoundError.

- [ ] **Step 6: Verify test passes**

Run: `python3 -m pytest tests/thermoloop/test_const.py -v`
Expected: PASS (2 passed).

- [ ] **Step 7: Write update to __init__.py**

Replace `custom_components/thermoloop/__init__.py` with:

```python
"""ThermoLoop: closed-loop smart-thermostat layer for Home Assistant."""
from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

PLATFORMS = ["sensor", "number", "select", "time"]


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up ThermoLoop from yaml (import-based config flow)."""
    if DOMAIN not in config:
        return True
    hass.async_create_task(
        hass.config_entries.flow.async_init(
            DOMAIN, context={"source": "import"}, data=config[DOMAIN]
        )
    )
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up ThermoLoop from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {}
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a ThermoLoop config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
    return True
```

- [ ] **Step 8: Run existing brain tests to make sure nothing broke**

Run: `python3 -m pytest tests/thermoloop -v --ignore=tests/thermoloop/test_actuator.py --ignore=tests/thermoloop/test_sensor.py --ignore=tests/thermoloop/test_number.py --ignore=tests/thermoloop/test_select.py --ignore=tests/thermoloop/test_time.py --ignore=tests/thermoloop/test_presence.py --ignore=tests/thermoloop/test_loop.py`
Expected: All brain tests still pass.

- [ ] **Step 9: Commit**

```bash
git add custom_components/thermoloop/manifest.json custom_components/thermoloop/hacs.json custom_components/thermoloop/__init__.py custom_components/thermoloop/config_flow.py custom_components/thermoloop/const.py tests/thermoloop/test_const.py
git commit -m "feat(thermoloop): add domain registration + config flow
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Actuator — translate ACCommand to climate service calls

**Files:**
- Create: `custom_components/thermoloop/actuator.py`
- Test: `tests/thermoloop/test_actuator.py`

- [ ] **Step 1: Write the failing test**

Create `tests/thermoloop/test_actuator.py`:

```python
"""Tests for the ThermoLoop actuator."""
from unittest.mock import AsyncMock

import pytest

from custom_components.thermoloop.actuator import Actuator
from custom_components.thermoloop.contracts import ACCommand, Fan, Mode


@pytest.fixture
def mock_hass():
    hass = AsyncMock()
    hass.services.async_call = AsyncMock()
    return hass


def _cmd(power=True, mode=Mode.COOL, setpoint=22, fan=Fan.LOW, reason="test") -> ACCommand:
    return ACCommand(power=power, mode=mode, setpoint=setpoint, fan=fan, reason=reason)


@pytest.mark.asyncio
async def test_actuator_turn_off_calls_turn_off_service(mock_hass):
    actuator = Actuator(mock_hass, "climate.my_ac")
    cmd = _cmd(power=False)
    await actuator.apply(cmd)
    mock_hass.services.async_call.assert_called_once_with(
        "climate", "turn_off", {"entity_id": "climate.my_ac"}
    )


@pytest.mark.asyncio
async def test_actuator_cool_mode_sets_hvac_mode(mock_hass):
    actuator = Actuator(mock_hass, "climate.my_ac")
    cmd = _cmd(power=True, mode=Mode.COOL, setpoint=18, fan=Fan.HIGH)
    await actuator.apply(cmd)
    assert mock_hass.services.async_call.call_count == 3
    mock_hass.services.async_call.assert_any_call(
        "climate", "set_hvac_mode", {"entity_id": "climate.my_ac", "hvac_mode": "cool"}
    )
    mock_hass.services.async_call.assert_any_call(
        "climate", "set_temperature", {"entity_id": "climate.my_ac", "temperature": 18}
    )
    mock_hass.services.async_call.assert_any_call(
        "climate", "set_fan_mode", {"entity_id": "climate.my_ac", "fan_mode": "high"}
    )


@pytest.mark.asyncio
async def test_actuator_power_on_does_not_turn_off(mock_hass):
    actuator = Actuator(mock_hass, "climate.my_ac")
    cmd = _cmd(power=True)
    await actuator.apply(cmd)
    for call_args in mock_hass.services.async_call.call_args_list:
        domain, service = call_args[0]
        assert not (domain == "climate" and service == "turn_off")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 -m pytest tests/thermoloop/test_actuator.py -v`
Expected: FAIL — ModuleNotFoundError.

- [ ] **Step 3: Write implementation**

Create `custom_components/thermoloop/actuator.py`:

```python
"""Actuator: the only HA-touching layer in the brain-to-AC pipeline.

Translates a pure `ACCommand` into concrete `climate.*` service calls on
the configured SmartIR climate entity.
"""
from __future__ import annotations

import logging

from homeassistant.core import HomeAssistant

from .contracts import ACCommand, Fan, Mode

_LOGGER = logging.getLogger(__name__)

_FAN_MAP = {
    Fan.LOW: "low",
    Fan.MID: "mid",
    Fan.HIGH: "high",
    Fan.HIGHEST: "highest",
}

_MODE_MAP = {
    Mode.COOL: "cool",
    Mode.HEAT: "heat",
    Mode.DRY: "dry",
}


class Actuator:
    """Sends discrete AC commands to a Home Assistant climate entity."""

    def __init__(self, hass: HomeAssistant, entity_id: str) -> None:
        self._hass = hass
        self._entity_id = entity_id

    async def apply(self, cmd: ACCommand) -> None:
        """Apply an ACCommand to the climate entity via service calls."""
        if not cmd.power:
            await self._hass.services.async_call(
                "climate", "turn_off",
                {"entity_id": self._entity_id},
            )
            return

        calls = []

        calls.append(("climate", "set_hvac_mode", {
            "entity_id": self._entity_id,
            "hvac_mode": _MODE_MAP[cmd.mode],
        }))

        calls.append(("climate", "set_temperature", {
            "entity_id": self._entity_id,
            "temperature": cmd.setpoint,
        }))

        calls.append(("climate", "set_fan_mode", {
            "entity_id": self._entity_id,
            "fan_mode": _FAN_MAP[cmd.fan],
        }))

        for domain, service, data in calls:
            await self._hass.services.async_call(domain, service, data)

        _LOGGER.debug("Sent: %s", cmd)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 -m pytest tests/thermoloop/test_actuator.py -v`
Expected: PASS (3 passed).

- [ ] **Step 5: Commit**

```bash
git add custom_components/thermoloop/actuator.py tests/thermoloop/test_actuator.py
git commit -m "feat(thermoloop): add actuator — ACCommand to climate service calls
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Sensor entity — thermoloop_status

**Files:**
- Create: `custom_components/thermoloop/sensor.py`
- Test: `tests/thermoloop/test_sensor.py`

- [ ] **Step 1: Write the failing test**

Create `tests/thermoloop/test_sensor.py`:

```python
"""Tests for ThermoLoop sensor entities."""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.thermoloop.const import DOMAIN
from custom_components.thermoloop.sensor import ThermoLoopStatusSensor


@pytest.fixture
def mock_hass():
    hass = MagicMock()
    hass.data = {DOMAIN: {}}
    return hass


def test_status_sensor_has_correct_attributes(mock_hass):
    sensor = ThermoLoopStatusSensor(mock_hass, "entry_id")
    assert sensor.unique_id == "thermoloop_status_entry_id"
    assert sensor.name == "ThermoLoop Status"
    assert sensor.entity_id is None  # set when added to HA


def test_status_sensor_state_defaults_to_idle(mock_hass):
    sensor = ThermoLoopStatusSensor(mock_hass, "entry_id")
    assert sensor.native_value == "idle"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 -m pytest tests/thermoloop/test_sensor.py -v`
Expected: FAIL — ModuleNotFoundError.

- [ ] **Step 3: Write implementation**

Create `custom_components/thermoloop/sensor.py`:

```python
"""Sensor platform for ThermoLoop.

The ``sensor.thermoloop_status`` diagnostic entity reports the last command
state, active sensor, current vs target, algorithm, and presence. Its
state history is the command timeline the panel overlays markers from.
"""
from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_IDLE
from homeassistant.core import HomeAssistant
from homeassistant.components.sensor import SensorEntity
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import (
    ATTR_ACTIVE_SENSOR,
    ATTR_ALGORITHM,
    ATTR_CURRENT_TEMP,
    ATTR_MODE,
    ATTR_REASON,
    ATTR_TARGET,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the ThermoLoop status sensor."""
    sensor = ThermoLoopStatusSensor(hass, entry.entry_id)
    hass.data.setdefault(DOMAIN, {}).setdefault(entry.entry_id, {})
    hass.data[DOMAIN][entry.entry_id]["status_sensor"] = sensor
    async_add_entities([sensor])


class ThermoLoopStatusSensor(SensorEntity):
    """Reports the last command and current control state."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, hass: HomeAssistant, entry_id: str) -> None:
        self._hass = hass
        self._entry_id = entry_id
        self._attr_unique_id = f"thermoloop_status_{entry_id}"
        self._attr_name = "ThermoLoop Status"
        self._attr_native_value = STATE_IDLE
        self._attributes: dict = {}

    @property
    def extra_state_attributes(self) -> dict:
        return self._attributes

    def update_state(
        self,
        state: str,
        *,
        mode: str | None = None,
        algorithm: str | None = None,
        target: float | None = None,
        active_sensor: str | None = None,
        current_temp: float | None = None,
        reason: str | None = None,
    ) -> None:
        """Update the sensor state and attributes."""
        self._attr_native_value = state
        attrs = {}
        if mode is not None:
            attrs[ATTR_MODE] = mode
        if algorithm is not None:
            attrs[ATTR_ALGORITHM] = algorithm
        if target is not None:
            attrs[ATTR_TARGET] = target
        if active_sensor is not None:
            attrs[ATTR_ACTIVE_SENSOR] = active_sensor
        if current_temp is not None:
            attrs[ATTR_CURRENT_TEMP] = current_temp
        if reason is not None:
            attrs[ATTR_REASON] = reason
        self._attributes = attrs
        self.async_write_ha_state()
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 -m pytest tests/thermoloop/test_sensor.py -v`
Expected: PASS (2 passed).

- [ ] **Step 5: Commit**

```bash
git add custom_components/thermoloop/sensor.py tests/thermoloop/test_sensor.py
git commit -m "feat(thermoloop): add status sensor entity
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Number entities — day and night targets

**Files:**
- Create: `custom_components/thermoloop/number.py`
- Test: `tests/thermoloop/test_number.py`

- [ ] **Step 1: Write the failing test**

Create `tests/thermoloop/test_number.py`:

```python
"""Tests for ThermoLoop number entities."""
from unittest.mock import MagicMock

import pytest

from custom_components.thermoloop.number import ThermoLoopTargetNumber


@pytest.fixture
def mock_hass():
    return MagicMock()


def test_target_day_entity(mock_hass):
    entity = ThermoLoopTargetNumber(mock_hass, "entry_id", "day")
    assert entity.unique_id == "thermoloop_target_day_entry_id"
    assert entity.name == "ThermoLoop Target Day"
    assert entity.native_min_value == 16
    assert entity.native_max_value == 30
    assert entity.native_step == 1.0


def test_target_night_entity(mock_hass):
    entity = ThermoLoopTargetNumber(mock_hass, "entry_id", "night")
    assert entity.unique_id == "thermoloop_target_night_entry_id"
    assert entity.name == "ThermoLoop Target Night"
    assert entity.native_min_value == 16
    assert entity.native_max_value == 30


def test_target_day_default_value(mock_hass):
    entity = ThermoLoopTargetNumber(mock_hass, "entry_id", "day")
    assert entity.native_value == 22.0


def test_target_night_default_value(mock_hass):
    entity = ThermoLoopTargetNumber(mock_hass, "entry_id", "night")
    assert entity.native_value == 24.0
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 -m pytest tests/thermoloop/test_number.py -v`
Expected: FAIL — ModuleNotFoundError.

- [ ] **Step 3: Write implementation**

Create `custom_components/thermoloop/number.py`:

```python
"""Number platform for ThermoLoop.

Exposes day and night target temperatures as ``number`` entities, giving
UI editing, history, and automatability for free.
"""
from __future__ import annotations

import logging

from homeassistant.components.number import NumberEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfTemperature
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .contracts import MAX_SETPOINT, MIN_SETPOINT
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

_DEFAULT_TARGETS = {"day": 22.0, "night": 24.0}


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the ThermoLoop target number entities."""
    async_add_entities([
        ThermoLoopTargetNumber(hass, entry.entry_id, "day"),
        ThermoLoopTargetNumber(hass, entry.entry_id, "night"),
    ])


class ThermoLoopTargetNumber(NumberEntity):
    """A target temperature for day or night phase."""

    _attr_has_entity_name = True
    _attr_native_unit_of_measurement = UnitOfTemperature.CELSIUS
    _attr_native_min_value = float(MIN_SETPOINT)
    _attr_native_max_value = float(MAX_SETPOINT)
    _attr_native_step = 1.0

    def __init__(self, hass: HomeAssistant, entry_id: str, phase: str) -> None:
        self._hass = hass
        self._entry_id = entry_id
        self._phase = phase
        self._attr_unique_id = f"thermoloop_target_{phase}_{entry_id}"
        self._attr_name = f"ThermoLoop Target {phase.capitalize()}"
        self._attr_native_value = _DEFAULT_TARGETS[phase]

    async def async_set_native_value(self, value: float) -> None:
        """Set the target temperature."""
        self._attr_native_value = value
        self.async_write_ha_state()
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 -m pytest tests/thermoloop/test_number.py -v`
Expected: PASS (4 passed).

- [ ] **Step 5: Commit**

```bash
git add custom_components/thermoloop/number.py tests/thermoloop/test_number.py
git commit -m "feat(thermoloop): add target day/night number entities
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Select entities — algorithm and mode

**Files:**
- Create: `custom_components/thermoloop/select.py`
- Test: `tests/thermoloop/test_select.py`

- [ ] **Step 1: Write the failing test**

Create `tests/thermoloop/test_select.py`:

```python
"""Tests for ThermoLoop select entities."""
from unittest.mock import MagicMock

import pytest

from custom_components.thermoloop.select import ThermoLoopAlgorithmSelect, ThermoLoopModeSelect


@pytest.fixture
def mock_hass():
    return MagicMock()


def test_algorithm_select_default(mock_hass):
    entity = ThermoLoopAlgorithmSelect(mock_hass, "entry_id")
    assert entity.unique_id == "thermoloop_algorithm_entry_id"
    assert entity.name == "ThermoLoop Algorithm"
    assert entity.current_option == "v0"


def test_algorithm_select_options(mock_hass):
    entity = ThermoLoopAlgorithmSelect(mock_hass, "entry_id")
    assert entity.options == ["v0", "v1"]


def test_mode_select_default(mock_hass):
    entity = ThermoLoopModeSelect(mock_hass, "entry_id")
    assert entity.unique_id == "thermoloop_mode_entry_id"
    assert entity.name == "ThermoLoop Mode"
    assert entity.current_option == "auto"


def test_mode_select_options(mock_hass):
    entity = ThermoLoopModeSelect(mock_hass, "entry_id")
    assert entity.options == ["auto", "off", "away"]
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 -m pytest tests/thermoloop/test_select.py -v`
Expected: FAIL — ModuleNotFoundError.

- [ ] **Step 3: Write implementation**

Create `custom_components/thermoloop/select.py`:

```python
"""Select platform for ThermoLoop.

Exposes the control algorithm selector and the operating mode as ``select``
entities, giving UI editing for free.
"""
from __future__ import annotations

import logging

from homeassistant.components.select import SelectEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the ThermoLoop select entities."""
    async_add_entities([
        ThermoLoopAlgorithmSelect(hass, entry.entry_id),
        ThermoLoopModeSelect(hass, entry.entry_id),
    ])


class ThermoLoopAlgorithmSelect(SelectEntity):
    """Select which control algorithm to use."""

    _attr_has_entity_name = True
    _attr_options = ["v0", "v1"]

    def __init__(self, hass: HomeAssistant, entry_id: str) -> None:
        self._hass = hass
        self._entry_id = entry_id
        self._attr_unique_id = f"thermoloop_algorithm_{entry_id}"
        self._attr_name = "ThermoLoop Algorithm"
        self._attr_current_option = "v0"

    async def async_select_option(self, option: str) -> None:
        self._attr_current_option = option
        self.async_write_ha_state()


class ThermoLoopModeSelect(SelectEntity):
    """Select the operating mode: auto / off / away."""

    _attr_has_entity_name = True
    _attr_options = ["auto", "off", "away"]

    def __init__(self, hass: HomeAssistant, entry_id: str) -> None:
        self._hass = hass
        self._entry_id = entry_id
        self._attr_unique_id = f"thermoloop_mode_{entry_id}"
        self._attr_name = "ThermoLoop Mode"
        self._attr_current_option = "auto"

    async def async_select_option(self, option: str) -> None:
        self._attr_current_option = option
        self.async_write_ha_state()
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 -m pytest tests/thermoloop/test_select.py -v`
Expected: PASS (4 passed).

- [ ] **Step 5: Commit**

```bash
git add custom_components/thermoloop/select.py tests/thermoloop/test_select.py
git commit -m "feat(thermoloop): add algorithm and mode select entities
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Time entities — night window

**Files:**
- Create: `custom_components/thermoloop/time.py`
- Test: `tests/thermoloop/test_time.py`

- [ ] **Step 1: Write the failing test**

Create `tests/thermoloop/test_time.py`:

```python
"""Tests for ThermoLoop time entities."""
from datetime import time
from unittest.mock import MagicMock

import pytest

from custom_components.thermoloop.time import ThermoLoopNightTime


@pytest.fixture
def mock_hass():
    return MagicMock()


def test_night_start_default(mock_hass):
    entity = ThermoLoopNightTime(mock_hass, "entry_id", "start")
    assert entity.unique_id == "thermoloop_night_start_entry_id"
    assert entity.name == "ThermoLoop Night Start"
    assert entity.native_value == time(22, 0)


def test_night_end_default(mock_hass):
    entity = ThermoLoopNightTime(mock_hass, "entry_id", "end")
    assert entity.unique_id == "thermoloop_night_end_entry_id"
    assert entity.name == "ThermoLoop Night End"
    assert entity.native_value == time(7, 0)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 -m pytest tests/thermoloop/test_time.py -v`
Expected: FAIL — ModuleNotFoundError.

- [ ] **Step 3: Write implementation**

Create `custom_components/thermoloop/time.py`:

```python
"""Time platform for ThermoLoop.

Exposes the night-window start and end as ``time`` entities, giving UI editing
for free.
"""
from __future__ import annotations

import logging
from datetime import time

from homeassistant.components.time import TimeEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

_DEFAULT_TIMES = {"start": time(22, 0), "end": time(7, 0)}


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the ThermoLoop night time entities."""
    async_add_entities([
        ThermoLoopNightTime(hass, entry.entry_id, "start"),
        ThermoLoopNightTime(hass, entry.entry_id, "end"),
    ])


class ThermoLoopNightTime(TimeEntity):
    """A time-of-day boundary for the night window."""

    _attr_has_entity_name = True

    def __init__(self, hass: HomeAssistant, entry_id: str, boundary: str) -> None:
        self._hass = hass
        self._entry_id = entry_id
        self._boundary = boundary
        self._attr_unique_id = f"thermoloop_night_{boundary}_{entry_id}"
        self._attr_name = f"ThermoLoop Night {boundary.capitalize()}"
        self._attr_native_value = _DEFAULT_TIMES[boundary]

    async def async_set_value(self, value: time) -> None:
        self._attr_native_value = value
        self.async_write_ha_state()
```

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 -m pytest tests/thermoloop/test_time.py -v`
Expected: PASS (2 passed).

- [ ] **Step 5: Commit**

```bash
git add custom_components/thermoloop/time.py tests/thermoloop/test_time.py
git commit -m "feat(thermoloop): add night window time entities
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: PresenceTracker — listen to device_tracker

**Files:**
- Create: `custom_components/thermoloop/presence.py`
- Test: `tests/thermoloop/test_presence.py`

- [ ] **Step 1: Write the failing test

Create `tests/thermoloop/test_presence.py`:

```python
"""Tests for the ThermoLoop PresenceTracker."""
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.thermoloop.presence import PresenceTracker, PresenceState


@pytest.mark.asyncio
async def test_leave_callback_fires():
    callback = AsyncMock()
    tracker = PresenceTracker(callback)
    tracker._last_state = PresenceState.HOME

    await tracker._handle_event(
        MagicMock(data={"entity_id": "device_tracker.iphone", "new_state": MagicMock(state="not_home")})
    )
    callback.assert_called_once_with(PresenceState.AWAY)


@pytest.mark.asyncio
async def test_arrive_callback_fires():
    callback = AsyncMock()
    tracker = PresenceTracker(callback)
    tracker._last_state = PresenceState.AWAY

    await tracker._handle_event(
        MagicMock(data={"entity_id": "device_tracker.iphone", "new_state": MagicMock(state="home")})
    )
    callback.assert_called_once_with(PresenceState.HOME)


@pytest.mark.asyncio
async def test_same_state_does_not_fire():
    callback = AsyncMock()
    tracker = PresenceTracker(callback)
    tracker._last_state = PresenceState.HOME

    await tracker._handle_event(
        MagicMock(data={"entity_id": "device_tracker.iphone", "new_state": MagicMock(state="home")})
    )
    callback.assert_not_called()
```

- [ ] **Step 2: Run test to verify it fails

Run: `python3 -m pytest tests/thermoloop/test_presence.py -v`
Expected: FAIL — ModuleNotFoundError.

- [ ] **Step 3: Write implementation

Create `custom_components/thermoloop/presence.py`:

```python
"""Presence tracking for ThermoLoop.

Listens to a ``device_tracker`` entity state change and fires a callback
on home/away transitions. The ControlLoop uses this to set the operating
mode.
"""
from __future__ import annotations

import logging
from enum import Enum
from typing import Callable, Coroutine

from homeassistant.core import HomeAssistant, Event, EventStateChangedData
from homeassistant.helpers.event import async_track_state_change_event

_LOGGER = logging.getLogger(__name__)


class PresenceState(str, Enum):
    HOME = "home"
    AWAY = "away"


class PresenceTracker:
    """Tracks a device_tracker and calls a callback on home/away transitions."""

    def __init__(
        self,
        on_change: Callable[[PresenceState], Coroutine],
    ) -> None:
        self._on_change = on_change
        self._last_state: PresenceState | None = None
        self._unsub: Callable | None = None

    def setup(self, hass: HomeAssistant, entity_id: str) -> None:
        """Start listening to the device_tracker entity."""
        self._hass = hass
        self._entity_id = entity_id
        self._unsub = async_track_state_change_event(
            hass, [entity_id], self._handle_event
        )

        # Seed initial state
        state = hass.states.get(entity_id)
        if state is not None:
            raw = state.state
            self._last_state = PresenceState.HOME if raw == "home" else PresenceState.AWAY

    async def _handle_event(self, event: Event[EventStateChangedData]) -> None:
        """Process a state change event from the device_tracker."""
        new_state = event.data.get("new_state")
        if new_state is None:
            return
        raw = new_state.state
        current = PresenceState.HOME if raw == "home" else PresenceState.AWAY
        if current == self._last_state:
            return
        self._last_state = current
        await self._on_change(current)

    def teardown(self) -> None:
        """Stop listening."""
        if self._unsub is not None:
            self._unsub()
            self._unsub = None
```

- [ ] **Step 4: Run test to verify it passes

Run: `python3 -m pytest tests/thermoloop/test_presence.py -v`
Expected: PASS (3 passed).

- [ ] **Step 5: Commit**

```bash
git add custom_components/thermoloop/presence.py tests/thermoloop/test_presence.py
git commit -m "feat(thermoloop): add presence tracker
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: ControlLoop — the periodic tick

**Files:**
- Create: `custom_components/thermoloop/loop.py`
- Test: `tests/thermoloop/test_loop.py`

- [ ] **Step 1: Write the failing test

Create `tests/thermoloop/test_loop.py`:

```python
"""Tests for the ThermoLoop ControlLoop."""
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import timedelta

import pytest

from custom_components.thermoloop.contracts import (
    ACCommand,
    ACState,
    ControlInput,
    ControlMode,
    Decision,
    Fan,
    Mode,
)
from custom_components.thermoloop.loop import ControlLoop


@pytest.fixture
def mock_hass():
    hass = MagicMock()
    hass.states = MagicMock()
    return hass


@pytest.mark.asyncio
async def test_tick_away_turns_off_ac(mock_hass):
    controller = MagicMock()
    controller.decide.return_value = Decision(
        ACCommand(False, Mode.COOL, 22, Fan.LOW, "away: turn off"),
        "away: turn off"
    )
    actuator = AsyncMock()
    status_sensor = MagicMock()
    loop = ControlLoop(
        hass=mock_hass,
        controller=controller,
        actuator=actuator,
        status_sensor=status_sensor,
        climate_entity_id="climate.my_ac",
        temp_sensor_living="sensor.living_temp",
        temp_sensor_bedroom="sensor.bedroom_temp",
        presence_tracker_entity="device_tracker.iphone",
    )
    loop._last_presence = "away"
    loop._algorithm_name = "v0"
    loop._mode = "away"

    # Mock state reads
    def _state(entity_id, attribute=None):
        if entity_id == "sensor.living_temp":
            return MagicMock(state="23.5")
        if entity_id == "climate.my_ac":
            return MagicMock(
                state="cool",
                attributes={"hvac_mode": "cool", "current_temperature": 23.5, "temperature": 22, "fan_mode": "low"}
            )
        return MagicMock(state="unknown")
    mock_hass.states.get = _state

    await loop._tick()

    actuator.apply.assert_called_once()
    assert actuator.apply.call_args[0][0].power is False


@pytest.mark.asyncio
async def test_tick_sends_command(mock_hass):
    cmd = ACCommand(True, Mode.COOL, 18, Fan.HIGH, "v0 slam-cool (err +3.0)")
    controller = MagicMock()
    controller.decide.return_value = Decision(cmd, cmd.reason)
    actuator = AsyncMock()
    status_sensor = MagicMock()
    loop = ControlLoop(
        hass=mock_hass,
        controller=controller,
        actuator=actuator,
        status_sensor=status_sensor,
        climate_entity_id="climate.my_ac",
        temp_sensor_living="sensor.living_temp",
        temp_sensor_bedroom="sensor.bedroom_temp",
        presence_tracker_entity="device_tracker.iphone",
    )
    loop._last_presence = "home"
    loop._algorithm_name = "v0"
    loop._mode = "auto"
    loop._day_target = 22.0
    loop._night_target = 24.0

    def _state(entity_id):
        if entity_id == "sensor.living_temp":
            return MagicMock(state="25.0")
        if entity_id == "climate.my_ac":
            return MagicMock(
                state="cool",
                attributes={"hvac_mode": "cool", "current_temperature": 25.0, "temperature": 22, "fan_mode": "low"}
            )
        return MagicMock(state="unknown")
    mock_hass.states.get = _state

    await loop._tick()

    actuator.apply.assert_called_once_with(cmd)
    status_sensor.update_state.assert_called_once()


@pytest.mark.asyncio
async def test_tick_stale_sensor_skips(mock_hass):
    controller = MagicMock()
    actuator = AsyncMock()
    status_sensor = MagicMock()
    loop = ControlLoop(
        hass=mock_hass,
        controller=controller,
        actuator=actuator,
        status_sensor=status_sensor,
        climate_entity_id="climate.my_ac",
        temp_sensor_living="sensor.living_temp",
        temp_sensor_bedroom="sensor.bedroom_temp",
        presence_tracker_entity="device_tracker.iphone",
    )

    # No sensors available -> stale
    mock_hass.states.get = MagicMock(return_value=None)

    await loop._tick()

    controller.decide.assert_not_called()
    actuator.apply.assert_not_called()
```

- [ ] **Step 2: Run test to verify it fails

Run: `python3 -m pytest tests/thermoloop/test_loop.py -v`
Expected: FAIL — ModuleNotFoundError.

- [ ] **Step 3: Write implementation

Create `custom_components/thermoloop/loop.py`:

```python
"""Control loop — the periodic tick that drives ThermoLoop.

Every ~60 seconds, gathers sensor readings, presence, and assumed AC state
into a ``ControlInput``, calls ``Controller.decide()``, and applies the
result via ``Actuator.apply()``.
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Callable

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import async_track_time_interval

from .actuator import Actuator
from .algorithms import get_algorithm
from .const import (
    ATTR_ACTIVE_SENSOR,
    ATTR_ALGORITHM,
    ATTR_CURRENT_TEMP,
    ATTR_MODE,
    ATTR_REASON,
    ATTR_TARGET,
    DOMAIN,
    EVENT_THERMOLOOP_COMMAND,
)
from .contracts import ACCommand, ACState, ControlInput, ControlMode, Fan, Mode
from .controller import Controller
from .guards import GuardConfig
from .sensor import ThermoLoopStatusSensor

_LOGGER = logging.getLogger(__name__)

TICK_INTERVAL = timedelta(seconds=60)


class ControlLoop:
    """Periodic control loop for ThermoLoop."""

    def __init__(
        self,
        hass: HomeAssistant,
        controller: Controller,
        actuator: Actuator,
        status_sensor: ThermoLoopStatusSensor,
        climate_entity_id: str,
        temp_sensor_living: str,
        temp_sensor_bedroom: str,
        humidity_sensor_living: str | None = None,
        humidity_sensor_bedroom: str | None = None,
        presence_tracker_entity: str | None = None,
    ) -> None:
        self._hass = hass
        self._controller = controller
        self._actuator = actuator
        self._status = status_sensor
        self._climate_entity_id = climate_entity_id
        self._temp_sensor_living = temp_sensor_living
        self._temp_sensor_bedroom = temp_sensor_bedroom
        self._humidity_sensor_living = humidity_sensor_living
        self._humidity_sensor_bedroom = humidity_sensor_bedroom
        self._presence_entity = presence_tracker_entity

        # Runtime state
        self._day_target: float = 22.0
        self._night_target: float = 24.0
        self._night_start_hour: int = 22
        self._night_end_hour: int = 7
        self._algorithm_name: str = "v0"
        self._mode: str = "auto"
        self._last_presence: str = "home"
        self._last_command_at: float | None = None
        self._last_command: ACCommand | None = None
        self._unsub: Callable | None = None
        self._temp_trend_window: list[tuple[float, float]] = []

    def start(self) -> None:
        """Start the periodic tick."""
        self._unsub = async_track_time_interval(
            self._hass, self._tick, TICK_INTERVAL
        )

    def stop(self) -> None:
        """Stop the periodic tick."""
        if self._unsub is not None:
            self._unsub()
            self._unsub = None

    def set_presence(self, state: str) -> None:
        self._last_presence = state

    def set_algorithm(self, name: str) -> None:
        self._algorithm_name = name

    def set_mode(self, mode: str) -> None:
        self._mode = mode

    def set_day_target(self, value: float) -> None:
        self._day_target = value

    def set_night_target(self, value: float) -> None:
        self._night_target = value

    def set_night_start(self, hour: int) -> None:
        self._night_start_hour = hour

    def set_night_end(self, hour: int) -> None:
        self._night_end_hour = hour

    def _is_night(self) -> bool:
        now = datetime.now()
        h = now.hour
        if self._night_start_hour <= self._night_end_hour:
            return self._night_start_hour <= h < self._night_end_hour
        # wraps around midnight (e.g. start=22, end=7)
        return h >= self._night_start_hour or h < self._night_end_hour

    def _get_control_mode(self) -> ControlMode:
        if self._mode == "off":
            return ControlMode.OFF
        if self._mode == "away" or self._last_presence == "away":
            return ControlMode.AWAY
        return ControlMode.AUTO

    def _read_sensor_temp(self, entity_id: str) -> float | None:
        state = self._hass.states.get(entity_id)
        if state is None or state.state in ("unknown", "unavailable", None):
            return None
        try:
            return float(state.state)
        except (ValueError, TypeError):
            return None

    def _read_assumed_state(self) -> ACState | None:
        state = self._hass.states.get(self._climate_entity_id)
        if state is None or state.state in ("unknown", "unavailable", None):
            return None
        attrs = state.attributes
        mode_str = attrs.get("hvac_mode") or state.state
        setpoint = attrs.get("temperature", 22)
        fan_str = attrs.get("fan_mode", "low")

        mode_map = {"cool": Mode.COOL, "heat": Mode.HEAT, "dry": Mode.DRY}
        fan_map = {"low": Fan.LOW, "mid": Fan.MID, "high": Fan.HIGH, "highest": Fan.HIGHEST}

        return ACState(
            power=mode_str not in ("off",),
            mode=mode_map.get(mode_str, Mode.COOL),
            setpoint=int(setpoint) if setpoint else 22,
            fan=fan_map.get(fan_str, Fan.LOW),
        )

    def _compute_trend(self) -> float:
        """Compute temperature slope (°C/min) from recent readings."""
        if len(self._temp_trend_window) < 2:
            return 0.0
        recent = self._temp_trend_window[-5:]
        if len(recent) < 2:
            return 0.0
        (t0, v0), (t1, v1) = recent[0], recent[-1]
        dt = (t1 - t0) / 60.0
        if dt < 0.5:
            return 0.0
        return (v1 - v0) / dt

    async def _tick(self, now=None) -> None:
        """Execute one control tick."""
        try:
            # Determine phase and pick active sensor
            night = self._is_night()
            active_sensor_entity = self._temp_sensor_bedroom if night else self._temp_sensor_living
            sensor_label = "bedroom" if night else "living"

            current_temp = self._read_sensor_temp(active_sensor_entity)
            if current_temp is None:
                _LOGGER.warning("Active sensor %s unavailable, skipping tick", active_sensor_entity)
                self._status.update_state("stale", reason=f"sensor {sensor_label} unavailable")
                return

            now_ts = datetime.now().timestamp()
            self._temp_trend_window.append((now_ts, current_temp))
            trend = self._compute_trend()

            assumed = self._read_assumed_state()
            if assumed is None:
                _LOGGER.warning("Climate entity %s unavailable, skipping tick", self._climate_entity_id)
                self._status.update_state("stale", reason="climate entity unavailable")
                return

            target = self._night_target if night else self._day_target
            control_mode = self._get_control_mode()

            ci = ControlInput(
                now=now_ts,
                mode=control_mode,
                current_temp=current_temp,
                sensor_age=1.0,
                target=target,
                assumed_state=assumed,
                temp_trend=trend,
                last_command_at=self._last_command_at,
            )

            self._controller.algorithm = get_algorithm(self._algorithm_name)
            decision = self._controller.decide(ci)

            if decision.is_send:
                cmd = decision.command
                await self._actuator.apply(cmd)
                self._last_command = cmd
                self._last_command_at = now_ts
                self._hass.bus.async_fire(
                    EVENT_THERMOLOOP_COMMAND,
                    {
                        "command": f"{cmd.mode.value} {cmd.setpoint}°C fan={cmd.fan.value}",
                        "reason": cmd.reason,
                        "target": target,
                        "current_temp": current_temp,
                        "active_sensor": sensor_label,
                    },
                )
                self._status.update_state(
                    "active" if cmd.power else "off",
                    mode=control_mode.value,
                    algorithm=self._algorithm_name,
                    target=target,
                    active_sensor=sensor_label,
                    current_temp=current_temp,
                    reason=cmd.reason,
                )
            else:
                self._status.update_state(
                    "idle",
                    mode=control_mode.value,
                    algorithm=self._algorithm_name,
                    target=target,
                    active_sensor=sensor_label,
                    current_temp=current_temp,
                    reason=decision.reason,
                )

        except Exception:
            _LOGGER.exception("Error in ThermoLoop control tick")
```

- [ ] **Step 4: Run test to verify it passes

Run: `python3 -m pytest tests/thermoloop/test_loop.py -v`
Expected: PASS (3 passed).

- [ ] **Step 5: Commit**

```bash
git add custom_components/thermoloop/loop.py tests/thermoloop/test_loop.py
git commit -m "feat(thermoloop): add control loop with periodic tick
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 9: Wire everything in __init__.py

**Files:**
- Modify: `custom_components/thermoloop/__init__.py`

- [ ] **Step 1: Update __init__.py to wire loop, actuator, presence**

Replace `custom_components/thermoloop/__init__.py`:

```python
"""ThermoLoop: closed-loop smart-thermostat layer for Home Assistant."""
from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType

from .actuator import Actuator
from .const import (
    CONF_CLIMATE_ENTITY,
    CONF_HUMIDITY_SENSOR_BEDROOM,
    CONF_HUMIDITY_SENSOR_LIVING,
    CONF_PRESENCE_TRACKER,
    CONF_TEMP_SENSOR_BEDROOM,
    CONF_TEMP_SENSOR_LIVING,
    DOMAIN,
)
from .controller import Controller
from .guards import GuardConfig
from .loop import ControlLoop
from .presence import PresenceTracker, PresenceState
from .algorithms import get_algorithm

_LOGGER = logging.getLogger(__name__)

PLATFORMS = ["sensor", "number", "select", "time"]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up ThermoLoop from yaml (import-based config flow)."""
    if DOMAIN not in config:
        return True
    hass.async_create_task(
        hass.config_entries.flow.async_init(
            DOMAIN, context={"source": "import"}, data=config[DOMAIN]
        )
    )
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up ThermoLoop from a config entry."""
    conf = entry.data

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {}

    # Forward to entity platforms — entities register themselves in hass.data
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Retrieve the status sensor registered by sensor.py's async_setup_entry
    status_sensor = hass.data[DOMAIN][entry.entry_id].get("status_sensor")

    actuator = Actuator(hass, conf[CONF_CLIMATE_ENTITY])
    controller = Controller(algorithm=get_algorithm("v0"), guards=GuardConfig())

    loop = ControlLoop(
        hass=hass,
        controller=controller,
        actuator=actuator,
        status_sensor=status_sensor,
        climate_entity_id=conf[CONF_CLIMATE_ENTITY],
        temp_sensor_living=conf.get(CONF_TEMP_SENSOR_LIVING),
        temp_sensor_bedroom=conf.get(CONF_TEMP_SENSOR_BEDROOM),
        humidity_sensor_living=conf.get(CONF_HUMIDITY_SENSOR_LIVING),
        humidity_sensor_bedroom=conf.get(CONF_HUMIDITY_SENSOR_BEDROOM),
        presence_tracker_entity=conf.get(CONF_PRESENCE_TRACKER),
    )

    # Set up presence tracking
    presence_tracker = None
    presence_entity = conf.get(CONF_PRESENCE_TRACKER)
    if presence_entity:

        async def _on_presence(state: PresenceState) -> None:
            if state == PresenceState.AWAY:
                loop.set_mode("away")
            else:
                loop.set_mode("auto")

        presence_tracker = PresenceTracker(_on_presence)
        presence_tracker.setup(hass, presence_entity)

    # Store for unload
    hass.data[DOMAIN][entry.entry_id] = {
        "actuator": actuator,
        "loop": loop,
        "presence_tracker": presence_tracker,
    }

    loop.start()
    _LOGGER.info("ThermoLoop started")

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a ThermoLoop config entry."""
    data = hass.data[DOMAIN].get(entry.entry_id, {})
    loop = data.get("loop")
    if loop:
        loop.stop()
    presence = data.get("presence_tracker")
    if presence:
        presence.teardown()

    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
    return True
```

Note: This depends on the entities being available. A cleaner approach is to wire the loop after platform setup completes by listening to the entity registry or using a delayed start. For v1, this assumes entities are created synchronously.

- [ ] **Step 2: Commit**

```bash
git add custom_components/thermoloop/__init__.py
git commit -m "feat(thermoloop): wire loop, actuator, presence in domain setup
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage (against `2026-06-08-thermoloop-design.md`):**
- §4 L2 actuator → Task 2.
- §4 L3 ControlLoop → Task 8 (periodic ~60s tick, gathers ControlInput, decides, applies).
- §4 L3 PresenceTracker → Task 7 (listens to device_tracker, leave→away, return→auto).
- §4 L3 Tunable entities → Tasks 3-6 (sensor, number, select, time entities).
- §4 L3 `thermoloop_command` event → Task 8 (`EVENT_THERMOLOOP_COMMAND` fired on send).
- §5 Data flow → Task 8 matches the tick flow.
- §7 Error handling → stale sensor and unavailable climate entity caught in tick, hold with log.
- §8 Packaging → `manifest.json`, `_config_flow.py`, domain renamed to `thermoloop`.

**Placeholder scan:** No TBDs, TODOs, or "implement later" — all steps contain complete runnable code.

**Type consistency:** `ControlInput`, `ACCommand`, `ACState`, `Decision`, `Mode`, `Fan`, `ControlMode` from `contracts.py` (Plan 1) are used consistently in actuator, loop, and presence. `Controller.decide` signature unchanged.

**Out of scope (Plan 3):** The Lit web component panel (`www/thermoloop-panel.js`), `panel.py` registration, and the `source_names` feature are deferred.
