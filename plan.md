# Vehicle Telemetry Visualization Dashboard — Build Plan

## 1. Project Overview

A single-page, real-time fleet monitoring dashboard built with HTML, CSS, and vanilla JavaScript. Fleet operators can view all vehicles on an interactive map, select individual vehicles to inspect detailed telemetry, track trend charts, and respond to alerts — all with a dark, premium, futuristic aesthetic.

---

## 2. Goals & Acceptance Criteria

| # | Criterion |
|---|-----------|
| 1 | Fleet overview panel showing all vehicles with key metrics at a glance |
| 2 | Interactive map (Leaflet.js, free/OSM tiles) with vehicle location markers |
| 3 | Vehicle selection triggers detailed telemetry side panel |
| 4 | Line/area charts for speed, temperature, battery, and fuel trends |
| 5 | Status badges and alert notifications per vehicle |
| 6 | Dark, premium, futuristic UI — professional, not gaming |
| 7 | Fully responsive layout (desktop-first, mobile-friendly) |
| 8 | All data is realistic mock telemetry (no backend required) |

---

## 3. Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Markup | HTML5 | Semantic structure |
| Styling | CSS3 (custom properties, grid, flexbox) | No framework needed; full control |
| Logic | Vanilla JavaScript (ES6+) | No build step; maintainable |
| Map | Leaflet.js (CDN) | Lightweight, free OSM tiles |
| Charts | Chart.js (CDN) | Simple API, attractive defaults |
| Icons | Lucide Icons (CDN SVG) | Clean, modern icon set |
| Fonts | Inter (Google Fonts CDN) | Professional, readable |

---

## 4. File Structure

```
dashboard/
├── index.html          # Single entry point
├── css/
│   ├── reset.css       # Minimal CSS reset
│   ├── variables.css   # Design tokens (colors, spacing, radii)
│   ├── layout.css      # Grid / flex layout scaffolding
│   ├── components.css  # Cards, badges, buttons, alerts
│   └── charts.css      # Chart container sizing
├── js/
│   ├── data/
│   │   └── mockData.js     # Static + simulated telemetry data
│   ├── map.js              # Leaflet map init, markers, popups
│   ├── charts.js           # Chart.js instances and update helpers
│   ├── fleet.js            # Fleet list rendering, vehicle selection
│   ├── telemetry.js        # Detail panel population, gauge updates
│   ├── alerts.js           # Alert generation and notification feed
│   └── main.js             # App bootstrap, simulation loop
└── assets/
    └── icons/              # Optional local SVGs (fallback)
```

---

## 5. Design System

### 5.1 Color Palette

```css
--color-bg-base:       #0a0d14;   /* Page background */
--color-bg-surface:    #111827;   /* Cards / panels */
--color-bg-elevated:   #1c2333;   /* Hover states, inputs */
--color-border:        #1e2d40;   /* Subtle borders */
--color-accent-cyan:   #00d4ff;   /* Primary accent, active states */
--color-accent-blue:   #3b82f6;   /* Secondary accent */
--color-accent-green:  #10b981;   /* Online / healthy */
--color-accent-amber:  #f59e0b;   /* Warning */
--color-accent-red:    #ef4444;   /* Critical / alert */
--color-text-primary:  #f1f5f9;   /* Headings */
--color-text-secondary:#94a3b8;   /* Labels, meta */
--color-text-muted:    #475569;   /* Placeholders */
```

### 5.2 Typography

- Font: **Inter** (weights 400, 500, 600, 700)
- Base size: `14px`
- Heading scale: `12px` label → `16px` card title → `24px` metric value → `32px` hero stat

### 5.3 Spacing & Radii

- Base unit: `4px`
- Card padding: `20px`
- Border radius — small: `6px`, medium: `12px`, large: `16px`

### 5.4 Shadows & Glow

- Card shadow: `0 4px 24px rgba(0,0,0,0.4)`
- Active/accent glow: `0 0 12px rgba(0,212,255,0.25)`

---

## 6. Layout Architecture

```
┌─────────────────────────────────────────────────────┐
│  HEADER — Logo | Dashboard Title | Time | Alerts    │
├──────────────┬──────────────────────┬───────────────┤
│              │                      │               │
│  FLEET LIST  │       MAP VIEW       │   TELEMETRY   │
│  (sidebar)   │    (center/main)     │   DETAIL      │
│              │                      │   (sidebar)   │
│  Vehicle     │  Leaflet interactive │               │
│  cards with  │  map with markers    │  Gauges +     │
│  status &    │  and tooltips        │  Trend charts │
│  key stats   │                      │               │
│              ├──────────────────────┤               │
│              │  KPI METRICS BAR     │               │
│              │  (fleet aggregates)  │               │
└──────────────┴──────────────────────┴───────────────┘
│  ALERT FEED — scrollable notification strip         │
└─────────────────────────────────────────────────────┘
```

**Responsive breakpoints:**
- `≥1280px`: Full three-column layout
- `768px–1279px`: Map full width; fleet list and telemetry panel collapse to tabs
- `<768px`: Single-column stack; map height reduced; tabs for sections

---

## 7. Mock Data Design (`mockData.js`)

### 7.1 Vehicle Object Shape

```js
{
  id: "VH-001",
  name: "Truck Alpha",
  type: "truck",            // truck | van | sedan
  driver: "J. Martinez",
  status: "online",         // online | idle | warning | offline
  location: { lat: 51.505, lng: -0.09 },
  telemetry: {
    speed: 72,              // km/h
    temperature: 87,        // °C (engine)
    battery: 84,            // % (EV or auxiliary)
    fuel: 61,               // %
    odometer: 142500,       // km
    rpm: 2200,
    heading: 245            // degrees
  },
  history: [                // Last 20 telemetry snapshots (1 per minute)
    { timestamp, speed, temperature, battery, fuel }
  ],
  alerts: [
    { id, severity, message, timestamp }
  ]
}
```

### 7.2 Fleet Composition (Mock)

| ID | Name | Type | Status |
|----|------|------|--------|
| VH-001 | Truck Alpha | Truck | Online |
| VH-002 | Van Bravo | Van | Warning |
| VH-003 | Sedan Charlie | Sedan | Idle |
| VH-004 | Truck Delta | Truck | Online |
| VH-005 | Van Echo | Van | Offline |

### 7.3 Simulation Loop

`main.js` runs `setInterval` every **3 seconds**:
- Randomly mutate `speed ±5`, `temperature ±2`, `battery -0.1`, `fuel -0.05`
- Push new snapshot to `history` (cap at 20 entries)
- Trigger alert generation if thresholds breached
- Re-render affected UI components

---

## 8. Components

### 8.1 Header

- Logo (SVG icon + text)
- Live UTC clock (updates every second)
- Fleet status summary pill: `4 Online · 1 Warning · 1 Offline`
- Alert bell with unread count badge

### 8.2 Fleet Sidebar (Left)

- Search/filter input
- Status filter tabs: All | Online | Warning | Offline
- Vehicle card per vehicle:
  - Status indicator dot (colored)
  - Vehicle name + type icon
  - Driver name
  - Speed | Battery | Fuel mini-metrics
  - Click → select vehicle and pan map

### 8.3 Map Panel (Center)

**Library:** Leaflet.js with OpenStreetMap tiles

- Custom marker icons per vehicle type; color reflects status
- Clicking a marker selects the vehicle (syncs with fleet sidebar and telemetry panel)
- Active vehicle marker has a pulsing glow ring (CSS animation)
- Popup on hover: vehicle name + speed + status
- "Fit all" button to reset map bounds

### 8.4 KPI Metrics Bar

Displayed beneath the map. Fleet-wide aggregates:

| Metric | Display |
|--------|---------|
| Active Vehicles | `4 / 5` |
| Avg Fleet Speed | `58 km/h` |
| Alerts (active) | `3` |
| Total Distance Today | `1,240 km` |

### 8.5 Telemetry Detail Panel (Right)

Shown when a vehicle is selected:

**Top section — Vehicle identity**
- Name, type, driver, status badge, last updated timestamp

**Gauge row (4 gauges)**
- Speed — arc gauge, 0–200 km/h
- Temperature — arc gauge, 0–150°C; amber >90°, red >110°
- Battery — arc gauge, 0–100%; amber <30%, red <15%
- Fuel — arc gauge, 0–100%; amber <25%, red <10%

> Gauges are drawn with the Canvas API or SVG arcs; no third-party gauge library required.

**Trend charts (Chart.js)**
- Speed over time — line chart, cyan fill
- Temperature over time — line chart, amber fill
- Battery & Fuel combined — dual-line chart

**Vehicle details table**
- Odometer, RPM, Heading, Coordinates

### 8.6 Alert Feed (Bottom Strip)

- Horizontally scrollable row of alert cards
- Severity color: info (blue), warning (amber), critical (red)
- Each card: severity icon | message | vehicle name | time ago
- Dismiss button per alert
- New alerts animate in from the right

---

## 9. Interactivity Specification

| Trigger | Action |
|---------|--------|
| Click vehicle card (sidebar) | Select vehicle; pan + zoom map to marker; update telemetry panel |
| Click map marker | Same as clicking vehicle card |
| Filter tab change | Filter fleet list; map markers remain visible but dimmed |
| Search input | Live filter vehicle list by name or driver |
| Dismiss alert | Remove from feed; decrement badge count |
| Simulation tick (3s) | Update telemetry values; refresh charts; move markers slightly; check thresholds |

---

## 10. Alert Logic (`alerts.js`)

| Condition | Severity | Message |
|-----------|----------|---------|
| Temperature > 110°C | Critical | "Engine overheating — immediate attention required" |
| Temperature > 90°C | Warning | "Engine temperature elevated" |
| Fuel < 10% | Critical | "Fuel critically low" |
| Fuel < 25% | Warning | "Fuel level low" |
| Battery < 15% | Critical | "Battery critically low" |
| Battery < 30% | Warning | "Battery level low" |
| Vehicle offline > 5 min | Warning | "Vehicle has lost connectivity" |
| Speed > 120 km/h | Warning | "Speed limit exceeded" |

---

## 11. CSS Architecture Notes

- Use **CSS custom properties** for all design tokens — no hard-coded values in component styles.
- Use **CSS Grid** for the top-level three-column layout.
- Use **Flexbox** for card interiors and metric rows.
- **No CSS framework** (no Bootstrap, Tailwind) — keeps the bundle minimal and the aesthetic fully custom.
- Animations: subtle `transition` on hover (150ms ease), pulsing glow on active marker (keyframe), slide-in for alert cards.
- `scrollbar-width: thin` + custom scrollbar colors for all overflow containers.

---

## 12. JavaScript Architecture Notes

- **No module bundler** — load scripts in order via `<script>` tags (data → map → charts → fleet → telemetry → alerts → main).
- Use a simple **pub/sub pattern** (`EventEmitter` ~20 lines) to decouple selection changes from UI updates.
- All DOM queries cached on init; no repeated `querySelector` in render loops.
- Chart instances stored in a module-level object; call `.update()` rather than recreating on each tick.
- Leaflet marker positions updated via `.setLatLng()` — no full map re-render.

---

## 13. Build Sequence (Implementation Order)

| Phase | Tasks |
|-------|-------|
| **1 — Foundation** | `index.html` skeleton; `reset.css`; `variables.css`; Google Fonts + CDN links |
| **2 — Layout** | `layout.css` three-column grid; header; responsive breakpoints |
| **3 — Mock Data** | `mockData.js` with 5 vehicles, history arrays, alert seeds |
| **4 — Map** | `map.js`: Leaflet init, markers, popups, selection sync |
| **5 — Fleet Sidebar** | `fleet.js`: vehicle cards, search, filter tabs |
| **6 — KPI Bar** | Static metric row populated from mock data aggregates |
| **7 — Telemetry Panel** | `telemetry.js`: identity block, SVG arc gauges, detail table |
| **8 — Charts** | `charts.js`: speed, temperature, battery/fuel Chart.js instances |
| **9 — Alerts** | `alerts.js`: alert feed rendering, threshold checks, dismiss logic |
| **10 — Simulation** | `main.js`: tick loop, data mutation, UI refresh, alert generation |
| **11 — Polish** | Animations, hover states, responsive adjustments, scrollbar styling |

---

## 14. Accessibility & Quality Notes

- All interactive elements keyboard-accessible (tab order, focus rings styled with accent color).
- Color is never the sole indicator — status badges include text labels.
- Charts include `aria-label` attributes.
- Use `prefers-reduced-motion` media query to disable animations for users who need it.
- Target Lighthouse Performance ≥ 90 (single HTML file, CDN assets only, no large bundles).

---

## 15. Deliverable

A single `dashboard/` folder that can be opened directly in a browser (`index.html`) with no build step, no server, and no dependencies beyond CDN-loaded libraries. The dashboard auto-simulates live telemetry updates, is fully interactive, and presents a professional dark-futuristic fleet monitoring experience.
