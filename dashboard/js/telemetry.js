/* ─────────────────────────────────────────────
   telemetry.js — Right panel: vehicle identity,
   arc gauges (Canvas 2D), details table.
   Charts live in charts.js.
───────────────────────────────────────────── */
'use strict';

const TelemetryModule = (() => {
  const _els = {};

  const GAUGE_CONFIGS = [
    { canvas: 'canvasSpeed',   valueEl: 'gaugeValueSpeed',   key: 'speed',       min: 0, max: 200, warn: 100, crit: 140, unit: '',  invertThreshold: false },
    { canvas: 'canvasTemp',    valueEl: 'gaugeValueTemp',    key: 'temperature', min: 0, max: 150, warn: 90,  crit: 110, unit: '\u00b0', invertThreshold: false },
    { canvas: 'canvasBattery', valueEl: 'gaugeValueBattery', key: 'battery',     min: 0, max: 100, warn: 30,  crit: 15,  unit: '%', invertThreshold: true  },
    { canvas: 'canvasFuel',    valueEl: 'gaugeValueFuel',    key: 'fuel',        min: 0, max: 100, warn: 25,  crit: 10,  unit: '%', invertThreshold: true  },
  ];

  function init() {
    _els.empty   = document.getElementById('telemetryEmpty');
    _els.content = document.getElementById('telemetryContent');
  }

  function _showEmpty()   { _els.empty.hidden = false; _els.content.hidden = true; }
  function _showContent() { _els.empty.hidden = true;  _els.content.hidden = false; }

  function update(vehicleId) {
    if (!vehicleId) { _showEmpty(); return; }
    const v = getVehicleById(vehicleId);
    if (!v)          { _showEmpty(); return; }
    _showContent();

    document.getElementById('vehicleName').textContent   = v.name;
    document.getElementById('vehicleDriver').textContent = v.driver;

    const badge = document.getElementById('vehicleStatusBadge');
    badge.textContent = v.status.charAt(0).toUpperCase() + v.status.slice(1);
    badge.className   = 'status-badge status-badge--' + v.status;

    document.getElementById('vehicleUpdated').textContent = 'Updated just now';

    document.getElementById('detailOdometer').textContent = v.telemetry.odometer.toLocaleString() + ' km';
    document.getElementById('detailRpm').textContent      = v.telemetry.rpm.toLocaleString() + ' RPM';
    document.getElementById('detailHeading').textContent  = v.telemetry.heading + '\u00b0 (' + _headingLabel(v.telemetry.heading) + ')';
    document.getElementById('detailCoords').textContent   = v.location.lat.toFixed(4) + ', ' + v.location.lng.toFixed(4);

    GAUGE_CONFIGS.forEach(function(cfg) { _drawGauge(cfg, v.telemetry[cfg.key]); });
  }

  function _drawGauge(cfg, rawValue) {
    const canvas = document.getElementById(cfg.canvas);
    if (!canvas) return;
    const ctx  = canvas.getContext('2d');
    const W    = canvas.offsetWidth  || 120;
    const H    = canvas.offsetHeight || 80;
    const dpr  = window.devicePixelRatio || 1;

    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.scale(dpr, dpr);
    }

    const cx     = W / 2;
    const cy     = H - 8;
    const radius = Math.min(W * 0.42, (H - 8) * 0.9);
    const value  = Math.min(cfg.max, Math.max(cfg.min, rawValue));
    const ratio  = (value - cfg.min) / (cfg.max - cfg.min);

    const color = cfg.invertThreshold
      ? (value <= cfg.crit ? '#ef4444' : value <= cfg.warn ? '#f59e0b' : '#10b981')
      : (value >= cfg.crit ? '#ef4444' : value >= cfg.warn ? '#f59e0b' : '#00d4ff');

    ctx.clearRect(0, 0, W, H);

    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, 2 * Math.PI);
    ctx.strokeStyle = '#1c2333';
    ctx.lineWidth   = 9;
    ctx.lineCap     = 'round';
    ctx.stroke();

    if (ratio > 0) {
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur  = 10;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, Math.PI, Math.PI + ratio * Math.PI);
      ctx.strokeStyle = color;
      ctx.lineWidth   = 9;
      ctx.lineCap     = 'round';
      ctx.stroke();
      ctx.restore();
    }

    const valueEl = document.getElementById(cfg.valueEl);
    if (valueEl) {
      valueEl.textContent = Math.round(value) + cfg.unit;
      valueEl.style.color = color;
    }
  }

  function _headingLabel(deg) {
    return ['N','NE','E','SE','S','SW','W','NW'][Math.round(deg / 45) % 8];
  }

  function refresh() { update(AppState.selectedVehicleId); }

  return { init, update, refresh };
})();
