import { LitElement, html, css } from "lit";
import { classMap } from "lit/directives/class-map.js";

const RANGE_LABELS = { "6h": "6h", "24h": "24h", "7d": "7d" };
const RANGE_MS = { "6h": 6 * 3600 * 1000, "24h": 24 * 3600 * 1000, "7d": 7 * 24 * 3600 * 1000 };

class ThermoLoopPanel extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 16px;
      font-family: var(--primary-font-family, sans-serif);
      color: var(--primary-text-color, #333);
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    @media (max-width: 600px) {
      .grid { grid-template-columns: 1fr; }
    }

    .status {
      grid-column: 1 / -1;
      display: flex;
      flex-wrap: wrap;
      gap: 16px 24px;
      padding: 16px;
      background: var(--card-background-color, #f0f0f0);
      border-radius: 12px;
    }
    .status-item { display: flex; flex-direction: column; min-width: 70px; }
    .status-label { font-size: 0.7em; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.6; }
    .status-value { font-size: 1.1em; font-weight: 600; margin-top: 2px; }
    .status-value.idle { color: var(--warning-color, #ff9800); }
    .status-value.active { color: var(--success-color, #4caf50); }
    .status-value.off { color: var(--disabled-text-color, #999); }
    .status-value.error,
    .status-value.stale { color: var(--error-color, #f44336); }

    .graph-card {
      grid-column: 1 / -1;
      background: var(--card-background-color, #f0f0f0);
      border-radius: 12px;
      padding: 16px;
    }
    .graph-card canvas {
      width: 100%;
      height: 260px;
      display: block;
      border-radius: 8px;
    }
    .graph-empty {
      height: 260px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.4;
      font-size: 0.9em;
    }
    .range-chips {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      justify-content: center;
    }
    .range-chip {
      padding: 6px 16px;
      border-radius: 16px;
      border: 1px solid var(--divider-color, #ccc);
      cursor: pointer;
      font-size: 0.8em;
      user-select: none;
    }
    .range-chip.active {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, white);
      border-color: var(--primary-color);
    }

    .controls-card {
      background: var(--card-background-color, #f0f0f0);
      border-radius: 12px;
      padding: 16px;
    }
    .controls-card h3 {
      margin: 0 0 4px 0;
      font-size: 0.85em;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.6;
    }
    .control-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid var(--divider-color, #ddd);
    }
    .control-row:last-child { border-bottom: none; }
    .control-label { font-size: 0.85em; }
    .stepper {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .stepper button {
      width: 30px; height: 30px;
      border-radius: 50%;
      border: 1px solid var(--divider-color, #ccc);
      background: var(--card-background-color);
      cursor: pointer;
      font-size: 1.1em;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
    .stepper button:hover { background: var(--primary-color, #03a9f4); color: white; }
    .stepper span { min-width: 40px; text-align: center; font-weight: 600; font-size: 1.05em; }
    select {
      background: var(--input-background-color, white);
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 0.85em;
      color: var(--primary-text-color);
    }

    .log-card {
      background: var(--card-background-color, #f0f0f0);
      border-radius: 12px;
      padding: 16px;
      max-height: 360px;
      overflow-y: auto;
    }
    .log-card h3 {
      margin: 0 0 8px 0;
      font-size: 0.85em;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.6;
      cursor: pointer;
      user-select: none;
    }
    .log-card.collapsed .log-entries { display: none; }
    .log-entries { display: flex; flex-direction: column; gap: 4px; }
    .log-entry {
      padding: 6px 8px;
      font-size: 0.78em;
      border-radius: 6px;
      display: flex;
      gap: 8px;
      align-items: baseline;
      background: var(--input-background-color, rgba(0,0,0,0.02));
    }
    .log-time { opacity: 0.5; white-space: nowrap; font-family: monospace; font-size: 0.9em; }
    .log-detail { flex: 1; word-break: break-word; }
    .log-entry.command { border-left: 3px solid var(--primary-color, #03a9f4); }
    .log-entry.arrive { border-left: 3px solid var(--success-color, #4caf50); }
    .log-entry.leave { border-left: 3px solid var(--warning-color, #ff9800); }

  `;

  static properties = {
    hass: { type: Object },
    config: { type: Object },
    _range: { state: true },
    _logCollapsed: { state: true },
    _events: { state: true },
    _tempHistory: { state: true },
  };

  constructor() {
    super();
    this._range = "24h";
    this._logCollapsed = false;
    this._events = [];
    this._tempHistory = { living: [], bedroom: [] };
    this._sensorIds = { tempDay: null, tempNight: null, status: null, mode: null, algorithm: null, dayTarget: null, nightTarget: null };
    this._disconnected = false;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._disconnected = true;
  }

  connectedCallback() {
    super.connectedCallback();
    this._discoverEntities();
    this._fetchData();
  }

  updated(changedProps) {
    if (changedProps.has("hass") && this.hass) {
      this._discoverEntities();
      this._fetchData();
    }
    if (changedProps.has("_tempHistory") || changedProps.has("_range")) {
      this._renderGraph();
    }
  }

  _discoverEntities() {
    if (!this.hass || !this.hass.states) return;
    const states = this.hass.states;
    for (const entityId of Object.keys(states)) {
      if (entityId.startsWith("sensor.thermoloop_status")) this._sensorIds.status = entityId;
      if (entityId.startsWith("select.thermoloop_mode")) this._sensorIds.mode = entityId;
      if (entityId.startsWith("select.thermoloop_algorithm")) this._sensorIds.algorithm = entityId;
      if (entityId.startsWith("number.thermoloop_target_day")) this._sensorIds.dayTarget = entityId;
      if (entityId.startsWith("number.thermoloop_target_night")) this._sensorIds.nightTarget = entityId;
    }
  }

  async _fetchData() {
    if (!this.hass) return;
    this._fetchHistory();
    this._fetchEvents();
  }

  async _fetchHistory() {
    if (!this.hass || !this.hass.callWS) return;
    const now = new Date();
    const start = new Date(now.getTime() - RANGE_MS[this._range]);

    // Find temp sensors from status entity attributes
    let tempSensors = [];
    if (this._sensorIds.status) {
      const statusState = this.hass.states[this._sensorIds.status];
      if (statusState && statusState.attributes) {
        const activeId = statusState.attributes.active_sensor;
        if (activeId) tempSensors.push(activeId);
      }
    }

    if (tempSensors.length === 0) {
      // Try to discover by scanning states
      for (const [id, stateObj] of Object.entries(this.hass.states)) {
        if (stateObj.attributes && stateObj.attributes.device_class === "temperature") {
          tempSensors.push(id);
        }
      }
    }

    if (tempSensors.length === 0) return;

    try {
      const result = await this.hass.callWS({
        type: "history/history_during_period",
        start_time: start.toISOString(),
        end_time: now.toISOString(),
        entity_ids: tempSensors,
        minimal_response: true,
        no_attributes: true,
      });

      // history/history_during_period returns the compressed WS format:
      // each point is { s: state, lu: last_updated, lc: last_changed } with
      // timestamps in epoch SECONDS (not the verbose state/last_changed keys).
      const history = { living: [], bedroom: [] };
      for (const [entityId, changes] of Object.entries(result)) {
        const bucket = history.living.length <= history.bedroom.length ? "living" : "bedroom";
        history[bucket] = changes.map(c => ({
          t: (c.lu ?? c.lc) * 1000,
          v: parseFloat(c.s),
        })).filter(p => !isNaN(p.v) && p.t > 0);
      }
      this._tempHistory = history;
    } catch (e) {
      console.warn("ThermoLoop: history fetch failed", e);
    }
  }

  async _fetchEvents() {
    if (!this.hass || !this.hass.callWS || !this._sensorIds.status) {
      this._events = [];
      return;
    }
    const now = new Date();
    const start = new Date(now.getTime() - RANGE_MS[this._range]);

    // The status sensor's state history IS the command timeline. The
    // logbook/get_events command does NOT accept an event_types filter (and
    // thermoloop_command bus events aren't queryable through it), so read the
    // status sensor history instead and log each state transition with its
    // reason attribute.
    try {
      const result = await this.hass.callWS({
        type: "history/history_during_period",
        start_time: start.toISOString(),
        end_time: now.toISOString(),
        entity_ids: [this._sensorIds.status],
        minimal_response: false,
        no_attributes: false,
      });

      const changes = result[this._sensorIds.status] || [];
      const events = [];
      let prevState = null;
      let lastAttrs = {};
      for (const c of changes) {
        if (c.a) lastAttrs = c.a;
        const state = c.s;
        const ts = (c.lc ?? c.lu) * 1000;
        if (state === prevState) continue;
        prevState = state;
        const reason = lastAttrs.reason ? ` — ${lastAttrs.reason}` : "";
        events.push({
          time: new Date(ts).toLocaleTimeString(),
          detail: `${state}${reason}`,
          type: state === "error" ? "leave" : "command",
        });
      }
      this._events = events.slice(-100);
    } catch (e) {
      console.warn("ThermoLoop: status history fetch failed", e);
      this._events = [];
    }
  }

  _findEntity(prefix) {
    if (!this.hass || !this.hass.states) return null;
    for (const id of Object.keys(this.hass.states)) {
      if (id.startsWith(prefix)) return id;
    }
    return null;
  }

  _entityState(entityId, fallback = null) {
    if (!entityId || !this.hass || !this.hass.states[entityId]) return fallback;
    return this.hass.states[entityId].state;
  }

  _entityAttr(entityId, attr, fallback = null) {
    if (!entityId || !this.hass || !this.hass.states[entityId]) return fallback;
    const attrs = this.hass.states[entityId].attributes;
    return attrs ? attrs[attr] : fallback;
  }

  _statusValue(field, fallback = "—") {
    if (!this._sensorIds.status) return fallback;
    const state = this.hass && this.hass.states[this._sensorIds.status];
    if (!state) return fallback;
    if (field === "state") return state.state;
    return state.attributes ? state.attributes[field] : fallback;
  }

  _callService(domain, service, data) {
    if (this.hass) {
      this.hass.callService(domain, service, data);
    }
  }

  _setDayTarget(value) {
    if (this._sensorIds.dayTarget) {
      this._callService("number", "set_value", {
        entity_id: this._sensorIds.dayTarget,
        value: Math.max(16, Math.min(30, value)),
      });
    }
  }

  _setNightTarget(value) {
    if (this._sensorIds.nightTarget) {
      this._callService("number", "set_value", {
        entity_id: this._sensorIds.nightTarget,
        value: Math.max(16, Math.min(30, value)),
      });
    }
  }

  _setMode(mode) {
    if (this._sensorIds.mode) {
      this._callService("select", "select_option", {
        entity_id: this._sensorIds.mode,
        option: mode,
      });
    }
  }

  _setAlgorithm(algo) {
    if (this._sensorIds.algorithm) {
      this._callService("select", "select_option", {
        entity_id: this._sensorIds.algorithm,
        option: algo,
      });
    }
  }

  _renderGraph() {
    const canvas = this.shadowRoot && this.shadowRoot.getElementById("tempChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    const series = [];
    if (this._tempHistory.living.length > 0) series.push({ data: this._tempHistory.living, color: "#03a9f4", label: "Living", lineDash: [] });
    if (this._tempHistory.bedroom.length > 0) series.push({ data: this._tempHistory.bedroom, color: "#ff9800", label: "Bedroom", lineDash: [6, 4] });

    if (series.length === 0 || series.every(s => s.data.length < 2)) {
      ctx.fillStyle = "#999";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Waiting for temperature data…", w / 2, h / 2);
      return;
    }

    const pad = { top: 16, right: 16, bottom: 28, left: 48 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    // Collect all temps and times
    let allTemps = [];
    let allTimes = [];
    for (const s of series) {
      for (const p of s.data) {
        allTemps.push(p.v);
        allTimes.push(p.t);
      }
    }

    if (allTemps.length === 0) return;

    const minTemp = Math.floor(Math.min(...allTemps) - 1);
    const maxTemp = Math.ceil(Math.max(...allTemps) + 1);
    const minTime = Math.min(...allTimes);
    const maxTime = Math.max(...allTimes);
    const timeRange = Math.max(maxTime - minTime, 1);

    const xScale = t => pad.left + ((t - minTime) / timeRange) * plotW;
    const yScale = v => pad.top + plotH - ((v - minTemp) / (maxTemp - minTemp)) * plotH;

    // Grid lines
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (plotH / 4) * i;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
    }

    // Y-axis labels
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const v = minTemp + ((maxTemp - minTemp) / 4) * i;
      const y = pad.top + plotH - (plotH / 4) * i;
      ctx.fillText(v.toFixed(1), pad.left - 6, y + 4);
    }

    // X-axis labels
    ctx.textAlign = "center";
    for (let i = 0; i <= 4; i++) {
      const t = minTime + (timeRange / 4) * i;
      const x = pad.left + (plotW / 4) * i;
      const d = new Date(t);
      const label = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      ctx.fillText(label, x, h - 6);
    }

    // Draw series
    for (const s of series) {
      if (s.data.length < 2) continue;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2;
      ctx.setLineDash(s.lineDash);
      ctx.beginPath();
      const sorted = [...s.data].sort((a, b) => a.t - b.t);
      for (let i = 0; i < sorted.length; i++) {
        const x = xScale(sorted[i].t);
        const y = yScale(sorted[i].v);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Target line from status
    const target = this._statusValue("target");
    if (target && target !== "—") {
      const targetY = yScale(parseFloat(target));
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pad.left, targetY);
      ctx.lineTo(w - pad.right, targetY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`Target ${target}°C`, w - pad.right - 70, targetY - 4);
    }
  }

  _rangeHistory(range) {
    this._range = range;
    this._fetchHistory();
    this._fetchEvents();
  }

  render() {
    const mode = this._entityState(this._sensorIds.mode, "auto");
    const algo = this._entityState(this._sensorIds.algorithm, "v0");
    const dayTarget = parseFloat(this._entityState(this._sensorIds.dayTarget, "22")) || 22;
    const nightTarget = parseFloat(this._entityState(this._sensorIds.nightTarget, "24")) || 24;
    const statusState = this._statusValue("state");
    const statusReason = this._statusValue("reason");
    const statusSensor = this._statusValue("active_sensor");
    const statusTemp = this._statusValue("current_temp");
    const statusTarget = this._statusValue("target");
    const statusPresence = this._entityState(this._findEntity("select.thermoloop_mode"), "auto");

    return html`
      <div class="grid">
        <!-- Status strip -->
        <div class="status">
          <div class="status-item">
            <span class="status-label">Status</span>
            <span class="status-value ${statusState}">${statusState || "—"}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Mode</span>
            <span class="status-value">${mode}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Active Sensor</span>
            <span class="status-value">${statusSensor || "—"}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Temperature</span>
            <span class="status-value">${statusTemp != null ? `${statusTemp}°C` : "—"}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Target</span>
            <span class="status-value">${statusTarget != null ? `${statusTarget}°C` : "—"}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Algorithm</span>
            <span class="status-value">${algo}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Reason</span>
            <span class="status-value" style="font-size:0.85em;font-weight:400">${statusReason || "—"}</span>
          </div>
        </div>

        <!-- Graph -->
        <div class="graph-card">
          <canvas id="tempChart"></canvas>
          <div class="range-chips">
            ${Object.entries(RANGE_LABELS).map(([key, label]) => html`
              <div class="range-chip ${classMap({ active: this._range === key })}"
                   @click=${() => this._rangeHistory(key)} role="button">${label}</div>
            `)}
          </div>
        </div>

        <!-- Controls -->
        <div class="controls-card">
          <h3>Controls</h3>

          <div class="control-row">
            <span class="control-label">Mode</span>
            <select @change=${e => this._setMode(e.target.value)} .value=${mode}>
              <option value="auto">Auto</option>
              <option value="off">Off</option>
              <option value="away">Away</option>
            </select>
          </div>

          <div class="control-row">
            <span class="control-label">Algorithm</span>
            <select @change=${e => this._setAlgorithm(e.target.value)} .value=${algo}>
              <option value="v0">v0 — Aggressive</option>
              <option value="v1">v1 — Proportional</option>
            </select>
          </div>

          <div class="control-row">
            <span class="control-label">Day Target</span>
            <div class="stepper">
              <button @click=${() => this._setDayTarget(dayTarget - 1)}>−</button>
              <span>${dayTarget}°C</span>
              <button @click=${() => this._setDayTarget(dayTarget + 1)}>+</button>
            </div>
          </div>

          <div class="control-row">
            <span class="control-label">Night Target</span>
            <div class="stepper">
              <button @click=${() => this._setNightTarget(nightTarget - 1)}>−</button>
              <span>${nightTarget}°C</span>
              <button @click=${() => this._setNightTarget(nightTarget + 1)}>+</button>
            </div>
          </div>
        </div>

        <!-- Event log -->
        <div class="log-card ${classMap({ collapsed: this._logCollapsed })}">
          <h3 @click=${() => this._logCollapsed = !this._logCollapsed}>
            ${this._logCollapsed ? "▶" : "▼"} Event Log (${this._events.length})
          </h3>
          <div class="log-entries">
            ${this._events.length === 0
              ? html`<div class="log-entry"><span style="opacity:0.4">No events in this period</span></div>`
              : this._events.map(e => html`
                <div class="log-entry ${e.type}">
                  <span class="log-time">${e.time}</span>
                  <span class="log-detail">${e.detail}</span>
                </div>
              `)}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("thermoloop-panel", ThermoLoopPanel);
