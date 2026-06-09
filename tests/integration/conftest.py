"""Real-HA integration test fixtures for ThermoLoop."""
import pytest
import pytest_asyncio
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.thermoloop.const import (
    CONF_BROADLINK_REMOTE,
    CONF_PRESENCE_TRACKER,
    CONF_TEMP_SENSOR_BEDROOM,
    CONF_TEMP_SENSOR_LIVING,
    DOMAIN,
)


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


@pytest.fixture
def remote_calls():
    """List recording every remote.send_command call."""
    return []


@pytest_asyncio.fixture
async def setup_thermoloop(hass: HomeAssistant, remote_calls):
    """Set up ThermoLoop with a stub remote service and return handles."""

    async def _handle_send_command(call: ServiceCall) -> None:
        remote_calls.append(call.data)

    hass.services.async_register(
        "remote", "send_command", _handle_send_command
    )

    # Skip frontend panel registration: http/frontend/panel_custom are not
    # loaded in a bare test hass, and async_setup_entry guards on this flag.
    hass.data.setdefault(DOMAIN, {})["_panel_registered"] = True

    entry = MockConfigEntry(
        domain=DOMAIN,
        data={
            CONF_BROADLINK_REMOTE: "remote.broadlink_remote",
            CONF_TEMP_SENSOR_LIVING: "sensor.living_temp",
            CONF_TEMP_SENSOR_BEDROOM: "sensor.bedroom_temp",
            CONF_PRESENCE_TRACKER: ["device_tracker.phone1"],
        },
        entry_id="test_entry",
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    control_loop = hass.data[DOMAIN][entry.entry_id]["control_loop"]
    yield entry, control_loop, remote_calls


@pytest.fixture
def status_entity_id(hass: HomeAssistant, setup_thermoloop):
    """Resolve the status sensor's real entity_id via the entity registry.

    The sensor uses has_entity_name=True, so its entity_id is derived from
    its name (sensor.thermoloop_status), NOT from its unique_id. Look it up
    by unique_id to stay robust to slug/collision suffixes.
    """
    entry, _, _ = setup_thermoloop
    registry = er.async_get(hass)
    entity_id = registry.async_get_entity_id(
        "sensor", DOMAIN, f"thermoloop_status_{entry.entry_id}"
    )
    assert entity_id is not None, "status sensor not registered"
    return entity_id
