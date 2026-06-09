"""Tests for ThermoLoop config flow."""
from custom_components.thermoloop.const import (
    CONF_BROADLINK_REMOTE,
    CONF_TEMP_SENSOR_LIVING,
    DOMAIN,
)
from custom_components.thermoloop.config_flow import DATA_SCHEMA


def test_config_flow_domain():
    from custom_components.thermoloop.config_flow import ConfigFlow
    assert ConfigFlow.domain == DOMAIN


def test_config_flow_version():
    from custom_components.thermoloop.config_flow import ConfigFlow
    assert ConfigFlow.VERSION == 1


def test_schema_has_required_keys():
    assert CONF_BROADLINK_REMOTE in DATA_SCHEMA.schema
    assert CONF_TEMP_SENSOR_LIVING in DATA_SCHEMA.schema
