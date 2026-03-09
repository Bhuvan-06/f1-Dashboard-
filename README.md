# 🏎 F1 Strategy Intelligence Engine

A fully interactive Formula 1 data dashboard built as a single React component. It covers every driver and season from **2019–2025** with analytics tools, AI-powered features, mini-games, and rich visualisations — all in one ~4,400-line JSX file.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [How to Run](#2-how-to-run)
3. [File Structure](#3-file-structure)
4. [Design System](#4-design-system)
5. [Data Layer](#5-data-layer)
6. [Shared UI Components](#6-shared-ui-components)
7. [Pages & Features](#7-pages--features)
   - [AI Oracle](#ai-oracle)
   - [Driver Hub](#driver-hub)
   - [Analytics](#analytics)
   - [Games](#games)
   - [Standings](#standings)
   - [Teams](#teams)
   - [ML Models](#ml-models)
8. [Easter Eggs](#8-easter-eggs)
9. [How to Add a New Driver](#9-how-to-add-a-new-driver)
10. [How to Add a New Season](#10-how-to-add-a-new-season)
11. [How to Add a New Feature / Page](#11-how-to-add-a-new-feature--page)
12. [How the AI (Claude) Integration Works](#12-how-the-ai-claude-integration-works)
13. [Persistent Storage](#13-persistent-storage)
14. [Dependencies](#14-dependencies)

---

## 1. Project Overview

This is a **single-file React application** (`F1Dashboard.jsx`). Everything — data, styles, components, logic — lives in one file. There is no backend, no database, and no build process required beyond what Claude.ai's artifact runner (or any standard React environment) provides.

**Key design decisions:**
- All data is hardcoded JavaScript objects. No API calls for stats.
- AI features use the Anthropic Claude API directly from the browser.
- Visuals (driver helmets, circuit maps) are pure SVG — no image hosting needed.
- Persistent data (prediction leaderboard) uses a key-value storage API (`window.storage`).

---

## 2. How to Run

### In Claude.ai (current setup)
Paste the full JSX into a Claude artifact and it runs immediately. No setup needed.

### Standalone (Vite / Create React App)
```bash
npm create vite@latest f1-dashboard -- --template react
cd f1-dashboard
npm install recharts
# Replace src/App.jsx content with F1Dashboard.jsx content
npm run dev
```

### GitHub Pages
1. Push the project to a GitHub repo
2. Run the Vite build: `npm run build`
3. Deploy the `dist/` folder to GitHub Pages via the repo settings

---

## 3. File Structure

The single file is organised in this top-to-bottom order:

```
F1Dashboard.jsx
│
├── IMPORTS                     Lines 1–8      React hooks + Recharts chart components
├── GLOBAL STYLES               Lines 13–46    Google Fonts, CSS animations, scrollbar
├── DESIGN TOKENS (C)           Lines 51–58    All colours, font families
├── TEAM COLORS                 Lines 60–66    Team name → hex colour map
│
├── DATA LAYER
│   ├── DRIVERS array           Lines 71–273   All 20 drivers with full stats
│   ├── SEASONS array           Line 274       [2019, 2020, 2021, 2022, 2023, 2024, 2025]
│   ├── CIRCUITS array          Lines 276–284  23 circuit names
│   └── Helper functions        Lines 285–292  sv(), totalPts(), totalWins(), totalPods()
│
├── SHARED UI COMPONENTS        Lines 297–407
│   ├── Pill                    Tag/badge component
│   ├── GCard                   Glass card with hover glow
│   ├── ChartTip                Recharts tooltip
│   ├── PageHead                Page title + subtitle
│   ├── TabBar                  Sub-navigation tab strip
│   ├── Spinner                 Loading spinner
│   ├── AiBox                   AI response display box
│   └── SliderRow               Labelled range slider
│
├── DRIVER VISUALS
│   ├── HELMET_DESIGNS          Lines 414–477  SVG helmet config per driver
│   ├── DriverPhoto             Lines 478–565  Renders inline SVG helmet portrait
│   └── CircuitSVG              Lines 565–752  Renders SVG circuit map
│
├── FILTER BAR                  Lines 756–836  Driver search/filter UI
│
├── PAGE COMPONENTS
│   ├── AIOracle()              Lines 855–1582  7 AI-powered tabs
│   ├── DriverHub()             Lines 1583–2025 5 views of driver data
│   ├── StandingsPage()         Lines 2026–2096 Championship table
│   ├── TeamsPage()             Lines 2097–2198 Constructor analysis
│   ├── ModelsPage()            Lines 2199–2417 ML model showcase
│   ├── AnalyticsPage()         Lines 2418–3305 4 interactive analytics tools
│   └── GamesPage()             Lines 3306–4317 4 interactive games
│
├── EASTER EGGS                 Lines 2290–2370 Konami code, SENNA, pit game
├── TABS config                 Lines 4308–4316 Main nav tab definitions
└── App() root                  Lines 4318–4439 Root component + nav + header + footer
```

---

## 4. Design System

All colours and fonts are defined once in the `C` object (line 51) and used everywhere:

```js
const C = {
  // Backgrounds (darkest to lightest)
  bg: "#050509",    // page background
  s0: "#08080f",    // deepest surface (AI response boxes)
  s1: "#0d0d18",    // card inner sections, filter bars
  s2: "#121220",    // input fields, selects
  card: "#0e0e1c",  // GCard background

  // Borders
  border: "rgba(255,255,255,.07)",    // default subtle border
  borderHi: "rgba(255,255,255,.13)",  // hovered card border

  // Accent colours
  red: "#e8002d",    // Ferrari red — primary actions, alerts
  gold: "#f0a030",   // Analytics section, championship gold
  cyan: "#00d4ff",   // Debrief, data highlights
  green: "#34d399",  // Games section, success states
  violet: "#a78bfa", // AI Oracle, predictions
  pink: "#f472b6",   // Occasional accent

  // Text
  text: "#f0f0f6",   // primary text
  dim: "#8890a8",    // secondary text
  muted: "#3d4158",  // labels, placeholders

  // Font families (referenced in style props)
  fn:   "'DM Sans', sans-serif",      // body text
  disp: "'Orbitron', monospace",      // display / numbers
  mono: "'DM Mono', monospace",       // labels, codes, data
};
```

**To change the colour scheme:** update values in `C`. Everything throughout the app inherits from here automatically.

Team colours live in `TEAM_COLORS` (line 60) and are accessed via the helper `tc(teamName)`.

**Animations** are defined as CSS keyframes in `GlobalStyles` (line 13):
- `fadeUp` — page sections entering from below
- `cardIn` — driver cards staggered entrance
- `popIn` — modal/toast spring pop
- `pulse` — the live indicator dot and loading dots
- `spin` — spinner and the logo ring
- `glow` — red glow pulse on special elements

---

## 5. Data Layer

### DRIVERS array (line 71)

Each driver is one object in the `DRIVERS` array. Here is the full schema:

```js
{
  code:     "VER",              // 3-letter code used as ID everywhere
  name:     "Max Verstappen",   // Full display name
  team:     "Red Bull",         // Current team — must match a key in TEAM_COLORS
  nat:      "NL",               // ISO 2-letter nationality
  num:      1,                  // Race number
  age:      27,                 // Age (update each season)
  starts:   182,                // Total career race starts

  // Skill ratings out of 100 — used in radar charts, AI prompts, and comparisons
  pace:     98,   // outright single-lap speed
  craft:    97,   // race craft / wheel-to-wheel ability
  cons:     96,   // consistency and error rate
  wet:      92,   // wet weather performance
  quali:    97,   // qualifying performance

  // Season-by-season stats — add a new key each year
  pts:     { 2019:278, 2020:214, 2021:395, 2022:454, 2023:575, 2024:437, 2025:429 },
  wins:    { 2019:3,   2020:2,   2021:10,  2022:15,  2023:19,  2024:9,   2025:10  },
  poles:   { 2019:2,   2020:3,   2021:10,  2022:14,  2023:12,  2024:9,   2025:8   },
  podiums: { 2019:9,   2020:11,  2021:18,  2022:17,  2023:21,  2024:14,  2025:16  },
  dnfs:    { 2019:3,   2020:2,   2021:4,   2022:3,   2023:2,   2024:3,   2025:2   },

  avgGrid:   1.8,  // average qualifying position (career)
  avgFin:    2.1,  // average finishing position (career)
  lapTime:   90.2, // representative average lap time in seconds
  qualiGap:  0.00, // qualifying gap to pole in seconds (0 = the benchmark)

  bio:    "Redefining the limits...",          // Short bio shown in cards
  secret: "Owns 47 racing simulators..."      // Revealed after clicking card 3×
}
```

### Helper functions (line 285)

```js
// Get a stat value for a driver in a given season
// season = "All" returns career total, season = "2024" returns that year
sv(driver, fieldName, season)

// Shortcuts
totalPts(driver)   // career points sum
totalWins(driver)  // career wins sum
totalPods(driver)  // career podiums sum
```

### SEASONS array (line 274)
```js
const SEASONS = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
```
This powers all season selector dropdowns. Add a new year here and it appears everywhere automatically.

### CIRCUITS array (line 276)
23 circuits used in the Race Predictor dropdown, Strategy Advisor, and Lap Challenge. To add a circuit, append it to this array.

---

## 6. Shared UI Components

These are small building blocks used across every page.

### `<Pill label="McLaren" color="#FF8000" sm />`
A small coloured badge/tag. `sm` makes it smaller. Used for team names, stats, flags.

### `<GCard accent={color} noHover>`
The glass card container used for every data panel. 
- `accent` — sets the glow colour on hover (usually the team colour)
- `noHover` — disables the lift and glow animation (use for static info panels)

### `<TabBar tabs={[["id","Label"],...]} active={sub} setActive={setSub} />`
The pill-style sub-navigation strip inside each page. Pass an array of `[id, displayLabel]` pairs.

### `<AiBox text={result} loading={isLoading} color={C.violet} />`
Displays AI-generated text with a coloured left border and header. Shows a spinner while loading. Renders nothing if both `text` and `loading` are falsy.

### `<SliderRow label="Lap: 28/58" value={lap} setValue={setLap} min={1} max={57} color={C.gold} fmt={v => \`Lap \${v}\`} />`
A labelled range slider. `fmt` formats the displayed value.

### `<DriverPhoto code="VER" team="Red Bull" size={110} tall />`
Renders an inline SVG helmet portrait. `tall` makes it taller than wide (aspect 1:1.35). Uses design data from `HELMET_DESIGNS`. No external images — always renders.

### `<CircuitSVG circuit="Monaco" size={280} active={false} />`
Renders an SVG circuit map with sector colours, DRS zones, corner labels, and a start/finish marker. Available circuits: `Bahrain`, `Monaco`, `Silverstone`, `Monza`, `Spa`, `Suzuka`.

---

## 7. Pages & Features

The root `App()` component maintains 3 pieces of global state passed down to pages:
- `tab` — which main page is active
- `selected` — array of driver codes currently "selected" (used in Hub and Standings)
- `season` — the active season filter (`"All"` or `"2024"` etc.)

---

### AI Oracle

**File location:** `function AIOracle()` — line 855

7 tabs, each powered by a direct call to the Claude API:

| Tab | What it does | Key state |
|-----|-------------|-----------|
| 🏁 Predictor | Predicts top-5 for a chosen circuit using driver form | `circuit`, `predResult` |
| 🔧 Strategy | Pit wall strategy call given lap/tyre/position data | `stratDriver`, `lapNum`, `tyreAge`, `weather`, `position` |
| 📋 Driver Report | Scouting report for any driver | `scoutCode`, `scoutResult` |
| 💬 Ask Anything | Natural language Q&A against the full driver database | `question`, `qaResult` |
| 📻 Race Radio | Live multi-turn chat: you = engineer, Claude = driver | `radioMessages`, `radioStarted` |
| 💼 Transfers | Transfer rumour + salary + negotiation analysis | `contractDriver`, `contractTeam`, `contractResult` |
| 🗂️ Debrief | Post-race debrief from a team's TP perspective | `debriefRace`, `debriefTeam`, `debriefResult` |

**How AI calls work:** see [Section 12](#12-how-the-ai-claude-integration-works).

**To add a new AI tool:**
1. Add `useState` variables for its inputs and output
2. Write an `async run___()` function that builds a prompt and calls `callClaude(prompt)`
3. Add a `["newtool", "🔮 New Tool"]` entry to the `tabs` array inside `AIOracle`
4. Add a `{tab === "newtool" && (...)}` render block

---

### Driver Hub

**File location:** `function DriverHub()` — line 1583

5 view modes selectable by a toggle strip:

| View | Description |
|------|-------------|
| Grid | Cards for each driver with helmet, stats, radar chart, secret stat |
| Compare | Pick 2 drivers, see side-by-side metric bars, radar overlay |
| Table | Sortable data table of all drivers |
| Scatter | 2D scatter plot — any metric on X vs Y axis |
| Trends | Line chart of season-by-season points for selected drivers |

**Secret stats:** each driver card tracks clicks in `reveals` state. At 3 clicks, `d.secret` is revealed with a `popIn` animation.

---

### Analytics

**File location:** `function AnalyticsPage()` — line 2418

4 sub-tools:

| Tool | What it does |
|------|-------------|
| What-If Simulator | Team pace multiplier sliders (50–150%) change a live simulated championship table. Preset scenarios included. |
| Points Swing | Calculates championship points lost to DNFs. Shows alternate standings if every retirement had scored P7–P8 points instead. |
| Teammate Battle | 13 curated teammate pairs. 10 head-to-head metrics with dual progress bars + seasonal points chart. |
| Tyre Matrix | 23×5 heatmap (circuit × compound) showing performance scores. Click any row for a circuit detail card with SVG map. |

**Key data for Teammate Battle:** `TEAMMATE_PAIRS` array (line 2402). Each entry: `{ a: "VER", b: "PER", team: "Red Bull" }`.

**Key data for Tyre Matrix:** `TYRE_MATRIX` (auto-generated from `CIRCUITS_LIST` using seeded pseudo-random values for stability).

---

### Games

**File location:** `function GamesPage()` — line 3306

4 games:

| Game | How it works |
|------|-------------|
| Fantasy Draft | Pick up to 5 drivers within a £100M budget. Budget tiers based on career points. Score = combined season points. |
| Driver Quiz | 15-question bank, 10 drawn randomly per session. Multiple choice with hints. Graded at the end. |
| Prediction Leaderboard | Submit P1/P2/P3 podium predictions for 8 races. Scored against hardcoded 2025 actual results. Leaderboard is **shared** via persistent storage. |
| Lap Time Challenge | Pick circuit + driver. React to green lights sector-by-sector. Time is compared to a target. Colour-coded: purple/green/yellow/red. |

**Quiz questions** live in `QUIZ_BANK` (line 3259). Each entry: `{ q: "question text", opts: ["A","B","C","D"], a: "correct answer", hint: "hint text" }`.

**Lap Challenge circuit data** lives in `SECTOR_PROFILES` (line 3296). Each entry: `{ s1: [baseTime, spread], s2: [...], s3: [...] }`.

**Actual race results for scoring** are hardcoded in `ACTUAL_RESULTS` inside `GamesPage`. Update these at the start of each season.

---

### Standings

**File location:** `function StandingsPage()` — line 2026

A championship standings table that respects the active season and driver selection filters. Sortable. Shows position, team colour bar, points, wins, podiums.

---

### Teams

**File location:** `function TeamsPage()` — line 2097

Constructor-level stats: aggregates driver data by team. Shows team colour, combined points, driver roster, and a bar chart.

---

### ML Models

**File location:** `function ModelsPage()` — line 2199

A showcase of simulated machine learning model outputs (no real ML running in-browser). Includes:
- Predicted championship standings with confidence intervals
- Feature importance charts
- Model accuracy indicators

This page is **entirely cosmetic / portfolio content** — the numbers are static. To connect it to real ML output, replace the hardcoded data with API calls to your own model endpoints.

---

## 8. Easter Eggs

Three hidden features activated by user interaction:

| Trigger | What happens | Code location |
|---------|-------------|--------------|
| Konami code: ↑↑↓↓←→←→BA | DRS Gate modal opens — a visual "DRS activated" celebration | `EGG_KONAMI`, `DRSGate` component |
| Type the word `SENNA` anywhere | Senna tribute modal with a quote | `typedRef`, `SennaModal` component |
| Click the F1 logo in the header 7 times | Pit stop reaction mini-game launches | `logoTaps`, `PitReaction` component |

The footer has a tiny hint: `🕹 ↑↑↓↓←→←→BA · type SENNA · click logo 7×`

---

## 9. How to Add a New Driver

Find the `DRIVERS` array (line 71) and add a new object following this template:

```js
{ 
  code: "HAD",                          // unique 3-letter code
  name: "Isack Hadjar",
  team: "RB",                           // must exactly match a TEAM_COLORS key
  nat: "FR",
  num: 6,
  age: 20,
  starts: 22,
  pace: 84, craft: 80, cons: 78, wet: 77, quali: 86,
  pts:     { 2025: 58 },                // add 0 for years before their debut
  wins:    { 2025: 0 },
  poles:   { 2025: 0 },
  podiums: { 2025: 1 },
  dnfs:    { 2025: 3 },
  avgGrid: 10.2, avgFin: 11.4, lapTime: 92.1, qualiGap: 0.61,
  bio: "One to watch.",
  secret: "Hidden stat here 🔒"
},
```

Then add their helmet design to `HELMET_DESIGNS` (line 414):

```js
HAD: { 
  dome: "#001133", visor: "#3366ff", stripe: "#ff6600", accent: "#ffffff", flag: "🇫🇷",
  stripes: [
    { x:16, y:55, w:68, h:7, rx:3, c:"#ff6600" },
    { x:22, y:45, w:56, h:4, rx:2, c:"#ffffff" }
  ],
  motif: "curve"   // options: "angular","curve","chevron","zigzag","wave","line"
},
```

That's it. The driver will appear in every page, chart, dropdown, and AI prompt automatically.

---

## 10. How to Add a New Season

**Step 1** — Add the year to `SEASONS`:
```js
const SEASONS = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]; // add 2026
```

**Step 2** — Add 2026 stats to every driver's objects:
```js
pts:     { ...existing..., 2026: 0 },
wins:    { ...existing..., 2026: 0 },
poles:   { ...existing..., 2026: 0 },
podiums: { ...existing..., 2026: 0 },
dnfs:    { ...existing..., 2026: 0 },
```

Fill these in as the season progresses. The season selector, charts, standings, and all analytics tools update automatically.

**Step 3** — Update `ACTUAL_RESULTS` in `GamesPage` for the prediction scoring (add 2026 races when they're complete).

**Step 4** — Update driver `age`, `starts`, `team`, and career averages (`avgGrid`, `avgFin`) at the start of each season.

---

## 11. How to Add a New Feature / Page

### Adding a new page to the main nav

**Step 1** — Write your page as a function component:
```js
function MyNewPage({ season, setSeason }) {
  return (
    <div>
      <PageHead title="MY PAGE" sub="Description here" color={C.cyan} />
      {/* your content */}
    </div>
  );
}
```

**Step 2** — Add it to the `TABS` array (line 4308):
```js
const TABS = [
  ...existing tabs...,
  { id: "mypage", label: "🔮 My Page" },
];
```

**Step 3** — Add it to the `pages` object in `App()` (line 4348):
```js
const pages = {
  ...existing pages...,
  mypage: <MyNewPage season={season} setSeason={setSeason} />,
};
```

Done. It will appear in the nav and render when clicked.

### Adding a sub-tool to an existing page

Each page uses `const [sub, setSub] = useState("defaulttab")` and a `<TabBar>` for internal navigation. To add a new tool to e.g. Analytics:

1. Add `["newtool", "🔧 New Tool"]` to the `tabs` prop of that page's `<TabBar>`
2. Add your state variables and logic inside `AnalyticsPage`
3. Add a `{sub === "newtool" && (...)}` render block at the bottom of that page

---

## 12. How the AI (Claude) Integration Works

All AI features use a single async helper function:

```js
async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",  // always use the latest Sonnet model
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.find(b => b.type === "text")?.text || "No response received.";
}
```

**The Race Radio Simulator** is different — it's a multi-turn conversation so it calls the API directly (not via `callClaude`) and passes the full `messages` array history plus a `system` prompt that sets the driver's character.

**To change which Claude model is used:** find the `model:` field in both `callClaude` and the Radio's inline `fetch` call. Update both to the same model string.

**The prompt engineering pattern used throughout:**
- Give Claude a specific role ("You are a senior F1 strategist")
- Inject live data from the `DRIVERS` array into the prompt as structured text
- Specify exact output format ("Write exactly 3 paragraphs", "Numbered 1–5")
- Set tone constraints ("No hedging", "Under 220 words")

To improve any AI output, find the `prompt` template string inside the relevant `run___()` function and edit it.

---

## 13. Persistent Storage

The Prediction Leaderboard is the only feature that saves data between sessions. It uses `window.storage` — a key-value API provided by the Claude.ai artifact environment:

```js
// Save (shared = true means all visitors can see it)
await window.storage.set("f1_predictions_v2", JSON.stringify(data), true);

// Load
const result = await window.storage.get("f1_predictions_v2", true);
const data = result ? JSON.parse(result.value) : [];

// Delete one entry
await window.storage.set("f1_predictions_v2", JSON.stringify(updatedArray), true);
```

**If deploying outside Claude.ai:** replace `window.storage` calls with `localStorage`, a database, or any key-value store of your choice. The logic is identical — just swap the API calls.

---

## 14. Dependencies

Everything is declared in the import at the top of the file.

| Dependency | Used for | Version |
|-----------|---------|---------|
| `react` | Core UI framework | via artifact runner |
| `recharts` | All charts (bar, area, radar, scatter, line) | via artifact runner |
| Google Fonts | Orbitron (display), DM Sans (body), DM Mono (mono) | loaded via CSS @import |
| Anthropic Claude API | All AI features | `claude-sonnet-4-20250514` |

No `package.json` is needed in the Claude.ai environment. If running standalone, install:
```bash
npm install react react-dom recharts
```

---

## Changelog

| Version | What was added |
|---------|---------------|
| v1 | Initial dashboard — driver cards, standings, basic charts |
| v2 | Interactive comparisons, scatter plots, trends view |
| v3 | Apple-inspired design overhaul, easter eggs, dark theme |
| v4 | AI Oracle (Race Predictor, Strategy Advisor, Driver Scout, Q&A) |
| v5 | Analytics page (What-If, Swing, Teammate Battle, Tyre Matrix) + Games page (Fantasy, Quiz, Predictions, Lap Challenge) |
| v6 | SVG driver helmets, SVG circuit maps, Compare view photo banners |
| v7 | Race Radio Simulator, Contract Negotiator, Post-Race Debrief added to AI Oracle |
