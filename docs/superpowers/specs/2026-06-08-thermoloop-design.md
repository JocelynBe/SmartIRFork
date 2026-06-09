# ThermoLoop — Design Spec

**Date:** 2026-06-08
**Status:** Approved design, pre-implementation
**Rigor level (P9):** Level 2 (user-facing feature, single user + HACS consumers)

## 1. Summary

ThermoLoop is a closed-loop smart-thermostat layer for Home Assistant, built by
pivoting this fork of SmartIR. It reads room sensors and phone presence, decides a
discrete air-conditioner command each control tick, sends it through the existing
SmartIR climate entity (the actuator), records every command, and renders a
responsive sidebar panel (temperature graph + event log + live controls).

SmartIR's IR code database and IR plumbing stay underneath as the **actuator**.
The new project identity is **ThermoLoop** (HA domain `thermoloop`).

### Concrete target setup
- **Broadlink RM4 mini + temp/humidity sensor** — living room (also the IR blaster).
- **Govee H5075** — bedroom temp/humidity sensor.
- **Mitsubishi AC** — controlled via IR through the existing SmartIR climate entity.
  Code DB confirms the control surface: modes `cool / heat / dry`, fan
  `low / mid / high / highest`, setpoint **16–30 °C in 1° steps** (discrete control).
- **iPhone `device_tracker`** (via luci/OpenWrt) — presence.

## 2. Goals

1. Track living-room (Broadlink) and bedroom (Govee) temperature/humidity.
2. Turn the AC **off when the user leaves**; **auto-resume** control when they return.
3. Closed-loop control: drive aggressively toward a target, then maintain it stably.
   - **Both-direction:** cool when above target, heat when below.
   - Feedback sensor switches by clock: **living room (Broadlink) during the day**,
     **bedroom (Govee) at night** (after the configurable night-start, default 22:00).
   - **Day and night targets are independent** and editable in the UI.
   - **Algorithm is selectable** in the UI: `v0` (aggressive hysteresis) or `v1`
     (proportional + trend).
4. UI shows when commands were sent — as an **event log** and as **markers on the
   temperature graph** (both rooms plotted).
5. **Record** every phone home/away transition (timestamped) for later use.

### Non-goals (deferred to v2)
- Learning average leave/arrive times per weekday (incl. WFH variance).
- **Pre-conditioning** the room before predicted arrival.
- (v1 only *records* the presence data — and that recording is free, see §5.)

## 3. Key constraints & realities

- **IR is fire-and-forget / open-loop.** The RM4 blasts a code; nothing confirms the
  AC received it or what state it is actually in. The controller never reads true AC
  state — it tracks *assumed* state and picks a discrete `{mode, setpoint, fan}` each
  tick. The command log records what was **sent**, never "confirmed."
- **Control is discrete.** The algorithm chooses from setpoints 16–30 (1° steps),
  modes `cool/heat/dry`, and four fan tiers. "Maintain the exact temperature" means
  "pick the best discrete command each tick, with a deadband to avoid IR spam."
- **Both-direction needs anti-cycling guards** or it will fight itself
  (cool → overshoot → heat → overshoot). See §4 L2 guards.
- **One AC, two rooms (mostly).** The single Mitsubishi unit is assumed to meaningfully
  affect both the living room and the bedroom. Confirmed "mostly yes" by the user.

## 4. Architecture (L0 → L3)

SmartIR climate entity = actuator (L0/L1 of the actuation chain). ThermoLoop adds a
control service (L2) and a panel (L3). The "brain" has **no Home Assistant imports**
and is unit-testable in isolation (P3).

### L0 — Contracts (pure data, zero HA imports)

- **`ControlInput`** — assembled each tick:
  `now`, `phase` (day|night), `active_sensor_reading` (temperature + age),
  `target` (day or night target for the active phase), `assumed_ac_state`
  (`{power, mode, setpoint, fan}` — last commanded), `temp_trend` (°C/min slope),
  `presence` (home|away), `last_command_at`.
- **`ACCommand`** — algorithm output:
  `{power: on|off, mode: cool|heat|dry, setpoint: int 16..30, fan: low|mid|high|highest, reason: str}`.
- **`Decision`** — post-guards: `send(ACCommand)` or `hold(reason)`. Guards may
  downgrade a proposed command to `hold`.
- **`CommandLogEntry`** — the recorded shape of a send: timestamp, active_sensor,
  current_temp, target, error, algorithm, command (`power/mode/setpoint/fan`), reason.
- **`PresenceEvent`** — `{ts, type: arrive|leave}` (recorded natively, see §5).

### L1 — Persistence (all HA-native; no custom files)

HA's recorder is a SQL store (SQLite default `home-assistant_v2.db`, or
MariaDB/Postgres if configured). We never touch SQL directly — we use the
recorder / history / logbook websocket APIs.

- **Command timeline → diagnostic entity + bus events.** The controller owns
  `sensor.thermoloop_status` whose state + attributes carry the last command
  (`mode, setpoint, fan, active_sensor, target, error, reason, presence`). The
  recorder keeps its history automatically → that history **is** the command timeline
  the graph overlays markers from. Each send also fires a `thermoloop_command` event
  so it appears in HA's native **Logbook** (and the panel's event list reads it via
  `logbook/get_events`).
- **Presence transitions → already recorded.** The iPhone `device_tracker`'s home/away
  history is already in the recorder. v1 "recording" is therefore **nothing to build**;
  v2 queries `history/history_during_period` on that tracker.
- **Assumed AC state → read from the SmartIR climate entity.** It is an assumed-state
  entity already holding last-commanded `{mode, setpoint, fan}`. On HA restart we read
  it back from there rather than persisting our own copy → no restart re-slam, no custom
  state file.
- **Retention caveat:** recorder history is governed by `purge_keep_days` (default 10).
  The command log / graph span whatever the recorder keeps. To get a 30-day log, bump
  `purge_keep_days` to 30. (Numeric temps can also persist for years via long-term
  statistics, but individual command events follow the purge window.)

### L2 — Services (the brain — HA-free except the thin actuator)

- **`Algorithm.compute(ControlInput) -> ACCommand`** — strategy interface, two impls:
  - **v0 — aggressive hysteresis.** `error = current - target`.
    Inside deadband → settle (`setpoint ≈ round(target)`, `fan = low`).
    Far above target → `cool, 16°, highest`. Far below → `heat, 30°, highest`.
    Near target → ease toward maintain. Simple and effective.
  - **v1 — proportional + trend.** Uses the slope to anticipate overshoot:
    `effective_error = error + k · slope · lookahead`, mapped to a setpoint offset and
    fan tier, backing off as it approaches target. Smoother, less overshoot.
- **`apply_guards(proposed, state, now) -> Decision`** — anti-cycling layer:
  - **Deadband** (±~0.3 °C): inside → no direction change, settle.
  - **Min dwell** (~10 min): cannot flip cool↔heat until elapsed.
  - **Min IR interval** (~3–5 min): no new command unless interval elapsed, with an
    override for large errors (urgent).
  - **Dedupe:** proposed == last commanded → `hold`.
  (Guard constants live in code, not entities — they are tuning internals, not user UX.)
- **`Actuator.apply(ACCommand)`** — the **only** HA-touching service-layer piece.
  Translates a command into `climate.set_hvac_mode / set_temperature / set_fan_mode /
  turn_off` calls on the existing SmartIR climate entity. Isolated so the brain stays
  pure and mockable.
- **`Controller.decide(ControlInput) -> Decision`** — composes algorithm + guards.
  Pure function. The center of gravity for tests.

### L3 — Application (HA glue + UI)

- **`ControlLoop`** — periodic tick (~60 s via `async_track_time_interval`):
  gather `ControlInput` from `hass` states (active sensor by clock, target by phase,
  assumed state from the climate entity, trend from recent history, presence) →
  `Controller.decide()` → on `send`, `Actuator.apply()` + update
  `sensor.thermoloop_status` + fire `thermoloop_command` event.
- **`PresenceTracker`** — listens to the iPhone `device_tracker`:
  on **leave** → record (native) + `turn_off` + set mode `away`;
  on **return** → record (native) + resume mode `auto`.
- **Tunable entities** (integration-owned; give UI + history + automatability for free):
  - `number.thermoloop_target_day`, `number.thermoloop_target_night`
  - `time.thermoloop_night_start` (22:00), `time.thermoloop_night_end` (07:00)
  - `select.thermoloop_algorithm` (`v0` / `v1`)
  - `select.thermoloop_mode` (`auto` / `off` / `away` — also driven by presence)
- **Panel** — see §6.

## 5. Data flow (one tick)

```
clock ─┐
       ├─ phase (day/night) ─→ pick active sensor (broadlink|govee) + target
sensors┘                                   │
device_tracker ─→ presence ────────────────┤
climate entity ─→ assumed_ac_state ────────┤
recorder history ─→ temp_trend ────────────┘
                          ↓
                   ControlInput
                          ↓
            Controller.decide (algorithm → guards)
                          ↓
                ┌──── Decision ────┐
                │ send             │ hold
                ↓                  ↓
        Actuator.apply        (nothing)
        climate.* calls
                ↓
   update sensor.thermoloop_status  +  fire thermoloop_command event
                ↓
        recorder + logbook (native persistence)
```

Presence transitions are recorded by HA's recorder automatically via the
`device_tracker` state history — no extra write path in v1.

## 6. The ThermoLoop panel

One Lit web component (HA's own frontend stack), bundled by esbuild into a single
`www/thermoloop-panel.js`, registered as a custom sidebar panel (tab **ThermoLoop**).
**Responsive**: CSS grid/flex with a ~600px breakpoint. Desktop = balanced split;
phone (HA Companion app webview) = single-column stack with the graph prioritized.

Zones:
- **Status strip** — `sensor.thermoloop_status`: mode, active room, `current → target`,
  the command being held, presence, algorithm, tick countdown, plus a light humidity
  readout (e.g. `RH 54%`). Wraps to multiple lines on phone.
- **Graph** — `history/history_during_period` for both temp sensors → living room
  (solid) + bedroom (dotted); a dashed target line that **steps** at the night-window
  boundary (e.g. 22° day → 24° night). Command markers (`▲`) from
  `sensor.thermoloop_status` history; hover (desktop) / tap (mobile) → reason string.
  Optional faint humidity line, toggleable (off by default). `6h / 24h / 7d` range chips.
- **Controls** — bound to the helper entities via `hass.callService`, so the same knobs
  work from any HA dashboard/automation too. Mode, algorithm, day target, night target,
  night window. On phone: dropdowns → segmented buttons; targets → `− value +` steppers.
- **Event log** — `logbook/get_events`: commands and `⇢ left / ⇠ arrived` presence
  transitions interleaved. Collapsible on phone. (The arrive/leave rows are exactly the
  data v2 will learn from.)

Mobile behaviors: hover→tap for markers/tooltip; segmented buttons + steppers instead of
fiddly inputs; event log collapses under a disclosure; graph scales to viewport with
reduced x-tick density; range chips stay tappable.

## 7. Error handling (fail-safe = hold)

- **Active sensor stale/unavailable** (unknown/unavailable state, or reading age beyond a
  threshold) → skip tick, surface "sensor stale" in the status strip, send nothing.
- **Climate entity unavailable** → skip tick, log.
- **Service-call exception on send** → log as a failed command, retry next tick.
- **HA restart** → reconstruct assumed AC state from the climate entity; no re-slam.
- **Open-loop honesty** → the log/status always reads "sent," never "confirmed."

## 8. Packaging (HACS)

Stay one HACS integration. Pivot the existing component to domain `thermoloop`
(`custom_components/thermoloop/`), keeping SmartIR's IR code DB and IR controller
plumbing underneath as the actuator. `hacs.json`, `manifest.json` (domain, name,
documentation URL), and entity prefixes updated to ThermoLoop.

Proposed module layout inside `custom_components/thermoloop/`:
```
contracts.py     # L0 schemas (ControlInput, ACCommand, Decision, CommandLogEntry)
algorithms.py    # v0, v1 strategies
guards.py        # apply_guards
controller.py    # Controller.decide (algorithm + guards)
actuator.py      # Actuator.apply → climate.* service calls (only HA seam in L2)
loop.py          # ControlLoop (periodic tick)
presence.py      # PresenceTracker
number.py        # target_day, target_night entities
select.py        # algorithm, mode entities
time.py          # night_start, night_end entities
sensor.py        # sensor.thermoloop_status
panel.py         # custom panel registration + websocket commands (if needed)
www/thermoloop-panel.js   # built frontend bundle
```
(Existing SmartIR climate/fan/light/media_player + controller + codes/ retained as the
IR actuation substrate.)

## 9. Test plan (P3 / P5 — failing tests first)

- **Brain is pure → the bulk of the tests, no HA:**
  - `Algorithm.compute` (v0, v1) over `ControlInput` fixtures: aggressive ramp, settle in
    deadband, both directions, trend anticipation (v1).
  - `apply_guards`: deadband hold, min-dwell blocks cool↔heat flip, min-IR-interval
    throttling + large-error override, dedupe.
  - `Controller.decide`: end-to-end composition cases.
- **Actuator** → mock service-call sink; assert correct `climate.*` calls per command
  (incl. `turn_off`).
- **Loop + presence** → `pytest-homeassistant-custom-component` harness (lighter):
  sensor selection by clock, target by phase, leave→off→away, return→auto, status entity
  + command event emission, stale-sensor skip.

## 10. Scope

- **v1** — everything in §2 goals 1–5, §4–§9.
- **v2** — learn average leave/arrive per weekday (handling WFH variance) from the
  already-recorded `device_tracker` history; pre-condition the room before predicted
  arrival.

## 11. Open / confirm later
- Tuning constants (deadband, min dwell, min IR interval, v1 gain `k`, lookahead) start at
  the §4 defaults and are refined empirically against real logs.
- `purge_keep_days` bump to 30 is a user recorder setting, not shipped config.
