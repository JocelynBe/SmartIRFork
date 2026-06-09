"""Guard: the built panel bundle must be self-contained.

The ThermoLoop panel ships as an ES module that the browser loads directly
from /thermoloop-panel/thermoloop-panel.js. Browsers cannot resolve bare
module specifiers like ``import ... from "lit"`` without an import map, and
Home Assistant does not provide one for custom panel modules. If lit is left
external (esbuild ``--external:lit``), the bare import survives into the
bundle, the module throws on load, ``customElements.define`` never runs, and
the panel renders blank.

These checks fail on an unbundled panel and pass once lit is inlined.
"""
from pathlib import Path

BUNDLE = (
    Path(__file__).resolve().parents[2]
    / "custom_components/thermoloop/www/thermoloop-panel.js"
)


def test_bundle_exists():
    assert BUNDLE.is_file(), f"panel bundle missing: {BUNDLE}"


def test_bundle_has_no_unresolved_bare_imports():
    text = BUNDLE.read_text()
    assert 'from "lit"' not in text, (
        "lit left external: browser cannot resolve bare 'lit' specifier -> blank panel"
    )
    assert 'from "lit/' not in text, "lit submodule left external -> blank panel"


def test_bundle_defines_custom_element():
    text = BUNDLE.read_text()
    assert 'customElements.define("thermoloop-panel"' in text, (
        "panel bundle does not register the thermoloop-panel custom element"
    )
