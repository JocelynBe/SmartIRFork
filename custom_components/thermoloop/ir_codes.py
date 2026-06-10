"""IR code lookup for ThermoLoop.

Resolves an ``ACCommand`` into a Broadlink Base64 IR code from the bundled
SmartIR code database (``codes/climate/<device_code>.json``), keyed by
mode/fan/temperature. This replaces a previous hand-rolled Mitsubishi frame
generator whose frames the AC did not recognize; the database carries
community-tested codes for the configured model.

Codes are returned as plain Base64 strings — the actuator prefixes them with
``b64:`` for ``remote.send_command``.
"""
from __future__ import annotations

import functools
import json
import os

from custom_components.thermoloop.contracts import ACCommand, Fan, Mode

# Mitsubishi MSZ-GL series (Broadlink, Base64). See codes/climate/1120.json.
# Bundling another model means dropping its <code>.json into codes/climate/ and
# pointing DEVICE_CODE at it (or, later, a config option).
DEVICE_CODE = 1120

_CODES_DIR = os.path.join(os.path.dirname(__file__), "codes", "climate")

_MODE_KEY = {Mode.COOL: "cool", Mode.HEAT: "heat", Mode.DRY: "dry"}
_FAN_KEY = {Fan.LOW: "low", Fan.MID: "mid", Fan.HIGH: "high", Fan.HIGHEST: "highest"}

_MIN_TEMP = 16
_MAX_TEMP = 30


@functools.lru_cache(maxsize=None)
def _commands(device_code: int) -> dict:
    """Load and cache the command table for a device code (file read once)."""
    path = os.path.join(_CODES_DIR, f"{device_code}.json")
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)["commands"]


def preload(device_code: int = DEVICE_CODE) -> None:
    """Warm the code cache off the event loop (call via executor at setup)."""
    _commands(device_code)


def generate_power_off(device_code: int = DEVICE_CODE) -> str:
    """Return the Broadlink Base64 power-off code."""
    return _commands(device_code)["off"]


def generate(cmd: ACCommand, device_code: int = DEVICE_CODE) -> str:
    """Resolve an ``ACCommand`` to a Broadlink Base64 IR code from the database.

    Temperature is clamped to the database's supported range; mode/fan fall back
    to cool/high if an enum value has no database key.
    """
    if not cmd.power:
        return generate_power_off(device_code)
    commands = _commands(device_code)
    mode = _MODE_KEY.get(cmd.mode, "cool")
    fan = _FAN_KEY.get(cmd.fan, "high")
    temp = max(_MIN_TEMP, min(_MAX_TEMP, int(round(cmd.setpoint))))
    table = commands[mode][fan]

    code = table.get(str(temp))
    if code:
        return code
    # The database can have isolated gaps (e.g. heat/low/23): use the nearest
    # temperature that has a code rather than ever returning an empty string,
    # which would send an invalid `b64:` to the Broadlink.
    for delta in range(1, _MAX_TEMP - _MIN_TEMP + 1):
        for cand in (temp - delta, temp + delta):
            if _MIN_TEMP <= cand <= _MAX_TEMP and table.get(str(cand)):
                return table[str(cand)]
    return generate_power_off(device_code)
