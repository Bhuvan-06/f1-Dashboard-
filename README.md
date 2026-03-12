# 🏎 F1 Intelligence Dashboard

> A full-stack-quality Formula 1 analytics platform built entirely in the browser — real driver photos, live Claude AI analysis, 7 seasons of historical data, and interactive games.

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat&logo=vite&logoColor=white)
![Claude AI](https://img.shields.io/badge/Claude-AI-D97706?style=flat&logo=anthropic&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-3-22D3EE?style=flat)
![CI](https://img.shields.io/github/actions/workflow/status/YOUR_USERNAME/f1-dashboard/ci.yml?label=CI&style=flat)

---

## What it is

A **single-page React application** covering every Formula 1 driver and season from **2019–2025**. It features 7 full feature pages, 7 live Claude-powered AI tools, 8 chart types, 4 interactive games, and a season-aware data system that correctly tracks every driver's team history — all with no backend server.

Built as a portfolio project to demonstrate React architecture, data visualisation, AI API integration, and attention to UX detail.

---

## Live Demo

🔗 **[View Live →](https://YOUR_USERNAME.github.io/f1-dashboard)**

> Use the demo account to log in instantly:
> **Email:** `demo@flintel.com` · **Password:** `f1demo`
> Or click **Continue as Guest**

---

## Features at a Glance

| Section | What's inside |
|---|---|
| 🤖 **AI Oracle** | 7 Claude-powered tools — race predictor, strategy advisor, driver scout, Q&A, race radio, contract simulator, team debrief |
| 🏎 **Driver Hub** | Grid, table, compare, scatter, and trends views across all 20 drivers |
| 📊 **Analytics** | What-if simulator, points swing analysis, teammate battles, tyre compound matrix |
| 🎮 **Games** | Fantasy draft, F1 quiz, podium predictor, real-time lap simulator |
| 🏆 **Standings** | Season championship table — filterable by team, season, and metric |
| 🔧 **Constructors** | Team-level stats with season-accurate driver rosters |
| 🧠 **ML Models** | Gradient Boosting (AUC 0.947), Random Forest (AUC 0.929), Ridge Regression (R² 0.9998), K-Means strategy clusters |

---

## Tech Stack

```
React 19        — UI framework
Vite 7          — build tool + dev server
Recharts 3      — 8 chart types (area, bar, radar, scatter, line, composed, heatmap, real-time)
Claude API      — live AI for all 7 Oracle tools
localStorage    — auth + session persistence (no backend)
GitHub Actions  — CI pipeline (lint + build on every push)
F1 CDN          — official Formula 1 Cloudinary driver photos
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- An [Anthropic API key](https://console.anthropic.com/) *(for AI features only)*

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/f1-dashboard.git
cd f1-dashboard

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build at localhost:4173
```

### Lint

```bash
npm run lint
```

---

## Project Structure

```
f1-dashboard/
├── src/
│   ├── F1Dashboard.jsx    # Main app — all 7 pages, data, components (~4,400 lines)
│   ├── AuthPage.jsx       # Login / sign up screen
│   └── main.jsx           # Root — auth state, session restore, toast notifications
├── .github/
│   └── workflows/
│       └── ci.yml         # GitHub Actions: lint + build on every push/PR
├── .vscode/
│   ├── settings.json      # Format on save, ESLint auto-fix
│   └── extensions.json    # Recommended extensions
├── public/
├── index.html
├── vite.config.js
├── eslint.config.js
└── package.json
```

---

## Architecture

The app is a **single-file React architecture** — all 7 pages, shared components, and data live in `F1Dashboard.jsx`. This was an intentional design choice to keep the project portable and self-contained.

### Data Layer

All driver statistics are hardcoded JavaScript — no external API calls for data. This makes the app fully offline-capable after first load (except for AI features and driver photos).

```js
// Every driver follows this schema
{
  code: "HAM",  name: "Lewis Hamilton",  team: "Ferrari",
  nat: "GB",    num: 44,                 age: 40,
  pace: 94,  craft: 98,  cons: 97,  wet: 99,  quali: 94,   // skill ratings /100
  pts:     { 2019:413, 2020:347, 2021:387, 2022:240, 2023:234, 2024:272, 2025:290 },
  wins:    { 2019:11,  2020:11,  2021:8,   2022:0,   2023:1,   2024:1,   2025:2   },
  podiums: { 2019:17,  2020:16,  2021:17,  2022:7,   2023:9,   2024:11,  2025:10  },
  // + poles, dnfs, bio, hidden secret stat...
}
```

### Season-Aware System

The most technically complex feature. Every photo, team colour, team name, filter, and constructor grouping is **historically accurate** per selected season.

- **2024 selected** → Hamilton appears in Mercedes silver, grouped under Mercedes, with his 2024 Mercedes CDN photo
- **2025 selected** → Hamilton appears in Ferrari red, grouped under Ferrari, with his 2025 Ferrari photo

This is powered by three data structures and two resolver functions:

```js
// Team override map — only entries that differ from the driver's current team
const DRIVER_TEAMS_BY_YEAR = {
  HAM: { 2019:"Mercedes", 2020:"Mercedes", ..., 2024:"Mercedes" }, // current = Ferrari
  SAI: { 2019:"McLaren",  2020:"McLaren",  2021:"Ferrari", ..., 2024:"Ferrari" }, // current = Williams
  BOT: { 2019:"Mercedes", ..., 2021:"Mercedes", 2022:"Alfa Romeo", 2023:"Alfa Romeo" }, // current = Sauber
  // + 7 more drivers
};

// 31 CDN photo URLs keyed "CODE_TEAM"
const DRIVER_PHOTO_MAP = {
  "HAM_Mercedes": F1_CDN_YEAR(2024, "mercedes", "lewham01"),
  "HAM_Ferrari":  F1_CDN_YEAR(2025, "ferrari",  "lewham01"),
  // ...
};

// Resolvers
const driverSeasonTeam = (code, season) => { /* returns correct team for any year */ };
const getDriverPhoto   = (code, season) => { /* returns correct CDN URL for any year */ };
```

15 component locations across 5 pages consume this system.

### Design System

All colours and typography tokens live in one `C` object — change a value there and it updates everywhere:

```js
const C = {
  bg: "#050509",      // page background
  card: "#0e0e1c",    // card surface
  red: "#e8002d",     // primary accent (F1 red)
  gold: "#f0a030",    // championship gold
  cyan: "#00d4ff",    // data highlights
  violet: "#a78bfa",  // AI features
  text: "#f0f0f6",    // primary text
  disp: "'Orbitron', monospace",  // display / numbers font
  mono: "'DM Mono', monospace",   // data / labels font
};
```

---

## AI Integration

All 7 AI Oracle tools make **live calls to the Claude API** directly from the browser.

```js
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  }),
});
```

**Prompt engineering pattern used throughout:**
- Inject live driver database stats into each prompt as structured text
- Assign Claude a specific expert role ("You are a senior F1 strategist...")
- Constrain output format and length precisely
- The **Race Radio** tool is a multi-turn conversation with a system prompt that defines the driver's character and personality

---

## Authentication

localStorage-based auth with no backend required. Users are stored as JSON in `f1_users`, active sessions in `f1_session`. The `Root` component in `main.jsx` handles session restore on page load, login/logout state, and toast notifications.

---

## Driver Photos

Photos are served from the **official Formula 1 Cloudinary CDN** — the same source as F1's own website.

```
https://media.formula1.com/image/upload/c_lfill,w_220/q_auto/
  d_common:f1:{YEAR}:fallback:driver:{YEAR}fallbackdriverright.webp/
  v1740000000/common/f1/{YEAR}/{TEAM}/{SLUG}/{YEAR}{TEAM}{SLUG}right.webp
```

The `d_` fallback parameter means the CDN automatically serves a generic silhouette if no specific photo exists — so no URL ever 404s. If a photo fails to load entirely, an SVG helmet portrait renders in the driver's team colours as a final fallback.

---

## Easter Eggs

| Trigger | What happens |
|---|---|
| Konami code `↑↑↓↓←→←→BA` | Full-screen "DRS OPEN" celebration overlay |
| Type the word `SENNA` | Ayrton Senna tribute modal with a famous quote |
| Click the F1 logo 7× | Pit lane reaction-time mini-game |

*Hint in the footer: `🕹 ↑↑↓↓←→←→BA · type SENNA · click logo 7×`*

---

## How to Extend

### Add a new driver

1. Add an object to the `DRIVERS` array following the schema above
2. Add their helmet design to `HELMET_DESIGNS` (dome colour, visor, stripes)
3. Add their photo URL(s) to `DRIVER_PHOTO_MAP`
4. If they've changed teams historically, add overrides to `DRIVER_TEAMS_BY_YEAR`

The driver will appear across every page, chart, AI prompt, and dropdown automatically.

### Add a new season

1. Append the year to `const SEASONS = [...]`
2. Add the new year's key to every driver's `pts`, `wins`, `poles`, `podiums`, `dnfs` objects
3. Update each driver's `team`, `age`, and `starts`

### Add a new page

```js
// 1. Write a function component
function MyPage({ season, setSeason }) {
  return <div><PageHead title="MY PAGE" sub="Description" /></div>;
}

// 2. Add a tab entry
{ id: "mypage", label: "🔮 My Page" }

// 3. Register in the pages map
mypage: <MyPage season={season} setSeason={setSeason} />
```

---

## CI/CD

GitHub Actions runs on every push and pull request to `main`:

```yaml
steps:
  - npm ci
  - npm run lint    # must pass with 0 errors
  - npm run build   # must succeed
```

---

## Deploy to GitHub Pages

```bash
# 1. Install the deploy tool
npm install --save-dev gh-pages

# 2. Add to package.json scripts:
#    "predeploy": "npm run build",
#    "deploy": "gh-pages -d dist"

# 3. Add base to vite.config.js:
#    base: '/f1-dashboard/'

# 4. Deploy
npm run deploy
```

Live at `https://YOUR_USERNAME.github.io/f1-dashboard` within ~2 minutes.

---

## Changelog

| Version | What was added |
|---|---|
| v1.0 | Initial dashboard — driver cards, standings, basic charts |
| v2.0 | Analytics page (What-If, Swing, Teammate Battle, Tyre Matrix) |
| v3.0 | AI Oracle — Race Predictor, Strategy, Scout Report, Q&A, Race Radio, Transfers, Debrief |
| v4.0 | Games page — Fantasy Draft, Quiz, Podium Predictor, Lap Time Simulator |
| v4.1 | Login / signup system with F1-themed auth page and toast notifications |
| v4.2 | Real driver photos from official F1 CDN replacing SVG helmets |
| v4.3 | Season-aware team history — correct photos, colours, and constructor stats per year |

---

## License

MIT © 2025 — free to use, fork, and build on.

---

<div align="center">
  <sub>Built with React · Recharts · Claude AI · Vite · ❤️ for Formula 1</sub>
</div>
