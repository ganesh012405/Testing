/* ─────────────────────────────────────────────
   alerts.js — Threshold checks, alert feed
   rendering, badge count, dismiss handling.
───────────────────────────────────────────── */
'use strict';

const AlertsModule = (() => {
  let _feed  = null;
  let _badge = null;
  let _nextId = 200;

  const RULES = [
    { key: 'temperature', severity: 'critical', test: function(v){ return v >= 110; }, msg: 'Engine overheating \u2014 immediate attention required' },
    { key: 'temperature', severity: 'warning',  test: function(v){ return v >= 90 && v < 110; }, msg: 'Engine temperature elevated' },
    { key: 'fuel',        severity: 'critical', test: function(v){ return v <= 10; },            msg: 'Fuel critically low' },
    { key: 'fuel',        severity: 'warning',  test: function(v){ return v > 10 && v <= 25; },  msg: 'Fuel level low' },
    { key: 'battery',     severity: 'critical', test: function(v){ return v <= 15; },            msg: 'Battery critically low' },
    { key: 'battery',     severity: 'warning',  test: function(v){ return v > 15 && v <= 30; },  msg: 'Battery level low' },
    { key: 'speed',       severity: 'warning',  test: function(v){ return v > 120; },            msg: 'Speed limit exceeded' },
  ];

  function init() {
    _feed  = document.getElementById('alertFeed');
    _badge = document.getElementById('alertBadge');
  }

  function checkThresholds(vehicle) {
    if (vehicle.status === 'offline') return;
    RULES.forEach(function(rule) {
      const val = vehicle.telemetry[rule.key];
      if (!rule.test(val)) return;
      const alreadyActive = vehicle.alerts.some(function(a) {
        return a.message === rule.msg && (Date.now() - a.timestamp) < 90_000;
      });
      if (alreadyActive) return;
      vehicle.alerts.push({
        id: 'ALT-' + (++_nextId),
        severity: rule.severity,
        message: rule.msg,
        timestamp: Date.now(),
        vehicleName: vehicle.name,
      });
    });
  }

  function render() {
    const all = [];
    FLEET.forEach(function(v) {
      v.alerts.forEach(function(a) {
        all.push(Object.assign({}, a, { vehicleName: a.vehicleName || v.name }));
      });
    });
    all.sort(function(a, b){ return b.timestamp - a.timestamp; });
    const shown = all.slice(0, 20);

    const count = all.length;
    _badge.textContent       = count > 99 ? '99+' : String(count);
    _badge.dataset.count     = count;
    _badge.style.display     = count === 0 ? 'none' : '';

    _feed.innerHTML = '';
    if (shown.length === 0) {
      const msg = document.createElement('span');
      msg.style.cssText = 'font-size:12px;color:var(--color-text-muted);padding:0 12px;';
      msg.textContent = 'No active alerts';
      _feed.appendChild(msg);
      return;
    }

    shown.forEach(function(alert) {
      _feed.appendChild(_buildCard(alert));
    });
  }

  function _buildCard(alert) {
    const div = document.createElement('div');
    div.className       = 'alert-card alert-card--' + alert.severity;
    div.dataset.alertId = alert.id;

    const severityIcon = alert.severity === 'critical'
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>';

    div.innerHTML =
      '<span class="alert-severity-icon" aria-hidden="true">' + severityIcon + '</span>' +
      '<div class="alert-card-body">' +
        '<span class="alert-card-message">' + _esc(alert.message) + '</span>' +
        '<span class="alert-card-meta">' + _esc(alert.vehicleName) + ' \u00b7 ' + _relTime(alert.timestamp) + '</span>' +
      '</div>' +
      '<button class="alert-dismiss-btn" aria-label="Dismiss alert">' +
        '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
      '</button>';

    div.querySelector('.alert-dismiss-btn').addEventListener('click', function() { dismiss(alert.id); });
    return div;
  }

  function dismiss(alertId) {
    FLEET.forEach(function(v) {
      const idx = v.alerts.findIndex(function(a){ return a.id === alertId; });
      if (idx !== -1) v.alerts.splice(idx, 1);
    });
    render();
    FleetModule.renderKpi();
  }

  function _relTime(ts) {
    const s = Math.round((Date.now() - ts) / 1000);
    if (s < 5)  return 'just now';
    if (s < 60) return s + 's ago';
    const m = Math.round(s / 60);
    if (m < 60) return m + 'm ago';
    return Math.round(m / 60) + 'h ago';
  }

  function _esc(str) {
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function refresh() {
    FLEET.forEach(function(v){ checkThresholds(v); });
    render();
  }

  return { init, checkThresholds, render, dismiss, refresh };
})();
