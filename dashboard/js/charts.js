/* ─────────────────────────────────────────────
   charts.js — Chart.js trend charts for the
   telemetry panel. Creates instances on vehicle
   selection; updates data each simulation tick.
───────────────────────────────────────────── */
'use strict';

const ChartsModule = (() => {
  const _charts = { speed: null, temp: null, batteryFuel: null };

  const BASE_SCALES = {
    x: {
      ticks: { color: '#475569', font: { size: 10, family: 'Inter' }, maxTicksLimit: 5, maxRotation: 0 },
      grid:  { color: '#1e2d4088' },
      border: { display: false },
    },
    y: {
      ticks: { color: '#475569', font: { size: 10, family: 'Inter' } },
      grid:  { color: '#1e2d4088' },
      border: { display: false },
    },
  };

  const BASE_PLUGINS = {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1c2333',
      borderColor:     '#1e2d40',
      borderWidth:     1,
      titleColor:      '#94a3b8',
      bodyColor:       '#f1f5f9',
      padding:         10,
      cornerRadius:    8,
    },
  };

  function _dataset(label, data, color) {
    return {
      label,
      data,
      borderColor:      color,
      backgroundColor:  color + '22',
      borderWidth:      2,
      pointRadius:      0,
      pointHoverRadius: 4,
      fill:             true,
      tension:          0.4,
    };
  }

  function _labels(history) {
    return history.map(function(h) {
      const d  = new Date(h.timestamp);
      const hh = String(d.getUTCHours()).padStart(2, '0');
      const mm = String(d.getUTCMinutes()).padStart(2, '0');
      return hh + ':' + mm;
    });
  }

  function _destroyAll() {
    Object.keys(_charts).forEach(function(k) {
      if (_charts[k]) { _charts[k].destroy(); _charts[k] = null; }
    });
  }

  function create(vehicleId) {
    _destroyAll();
    const v = getVehicleById(vehicleId);
    if (!v) return;
    const labels = _labels(v.history);

    const ctxSpeed = document.getElementById('chartSpeed');
    if (ctxSpeed) {
      _charts.speed = new Chart(ctxSpeed, {
        type: 'line',
        data: { labels: labels, datasets: [_dataset('Speed km/h', v.history.map(function(h){ return +h.speed.toFixed(1); }), '#00d4ff')] },
        options: {
          responsive: true, maintainAspectRatio: false, animation: { duration: 400 },
          interaction: { mode: 'index', intersect: false },
          plugins: BASE_PLUGINS,
          scales: Object.assign({}, BASE_SCALES, { y: Object.assign({}, BASE_SCALES.y, { min: 0, max: 220, ticks: Object.assign({}, BASE_SCALES.y.ticks, { callback: function(v){ return v + ' km/h'; } }) }) }),
        },
      });
    }

    const ctxTemp = document.getElementById('chartTemp');
    if (ctxTemp) {
      _charts.temp = new Chart(ctxTemp, {
        type: 'line',
        data: { labels: labels, datasets: [_dataset('Temp \u00b0C', v.history.map(function(h){ return +h.temperature.toFixed(1); }), '#f59e0b')] },
        options: {
          responsive: true, maintainAspectRatio: false, animation: { duration: 400 },
          interaction: { mode: 'index', intersect: false },
          plugins: BASE_PLUGINS,
          scales: Object.assign({}, BASE_SCALES, { y: Object.assign({}, BASE_SCALES.y, { min: 0, max: 160, ticks: Object.assign({}, BASE_SCALES.y.ticks, { callback: function(v){ return v + '\u00b0'; } }) }) }),
        },
      });
    }

    const ctxBF = document.getElementById('chartBatteryFuel');
    if (ctxBF) {
      _charts.batteryFuel = new Chart(ctxBF, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            _dataset('Battery %', v.history.map(function(h){ return +h.battery.toFixed(1); }), '#3b82f6'),
            _dataset('Fuel %',    v.history.map(function(h){ return +h.fuel.toFixed(1);    }), '#10b981'),
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false, animation: { duration: 400 },
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: true, labels: { color: '#94a3b8', font: { size: 11, family: 'Inter' }, boxWidth: 10, padding: 12 } },
            tooltip: BASE_PLUGINS.tooltip,
          },
          scales: Object.assign({}, BASE_SCALES, { y: Object.assign({}, BASE_SCALES.y, { min: 0, max: 110, ticks: Object.assign({}, BASE_SCALES.y.ticks, { callback: function(v){ return v + '%'; } }) }) }),
        },
      });
    }
  }

  function update(vehicleId) {
    const v = getVehicleById(vehicleId);
    if (!v) return;
    const labels = _labels(v.history);

    if (_charts.speed) {
      _charts.speed.data.labels = labels;
      _charts.speed.data.datasets[0].data = v.history.map(function(h){ return +h.speed.toFixed(1); });
      _charts.speed.update('none');
    }
    if (_charts.temp) {
      _charts.temp.data.labels = labels;
      _charts.temp.data.datasets[0].data = v.history.map(function(h){ return +h.temperature.toFixed(1); });
      _charts.temp.update('none');
    }
    if (_charts.batteryFuel) {
      _charts.batteryFuel.data.labels = labels;
      _charts.batteryFuel.data.datasets[0].data = v.history.map(function(h){ return +h.battery.toFixed(1); });
      _charts.batteryFuel.data.datasets[1].data = v.history.map(function(h){ return +h.fuel.toFixed(1);    });
      _charts.batteryFuel.update('none');
    }
  }

  function refresh() {
    if (AppState.selectedVehicleId) update(AppState.selectedVehicleId);
  }

  return { create, update, refresh };
})();
