# ThermoLoop Broadlink Actuator — Design Spec

**Date:** 2026-06-09
**Status:** Approved design (revised)
**Supersedes:** SmartIR actuator dependency (design spec §2 goal 1, §4 L1 actuator)

## 1. Summary

Replace the SmartIR climate entity dependency with direct Broadlink RM4 Mini IR blasting. ThermoLoop generates Mitsubishi IR codes from `ACCommand` and sends them via `remote.send_command` on the user's Broadlink remote entity. Assumed AC state is tracked locally instead of read from a climate entity.

## 2. Motivation

Remove SmartIR dependency. Direct Broadlink control simplifies the config flow, eliminates an external dependency, and gives full control over MSZ-GL18NA IR codes.

## 3. Architecture

```
ControlLoop → Actuator.apply(ACCommand)
                → ir_codes.generate(cmd) → base64 IR code string
                → hass.services.async_call("remote", "send_command",
                    {entity_id, command: ["b64:<code>"]})
                → updates assumed AC state in hass.data
```

### 3.1 New: `ir_codes.py`

Pure-function module generating Mitsubishi MSZ-GL18NA IR codes from `ACCommand`. No HA imports.

- **Input:** `ACCommand` (power, mode, setpoint, fan)
- **Output:** base64-encoded IR packet string (same format as codes from `remote.learn`)
- Uses 38 kHz carrier, pulse-distance encoding (mark 432µs, space 432µs for 1; mark 432µs, space 1284µs for 0), 108-bit Mitsubishi protocol
- Separate `generate_power_off()` for the fixed off command
- **Fallback:** if programmatic generation fails, use a pre-stored JSON dict of known-working codes (~6 KB, extracted from SmartIR code DB)

### 3.2 Modified: `actuator.py`

Replaces climate service calls with `remote.send_command`.

```python
class Actuator:
    def __init__(self, hass, broadlink_entity_id: str):
        self._hass = hass
        self._entity_id = broadlink_entity_id

    async def apply(self, cmd: ACCommand) -> None:
        code = ir_codes.generate_power_off() if not cmd.power else ir_codes.generate(cmd)
        await self._hass.services.async_call(
            "remote", "send_command",
            {"entity_id": self._entity_id, "command": [f"b64:{code}"]},
            blocking=True,
        )
```

### 3.3 Assumed state tracking

The SmartIR climate entity was the source of assumed AC state for `ControlLoop._build_input()`. With it removed, the `Actuator` (or `ControlLoop`) maintains last-commanded state:

- **Storage:** `hass.data[DOMAIN][entry_id]["assumed_state"]: ACState`
- **Initial:** Defaults to `ACState(power=False, mode=Mode.COOL, setpoint=22, fan=Fan.LOW)` on first tick (safe start — AC assumed off)
- **After each send:** `Actuator.apply()` returns the final `ACState` (derived from the command), which `async_tick` stores
- **`_build_input` change:** Reads `assumed_state` from `hass.data` instead of from `hass.states.get(climate_entity_id).attributes`
- **Restart:** No persistence — defaults to safe-off on each restart. The first tick after restart sends a fresh command based on current sensor readings

### 3.4 Modified: `config_flow.py`

Replace `CONF_CLIMATE_ENTITY` (domain `climate`) selector with `CONF_BROADLINK_REMOTE` (domain `remote`).

```python
vol.Required(CONF_BROADLINK_REMOTE): selector.EntitySelector(
    selector.EntitySelectorConfig(domain="remote")
)
```

No backward-compat fallback — clean break.

### 3.5 Modified: `const.py`

- Add `CONF_BROADLINK_REMOTE = "broadlink_remote"`
- Remove `CONF_CLIMATE_ENTITY` (unused)

### 3.6 Modified: `__init__.py`

- Pass `conf[CONF_BROADLINK_REMOTE]` to `Actuator` instead of `conf[CONF_CLIMATE_ENTITY]`
- Remove `climate_entity_id` parameter from `ControlLoop.__init__` call (no longer needed)
- Initialize `hass.data[DOMAIN][entry_id]["assumed_state"]` with safe default
- After each `actuator.apply()`, store returned `ACState`

### 3.7 Modified: `control_loop.py`

- Remove `self._climate_entity_id` (constructor parameter and field)
- `_build_input()` reads assumed state from `hass.data[DOMAIN][self._entry_id]["assumed_state"]` instead of `hass.states.get(self._climate_entity_id).attributes`
- Mode/fan string-to-enum mapping stays the same; just reads from local dict instead of HA entity

## 4. IR Code Generation

The Mitsubishi MSZ-GL18NA uses the standard Mitsubishi 108-bit IR protocol:

- **Carrier:** 38 kHz
- **Encoding:** Pulse-distance
  - Bit 1: 432µs mark, 432µs space
  - Bit 0: 432µs mark, 1284µs space
- **Leader:** 3400µs mark, 1750µs space
- **Payload:** 108 data bits (13.5 bytes, little-endian)
  - Header (3 bytes), device type (1), power+mode (1), temperature (1), fan+vane (1), timer/zero (5), checksum (1)
- **Temperature range:** 16°C–31°C in 1°C steps
- **Fan:** auto/low/medium/high mapped to AC's speeds
- **Vane:** Fixed to auto (not exposed in ACCommand)

Output is a base64-encoded string of the Broadlink IR packet format (same as `remote.learn` output). The raw IR timing data is encoded into Broadlink's packed format before base64 conversion.

## 5. Error Handling

- Broadlink remote entity unavailable → skip tick, log warning, set status to "error: remote unavailable"
- `remote.send_command` service call fails → logged, retry next tick
- Broadlink remote entity is off → no send, log warning, retry next tick
- IR code generation fails for a combination → log error, use nearest-valid code

## 6. Testing

- **`test_ir_codes.py`** — unit tests:
  - Valid code for each mode (cool/heat/dry)
  - Valid code for each fan speed
  - Valid code for each temperature (16–30)
  - Power-off produces a valid non-empty code
  - Output is a non-empty base64 string
  - No two identical codes for different commands (sanity check)
- **`test_actuator.py`** — updated:
  - `apply` calls `remote.send_command` with correct entity_id and `b64:` prefix
  - Power-off calls `generate_power_off` path
  - `apply` returns `ACState` with the correct fields
- **`test_config_flow.py`** — updated:
  - Schema uses `CONF_BROADLINK_REMOTE` with domain `remote`
  - No `CONF_CLIMATE_ENTITY`
- **`test_control_loop.py`** — updated:
  - `_build_input` reads from `hass.data` assumed state
  - No `climate_entity_id` in constructor
- **`test_init.py`** — updated:
  - `mock_entry.data` uses `CONF_BROADLINK_REMOTE` not `CONF_CLIMATE_ENTITY`
  - Assumed state initialized on setup

## 7. Migration

Since there are no production users of ThermoLoop, remove `CONF_CLIMATE_ENTITY` entirely. Existing config entries will need re-creation (acceptable pre-v1).
