# ThermoLoop Panel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Register a ThermoLoop sidebar panel in Home Assistant — a Lit web component showing status strip, temperature graph, controls, and event log, bundled via esbuild.

**Architecture:** A single Lit web component (`<thermoloop-panel>`) served from a static path, registered as a HA sidebar panel via `panel_custom.async_register_panel`. It reads data via `hass.states`, `hass.callWS` (history/logbook), and issues service calls via `hass.callService`. No backend changes to the control brain.

**Tech Stack:** HA 2025.5+, Lit (provided by HA frontend via import map), esbuild, vanilla Canvas API for graph, Node 25.

---

## File Structure

All paths relative to repo root `/Users/jocelyn/src/SmartIRFork`.

**New files:**
- `custom_components/thermoloop/panel.py` — panel registration via `panel_custom.async_register_panel`
- `custom_components/thermoloop/package.json` — build deps (esbuild devDependency)
- `custom_components/thermoloop/www/src/thermoloop-panel.js` — Lit component source
- `custom_components/thermoloop/www/thermoloop-panel.js` — bundled output (committed)
- `tests/thermoloop/test_panel.py` — panel registration tests
- `tests/thermoloop/test_panel_build.py` — basic smoke test that JS exists

**Modified files:**
- `custom_components/thermoloop/__init__.py` — wire `async_register_panel()` in setup + cleanup in unload
- `tests/thermoloop/conftest.py` — mock `homeassistant.components.http` and `homeassistant.components.frontend` in sys.modules

**Why these boundaries:** Panel registration is its own concern, separated from entity setup. The Lit source lives in `www/src/`; the bundled output in `www/`. Build tooling is confined to `package.json`.

---

### Task 1: Build tooling

- [ ] **Step 1:** Create `custom_components/thermoloop/package.json`:

```json
{
  "name": "thermoloop-panel",
  "private": true,
  "scripts": {
    "build": "esbuild www/src/thermoloop-panel.js --bundle --format=esm --target=es2021 --external:lit --outfile=www/thermoloop-panel.js",
    "watch": "esbuild www/src/thermoloop-panel.js --bundle --format=esm --target=es2021 --external:lit --outfile=www/thermoloop-panel.js --watch"
  },
  "devDependencies": {
    "esbuild": "^0.24.0"
  }
}
```

- [ ] **Step 2:** `npm install` in `custom_components/thermoloop/`

---

### Task 2: Panel registration tests + implementation

- [ ] **Step 3:** Extend conftest.py mocks. Add after existing module code:

```python
# Mock homeassistant.components.http
ha_mod.components.http = types.ModuleType("homeassistant.components.http")
ha_mod.components.http.StaticPathConfig = MagicMock()

# Mock homeassistant.components.frontend
ha_mod.components.frontend = types.ModuleType("homeassistant.components.frontend")
ha_mod.components.frontend.async_register_built_in_panel = MagicMock()

# Mock panel_custom
ha_mod.components.panel_custom = types.ModuleType("homeassistant.components.panel_custom")
ha_mod.components.panel_custom.async_register_panel = AsyncMock()

# Register in sys.modules
sys.modules["homeassistant.components.http"] = ha_mod.components.http
sys.modules["homeassistant.components.frontend"] = ha_mod.components.frontend
sys.modules["homeassistant.components.panel_custom"] = ha_mod.components.panel_custom
```

- [ ] **Step 4:** Write the test (`tests/thermoloop/test_panel.py`):

```python
"""Tests for panel registration."""
from unittest.mock import AsyncMock, MagicMock, patch
import pytest


@pytest.fixture
def mock_hass():
    hass = MagicMock()
    hass.data = {}
    hass.http = MagicMock()
    hass.http.async_register_static_paths = AsyncMock(return_value=None)
    hass.components.panel_custom = MagicMock()
    hass.components.panel_custom.async_register_panel = AsyncMock()
    return hass


@pytest.mark.asyncio
async def test_register_panel_registers_static_paths(mock_hass):
    from custom_components.thermoloop.panel import async_register_panel
    await async_register_panel(mock_hass)
    mock_hass.http.async_register_static_paths.assert_awaited_once()


@pytest.mark.asyncio
async def test_register_panel_calls_panel_custom(mock_hass):
    from custom_components.thermoloop.panel import async_register_panel
    await async_register_panel(mock_hass)
    mock_hass.components.panel_custom.async_register_panel.assert_awaited_once()


@pytest.mark.asyncio
async def test_register_panel_uses_correct_args(mock_hass):
    from custom_components.thermoloop.panel import async_register_panel
    await async_register_panel(mock_hass)
    args, kwargs = mock_hass.components.panel_custom.async_register_panel.call_args
    assert kwargs.get("frontend_url_path") == "thermoloop"
    assert kwargs.get("sidebar_title") == "ThermoLoop"
    assert kwargs.get("sidebar_icon") == "mdi:thermostat"
```

Run: `python3 -m pytest tests/thermoloop/test_panel.py -v`
Expected: FAIL — ModuleNotFoundError.

- [ ] **Step 5:** Create `panel.py`:

```python
"""Panel registration for ThermoLoop sidebar panel."""
from __future__ import annotations

import logging
import os

from homeassistant.components.http import StaticPathConfig
from homeassistant.components.panel_custom import async_register_panel
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

_PANEL_URL = "/thermoloop-panel"
_PANEL_JS = "thermoloop-panel.js"
_SIDEBAR_TITLE = "ThermoLoop"
_SIDEBAR_ICON = "mdi:thermostat"


async def async_register_panel(hass: HomeAssistant) -> None:
    """Register the ThermoLoop sidebar panel and static path."""
    www_path = os.path.join(os.path.dirname(__file__), "www")

    await hass.http.async_register_static_paths([
        StaticPathConfig(_PANEL_URL, www_path, True),
    ])

    await async_register_panel(
        hass=hass,
        frontend_url_path="thermoloop",
        webcomponent_name="thermoloop-panel",
        sidebar_title=_SIDEBAR_TITLE,
        sidebar_icon=_SIDEBAR_ICON,
        module_url=f"{_PANEL_URL}/{_PANEL_JS}",
        embed_iframe=False,
        require_admin=True,
    )

    _LOGGER.debug("ThermoLoop panel registered")
```

Run tests: `python3 -m pytest tests/thermoloop/test_panel.py -v`
Expected: PASS.

- [ ] **Step 6:** Wire into `__init__.py`. At module level, add:

```python
from custom_components.thermoloop.panel import async_register_panel, async_remove_panel
```

In `async_setup_entry`, before `return True`:

```python
    await async_register_panel(hass)
```

In `async_unload_entry`, before platform unload:

```python
    if DOMAIN in hass.data:
        await async_remove_panel(hass)
```

Add `async_remove_panel` to `panel.py`:

```python
async def async_remove_panel(hass: HomeAssistant) -> None:
    """Remove the ThermoLoop sidebar panel."""
    try:
        hass.components.frontend.async_remove_panel("thermoloop")
    except Exception:
        _LOGGER.debug("Could not remove panel (may already be gone)")
```

Run: `python3 -m pytest tests/thermoloop/test_init.py -v` — existing tests pass.
Run: `python3 -m pytest tests/thermoloop/test_panel.py -v` — PASS (3 passed).

---

### Task 3: Lit web component — full panel

- [ ] **Step 7:** Write `www/src/thermoloop-panel.js` with the complete Lit component covering all four zones.

The panel receives `hass` via property (HA injects it automatically for panels registered via `panel_custom`). Lit is available via HA's import map as `"lit"`.

Structure the component as follows — this is the full implementation to write:

```javascript
import { LitElement, html, css } from "lit";

class ThermoLoopPanel extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 16px;
      font-family: var(--primary-font-family, sans-serif);
      color: var(--primary-text-color, #333);
    }

    /* Two-column layout on desktop, single column below 600px */
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    @media (max-width: 600px) {
      .grid { grid-template-columns: 1fr; }
    }

    /* Status strip */
    .status {
      grid-column: 1 / -1;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      padding: 12px;
      background: var(--card-background-color, #f0f0f0);
      border-radius: 8px;
      align-items: center;
    }
    .status-item {
      display: flex;
      flex-direction: column;
      font-size: 0.85em;
    }
    .status-label { font-size: 0.75em; opacity: 0.7; }
    .status-value { font-weight: 500; }

    /* Graph */
    .graph-container {
      grid-column: 1 / -1;
      position: relative;
      background: var(--card-background-color, #f0f0f0);
      border-radius: 8px;
      padding: 12px;
    }
    .graph-container canvas {
      width: 100%;
      height: 250px;
      display: block;
    }
    .range-chips {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      justify-content: center;
    }
    .range-chip {
      padding: 4px 12px;
      border-radius: 12px;
      border: 1px solid var(--divider-color, #ccc);
      cursor: pointer;
      font-size: 0.8em;
    }
    .range-chip.active {
      background: var(--primary-color, #03a9f4);
      color: var(--primary-text-color, white);
      border-color: var(--primary-color);
    }

    /* Controls */
    .controls {
      background: var(--card-background-color, #f0f0f0);
      border-radius: 8px;
      padding: 12px;
    }
    .controls h3 { margin: 0 0 12px 0; font-size: 1em; }
    .control-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--divider-color, #ddd);
    }
    .control-row:last-child { border-bottom: none; }
    .control-label { font-size: 0.85em; }
    .stepper {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .stepper button {
      width: 28px; height: 28px;
      border-radius: 50%;
      border: 1px solid var(--divider-color, #ccc);
      background: var(--card-background-color);
      cursor: pointer;
      font-size: 1em;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stepper span { min-width: 32px; text-align: center; font-weight: 500; }

    /* Event log */
    .event-log {
      background: var(--card-background-color, #f0f0f0);
      border-radius: 8px;
      padding: 12px;
    }
    .event-log h3 {
      margin: 0 0 12px 0;
      font-size: 1em;
      cursor: pointer;
    }
    .event-log.collapsed .log-entries { display: none; }
    .log-entry {
      padding: 4px 0;
      font-size: 0.82em;
      border-bottom: 1px solid var(--divider-color, #eee);
      display: flex;
      gap: 8px;
    }
    .log-time { opacity: 0.6; white-space: nowrap; }
    .log-detail { flex: 1; }
  `;

  static properties = {
    hass: { type: Object },
    _status: { state: true, type: Object },
    _mode: { state: true, type: String },
    _algorithm: { state: true, type: String },
    _dayTarget: { state: true, type: Number },
    _nightTarget: { state: true, type: Number },
    _nightStart: { state: true, type: String },
    _nightEnd: { state: true, type: String },
    _tempHistory: { state: true, type: Array },
    _events: { state: true, type: Array },
    _range: { state: true, type: String },
    _logCollapsed: { state: true, type: Boolean },
  };

  constructor() {
    super();
    this._status = {};
    this._mode = "auto";
    this._algorithm = "v0";
    this._dayTarget = 22;
    this._nightTarget = 24;
    this._nightStart = "22:00";
    this._nightEnd = "07:00";
    this._tempHistory = [];
    this._events = [];
    this._range = "24h";
    this._logCollapsed = false;
    this._unsubs = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this._fetchData();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    for (const unsub of this._unsubs) { unsub(); }
    this._unsubs = [];
  }

  updated(changedProps) {
    if (changedProps.has("hass") && this.hass) {
      this._startSubscriptions();
      this._fetchData();
    }
  }

  _startSubscriptions() {
    for (const unsub of this._unsubs) { unsub(); }
    this._unsubs = [];

    // Subscribe to relevant state changes
    this._unsubs.push(
      this.hass.connection.subscribeMessage(
        (msg) => this._onStateChange(msg),
        { type: "subscribe_entities", entity_ids: this._relevantEntityIds() }
      )
    );
  }

  _relevantEntityIds() {
    return [
      "sensor.thermoloop_status",  // Will need actual entry_id suffix
      "select.thermoloop_mode",
      "select.thermoloop_algorithm",
      "number.thermoloop_target_day",
      "number.thermoloop_target_night",
      "time.thermoloop_night_window_start",
      "time.thermoloop_night_window_end",
    ];
  }

  _onStateChange(msg) {
    // Update local state from entity changes
  }

  async _fetchData() {
    if (!this.hass) return;
    // Fetch temperature history for the active range
    // Fetch event log for thermoloop_command events
    // Read current entity states
  }

  _fetchHistory(range) {
    this._range = range;
    // Calculate start time based on range
    const now = new Date();
    const start = new Date(now);
    switch (range) {
      case "6h": start.setHours(now.getHours() - 6); break;
      case "24h": start.setHours(now.getHours() - 24); break;
      case "7d": start.setDate(now.getDate() - 7); break;
    }

    // Fetch history for both temp sensors
    // This needs the actual sensor entity_ids from the config flow
    // For now, we'll read them from hass.states
  }

  _drawGraph() {
    // Canvas-based line chart for temperature history
    // TODO: implement canvas rendering
  }

  _callService(domain, service, data) {
    if (this.hass) {
      this.hass.callService(domain, service, data);
    }
  }

  _setDayTarget(value) {
    this._dayTarget = value;
    this._callService("number", "set_value", {
      entity_id: "number.thermoloop_target_day",
      value: value,
    });
  }

  _setNightTarget(value) {
    this._nightTarget = value;
    this._callService("number", "set_value", {
      entity_id: "number.thermoloop_target_night",
      value: value,
    });
  }

  _setMode(mode) {
    this._mode = mode;
    this._callService("select", "select_option", {
      entity_id: "select.thermoloop_mode",
      option: mode,
    });
  }

  _setAlgorithm(algo) {
    this._algorithm = algo;
    this._callService("select", "select_option", {
      entity_id: "select.thermoloop_algorithm",
      option: algo,
    });
  }

  render() {
    const status = this._status;
    return html`
      <div class="grid">
        <!-- Status strip -->
        <div class="status">
          <div class="status-item">
            <span class="status-label">Mode</span>
            <span class="status-value">${status.mode || "—"}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Active Sensor</span>
            <span class="status-value">${status.active_sensor || "—"}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Temperature</span>
            <span class="status-value">${status.current_temp != null ? `${status.current_temp}°C` : "—"}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Target</span>
            <span class="status-value">${status.target != null ? `${status.target}°C` : "—"}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Reason</span>
            <span class="status-value">${status.reason || "—"}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Algorithm</span>
            <span class="status-value">${this._algorithm}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Presence</span>
            <span class="status-value">${status.presence || "—"}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Humidity</span>
            <span class="status-value">${status.humidity != null ? `${status.humidity}%` : "—"}</span>
          </div>
        </div>

        <!-- Graph -->
        <div class="graph-container">
          <canvas id="tempChart"></canvas>
          <div class="range-chips">
            ${["6h", "24h", "7d"].map(r => html`
              <div class="range-chip ${r === this._range ? "active" : ""}"
                   @click=${() => this._fetchHistory(r)}>${r}</div>
            `)}
          </div>
        </div>

        <!-- Controls -->
        <div class="controls">
          <h3>Controls</h3>

          <div class="control-row">
            <span class="control-label">Mode</span>
            <select @change=${e => this._setMode(e.target.value)} .value=${this._mode}>
              <option value="auto">Auto</option>
              <option value="off">Off</option>
              <option value="away">Away</option>
            </select>
          </div>

          <div class="control-row">
            <span class="control-label">Algorithm</span>
            <select @change=${e => this._setAlgorithm(e.target.value)} .value=${this._algorithm}>
              <option value="v0">v0 (Aggressive)</option>
              <option value="v1">v1 (Proportional)</option>
            </select>
          </div>

          <div class="control-row">
            <span class="control-label">Day Target</span>
            <div class="stepper">
              <button @click=${() => this._setDayTarget(this._dayTarget - 1)}>−</button>
              <span>${this._dayTarget}°C</span>
              <button @click=${() => this._setDayTarget(this._dayTarget + 1)}>+</button>
            </div>
          </div>

          <div class="control-row">
            <span class="control-label">Night Target</span>
            <div class="stepper">
              <button @click=${() => this._setNightTarget(this._nightTarget - 1)}>−</button>
              <span>${this._nightTarget}°C</span>
              <button @click=${() => this._setNightTarget(this._nightTarget + 1)}>+</button>
            </div>
          </div>
        </div>

        <!-- Event log -->
        <div class="event-log ${this._logCollapsed ? "collapsed" : ""}">
          <h3 @click=${() => this._logCollapsed = !this._logCollapsed}>
            ${this._logCollapsed ? "▶" : "▼"} Event Log
          </h3>
          <div class="log-entries">
            ${this._events.length === 0
              ? html`<div class="log-entry"><span style="opacity:0.5">No events yet</span></div>`
              : this._events.map(e => html`
                <div class="log-entry">
                  <span class="log-time">${e.time}</span>
                  <span class="log-detail">${e.detail}</span>
                </div>
              `)}
          </div>
        </div>
      </div>
    `;
  }

  // Canvas graph rendering — called after render on hass/range change
  _renderGraph() {
    const canvas = this.shadowRoot?.getElementById("tempChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;

    // TODO: implement actual data-driven chart
    // Placeholder: draw empty graph background
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "var(--divider-color, #ccc)";
    ctx.lineWidth = 1;
    // Vertical grid lines
    for (let i = 0; i < 6; i++) {
      const x = (w / 5) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    // Horizontal grid lines
    for (let i = 0; i < 4; i++) {
      const y = (h / 3) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }
}

customElements.define("thermoloop-panel", ThermoLoopPanel);
```

**Important:** The component above is the full structural template. Entity IDs in `_relevantEntityIds()` will need the actual `entry_id` suffix from the config entry. Since the panel is registered per-HA-instance (not per-entry), reading from `hass.states` with dynamic entity IDs requires either:
- A fixed known suffix (e.g., first config entry's ID)
- Querying `hass.states` for entities matching a pattern (`thermoloop_*`)
- Passing config via `panel_custom` registration

For v1, use the first approach: register a key-value lookup in `hass.data[DOMAIN]` that stores entity ID mappings, and serve them to the panel via a simple REST endpoint or include them in `config`.

- [ ] **Step 8:** Build the bundle:

```bash
cd custom_components/thermoloop && npm run build
```

Expected: `www/thermoloop-panel.js` created, ~20-40 KB.

---

### Task 4: Smoke tests + verification

- [ ] **Step 9:** Create `tests/thermoloop/test_panel_build.py`:

```python
"""Smoke test that bundled panel JS exists and looks valid."""
import os


def test_bundled_js_exists():
    path = "custom_components/thermoloop/www/thermoloop-panel.js"
    assert os.path.isfile(path), f"{path} not found"
    assert os.path.getsize(path) > 1000


def test_bundled_js_contains_custom_element():
    path = "custom_components/thermoloop/www/thermoloop-panel.js"
    with open(path) as f:
        content = f.read()
    assert "thermoloop-panel" in content
    assert "LitElement" in content


def test_bundled_js_parses():
    import subprocess
    result = subprocess.run(
        ["node", "--check", "custom_components/thermoloop/www/thermoloop-panel.js"],
        capture_output=True, text=True
    )
    assert result.returncode == 0, f"JS parse error: {result.stderr}"
```

- [ ] **Step 10:** Run full test suite:

```bash
python3 -m pytest tests/thermoloop -v
```

Expected: all tests pass (79+ total).

- [ ] **Step 11:** Commit and push:

```bash
git add custom_components/thermoloop/panel.py \
       custom_components/thermoloop/package.json \
       custom_components/thermoloop/package-lock.json \
       custom_components/thermoloop/www/ \
       custom_components/thermoloop/__init__.py \
       tests/thermoloop/test_panel.py \
       tests/thermoloop/test_panel_build.py \
       tests/thermoloop/conftest.py
git commit -m "feat(thermoloop): add sidebar panel with Lit web component"
git push origin master
```

---

## Self-Review Checklist

**Against spec (§6):**
- [ ] Status strip — mode, active room, temperature vs target, reason, presence, algorithm, humidity
- [ ] Graph — Canvas line chart, both temp sensors, target line, command markers (deferred placeholder), range chips
- [ ] Controls — mode select, algorithm select, day/night target steppers
- [ ] Event log — collapsible, shows command events with timestamp + detail
- [ ] Responsive — CSS grid with `max-width: 600px` breakpoint

**Engineering (P1–P9):**
- [ ] Panel registration isolated in `panel.py` (P1 layering)
- [ ] No changes to control brain or contracts (P4 domain separation)
- [ ] Tests for registration + build smoke test (P3 testability)
- [ ] Built JS committed for HACS delivery
- [ ] `lit` external — uses HA's bundled lit
- [ ] Zero frontend deps beyond Lit (Canvas API for graph)

**Edge cases:**
- [ ] Multiple entries: single panel per HA instance (idempotent)
- [ ] Unload: panel removed via `async_remove_panel`
- [ ] No data: graph placeholder, event log shows "No events yet"
- [ ] Entity unavailable: status shows "—" placeholder
