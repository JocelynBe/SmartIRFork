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
      cursor: crosshair;
    }
    .graph-legend {
      display: flex;
      gap: 20px;
      justify-content: center;
      margin-top: 10px;
      font-size: 0.78em;
      opacity: 0.85;
    }
    .graph-legend .item { display: flex; align-items: center; gap: 7px; }
    .graph-legend .item.off { opacity: 0.35; }
    .graph-legend .swatch {
      width: 18px;
      border-top: 3px solid currentColor;
      display: inline-block;
    }
    .graph-legend .swatch.dashed { border-top-style: dashed; }
    .graph-legend .swatch.block { width: 14px; height: 11px; border-top: none; border-radius: 2px; }
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
      user-select: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .log-refresh { cursor: pointer; font-size: 1.2em; opacity: 0.7; }
    .log-refresh:hover { opacity: 1; }
    .smooth-row {
      display: flex;
      align-items: center;
      gap: 12px;
      justify-content: center;
      margin-top: 10px;
      font-size: 0.78em;
      opacity: 0.8;
    }
    .smooth-row input[type="range"] { flex: 0 1 180px; }
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
    _smoothMin: { state: true },
  };

  constructor() {
    super();
    this._range = "24h";
    this._logCollapsed = false;
    this._events = [];
    this._tempHistory = { living: [], bedroom: [], external: [] };
    this._smoothMin = 5;                            // curve smoothing window (minutes)
    this._targetHistory = { day: [], night: [] };  // setpoint history -> step line
    this._statusHistory = [];                       // [{t, state}] -> active shading
    this._sensorIds = { tempDay: null, tempNight: null, status: null, mode: null, algorithm: null, dayTarget: null, nightTarget: null, weather: null, nightStart: null, nightEnd: null };
    this._disconnected = false;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._disconnected = true;
    if (this._pollTimer) { clearInterval(this._pollTimer); this._pollTimer = null; }
  }

  connectedCallback() {
    super.connectedCallback();
    this._discoverEntities();
    this._fetchData();
    // Poll so the graph + event log stay current without a manual reload
    // (recorder history lags live state by a few seconds).
    if (!this._pollTimer) this._pollTimer = setInterval(() => this._fetchData(), 20000);
  }

  updated(changedProps) {
    if (changedProps.has("hass") && this.hass) {
      this._discoverEntities();
      this._fetchData();
    }
    if (changedProps.has("_tempHistory") || changedProps.has("_range")
        || changedProps.has("_smoothMin")) {
      this._renderGraph();
    }
  }

  // --- Display helpers. ThermoLoop is Celsius-only; these stay for a single
  //     formatting path and identity conversion (sensor °F is normalized to °C
  //     in the backend, so the panel always receives Celsius). ---
  _toDisplay(c) {
    return c;
  }

  _fromDisplay(d) {
    return d;
  }

  _fmtTemp(c, digits = 1) {
    const n = typeof c === "string" ? parseFloat(c) : c;
    if (n == null || isNaN(n)) return "—";
    return `${n.toFixed(digits)}°C`;
  }

  // Centered moving average over a ±windowMs/2 time window (display-only).
  _smooth(points, windowMs = (this._smoothMin || 0) * 60 * 1000) {
    if (!points || points.length === 0) return [];
    if (windowMs <= 0) return points;  // smoothing off
    const half = windowMs / 2;
    const out = new Array(points.length);
    let lo = 0, hi = 0, sum = 0;
    for (let i = 0; i < points.length; i++) {
      const t = points[i].t;
      while (lo < points.length && points[lo].t < t - half) { sum -= points[lo].v; lo++; }
      while (hi < points.length && points[hi].t <= t + half) { sum += points[hi].v; hi++; }
      const count = hi - lo;
      out[i] = { t, v: count > 0 ? sum / count : points[i].v };
    }
    return out;
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
      if (entityId.startsWith("time.thermoloop_night_window_start")) this._sensorIds.nightStart = entityId;
      if (entityId.startsWith("time.thermoloop_night_window_end")) this._sensorIds.nightEnd = entityId;
    }
    // First weather.* entity exposing a numeric temperature attribute.
    if (!this._sensorIds.weather) {
      for (const entityId of Object.keys(states)) {
        if (!entityId.startsWith("weather.")) continue;
        const attrs = states[entityId].attributes;
        if (attrs && !isNaN(parseFloat(attrs.temperature))) {
          this._sensorIds.weather = entityId;
          break;
        }
      }
    }
  }

  async _fetchData() {
    if (!this.hass) return;
    this._fetchHistory();
    this._fetchEvents();
  }

  // Convert a temperature reading to Celsius based on its source unit. The
  // panel reasons in °C everywhere; sensors/weather may report °F.
  _toC(value, unit) {
    const n = typeof value === "string" ? parseFloat(value) : value;
    if (n == null || isNaN(n)) return null;
    return (typeof unit === "string" && unit.toUpperCase().includes("F")) ? (n - 32) * 5 / 9 : n;
  }

  // An entity's unit attribute (unit_of_measurement, or e.g. temperature_unit).
  _unitOf(entityId, attr = "unit_of_measurement") {
    const s = entityId && this.hass && this.hass.states[entityId];
    return s && s.attributes ? s.attributes[attr] : null;
  }

  async _fetchHistory() {
    if (!this.hass || !this.hass.callWS) return;
    const now = new Date();
    const start = new Date(now.getTime() - RANGE_MS[this._range]);

    // Both temp sensors come from the status sensor's day_sensor/night_sensor
    // attributes so both curves plot (not just the currently-active one).
    const statusAttrs = (this._sensorIds.status && this.hass.states[this._sensorIds.status]
      && this.hass.states[this._sensorIds.status].attributes) || {};
    const daySensor = statusAttrs.day_sensor || statusAttrs.active_sensor || null;
    const nightSensor = statusAttrs.night_sensor || null;

    let tempSensors = [];
    if (daySensor) tempSensors.push(daySensor);
    if (nightSensor && nightSensor !== daySensor) tempSensors.push(nightSensor);

    if (tempSensors.length === 0) {
      // Fallback: scan for temperature sensors.
      for (const [id, stateObj] of Object.entries(this.hass.states)) {
        if (stateObj.attributes && stateObj.attributes.device_class === "temperature") {
          tempSensors.push(id);
        }
      }
    }

    const weatherId = this._sensorIds.weather;
    const dayTargetId = this._sensorIds.dayTarget;
    const nightTargetId = this._sensorIds.nightTarget;
    const statusId = this._sensorIds.status;
    const extraIds = [weatherId, dayTargetId, nightTargetId, statusId].filter(Boolean);
    const requestedIds = [...tempSensors, ...extraIds];

    if (requestedIds.length === 0) return;

    try {
      // Fetch with attributes so the weather entity's temperature attribute is
      // available (its STATE is a condition string, not a number). Temp sensors
      // are still parsed from c.s in the same call.
      const result = await this.hass.callWS({
        type: "history/history_during_period",
        start_time: start.toISOString(),
        end_time: now.toISOString(),
        entity_ids: requestedIds,
        minimal_response: false,
        no_attributes: false,
      });

      // history/history_during_period returns the compressed WS format:
      // each point is { s: state, lu: last_updated, lc: last_changed, a: attrs }
      // with timestamps in epoch SECONDS.
      const numeric = changes => changes
        .map(c => ({ t: (c.lu ?? c.lc) * 1000, v: parseFloat(c.s) }))
        .filter(p => !isNaN(p.v) && p.t > 0);

      const history = { living: [], bedroom: [], external: [] };
      const targetHistory = { day: [], night: [] };
      let statusHistory = [];
      for (const [entityId, changes] of Object.entries(result)) {
        if (entityId === weatherId) {
          // Temperature is in the weather entity's unit (often °F); normalize
          // to °C, carrying forward the last known value across points that
          // omit `a`.
          const wUnit = this._unitOf(weatherId, "temperature_unit") || this._unitOf(weatherId);
          let lastTemp = null;
          history.external = changes.map(c => {
            if (c.a && c.a.temperature != null) {
              const parsed = this._toC(c.a.temperature, wUnit);
              if (parsed != null) lastTemp = parsed;
            }
            return { t: (c.lu ?? c.lc) * 1000, v: lastTemp };
          }).filter(p => p.v != null && !isNaN(p.v) && p.t > 0);
          continue;
        }
        if (entityId === dayTargetId) { targetHistory.day = numeric(changes); continue; }
        if (entityId === nightTargetId) { targetHistory.night = numeric(changes); continue; }
        if (entityId === statusId) {
          // Capture state + the AC commanded setpoint over time. Carry the
          // setpoint forward across points that omit attributes, but report it
          // only while the AC is active (null when off) so the line breaks
          // during off periods rather than carrying a stale value.
          let lastSp = null;
          statusHistory = changes.map(c => {
            if (c.a && c.a.setpoint != null) {
              const sp = parseFloat(c.a.setpoint);
              if (!isNaN(sp)) lastSp = sp;
            }
            const state = c.s;
            return {
              t: (c.lu ?? c.lc) * 1000,
              state,
              setpoint: state === "active" ? lastSp : null,
            };
          }).filter(p => p.t > 0);
          continue;
        }
        // Temp sensors: map day->living, night->bedroom by identity (falling
        // back to a fill heuristic when ids are unknown). Normalize °F→°C.
        let bucket;
        if (nightSensor && entityId === nightSensor && entityId !== daySensor) bucket = "bedroom";
        else if (daySensor && entityId === daySensor) bucket = "living";
        else bucket = history.living.length <= history.bedroom.length ? "living" : "bedroom";
        const sensorUnit = this._unitOf(entityId);
        history[bucket] = numeric(changes)
          .map(p => ({ t: p.t, v: this._toC(p.v, sensorUnit) }))
          .filter(p => p.v != null);
      }
      this._targetHistory = targetHistory;
      this._statusHistory = statusHistory;
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
      let prevKey = null;
      let lastAttrs = {};
      for (const c of changes) {
        if (c.a) lastAttrs = c.a;
        const state = c.s;
        // last_updated (lu): reflects attribute-only changes too, so a new
        // command that keeps state "active" but changes the setpoint gets its
        // own timestamp.
        const ts = (c.lu ?? c.lc) * 1000;
        // De-dupe by the actual SIGNAL, not just state — otherwise a new cool
        // command issued while already "active" (a real beep) is swallowed.
        const key = `${state}|${lastAttrs.setpoint ?? ""}|${lastAttrs.fan ?? ""}|${lastAttrs.mode ?? ""}`;
        if (key === prevKey) continue;
        prevKey = key;
        // Show the signal we actually sent the AC (mode + setpoint + fan).
        let signal = "";
        if ((state === "active" || state === "off") && lastAttrs.setpoint != null) {
          const mode = lastAttrs.mode || "cool";
          const fan = lastAttrs.fan ? ` ${lastAttrs.fan}` : "";
          signal = ` ${mode} ${Number(lastAttrs.setpoint).toFixed(0)}°C${fan}`;
        }
        const reason = lastAttrs.reason ? ` — ${lastAttrs.reason}` : "";
        events.push({
          time: new Date(ts).toLocaleTimeString(),
          detail: `${state}${signal}${reason}`,
          type: state === "error" ? "leave" : "command",
        });
      }
      // Most recent first.
      this._events = events.slice(-100).reverse();
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
    this._bindCrosshair(canvas);

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Build series with time-sorted, smoothed data (sorted/smoothed once,
    // reused for both the lines and the crosshair interpolation).
    const series = [];
    if (this._tempHistory.living.length > 0)
      series.push({ key: "living", color: "#03a9f4", label: "Living", lineDash: [],
                    data: this._smooth([...this._tempHistory.living].sort((a, b) => a.t - b.t)) });
    if (this._tempHistory.bedroom.length > 0)
      series.push({ key: "bedroom", color: "#ff9800", label: "Bedroom", lineDash: [6, 4],
                    data: this._smooth([...this._tempHistory.bedroom].sort((a, b) => a.t - b.t)) });
    if (this._tempHistory.external.length > 0)
      series.push({ key: "external", color: "#4caf50", label: "Outdoor", lineDash: [2, 3],
                    data: this._smooth([...this._tempHistory.external].sort((a, b) => a.t - b.t)) });

    if (series.length === 0 || series.every(s => s.data.length < 2)) {
      this._plot = null;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#999";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Waiting for temperature data…", w / 2, h / 2);
      return;
    }

    const pad = { top: 16, right: 16, bottom: 28, left: 48 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    let allTimes = [];
    for (const s of series) for (const p of s.data) allTimes.push(p.t);
    const minTime = Math.min(...allTimes);
    const maxTime = Math.max(...allTimes);
    const timeRange = Math.max(maxTime - minTime, 1);

    // Overlays spanning the same x-range: our day/night target step function,
    // the AC's commanded setpoint over time, and the active regions.
    const targetSteps = this._buildTargetSteps(minTime, maxTime);
    const activeRegions = this._activeRegions(minTime, maxTime);
    // Keep null entries (AC off) so the line breaks during off periods.
    const acSetpoints = (this._statusHistory || [])
      .filter(p => p.t >= minTime && p.t <= maxTime)
      .map(p => ({ t: p.t, v: p.setpoint }));

    let allTemps = [];
    for (const s of series) for (const p of s.data) allTemps.push(p.v);
    for (const p of targetSteps) allTemps.push(p.v);  // keep the target line in view
    for (const p of acSetpoints) if (p.v != null) allTemps.push(p.v);  // and AC setpoint

    const minTemp = Math.floor(Math.min(...allTemps) - 1);
    const maxTemp = Math.ceil(Math.max(...allTemps) + 1);

    const xScale = t => pad.left + ((t - minTime) / timeRange) * plotW;
    const yScale = v => pad.top + plotH - ((v - minTemp) / (maxTemp - minTemp)) * plotH;

    // Cache geometry so the crosshair can repaint without recomputing.
    this._plot = { ctx, w, h, pad, plotW, plotH, series, xScale, yScale, minTemp,
                   maxTemp, minTime, maxTime, timeRange, targetSteps, activeRegions, acSetpoints };

    this._paint(this._hoverX != null ? this._hoverX : null);
  }

  _bindCrosshair(canvas) {
    if (canvas._thermoBound) return;
    canvas._thermoBound = true;
    canvas.addEventListener("mousemove", (e) => {
      if (!this._plot) return;
      const rect = canvas.getBoundingClientRect();
      const { pad, w } = this._plot;
      const x = Math.max(pad.left, Math.min(w - pad.right, e.clientX - rect.left));
      this._hoverX = x;
      this._paint(x);
    });
    canvas.addEventListener("mouseleave", () => {
      this._hoverX = null;
      this._paint(null);
    });
  }

  _valueAtTime(data, t) {
    // Linear interpolation of value at time t; null if t is outside the range.
    if (data.length === 0 || t < data[0].t || t > data[data.length - 1].t) return null;
    for (let i = 1; i < data.length; i++) {
      if (data[i].t >= t) {
        const a = data[i - 1], b = data[i];
        const f = (t - a.t) / ((b.t - a.t) || 1);
        return a.v + (b.v - a.v) * f;
      }
    }
    return data[data.length - 1].v;
  }

  // Minutes-of-day for a `time.*` entity's "HH:MM:SS" state, or null.
  _parseTimeEntity(entityId) {
    if (!entityId || !this.hass || !this.hass.states[entityId]) return null;
    const s = this.hass.states[entityId].state;
    if (!s || typeof s !== "string") return null;
    const parts = s.split(":");
    if (parts.length < 2) return null;
    const h = parseInt(parts[0], 10), m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  }

  // Is the local time-of-day at `ms` within the night window? Wrap-aware.
  _isNightAt(ms, nightStart, nightEnd) {
    if (nightStart == null || nightEnd == null) return false;
    const d = new Date(ms);
    const cur = d.getHours() * 60 + d.getMinutes();
    if (nightStart <= nightEnd) return cur >= nightStart && cur < nightEnd;
    return cur >= nightStart || cur < nightEnd;  // wraps past midnight
  }

  // Step (last-value-at-or-before) lookup over a time-sorted {t,v} history.
  _stepValueAt(history, t) {
    if (!history || history.length === 0) return null;
    if (t <= history[0].t) return history[0].v;
    let v = history[0].v;
    for (const p of history) {
      if (p.t <= t) v = p.v; else break;
    }
    return v;
  }

  // Reconstruct the active setpoint over [t0,t1] as samples {t, v, night}:
  // day target during the day window, night target during the night window,
  // each stepping at the user's historical edits. Dense sampling keeps the
  // day/night boundary crossings and edit steps crisp enough to draw.
  _buildTargetSteps(t0, t1) {
    const dayH = this._targetHistory.day, nightH = this._targetHistory.night;
    if (dayH.length === 0 && nightH.length === 0) return [];
    const nightStart = this._parseTimeEntity(this._sensorIds.nightStart);
    const nightEnd = this._parseTimeEntity(this._sensorIds.nightEnd);
    const N = 400;
    const stepMs = (t1 - t0) / N;
    const out = [];
    for (let i = 0; i <= N; i++) {
      const t = t0 + i * stepMs;
      const night = this._isNightAt(t, nightStart, nightEnd);
      let v = this._stepValueAt(night ? nightH : dayH, t);
      if (v == null) v = this._stepValueAt(night ? dayH : nightH, t);
      if (v == null) continue;
      out.push({ t, v, night });
    }
    return out;
  }

  // Intervals where the status sensor reported "active", clamped to [t0,t1].
  _activeRegions(t0, t1) {
    const h = this._statusHistory;
    if (!h || h.length === 0) return [];
    const sorted = [...h].sort((a, b) => a.t - b.t);
    const regions = [];
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].state !== "active") continue;
      const start = Math.max(sorted[i].t, t0);
      const end = Math.min(i + 1 < sorted.length ? sorted[i + 1].t : t1, t1);
      if (end > start) regions.push({ t0: start, t1: end });
    }
    return regions;
  }

  _paint(hoverX) {
    const p = this._plot;
    if (!p) return;
    const { ctx, w, h, pad, plotW, plotH, series, xScale, yScale, minTemp, maxTemp,
            minTime, maxTime, timeRange, targetSteps, activeRegions, acSetpoints } = p;

    ctx.clearRect(0, 0, w, h);

    // Active regions: faint green band behind everything for each period the
    // AC was running (from the status sensor's history).
    if (activeRegions && activeRegions.length) {
      ctx.fillStyle = "rgba(76,175,80,0.13)";
      for (const r of activeRegions) {
        const x0 = xScale(r.t0), x1 = xScale(r.t1);
        if (x1 > x0) ctx.fillRect(x0, pad.top, x1 - x0, plotH);
      }
    }

    // Grid
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
      ctx.fillText(this._toDisplay(v).toFixed(1), pad.left - 6, y + 4);
    }

    // X-axis labels
    ctx.textAlign = "center";
    for (let i = 0; i <= 4; i++) {
      const t = minTime + (timeRange / 4) * i;
      const x = pad.left + (plotW / 4) * i;
      const d = new Date(t);
      ctx.fillText(d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), x, h - 6);
    }

    // Series lines
    for (const s of series) {
      if (s.data.length < 2) continue;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2;
      ctx.setLineDash(s.lineDash);
      ctx.beginPath();
      for (let i = 0; i < s.data.length; i++) {
        const x = xScale(s.data[i].t), y = yScale(s.data[i].v);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Target setpoint as a step function: day target (yellow) during the day
    // window, night target (purple) during the night window, stepping at each
    // historical user edit. Drawn horizontal-then-vertical for crisp steps.
    if (targetSteps && targetSteps.length > 1) {
      ctx.lineWidth = 1.5;
      for (let i = 1; i < targetSteps.length; i++) {
        const a = targetSteps[i - 1], b = targetSteps[i];
        ctx.strokeStyle = a.night ? "#9c27b0" : "#fbc02d";
        ctx.beginPath();
        ctx.moveTo(xScale(a.t), yScale(a.v));
        ctx.lineTo(xScale(b.t), yScale(a.v));
        ctx.lineTo(xScale(b.t), yScale(b.v));
        ctx.stroke();
      }
    }

    // AC commanded setpoint over time (what we actually told the AC to cool to)
    // — a stepped red line, distinct from our day/night target above.
    if (acSetpoints && acSetpoints.length > 0) {
      ctx.strokeStyle = "#e53935";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      let prev = null;  // last drawn point; null lifts the pen (AC off)
      for (const pt of acSetpoints) {
        if (pt.v == null) { prev = null; continue; }
        const x = xScale(pt.t), y = yScale(pt.v);
        if (prev == null) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, prev.y);  // hold previous value
          ctx.lineTo(x, y);       // step to new value
        }
        prev = { x, y };
      }
      // Extend the final value to "now" only if the AC is currently on.
      const last = acSetpoints[acSetpoints.length - 1];
      if (last && last.v != null) ctx.lineTo(xScale(maxTime), yScale(last.v));
      ctx.stroke();
    }

    // Hover crosshair: vertical bar + interpolated colored dot/value per line
    if (hoverX != null) {
      const t = minTime + ((hoverX - pad.left) / plotW) * timeRange;

      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(hoverX, pad.top); ctx.lineTo(hoverX, pad.top + plotH); ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                   hoverX, pad.top + 10);

      const labelRight = hoverX > w - pad.right - 50;
      for (const s of series) {
        const v = this._valueAtTime(s.data, t);
        if (v == null) continue;
        const y = yScale(v);
        ctx.beginPath();
        ctx.arc(hoverX, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#fff";
        ctx.stroke();
        ctx.fillStyle = s.color;
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = labelRight ? "right" : "left";
        ctx.fillText(`${this._toDisplay(v).toFixed(1)}°`, hoverX + (labelRight ? -8 : 8), y - 6);
      }
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
    const outdoorTemp = this._toC(
      this._entityAttr(this._sensorIds.weather, "temperature"),
      this._entityAttr(this._sensorIds.weather, "temperature_unit"),
    );
    const dayDisplay = this._toDisplay(dayTarget);
    const nightDisplay = this._toDisplay(nightTarget);
    const stepTarget = (current, deltaDisplay, setter) => {
      const next = this._fromDisplay(this._toDisplay(current) + deltaDisplay);
      setter(next);
    };

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
            <span class="status-value">${this._fmtTemp(statusTemp)}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Target</span>
            <span class="status-value">${this._fmtTemp(statusTarget)}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Outdoor</span>
            <span class="status-value">${this._fmtTemp(outdoorTemp)}</span>
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
          <div class="graph-legend">
            <span class="item ${classMap({ off: this._tempHistory.living.length === 0 })}"
                  style="color:#03a9f4">
              <span class="swatch"></span><span style="color:var(--primary-text-color)">Living (day)</span>
            </span>
            <span class="item ${classMap({ off: this._tempHistory.bedroom.length === 0 })}"
                  style="color:#ff9800">
              <span class="swatch dashed"></span><span style="color:var(--primary-text-color)">Bedroom (night)</span>
            </span>
            <span class="item ${classMap({ off: this._tempHistory.external.length === 0 })}"
                  style="color:#4caf50">
              <span class="swatch dashed"></span><span style="color:var(--primary-text-color)">Outdoor</span>
            </span>
            <span class="item ${classMap({ off: this._targetHistory.day.length === 0 })}"
                  style="color:#fbc02d">
              <span class="swatch"></span><span style="color:var(--primary-text-color)">Target (day)</span>
            </span>
            <span class="item ${classMap({ off: this._targetHistory.night.length === 0 })}"
                  style="color:#9c27b0">
              <span class="swatch"></span><span style="color:var(--primary-text-color)">Target (night)</span>
            </span>
            <span class="item ${classMap({ off: (this._statusHistory || []).every(p => p.setpoint == null) })}"
                  style="color:#e53935">
              <span class="swatch"></span><span style="color:var(--primary-text-color)">AC setpoint</span>
            </span>
            <span class="item ${classMap({ off: this._statusHistory.length === 0 })}">
              <span class="swatch block" style="background:rgba(76,175,80,0.4)"></span><span>Active</span>
            </span>
          </div>
          <div class="range-chips">
            ${Object.entries(RANGE_LABELS).map(([key, label]) => html`
              <div class="range-chip ${classMap({ active: this._range === key })}"
                   @click=${() => this._rangeHistory(key)} role="button">${label}</div>
            `)}
          </div>
          <div class="smooth-row">
            <span>Smoothing: ${this._smoothMin} min</span>
            <input type="range" min="0" max="30" step="1" .value=${String(this._smoothMin)}
                   @input=${e => { this._smoothMin = parseInt(e.target.value, 10); }} />
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
              <button @click=${() => stepTarget(dayTarget, -1, v => this._setDayTarget(v))}>−</button>
              <span>${this._fmtTemp(dayTarget)}</span>
              <button @click=${() => stepTarget(dayTarget, 1, v => this._setDayTarget(v))}>+</button>
            </div>
          </div>

          <div class="control-row">
            <span class="control-label">Night Target</span>
            <div class="stepper">
              <button @click=${() => stepTarget(nightTarget, -1, v => this._setNightTarget(v))}>−</button>
              <span>${this._fmtTemp(nightTarget)}</span>
              <button @click=${() => stepTarget(nightTarget, 1, v => this._setNightTarget(v))}>+</button>
            </div>
          </div>
        </div>

        <!-- Event log -->
        <div class="log-card ${classMap({ collapsed: this._logCollapsed })}">
          <h3>
            <span @click=${() => this._logCollapsed = !this._logCollapsed} style="cursor:pointer">
              ${this._logCollapsed ? "▶" : "▼"} Event Log (${this._events.length})
            </span>
            <span class="log-refresh" title="Refresh"
                  @click=${() => this._fetchData()}>⟳</span>
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
