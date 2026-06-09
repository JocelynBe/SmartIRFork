"""Smoke tests for the bundled panel JS."""
import os
import subprocess


def test_bundled_js_exists():
    path = "custom_components/thermoloop/www/thermoloop-panel.js"
    assert os.path.isfile(path), f"{path} not found"
    size = os.path.getsize(path)
    assert size > 5000, f"{path} is too small ({size} bytes)"


def test_bundled_js_contains_custom_element():
    path = "custom_components/thermoloop/www/thermoloop-panel.js"
    with open(path) as f:
        content = f.read()
    assert "thermoloop-panel" in content
    assert "LitElement" in content
    assert "classMap" in content
    assert "async_register_panel" not in content


def test_bundled_js_parses():
    result = subprocess.run(
        ["node", "--check", "custom_components/thermoloop/www/thermoloop-panel.js"],
        capture_output=True, text=True,
    )
    assert result.returncode == 0, f"JS parse error: {result.stderr}"
