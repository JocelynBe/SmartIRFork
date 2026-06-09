"""Tests for ThermoLoop config flow (schema validation)."""
from custom_components.thermoloop.config_flow import ConfigFlow, DATA_SCHEMA
from custom_components.thermoloop.const import (
    CONF_CLIMATE_ENTITY,
    CONF_PRESENCE_TRACKER,
    CONF_TEMP_SENSOR_BEDROOM,
    CONF_TEMP_SENSOR_LIVING,
    DOMAIN,
)


def test_config_flow_domain():
    assert ConfigFlow.domain == DOMAIN


def test_config_flow_version():
    assert ConfigFlow.VERSION == 1


def test_schema_has_required_keys():
    assert CONF_CLIMATE_ENTITY in DATA_SCHEMA.schema
    assert CONF_TEMP_SENSOR_LIVING in DATA_SCHEMA.schema
    assert CONF_TEMP_SENSOR_BEDROOM in DATA_SCHEMA.schema
    assert CONF_PRESENCE_TRACKER in DATA_SCHEMA.schema
