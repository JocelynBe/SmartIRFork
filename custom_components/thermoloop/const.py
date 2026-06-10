"""Constants for ThermoLoop."""
from __future__ import annotations

DOMAIN = "thermoloop"

CONF_BROADLINK_REMOTE = "broadlink_remote"
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
ATTR_HUMIDITY = "humidity"
ATTR_REASON = "reason"
ATTR_SETPOINT = "setpoint"       # the temperature commanded to the AC
ATTR_FAN = "fan"                 # the fan speed commanded to the AC
ATTR_AC_MODE = "ac_mode"         # the AC mode commanded (cool/heat/dry)
ATTR_DAY_SENSOR = "day_sensor"   # day/living temp sensor entity_id
ATTR_NIGHT_SENSOR = "night_sensor"  # night/bedroom temp sensor entity_id
