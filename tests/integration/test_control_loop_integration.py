"""Integration tests for ThermoLoop ControlLoop against real HA primitives."""
import datetime as dt

import pytest
from homeassistant.core import HomeAssistant

from custom_components.thermoloop.const import DOMAIN


class TestControlLoopIntegration:

    # --- Golden path ---

    @pytest.mark.asyncio
    async def test_golden_path_smoke(
        self, hass: HomeAssistant, setup_thermoloop, status_entity_id
    ):
        """Run one full tick with valid states; assert no crash and status written."""
        entry, control_loop, _ = setup_thermoloop

        # Set both sensors so the test is independent of the wall clock (the
        # night window selects day vs night sensor, and hass runs US/Pacific).
        hass.states.async_set("sensor.living_temp", "25.0")
        hass.states.async_set("sensor.bedroom_temp", "25.0")
        await hass.async_block_till_done()

        await control_loop.async_tick()
        await hass.async_block_till_done()

        status = hass.states.get(status_entity_id)
        assert status is not None

    # --- Input / state reading ---

    @pytest.mark.asyncio
    async def test_sensor_age_math(
        self, hass: HomeAssistant, setup_thermoloop
    ):
        """tz-aware last_updated should not crash _build_input."""
        entry, control_loop, _ = setup_thermoloop

        # Both sensors set (and equal) so the assertion holds whether the night
        # window selects the day or night sensor for the current wall clock.
        hass.states.async_set("sensor.living_temp", "22.5")
        hass.states.async_set("sensor.bedroom_temp", "22.5")
        await hass.async_block_till_done()

        ci = control_loop._build_input()
        assert ci is not None
        assert ci.current_temp == 22.5

    @pytest.mark.asyncio
    async def test_status_write_commits(
        self, hass: HomeAssistant, setup_thermoloop, status_entity_id
    ):
        """async_write_ha_state should actually write state into the machine."""
        entry, control_loop, _ = setup_thermoloop

        hass.states.async_set("sensor.living_temp", "25.0")
        hass.states.async_set("sensor.bedroom_temp", "25.0")
        await hass.async_block_till_done()

        await control_loop.async_tick()
        await hass.async_block_till_done()

        status = hass.states.get(status_entity_id)
        assert status is not None
        assert status.state != "unknown"

    # --- Error paths ---

    @pytest.mark.asyncio
    async def test_unavailable_sensor(
        self, hass: HomeAssistant, setup_thermoloop, status_entity_id
    ):
        """Unavailable temp sensor should produce error state, not crash."""
        entry, control_loop, _ = setup_thermoloop

        hass.states.async_set("sensor.living_temp", "unavailable")
        await hass.async_block_till_done()

        await control_loop.async_tick()
        await hass.async_block_till_done()

        status = hass.states.get(status_entity_id)
        assert status is not None
        assert status.state == "error"

    # --- Night window switching ---

    @pytest.mark.asyncio
    async def test_night_window_switch(
        self, hass: HomeAssistant, setup_thermoloop
    ):
        """Night window covering the whole day should switch to the night sensor.

        Config entity values are set via HA services (not ``hass.states.async_set``)
        because ``_build_input`` reads ``native_value`` from the entity objects.
        The night window 00:00-23:59 guarantees "now" is inside it regardless of
        wall-clock time, so the bedroom sensor must become active.
        """
        entry, control_loop, _ = setup_thermoloop

        # Set night window to cover all day via service (updates entity native_value)
        await hass.services.async_call(
            "time", "set_value",
            {"entity_id": "time.thermoloop_night_window_start", "time": dt.time(0, 0)},
            blocking=True,
        )
        await hass.services.async_call(
            "time", "set_value",
            {"entity_id": "time.thermoloop_night_window_end", "time": dt.time(23, 59)},
            blocking=True,
        )
        # Set the bedroom temp (night sensor)
        hass.states.async_set("sensor.bedroom_temp", "24.0")
        # _build_input also needs a valid day-level temp regardless of which
        # sensor is active, because is_night is checked first.
        hass.states.async_set("sensor.living_temp", "23.0")
        await hass.async_block_till_done()

        await control_loop.async_tick()
        await hass.async_block_till_done()

        assert control_loop._active_sensor_id == "sensor.bedroom_temp"

    # --- Actuator output ---

    @pytest.mark.asyncio
    async def test_send_decision_drives_actuator(
        self, hass: HomeAssistant, setup_thermoloop
    ):
        """Temp gap should produce a send command and store the actuator state."""
        entry, control_loop, remote_calls = setup_thermoloop

        hass.states.async_set("sensor.living_temp", "28.0")
        hass.states.async_set("sensor.bedroom_temp", "28.0")
        await hass.async_block_till_done()

        await control_loop.async_tick()
        await hass.async_block_till_done()

        assert remote_calls
        data = remote_calls[0]
        assert "command" in data

        assert control_loop._actuator.last_state is not None
