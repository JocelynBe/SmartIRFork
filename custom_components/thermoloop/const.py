"""Constants for ThermoLoop."""
from __future__ import annotations

DOMAIN = "thermoloop"

CONF_CLIMATE_ENTITY = "climate_entity"
CONF_TEMP_SENSOR_LIVING = "temperature_sensor_living"
CONF_TEMP_SENSOR_BEDROOM = "temperature_sensor_bedroom"
CONF_HUMIDITY_SENSOR_LIVING = "humidity_sensor_living"
CONF_HUMIDITY_SENSOR_BEDROOM = "humidity_sensor_bedroom"
CONF_PRESENCE_TRACKER = "presence_tracker"

EVENT_THERMOLOOP_COMMAND = "thermoloop_command"

ATTR_MODE = "mode"
ATTR_ALGORITHM = "algorithm"
ATTR_TARGET = "target"
ATTR_ACTIVE_SENSOR = "active_sensor"
ATTR_CURRENT_TEMP = "current_temp"
ATTR_REASON = "reason"
