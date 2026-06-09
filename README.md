# ThermoLoop

Closed-loop smart-thermostat layer for Home Assistant. Wraps any `climate` entity with intelligent scheduling, dual-sensor day/night control, event-driven presence detection, and humidity monitoring.

## Features

- **Dual-sensor day/night** — Uses a living-room sensor during the day, bedroom sensor at night, with configurable time windows
- **Event-driven presence** — Detects home/away from `device_tracker` entities and adjusts automatically
- **Two control algorithms** — `v0` aggressive hysteresis for instant response, `v1` smoother ramp with registry
- **Humidity monitoring** — Optional humidity sensors wired into the status sensor
- **Target temperature phase switching** — Separate day/night setpoints
- **Config flow UI** — Entity pickers for all sensors, no YAML needed

## Installation

### HACS (recommended)

1. Go to HACS → Integrations → three dots → Custom repositories
2. Add `https://github.com/JocelynBe/SmartIRFork` as type **Integration**
3. Click Install on the ThermoLoop card
4. Restart Home Assistant

### Manual

Copy the `custom_components/thermoloop/` directory into your HA `config/custom_components/` directory and restart.

## Setup

1. Go to Settings → Devices & Services → Add Integration
2. Search for **ThermoLoop**
3. Select your climate entity, temperature sensors, and optional presence trackers

## Architecture

```
Layer 0: Contracts — domain types, control input/output schemas
Layer 1: Algorithms — v0 (aggressive), v1 (smooth + registry)
Layer 2: Guards — stale sensor, target clamping, rate limiting
Layer 3: Controller — orchestrates algorithm + guards
Layer 4: HA Wiring — actuator, sensor, control_loop, config_flow
```

The control brain (layers 0-3) is pure Python with no HA imports. All HA integration is in layer 4.

## Development

```bash
# Install test dependencies
pip install -r requirements_test.txt

# Run test suite
python3 -m pytest tests/thermoloop -v
```
