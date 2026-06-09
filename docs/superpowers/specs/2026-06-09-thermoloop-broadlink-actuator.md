# ThermoLoop Broadlink Actuator — Design Spec

**Date:** 2026-06-09
**Status:** Approved design
**Supersedes:** SmartIR actuator dependency (design spec §2 goal 1, §4 L1 actuator)

## 1. Summary

Replace the SmartIR climate entity dependency with direct Broadlink RM4 Mini IR blasting. Instead of ThermoLoop sending `climate.*` service calls to an external entity, the `Actuator` generates the Mitsubishi IR code from the `ACCommand` and sends it via `remote.send_data` on the user's Broadlink remote entity.

## 2. Motivation

The SmartIR integration was a dependency with no other use now that this is a dedicated ThermoLoop fork. Direct Broadlink control removes the dependency, simplifies the config flow, and gives us full control over IR code generation for the MSZ-GL18NA.

## 3. Architecture

```
ControlLoop → Actuator.apply(ACCommand)
                → ir_codes.generate(cmd) → raw IR timing data
                → hass.services.async_call("remote", "send_data", {entity_id, data})
```

### 3.1 New: `ir_codes.py`

Generates Mitsubishi MSZ-GL18NA IR codes programmatically from `ACCommand` fields. The Mitsubishi IR protocol is a structured 108-bit packet encoding power, mode, temperature, fan, and vane position. No code DB needed.

- **Input:** `ACCommand` (power, mode, setpoint, fan)
- **Output:** Raw IR timing data (list of int µs values) compatible with Broadlink's `remote.send_data`
- **No HA imports** — pure function, testable without HA
- **Model-specific constants** for the MSZ-GL18NA in a single dict (carrier frequency, timing constants, protocol offsets)

### 3.2 Modified: `actuator.py`

Current: calls `climate.set_hvac_mode`, `climate.set_temperature`, `climate.set_fan_mode` on an external entity.

New: generates IR code from `ACCommand`, sends via `remote.send_data` on the configured Broadlink entity.

```python
class Actuator:
    def __init__(self, hass, broadlink_entity_id: str):
        self._hass = hass
        self._entity_id = broadlink_entity_id

    async def apply(self, cmd: ACCommand) -> None:
        if not cmd.power:
            data = ir_codes.generate_power_off()
        else:
            data = ir_codes.generate(cmd)
        await self._hass.services.async_call(
            "remote", "send_data",
            {"entity_id": self._entity_id, "data": data},
        )
```

### 3.3 Modified: config_flow.py

Replace the `CONF_CLIMATE_ENTITY` (domain `climate`) selector with `CONF_BROADLINK_REMOTE` (domain `remote`). The user picks their Broadlink RM4 Mini entity.

```
vol.Required(CONF_BROADLINK_REMOTE): selector.EntitySelector(
    selector.EntitySelectorConfig(domain="remote")
)
```

### 3.4 Modified: constants

- Add `CONF_BROADLINK_REMOTE = "broadlink_remote"`
- Remove unused `CONF_CLIMATE_ENTITY` (or keep for migration compat)

### 3.5 Modified: `__init__.py`

Pass `conf[CONF_BROADLINK_REMOTE]` to `Actuator` instead of `conf[CONF_CLIMATE_ENTITY]`.

## 4. IR Code Generation

The Mitsubishi MSZ-GL18NA uses the standard Mitsubishi 108-bit IR protocol with 38 kHz carrier. The encoding is well-documented across open-source projects:

- **Data bits:** 108 bits (13.5 bytes) in little-endian bit order
- **Encoding:** Manchester or pulse-distance (mark 420µs, space 420µs for 1; mark 420µs, space 1300µs for 0)
- **Leader:** 3400µs mark, 1750µs space
- **Byte layout:** Header (3 bytes) → device type → power+mode → temperature → fan+vane → timer (zeros) → checksum

The temperature range is 16°C–31°C in 1°C steps. Fan speeds map to the AC's 5-speed + auto range. Mode maps to cool/heat/dry.

The generator is a single pure function: `generate(cmd: ACCommand) -> str` returning a base64-encoded byte string (Broadlink compatible format, same as codes from `remote.learn`).

**Fallback:** If programmatic generation produces codes that don't work with the user's AC, switch to a pre-stored JSON dict of known-working codes for the MSZ-GL18NA (extracted from the SmartIR code DB). The JSON is ~6 KB and stored in a single file.

## 5. Error Handling

- Broadlink remote entity unavailable/unconfigured → skip tick, log warning
- `remote.send_data` service call fails → logged, retry next tick
- Power-off uses a separate `generate_power_off()` function (the off command is a fixed code)

## 6. Config Flow Migration

Existing users with `CONF_CLIMATE_ENTITY` still set: if `CONF_BROADLINK_REMOTE` is not set, fall back to legacy climate service-call mode with a deprecation warning. This maintains backward compatibility during transition.

## 7. Testing

- **`test_ir_codes.py`** — unit tests for IR code generation:
  - Generates valid code for each mode (cool/heat/dry)
  - Generates valid code for each fan speed
  - Generates valid code for each temperature (16–30)
  - Power-off generates correct fixed code
  - Output format matches expected base64+Broadlink format
- **`test_actuator.py`** — updated to mock `remote.send_data`:
  - `apply` calls `remote.send_data` with correct entity_id
  - Power-off calls `generate_power_off`
  - Error from `remote.send_data` logged (test via logger mock)
- **`test_config_flow.py`** — updated for new entity selector domain

## 8. Open Items

- Exact IR protocol byte encoding confirmed/refined via `remote.learn` from the original remote
- If the MSZ-GL18NA uses a non-standard encoding variant, we fall back to raw stored codes (JSON dict per mode+temp combination — larger but safer)
