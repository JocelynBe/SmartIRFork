from custom_components.thermoloop.const import DOMAIN, CONF_BROADLINK_REMOTE


def test_domain_is_thermoloop():
    assert DOMAIN == "thermoloop"


def test_config_keys_are_defined():
    assert CONF_BROADLINK_REMOTE == "broadlink_remote"
