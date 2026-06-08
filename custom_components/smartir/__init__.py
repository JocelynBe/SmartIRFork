import aiofiles
import aiohttp
import binascii
import logging
import os.path
import struct

_LOGGER = logging.getLogger(__name__)

DOMAIN = 'smartir'
VERSION = '1.18.1'

COMPONENT_ABS_DIR = os.path.dirname(
    os.path.abspath(__file__))


async def async_setup(hass, config):
    """Set up the SmartIR component.

    The upstream self-update mechanism has been removed as a supply-chain
    hardening measure. It previously downloaded this integration's own Python
    files from a remote repository and overwrote them at runtime (executed on
    the next restart), which is a code-execution channel and is unnecessary:
    update the integration through HACS or by replacing the files manually.

    Any legacy ``smartir:`` configuration block (e.g. ``check_updates``) is
    accepted and ignored so existing configurations keep working.
    """
    return True


class Helper():
    @staticmethod
    async def downloader(source, dest):
        async with aiohttp.ClientSession() as session:
            async with session.get(source) as response:
                if response.status == 200:
                    async with aiofiles.open(dest, mode='wb') as f:
                        await f.write(await response.read())
                else:
                    raise Exception("File not found")

    @staticmethod
    def pronto2lirc(pronto):
        codes = [int(binascii.hexlify(pronto[i:i+2]), 16) for i in range(0, len(pronto), 2)]

        if codes[0]:
            raise ValueError("Pronto code should start with 0000")
        if len(codes) != 4 + 2 * (codes[2] + codes[3]):
            raise ValueError("Number of pulse widths does not match the preamble")

        frequency = 1 / (codes[1] * 0.241246)
        return [int(round(code / frequency)) for code in codes[4:]]

    @staticmethod
    def lirc2broadlink(pulses):
        array = bytearray()

        for pulse in pulses:
            pulse = int(pulse * 269 / 8192)

            if pulse < 256:
                array += bytearray(struct.pack('>B', pulse))
            else:
                array += bytearray([0x00])
                array += bytearray(struct.pack('>H', pulse))

        packet = bytearray([0x26, 0x00])
        packet += bytearray(struct.pack('<H', len(array)))
        packet += array
        packet += bytearray([0x0d, 0x05])

        # Add 0s to make ultimate packet size a multiple of 16 for 128-bit AES encryption.
        remainder = (len(packet) + 4) % 16
        if remainder:
            packet += bytearray(16 - remainder)
        return packet
