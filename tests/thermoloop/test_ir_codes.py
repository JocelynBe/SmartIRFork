"""Tests for Mitsubishi IR code generation."""
import base64

from custom_components.thermoloop.contracts import ACCommand, Fan, Mode
from custom_components.thermoloop.ir_codes import (
    generate,
    generate_power_off,
    _us_to_ticks,
    _LEADER_MARK,
)


def test_generate_power_off_returns_nonempty():
    code = generate_power_off()
    assert isinstance(code, str)
    assert len(code) > 0


def test_generate_returns_base64_string():
    cmd = ACCommand(power=True, mode=Mode.COOL, setpoint=22, fan=Fan.LOW, reason="test")
    code = generate(cmd)
    assert isinstance(code, str)
    assert len(code) > 0
    # Verify it's valid base64
    decoded = base64.b64decode(code)
    assert len(decoded) > 0


def test_generate_differs_by_mode():
    cool = ACCommand(power=True, mode=Mode.COOL, setpoint=22, fan=Fan.LOW, reason="test")
    heat = ACCommand(power=True, mode=Mode.HEAT, setpoint=22, fan=Fan.LOW, reason="test")
    assert generate(cool) != generate(heat)


def test_generate_differs_by_temperature():
    low = ACCommand(power=True, mode=Mode.COOL, setpoint=16, fan=Fan.LOW, reason="test")
    high = ACCommand(power=True, mode=Mode.COOL, setpoint=30, fan=Fan.LOW, reason="test")
    assert generate(low) != generate(high)


def test_generate_differs_by_fan():
    low = ACCommand(power=True, mode=Mode.COOL, setpoint=22, fan=Fan.LOW, reason="test")
    high = ACCommand(power=True, mode=Mode.COOL, setpoint=22, fan=Fan.HIGH, reason="test")
    assert generate(low) != generate(high)


def test_generate_dry_mode_works():
    cmd = ACCommand(power=True, mode=Mode.DRY, setpoint=24, fan=Fan.LOW, reason="test")
    code = generate(cmd)
    assert len(code) > 0


def test_generate_all_fan_speeds():
    for fan in Fan:
        cmd = ACCommand(power=True, mode=Mode.COOL, setpoint=22, fan=fan, reason="test")
        code = generate(cmd)
        assert len(code) > 0


def test_generate_all_temperatures():
    for temp in range(16, 31):
        cmd = ACCommand(power=True, mode=Mode.COOL, setpoint=temp, fan=Fan.LOW, reason="test")
        code = generate(cmd)
        assert len(code) > 0


def test_us_to_ticks_conversion():
    """Test that microsecond to tick conversion uses correct formula."""
    # 3400 us leader should become ~112 ticks (with 269/8192 scale)
    ticks = _us_to_ticks(3400)
    assert 110 <= ticks <= 114, f"Expected 3400us ≈ 112 ticks, got {ticks}"


def test_timing_constants_are_small():
    """Verify timing constants are reasonable small values (< 200 ticks)."""
    assert _LEADER_MARK < 200, f"_LEADER_MARK should be < 200, got {_LEADER_MARK}"
    # Other timing constants should also fit in one byte (< 256)
    from custom_components.thermoloop.ir_codes import (
        _LEADER_SPACE,
        _BIT1_MARK,
        _BIT1_SPACE,
        _BIT0_SPACE,
        _TRAILER_MARK,
    )
    assert _LEADER_SPACE < 256
    assert _BIT1_MARK < 256
    assert _BIT1_SPACE < 256
    assert _BIT0_SPACE < 256
    assert _TRAILER_MARK < 256


def test_packet_header_format():
    """Test that generated packet has correct Broadlink header format."""
    code = generate_power_off()
    decoded = base64.b64decode(code)

    # Packet should have at least 6 bytes: header (4) + at least one timing + terminator (2)
    assert len(decoded) >= 6

    # Verify header bytes
    assert decoded[0] == 0x26, f"First byte should be 0x26, got {hex(decoded[0])}"
    assert decoded[1] == 0x00, f"Second byte should be 0x00, got {hex(decoded[1])}"

    # Extract length from bytes 2-3 (little-endian)
    length = decoded[2] | (decoded[3] << 8)
    assert length > 0, "Payload length should be > 0"

    # Verify packet structure: 4-byte header + payload
    expected_total = 4 + length
    assert len(decoded) == expected_total, (
        f"Packet length mismatch: expected {expected_total}, got {len(decoded)}"
    )


def test_packet_terminator():
    """Test that packet ends with correct terminator (0x0d 0x05)."""
    code = generate_power_off()
    decoded = base64.b64decode(code)

    assert len(decoded) >= 6
    assert decoded[-2] == 0x0d, f"Second-to-last byte should be 0x0d, got {hex(decoded[-2])}"
    assert decoded[-1] == 0x05, f"Last byte should be 0x05, got {hex(decoded[-1])}"


def test_packet_roundtrip_length():
    """Test that packet length field matches actual payload."""
    cmd = ACCommand(power=True, mode=Mode.COOL, setpoint=22, fan=Fan.LOW, reason="test")
    code = generate(cmd)
    decoded = base64.b64decode(code)

    # Extract header and length
    length = decoded[2] | (decoded[3] << 8)
    expected_total = 4 + length
    assert len(decoded) == expected_total, (
        f"Packet should be 4 + {length} = {expected_total}, got {len(decoded)}"
    )
