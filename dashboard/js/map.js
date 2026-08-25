/* ─────────────────────────────────────────────
   map.js — Leaflet map init, custom markers,
   popups, selection sync, tick refresh.
───────────────────────────────────────────── */
'use strict';

const MapModule = (() => {
  let _map = null;
  /** @type {Map<string, L.Marker>} */
  const _markers = new Map();

  const STATUS_COLORS = {
    online:  '#10b981',
    idle:    '#3b82f6',
    warning: '#f59e0b',
    offline: '#6b7280',
  };

  const TYPE_EMOJI = {
    truck: '🚚',
    van:   '🚐',
    sedan: '🚗',
  };

  // ── Init ──────────────────────────────────────
  function init() {
    _map = L.map('map', {
      center: [51.505, -0.09],
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });

    // Dark-styled tile layer via CSS filter (see charts.css)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://openstreetmap.org" style="color:#475569">OSM</a>',
    }).addTo(_map);

    document.getElementById('mapFitBtn').addEventListener('click', fitAll);
  }

  // ── Create a custom div icon ───────────────────
  function _createIcon(vehicle) {
    const color   = STATUS_COLORS[vehicle.status] || '#94a3b8';
    const emoji   = TYPE_EMOJI[vehicle.type]      || '🚗';
    const isActive = vehicle.id === AppState.selectedVehicleId;

    const pulse = isActive
      ? `<div style="
            position:absolute;inset:-6px;border-radius:50%;
            border:2px solid ${color};
            animation:markerPulse 2s ease-out infinite;
            pointer-events:none;"></div>`
      : '';

    const ring = isActive
      ? `border:2px solid ${color};box-shadow:0 0 16px ${color}88;`
      : `border:2px solid ${color}99;box-shadow:0 4px 12px rgba(0,0,0,0.5);`;

    const html = `
      <div style="
        position:relative;
        width:38px;height:38px;border-radius:50%;
        background:${color}28;
        ${ring}
        display:flex;align-items:center;justify-content:center;
        font-size:17px;
        transition:transform 0.2s ease;
      ">${emoji}${pulse}</div>`;

    return L.divIcon({ html, className: '', iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -22] });
  }

  // ── Render / update all markers ────────────────
  function renderMarkers() {
    FLEET.forEach(vehicle => {
      const { lat, lng } = vehicle.location;
      const icon = _createIcon(vehicle);

      if (_markers.has(vehicle.id)) {
        const m = _markers.get(vehicle.id);
        m.setLatLng([lat, lng]);
        m.setIcon(icon);
      } else {
        const m = L.marker([lat, lng], { icon })
          .addTo(_map)
          .bindPopup(() => _buildPopupHtml(vehicle.id), {
            maxWidth: 220,
            className: 'fleet-popup',
          })
          .on('click', () => AppState.selectVehicle(vehicle.id));
        _markers.set(vehicle.id, m);
      }
    });
  }

  // ── Popup HTML ─────────────────────────────────
  function _buildPopupHtml(vehicleId) {
    const v = getVehicleById(vehicleId);
    if (!v) return '';
    const color = STATUS_COLORS[v.status] || '#94a3b8';
    return `
      <div style="font-family:Inter,sans-serif;padding:4px 2px;min-width:160px;">
        <div style="font-size:14px;font-weight:700;color:#f1f5f9;margin-bottom:6px;">${v.name}</div>
        <div style="font-size:12px;color:#94a3b8;margin-bottom:4px;">Driver: ${v.driver}</div>
        <div style="display:flex;gap:16px;margin-top:8px;">
          <div>
            <div style="font-size:10px;color:#475569;text-transform:uppercase;letter-spacing:.05em;">Speed</div>
            <div style="font-size:16px;font-weight:700;color:#f1f5f9;">${Math.round(v.telemetry.speed)}<small style="font-size:10px;color:#94a3b8;"> km/h</small></div>
          </div>
          <div>
            <div style="font-size:10px;color:#475569;text-transform:uppercase;letter-spacing:.05em;">Fuel</div>
            <div style="font-size:16px;font-weight:700;color:#f1f5f9;">${Math.round(v.telemetry.fuel)}<small style="font-size:10px;color:#94a3b8;">%</small></div>
          </div>
        </div>
        <div style="margin-top:8px;">
          <span style="
            display:inline-block;padding:2px 8px;border-radius:999px;
            font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;
            background:${color}28;color:${color};
          ">${v.status}</span>
        </div>
      </div>`;
  }

  // ── Pan / fly to a vehicle ─────────────────────
  function panTo(vehicleId) {
    const v = getVehicleById(vehicleId);
    if (!v) return;
    _map.flyTo([v.location.lat, v.location.lng], 15, { duration: 0.7, easeLinearity: 0.5 });
  }

  // ── Fit all vehicles in view ───────────────────
  function fitAll() {
    const latLngs = FLEET.map(v => [v.location.lat, v.location.lng]);
    if (latLngs.length) _map.fitBounds(L.latLngBounds(latLngs), { padding: [50, 50] });
  }

  // ── Refresh called each tick ───────────────────
  function refresh() { renderMarkers(); }

  return { init, renderMarkers, panTo, fitAll, refresh };
})();
