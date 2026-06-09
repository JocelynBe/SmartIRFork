from custom_components.thermoloop.const import DOMAIN, CONF_CLIMATE_ENTITY


def test_domain_is_thermoloop():
    assert DOMAIN == "thermoloop"


def test_config_keys_are_defined():
    assert CONF_CLIMATE_ENTITY == "climate_entity"
