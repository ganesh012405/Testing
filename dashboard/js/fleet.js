/* ─────────────────────────────────────────────
   fleet.js — Fleet sidebar: vehicle cards,
   search, filter tabs, header status summary,
   KPI bar population.
───────────────────────────────────────────── */
'use strict';

const FleetModule = (() => {
  const _els = {
    list:   null,
    search: null,
    tabs:   null,
    status: null,
  };
  let _activeFilter = 'all';

  // ── Init ──────────────────────────────────────
  function init() {
    _els.list   = document.getElementById('fleetList');
    _els.search = document.getElementById('fleetSearch');
    _els.tabs   = document.querySelectorAll('.fleet-filter-tabs .tab-btn');
    _els.status = document.getElementById('headerStatus');

    _els.search.addEventListener('input', () => render());

    _els.tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        _activeFilter = btn.dataset.filter;
        _els.tabs.forEach(b => {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-selected', String(b === btn));
        });
        render();
      });
    });
  }

  // ── Render vehicle list ────────────────────────
  function render() {
    const query   = (_els.search?.value ?? '').trim().toLowerCase();
    const visible = FLEET.filter(v => {
      const matchesFilter = _activeFilter === 'all' || v.status === _activeFilter;
      const matchesSearch = !query
        || v.name.toLowerCase().includes(query)
        || v.driver.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });

    _els.list.innerHTML = '';

    if (visible.length === 0) {
      const li = document.createElement('li');
      li.className = 'fleet-empty-msg';
      li.textContent = 'No vehicles match.';
      _els.list.appendChild(li);
      return;
    }

    visible.forEach(vehicle => _els.list.appendChild(_buildCard(vehicle)));
  }

  // ── Build single vehicle card ──────────────────
  function _buildCard(vehicle) {
    const { telemetry, status } = vehicle;
    const isActive = vehicle.id === AppState.selectedVehicleId;
    const alertCount = vehicle.alerts.length;

    const li = document.createElement('li');
    li.className = `vehicle-card${isActive ? ' is-active' : ''}`;
    li.setAttribute('role', 'button');
    li.setAttribute('tabindex', '0');
    li.setAttribute('aria-label', `Select ${vehicle.name}`);
    li.dataset.vehicleId = vehicle.id;

    li.innerHTML = `
      <div class="vehicle-card-header">
        <span class="vehicle-status-dot dot--${status}" aria-hidden="true"></span>
        <span class="vehicle-card-name">${_esc(vehicle.name)}</span>
        ${alertCount > 0 ? `<span class="vehicle-alert-count" aria-label="${alertCount} alerts">${alertCount}</span>` : ''}
      </div>
      <div class="vehicle-card-sub">
        <span class="vehicle-card-type">${_typeLabel(vehicle.type)}</span>
        <span class="vehicle-card-driver">${_esc(vehicle.driver)}</span>
      </div>
      <div class="vehicle-card-metrics">
        <div class="metric-mini">
          <span class="metric-mini-label">Speed</span>
          <span class="metric-mini-value">${Math.round(telemetry.speed)}<small> km/h</small></span>
        </div>
        <div class="metric-mini">
          <span class="metric-mini-label">Battery</span>
          <span class="metric-mini-value" style="color:${_levelColor(telemetry.battery, 30, 15)}">${Math.round(telemetry.battery)}<small>%</small></span>
        </div>
        <div class="metric-mini">
          <span class="metric-mini-label">Fuel</span>
          <span class="metric-mini-value" style="color:${_levelColor(telemetry.fuel, 25, 10)}">${Math.round(telemetry.fuel)}<small>%</small></span>
        </div>
      </div>`;

    li.addEventListener('click',   () => AppState.selectVehicle(vehicle.id));
    li.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); AppState.selectVehicle(vehicle.id); }
    });
    return li;
  }

  // ── Header status pills ────────────────────────
  function renderHeaderStatus() {
    const counts = { online: 0, idle: 0, warning: 0, offline: 0 };
    FLEET.forEach(v => { if (counts[v.status] !== undefined) counts[v.status]++; });
    _els.status.innerHTML = Object.entries(counts)
      .filter(([, n]) => n > 0)
      .map(([s, n]) => `
        <span class="status-summary-pill">
          <span class="dot dot--${s}" aria-hidden="true"></span>
          ${n}&nbsp;${_cap(s)}
        </span>`)
      .join('');
  }

  // ── KPI bar ────────────────────────────────────
  function renderKpi() {
    const active = FLEET.filter(v => v.status !== 'offline');
    const moving = FLEET.filter(v => v.status === 'online' || v.status === 'warning');
    const avgSpd = moving.length
      ? Math.round(moving.reduce((s, v) => s + v.telemetry.speed, 0) / moving.length)
      : 0;
    const alertCnt = FLEET.reduce((s, v) => s + v.alerts.length, 0);

    document.getElementById('kpiActive').textContent   = `${active.length} / ${FLEET.length}`;
    document.getElementById('kpiAvgSpeed').textContent = `${avgSpd} km/h`;
    document.getElementById('kpiAlerts').textContent   = alertCnt;
    document.getElementById('kpiDistance').textContent = `${getTotalDailyDistance().toLocaleString()} km`;

    const alertEl = document.getElementById('kpiAlerts');
    alertEl.classList.toggle('kpi-value--alert', alertCnt > 0);
  }

  // ── Helpers ────────────────────────────────────
  function _esc(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function _cap(str)  { return str.charAt(0).toUpperCase() + str.slice(1); }

  function _typeLabel(type) {
    return { truck: '🚚 Truck', van: '🚐 Van', sedan: '🚗 Sedan' }[type] || type;
  }

  function _levelColor(value, warnAt, critAt) {
    if (value <= critAt) return 'var(--color-accent-red)';
    if (value <= warnAt) return 'var(--color-accent-amber)';
    return 'var(--color-text-primary)';
  }

  // ── Refresh called each tick ───────────────────
  function refresh() {
    render();
    renderHeaderStatus();
    renderKpi();
  }

  return { init, render, renderHeaderStatus, renderKpi, refresh };
})();
