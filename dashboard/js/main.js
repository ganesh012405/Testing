/* ─────────────────────────────────────────────
   main.js — Global AppState, vehicle selection
   coordinator, simulation tick, clock.
───────────────────────────────────────────── */
'use strict';

/* ── Global state ────────────────────────────── */
const AppState = {
  selectedVehicleId: null,

  selectVehicle: function(vehicleId) {
    this.selectedVehicleId = vehicleId;
    MapModule.panTo(vehicleId);
    MapModule.refresh();
    FleetModule.render();
    TelemetryModule.update(vehicleId);
    ChartsModule.create(vehicleId);

    /* slide-in panel on narrow viewports */
    if (window.innerWidth < 1280) {
      document.getElementById('telemetryPanel').classList.add('is-open');
    }
  },
};

/* ── Simulation tick ─────────────────────────── */
const TICK_MS = 3000;

function _clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
function _jitter(mag)       { return (Math.random() * 2 - 1) * mag; }

function simulationTick() {
  FLEET.forEach(function(v) {
    if (v.status === 'offline') return;
    var t = v.telemetry;

    if (v.status === 'online') {
      t.speed       = +_clamp(t.speed       + _jitter(6),   0, 160).toFixed(1);
      t.temperature = +_clamp(t.temperature + _jitter(2.5), 50, 130).toFixed(1);
    } else if (v.status === 'warning') {
      t.speed       = +_clamp(t.speed       + _jitter(4),   0, 100).toFixed(1);
      t.temperature = +_clamp(t.temperature + _jitter(1.5), 60, 120).toFixed(1);
    } else {
      /* idle */
      t.speed       = 0;
      t.temperature = +_clamp(t.temperature - 0.4, 40, 80).toFixed(1);
    }

    t.battery  = +_clamp(t.battery - 0.07 + _jitter(0.04), 0, 100).toFixed(1);
    t.fuel     = +_clamp(t.fuel    - 0.05 + _jitter(0.03), 0, 100).toFixed(1);
    t.rpm      = v.status === 'idle' ? 750 : Math.round(_clamp(t.speed * 24 + _jitter(150), 700, 6500));

    /* nudge location */
    if (v.status !== 'idle') {
      v.location.lat = +(v.location.lat + _jitter(0.00025)).toFixed(6);
      v.location.lng = +(v.location.lng + _jitter(0.00025)).toFixed(6);
    }

    /* push history snapshot */
    v.history.push({ timestamp: Date.now(), speed: t.speed, temperature: t.temperature, battery: t.battery, fuel: t.fuel });
    if (v.history.length > 20) v.history.shift();
  });

  MapModule.refresh();
  FleetModule.refresh();
  TelemetryModule.refresh();
  ChartsModule.refresh();
  AlertsModule.refresh();
}

/* ── Clock ───────────────────────────────────── */
function _startClock() {
  var el = document.getElementById('headerClock');
  function tick() {
    var n  = new Date();
    var hh = String(n.getUTCHours()).padStart(2,'0');
    var mm = String(n.getUTCMinutes()).padStart(2,'0');
    var ss = String(n.getUTCSeconds()).padStart(2,'0');
    el.textContent = hh + ':' + mm + ':' + ss + ' UTC';
  }
  tick();
  setInterval(tick, 1000);
}

/* ── Bootstrap ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  MapModule.init();
  FleetModule.init();
  TelemetryModule.init();
  AlertsModule.init();

  MapModule.renderMarkers();
  FleetModule.refresh();
  AlertsModule.refresh();

  /* auto-select first online vehicle */
  var first = FLEET.find(function(v){ return v.status === 'online'; });
  if (first) AppState.selectVehicle(first.id);

  _startClock();
  setInterval(simulationTick, TICK_MS);

  /* fit map after a short delay to ensure tiles load */
  setTimeout(function() { MapModule.fitAll(); }, 800);
});
