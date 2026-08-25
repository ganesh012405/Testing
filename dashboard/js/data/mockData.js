/* ---------------------------------------------
   mockData.js — Static fleet + telemetry data.
   Simulation loop in main.js mutates this in
   place every tick.
--------------------------------------------- */
'use strict';

/** Build 20 history snapshots stepping back 1 min each */
function _generateHistory(baseSpeed, baseTemp, baseBattery, baseFuel) {
  const history = [];
  const now = Date.now();
  let spd = baseSpeed, tmp = baseTemp, bat = baseBattery, fue = baseFuel;
  for (let i = 19; i >= 0; i--) {
    spd = Math.max(0,   spd   + (Math.random() * 10 - 5));
    tmp = Math.max(40,  tmp   + (Math.random() * 4  - 2));
    bat = Math.min(100, Math.max(0, bat - 0.12 + (Math.random() * 0.15)));
    fue = Math.min(100, Math.max(0, fue - 0.08 + (Math.random() * 0.10)));
    history.unshift({
      timestamp:   now - i * 60_000,
      speed:       +spd.toFixed(1),
      temperature: +tmp.toFixed(1),
      battery:     +bat.toFixed(1),
      fuel:        +fue.toFixed(1),
    });
  }
  return history;
}

const FLEET = [
  {
    id:     'VH-001',
    name:   'Truck Alpha',
    type:   'truck',
    driver: 'J. Martinez',
    status: 'online',
    location: { lat: 51.505,  lng: -0.090 },
    telemetry: { speed: 72,  temperature: 85,  battery: 84, fuel: 61, odometer: 142500, rpm: 2200, heading: 245 },
    history: _generateHistory(72,  85,  84, 61),
    alerts: [],
  },
  {
    id:     'VH-002',
    name:   'Van Bravo',
    type:   'van',
    driver: 'S. Patel',
    status: 'warning',
    location: { lat: 51.515,  lng: -0.120 },
    telemetry: { speed: 38,  temperature: 97,  battery: 27, fuel: 22, odometer: 88200,  rpm: 1800, heading:  90 },
    history: _generateHistory(38,  97,  27, 22),
    alerts: [
      { id: 'ALT-001', severity: 'warning',  message: 'Engine temperature elevated', timestamp: Date.now() - 120_000, vehicleName: 'Van Bravo' },
      { id: 'ALT-002', severity: 'warning',  message: 'Battery level low',           timestamp: Date.now() -  60_000, vehicleName: 'Van Bravo' },
    ],
  },
  {
    id:     'VH-003',
    name:   'Sedan Charlie',
    type:   'sedan',
    driver: 'A. Nguyen',
    status: 'idle',
    location: { lat: 51.495,  lng: -0.070 },
    telemetry: { speed: 0,   temperature: 58,  battery: 91, fuel: 79, odometer: 33100,  rpm: 750,  heading:   0 },
    history: _generateHistory(0,   58,  91, 79),
    alerts: [],
  },
  {
    id:     'VH-004',
    name:   'Truck Delta',
    type:   'truck',
    driver: 'R. Kowalski',
    status: 'online',
    location: { lat: 51.520,  lng: -0.080 },
    telemetry: { speed: 95,  temperature: 82,  battery: 73, fuel: 55, odometer: 210400, rpm: 2600, heading: 180 },
    history: _generateHistory(95,  82,  73, 55),
    alerts: [],
  },
  {
    id:     'VH-005',
    name:   'Van Echo',
    type:   'van',
    driver: 'T. Okafor',
    status: 'offline',
    location: { lat: 51.490,  lng: -0.110 },
    telemetry: { speed: 0,   temperature: 22,  battery: 12, fuel: 8,  odometer: 67800,  rpm: 0,    heading: 315 },
    history: _generateHistory(0,   22,  12,  8),
    alerts: [
      { id: 'ALT-003', severity: 'critical', message: 'Vehicle has lost connectivity', timestamp: Date.now() - 600_000, vehicleName: 'Van Echo' },
      { id: 'ALT-004', severity: 'critical', message: 'Fuel critically low',           timestamp: Date.now() - 300_000, vehicleName: 'Van Echo' },
    ],
  },
];

const DAILY_DISTANCE = { 'VH-001': 312, 'VH-002': 187, 'VH-003': 54, 'VH-004': 498, 'VH-005': 189 };

function getVehicleById(id) {
  return FLEET.find(v => v.id === id);
}

function getTotalDailyDistance() {
  return Object.values(DAILY_DISTANCE).reduce((a, b) => a + b, 0);
}
