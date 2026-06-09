"""Mock homeassistant modules for testing without a full HA install."""
import sys
from unittest.mock import MagicMock, PropertyMock

import types

# --- Build mock homeassistant module hierarchy ---
ha_mod = types.ModuleType("homeassistant")
ha_mod.const = types.ModuleType("homeassistant.const")
ha_mod.const.STATE_IDLE = "idle"

class MockPlatform:
    SENSOR = "sensor"
    NUMBER = "number"
    SELECT = "select"
    TIME = "time"

ha_mod.const.Platform = MockPlatform
ha_mod.const.UnitOfTemperature = types.ModuleType("homeassistant.const.UnitOfTemperature")
ha_mod.const.UnitOfTemperature.CELSIUS = "°C"

ha_mod.core = types.ModuleType("homeassistant.core")
ha_mod.core.HomeAssistant = MagicMock

ha_mod.config_entries = types.ModuleType("homeassistant.config_entries")
ha_mod.config_entries.ConfigEntry = MagicMock

ha_mod.helpers = types.ModuleType("homeassistant.helpers")
ha_mod.helpers.entity_platform = types.ModuleType(
    "homeassistant.helpers.entity_platform"
)
ha_mod.helpers.entity_platform.AddEntitiesCallback = MagicMock

ha_mod.components = types.ModuleType("homeassistant.components")
ha_mod.components.sensor = types.ModuleType("homeassistant.components.sensor")

# Build a minimal SensorEntity base class
class MockSensorEntity:
    _attr_has_entity_name = False
    _attr_should_poll = True
    _attr_unique_id = None
    _attr_name = None
    _attr_native_value = None

    def __init__(self, *args, **kwargs):
        pass

    async def async_write_ha_state(self):
        pass

    @property
    def entity_id(self):
        return None

    @property
    def extra_state_attributes(self):
        return {}

    @property
    def unique_id(self):
        return self._attr_unique_id

    @unique_id.setter
    def unique_id(self, value):
        self._attr_unique_id = value

    @property
    def name(self):
        return self._attr_name

    @name.setter
    def name(self, value):
        self._attr_name = value

    @property
    def native_value(self):
        return self._attr_native_value

    @native_value.setter
    def native_value(self, value):
        self._attr_native_value = value

ha_mod.components.sensor.SensorEntity = MockSensorEntity

# Build a minimal NumberEntity base class
class MockNumberEntity:
    _attr_has_entity_name = False
    _attr_unique_id = None
    _attr_name = None
    _attr_native_value = None
    _attr_native_min_value = None
    _attr_native_max_value = None
    _attr_native_step = None
    _attr_native_unit_of_measurement = None

    def __init__(self, *args, **kwargs):
        pass

    async def async_write_ha_state(self):
        pass

    async def async_set_native_value(self, value: float) -> None:
        pass

    @property
    def unique_id(self):
        return self._attr_unique_id

    @unique_id.setter
    def unique_id(self, value):
        self._attr_unique_id = value

    @property
    def name(self):
        return self._attr_name

    @name.setter
    def name(self, value):
        self._attr_name = value

    @property
    def native_value(self):
        return self._attr_native_value

    @native_value.setter
    def native_value(self, value):
        self._attr_native_value = value

    @property
    def native_min_value(self):
        return self._attr_native_min_value

    @native_min_value.setter
    def native_min_value(self, value):
        self._attr_native_min_value = value

    @property
    def native_max_value(self):
        return self._attr_native_max_value

    @native_max_value.setter
    def native_max_value(self, value):
        self._attr_native_max_value = value

    @property
    def native_step(self):
        return self._attr_native_step

    @native_step.setter
    def native_step(self, value):
        self._attr_native_step = value

    @property
    def native_unit_of_measurement(self):
        return self._attr_native_unit_of_measurement

    @native_unit_of_measurement.setter
    def native_unit_of_measurement(self, value):
        self._attr_native_unit_of_measurement = value

# Build a minimal SelectEntity base class
class MockSelectEntity:
    _attr_has_entity_name = False
    _attr_unique_id = None
    _attr_name = None
    _attr_current_option = None
    _attr_options = None

    def __init__(self, *args, **kwargs):
        pass

    async def async_write_ha_state(self):
        pass

    def async_select_option(self, option: str) -> None:
        self._attr_current_option = option

    @property
    def unique_id(self):
        return self._attr_unique_id

    @unique_id.setter
    def unique_id(self, value):
        self._attr_unique_id = value

    @property
    def name(self):
        return self._attr_name

    @name.setter
    def name(self, value):
        self._attr_name = value

    @property
    def current_option(self):
        return self._attr_current_option

    @current_option.setter
    def current_option(self, value):
        self._attr_current_option = value

    @property
    def options(self):
        return self._attr_options

    @options.setter
    def options(self, value):
        self._attr_options = value

# Build a minimal TimeEntity base class
class MockTimeEntity:
    _attr_has_entity_name = False
    _attr_unique_id = None
    _attr_name = None
    _attr_native_value = None

    def __init__(self, *args, **kwargs):
        pass

    def async_write_ha_state(self):
        pass

    def async_set_value(self, value: str) -> None:
        self._attr_native_value = value
        self.async_write_ha_state()

    @property
    def unique_id(self):
        return self._attr_unique_id

    @unique_id.setter
    def unique_id(self, value):
        self._attr_unique_id = value

    @property
    def name(self):
        return self._attr_name

    @name.setter
    def name(self, value):
        self._attr_name = value

    @property
    def native_value(self):
        return self._attr_native_value

    @native_value.setter
    def native_value(self, value):
        self._attr_native_value = value

ha_mod.components.number = types.ModuleType("homeassistant.components.number")
ha_mod.components.number.NumberEntity = MockNumberEntity

ha_mod.components.select = types.ModuleType("homeassistant.components.select")
ha_mod.components.select.SelectEntity = MockSelectEntity

ha_mod.components.time = types.ModuleType("homeassistant.components.time")
ha_mod.components.time.TimeEntity = MockTimeEntity

# Inject into sys.modules
sys.modules["homeassistant"] = ha_mod
sys.modules["homeassistant.const"] = ha_mod.const
sys.modules["homeassistant.core"] = ha_mod.core
sys.modules["homeassistant.config_entries"] = ha_mod.config_entries
sys.modules["homeassistant.helpers"] = ha_mod.helpers
sys.modules["homeassistant.helpers.entity_platform"] = ha_mod.helpers.entity_platform
sys.modules["homeassistant.components"] = ha_mod.components
sys.modules["homeassistant.components.sensor"] = ha_mod.components.sensor
sys.modules["homeassistant.components.number"] = ha_mod.components.number
sys.modules["homeassistant.components.select"] = ha_mod.components.select
sys.modules["homeassistant.components.time"] = ha_mod.components.time
sys.modules["homeassistant.const"] = ha_mod.const
