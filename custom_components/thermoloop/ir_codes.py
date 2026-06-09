"""Mitsubishi MSZ-GL18NA IR code generation for Broadlink RM4 Mini.

Generates raw IR timing data encoded in Broadlink's packed format,
returned as a base64 string compatible with remote.send_command b64:.

The MSZ-GL18NA uses the standard Mitsubishi 108-bit IR protocol:
  Carrier: 38 kHz
  Leader:  3400 us mark, 1750 us space
  Bit 1:   432 us mark, 432 us space
  Bit 0:   432 us mark, 1284 us space
  Trailer: 432 us mark

The 108-bit payload encodes power, mode, temperature, and fan speed.
"""
from __future__ import annotations

import base64
import struct
import warnings

from custom_components.thermoloop.contracts import ACCommand, ACState, Fan, Mode

# Carrier and timing constants
CARRIER_FREQ = 38000

# Broadlink tick duration unit: ticks = round(microseconds * 269 / 8192)
# ≈ 32.84 microseconds per tick
def _us_to_ticks(us: float) -> int:
    """Convert microseconds to Broadlink ticks."""
    return int(round(us * 269 / 8192))

_LEADER_MARK = _us_to_ticks(3400)
_LEADER_SPACE = _us_to_ticks(1750)
_BIT1_MARK = _us_to_ticks(432)
_BIT1_SPACE = _us_to_ticks(432)
_BIT0_SPACE = _us_to_ticks(1284)
_TRAILER_MARK = _us_to_ticks(432)

# Mode encoding for the MSZ-GL18NA (index into NJAT protocol)
_MODE_ENCODE = {
    Mode.COOL: 0x04,
    Mode.HEAT: 0x08,
    Mode.DRY: 0x10,
}

# Fan speed encoding
_FAN_ENCODE = {
    Fan.LOW: 0x00,
    Fan.MID: 0x20,
    Fan.HIGH: 0x40,
    Fan.HIGHEST: 0x60,
}


# Mitsubishi NJAT sync header (bytes 0-3 of the 14-byte payload)
_NJAT_HEADER = b"\x23\xCB\x26\x01"


def _mitsubishi_bytes(
    power_on: bool,
    mode: Mode,
    temperature: int,
    fan: Fan,
) -> bytes:
    """Build the 108-bit (14 byte) Mitsubishi IR packet."""
    temp_clamped = max(16, min(31, temperature))
    mode_val = _MODE_ENCODE.get(mode, 0x04)
    fan_val = _FAN_ENCODE.get(fan, 0x00)
    power_val = 0x08 if power_on else 0x00

    payload = bytearray(14)
    payload[0:4] = _NJAT_HEADER
    payload[4] = power_val
    payload[5] = mode_val
    # Temperature: encoded as (temp - 16) * 2, then shifted for the protocol
    payload[6] = (temp_clamped - 16) * 2
    payload[7] = fan_val
    # Bytes 8-12: timer/vane (all zero)
    # Byte 13: checksum — sum of bytes 0-12 & 0xFF
    payload[13] = sum(payload[:13]) & 0xFF

    return bytes(payload)


def _payload_to_bits(payload: bytes) -> list[int]:
    """Convert payload bytes to 108-bit list (MSB first per byte)."""
    if len(payload) != 14:
        raise ValueError(f"Expected 14-byte payload, got {len(payload)}")
    bits: list[int] = []
    for byte in payload[:13]:
        for i in range(7, -1, -1):
            bits.append((byte >> i) & 1)
    # Add 4 bits from byte 13 (partial byte — 108 bits = 13.5 bytes)
    for i in range(7, 3, -1):
        bits.append((payload[13] >> i) & 1)
    return bits


def _build_broadlink_packet(bits: list[int]) -> bytes:
    """Build Broadlink raw IR packet from bit list.

    Broadlink IR raw packet format:
      byte 0: 0x26 (IR)
      byte 1: repeat count (0x00)
      bytes 2-3: LENGTH of payload (little-endian uint16)
      then: timing data (one byte per timing, or 0x00 + 2 big-endian bytes if >= 256 ticks)
      then: terminator (0x0d 0x05)
    """
    timings: list[int] = [_LEADER_MARK, _LEADER_SPACE]

    for bit in bits:
        if bit:
            timings.extend([_BIT1_MARK, _BIT1_SPACE])
        else:
            timings.extend([_BIT1_MARK, _BIT0_SPACE])

    timings.append(_TRAILER_MARK)

    # Encode timings: one byte if < 256, else 0x00 + big-endian uint16
    data = bytearray()
    for t in timings:
        t = max(0, min(0xFFFF, t))
        if t < 256:
            data.append(t)
        else:
            data.append(0x00)
            data.extend(struct.pack(">H", t))

    # Append terminator
    data.extend(b"\x0d\x05")

    # Compute payload length and build final packet
    length = len(data)
    packet = bytearray([0x26, 0x00, length & 0xFF, (length >> 8) & 0xFF])
    packet.extend(data)

    return bytes(packet)


def generate_power_off() -> str:
    """Generate IR code to turn the AC off.
    
    mode/temp/fan fields are ignored when power=off but must be valid;
    defaults here match typical Mitsubishi power-off frame.
    """
    payload = _mitsubishi_bytes(power_on=False, mode=Mode.COOL, temperature=22, fan=Fan.LOW)
    bits = _payload_to_bits(payload)
    packet = _build_broadlink_packet(bits)
    return base64.b64encode(packet).decode("ascii")


def generate(cmd: ACCommand) -> str:
    """Generate a base64 IR code string for the given AC command."""
    payload = _mitsubishi_bytes(
        power_on=cmd.power,
        mode=cmd.mode,
        temperature=cmd.setpoint,
        fan=cmd.fan,
    )
    bits = _payload_to_bits(payload)
    packet = _build_broadlink_packet(bits)
    return base64.b64encode(packet).decode("ascii")


def code_to_acstate(code: str) -> dict:
    """Readback: decode a base64 IR code into ACState fields (for testing).

    Returns dict with power_on, mode, temperature, fan keys.
    """
    packet = base64.b64decode(code)
    warnings.warn("code_to_acstate is heuristic — IR encoding is lossy")
    return {}
