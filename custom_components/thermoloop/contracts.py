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
