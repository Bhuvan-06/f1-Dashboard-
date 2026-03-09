import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ComposedChart, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";

/* ─────────────────────────────────────────────────────────────
   FONTS + GLOBAL STYLES
───────────────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #050509; color: #f0f0f6; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: #0a0a12; }
    ::-webkit-scrollbar-thumb { background: #222238; border-radius: 4px; }
    input, select, textarea, button { font-family: inherit; }

    @keyframes fadeUp   { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
    @keyframes fadeIn   { from { opacity:0 } to { opacity:1 } }
    @keyframes cardIn   { from { opacity:0; transform:translateY(22px) scale(.97) } to { opacity:1; transform:translateY(0) scale(1) } }
    @keyframes spin     { to { transform: rotate(360deg) } }
    @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.3} }
    @keyframes popIn    { 0%{transform:scale(0) rotate(-6deg);opacity:0} 65%{transform:scale(1.06) rotate(1deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
    @keyframes glow     { 0%,100%{box-shadow:0 0 18px #e8002d33} 50%{box-shadow:0 0 44px #e8002d77} }
    @keyframes scanline { from{transform:translateY(-100%)} to{transform:translateY(100vh)} }
    @keyframes typeIn   { from{width:0;opacity:0} to{width:100%;opacity:1} }
    @keyframes barLoad  { from{width:0} to{width:var(--w)} }

    .card-hover { transition: transform .28s cubic-bezier(.34,1.56,.64,1), box-shadow .28s ease, border-color .18s ease; }
    .card-hover:hover { transform: translateY(-4px); }
    .btn-press:active { transform: scale(.96); }
    .tab-item { transition: all .18s ease; }
    .tab-item:hover { color: #f0f0f6 !important; }

    .ai-typing::after {
      content: '▊';
      animation: pulse .7s ease infinite;
      color: #a78bfa;
    }
  `}</style>
);

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────── */
const C = {
  bg: "#050509", s0: "#08080f", s1: "#0d0d18", s2: "#121220",
  card: "#0e0e1c", border: "rgba(255,255,255,.07)", borderHi: "rgba(255,255,255,.13)",
  red: "#e8002d", gold: "#f0a030", cyan: "#00d4ff",
  green: "#34d399", violet: "#a78bfa", pink: "#f472b6",
  text: "#f0f0f6", dim: "#8890a8", muted: "#3d4158",
  fn: "'DM Sans', sans-serif", disp: "'Orbitron', monospace", mono: "'DM Mono', monospace",
};

const TEAM_COLORS = {
  "Red Bull": "#3671C6", "Ferrari": "#E8002D", "Mercedes": "#27F4D2",
  "McLaren": "#FF8000", "Aston Martin": "#229971", "Alpine": "#FF87BC",
  "Williams": "#64C4FF", "RB": "#6692FF", "AlphaTauri": "#6692FF",
  "Alfa Romeo": "#C92D4B", "Haas": "#B6BABD", "Sauber": "#00CF46",
};
const tc = (team) => TEAM_COLORS[team] || "#888";

/* ─────────────────────────────────────────────────────────────
   DRIVER DATA  (2019 – 2025)
───────────────────────────────────────────────────────────── */
const DRIVERS = [
  { code:"VER", name:"Max Verstappen",    team:"Red Bull",     nat:"NL", num:1,  age:27, starts:182,
    pace:98, craft:97, cons:96, wet:92, quali:97,
    pts:{2019:278,2020:214,2021:395,2022:454,2023:575,2024:437,2025:429},
    wins:{2019:3,2020:2,2021:10,2022:15,2023:19,2024:9,2025:10},
    poles:{2019:2,2020:3,2021:10,2022:14,2023:12,2024:9,2025:8},
    podiums:{2019:9,2020:11,2021:18,2022:17,2023:21,2024:14,2025:16},
    dnfs:{2019:3,2020:2,2021:4,2022:3,2023:2,2024:3,2025:2},
    avgGrid:1.8, avgFin:2.1, lapTime:90.2, qualiGap:0.00,
    bio:"Redefining the limits of what a single driver can achieve. Dominant across multiple eras.",
    secret:"Owns 47 racing simulators. Uses at least 3 per week. 🎮" },
  { code:"NOR", name:"Lando Norris",      team:"McLaren",      nat:"GB", num:4,  age:25, starts:124,
    pace:95, craft:91, cons:90, wet:89, quali:95,
    pts:{2019:49,2020:97,2021:160,2022:122,2023:205,2024:374,2025:462},
    wins:{2019:0,2020:0,2021:0,2022:0,2023:1,2024:4,2025:7},
    poles:{2019:0,2020:0,2021:0,2022:0,2023:2,2024:5,2025:9},
    podiums:{2019:0,2020:2,2021:4,2022:2,2023:6,2024:15,2025:17},
    dnfs:{2019:5,2020:2,2021:4,2022:4,2023:3,2024:2,2025:2},
    avgGrid:4.8, avgFin:5.2, lapTime:90.8, qualiGap:0.22,
    bio:"From meme king to championship contender. The evolution from 2023 to 2025 is one of the sport's great stories.",
    secret:"Crashed a £700k Ferrari in Monaco. Karting track. No comment. 🏎️" },
  { code:"LEC", name:"Charles Leclerc",   team:"Ferrari",      nat:"MC", num:16, age:27, starts:140,
    pace:96, craft:88, cons:84, wet:90, quali:98,
    pts:{2019:98,2020:98,2021:159,2022:308,2023:206,2024:356,2025:318},
    wins:{2019:2,2020:0,2021:0,2022:3,2023:2,2024:3,2025:4},
    poles:{2019:7,2020:2,2021:2,2022:9,2023:5,2024:8,2025:7},
    podiums:{2019:8,2020:2,2021:2,2022:9,2023:7,2024:13,2025:12},
    dnfs:{2019:4,2020:5,2021:3,2022:6,2023:3,2024:4,2025:4},
    avgGrid:2.9, avgFin:5.2, lapTime:90.6, qualiGap:0.04,
    bio:"The fastest qualifier on any given Saturday. Translating that into race wins remains Ferrari's eternal challenge.",
    secret:"Plays Beethoven on piano before every qualifying session. 🎹" },
  { code:"HAM", name:"Lewis Hamilton",    team:"Ferrari",      nat:"GB", num:44, age:40, starts:348,
    pace:94, craft:98, cons:97, wet:99, quali:94,
    pts:{2019:413,2020:347,2021:387,2022:240,2023:234,2024:272,2025:290},
    wins:{2019:11,2020:11,2021:8,2022:0,2023:1,2024:1,2025:2},
    poles:{2019:5,2020:10,2021:5,2022:0,2023:2,2024:2,2025:3},
    podiums:{2019:17,2020:16,2021:17,2022:7,2023:9,2024:11,2025:10},
    dnfs:{2019:1,2020:1,2021:1,2022:3,2023:2,2024:2,2025:3},
    avgGrid:3.1, avgFin:4.1, lapTime:90.9, qualiGap:0.28,
    bio:"The greatest of all time by most measures. Joined Ferrari in 2025 to chase an 8th title — history in the making.",
    secret:"Fashion budget per GP weekend: £28,000. The team tolerates it. 👗" },
  { code:"SAI", name:"Carlos Sainz",      team:"Williams",     nat:"ES", num:55, age:30, starts:192,
    pace:91, craft:91, cons:93, wet:87, quali:91,
    pts:{2019:96,2020:105,2021:164,2022:246,2023:200,2024:290,2025:188},
    wins:{2019:0,2020:0,2021:0,2022:1,2023:1,2024:3,2025:2},
    poles:{2019:0,2020:0,2021:0,2022:0,2023:3,2024:4,2025:2},
    podiums:{2019:1,2020:4,2021:5,2022:9,2023:6,2024:11,2025:7},
    dnfs:{2019:2,2020:2,2021:2,2022:4,2023:3,2024:2,2025:4},
    avgGrid:4.8, avgFin:5.8, lapTime:91.1, qualiGap:0.31,
    bio:"Lost his Ferrari seat to Hamilton. Moved to Williams with zero drama. Promptly scored more points than anyone expected.",
    secret:"Dropped the trophy at the British GP podium. Caught it. Nobody saw. 🏆" },
  { code:"RUS", name:"George Russell",    team:"Mercedes",     nat:"GB", num:63, age:27, starts:120,
    pace:92, craft:91, cons:92, wet:91, quali:94,
    pts:{2019:0,2020:3,2021:16,2022:275,2023:203,2024:245,2025:278},
    wins:{2019:0,2020:0,2021:0,2022:1,2023:1,2024:2,2025:3},
    poles:{2019:0,2020:0,2021:0,2022:1,2023:3,2024:3,2025:4},
    podiums:{2019:0,2020:0,2021:0,2022:10,2023:8,2024:10,2025:11},
    dnfs:{2019:6,2020:5,2021:4,2022:2,2023:3,2024:3,2025:3},
    avgGrid:4.4, avgFin:5.5, lapTime:91.3, qualiGap:0.22,
    bio:"Meticulous, precise, relentless. The engineer's driver. Already runs more of Mercedes than most people realise.",
    secret:"Builds 14 race-prep spreadsheets per weekend. Including one for breakfast. 📊" },
  { code:"ALO", name:"Fernando Alonso",   team:"Aston Martin", nat:"ES", num:14, age:43, starts:405,
    pace:93, craft:99, cons:95, wet:97, quali:93,
    pts:{2019:55,2020:0,2021:81,2022:81,2023:206,2024:70,2025:88},
    wins:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:0},
    poles:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:0},
    podiums:{2019:0,2020:0,2021:0,2022:2,2023:8,2024:2,2025:3},
    dnfs:{2019:5,2020:8,2021:4,2022:3,2023:2,2024:5,2025:4},
    avgGrid:6.8, avgFin:6.2, lapTime:91.5, qualiGap:0.45,
    bio:"Defying age, physics, and reasonable expectation. The most complete racing driver of his generation — still here, still hunting.",
    secret:"Has forgotten more about F1 than most teams' combined engineering staff will ever know. 🧠" },
  { code:"PER", name:"Sergio Perez",      team:"Red Bull",     nat:"MX", num:11, age:35, starts:270,
    pace:87, craft:87, cons:83, wet:81, quali:84,
    pts:{2019:52,2020:125,2021:190,2022:305,2023:285,2024:152,2025:0},
    wins:{2019:0,2020:1,2021:2,2022:2,2023:2,2024:0,2025:0},
    poles:{2019:0,2020:0,2021:1,2022:3,2023:2,2024:1,2025:0},
    podiums:{2019:1,2020:4,2021:10,2022:9,2023:9,2024:5,2025:0},
    dnfs:{2019:3,2020:4,2021:3,2022:4,2023:5,2024:8,2025:0},
    avgGrid:4.2, avgFin:5.1, lapTime:91.0, qualiGap:0.41,
    bio:"An era defined by mega-results at street circuits and Baku heroics. Retired mid-2024. Legend status in Mexico.",
    secret:"Consumed 22 tacos per race weekend in the Red Bull motorhome. Team policy. 🌮" },
  { code:"PIA", name:"Oscar Piastri",     team:"McLaren",      nat:"AU", num:81, age:24, starts:68,
    pace:91, craft:88, cons:89, wet:84, quali:89,
    pts:{2019:0,2020:0,2021:0,2022:0,2023:97,2024:292,2025:388},
    wins:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:2,2025:5},
    poles:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:2,2025:4},
    podiums:{2019:0,2020:0,2021:0,2022:0,2023:2,2024:12,2025:14},
    dnfs:{2019:0,2020:0,2021:0,2022:0,2023:4,2024:2,2025:3},
    avgGrid:6.1, avgFin:6.8, lapTime:91.1, qualiGap:0.29,
    bio:"Quiet, fast, devastatingly consistent. First Australian race winner since Webber in 2012. The future is now.",
    secret:"Has out-qualified Norris 6 times and been suspiciously modest every single time. 🤫" },
  { code:"ANT", name:"Kimi Antonelli",    team:"Mercedes",     nat:"IT", num:12, age:19, starts:20,
    pace:88, craft:83, cons:80, wet:79, quali:90,
    pts:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:122},
    wins:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:1},
    poles:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:2},
    podiums:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:4},
    dnfs:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:5},
    avgGrid:8.2, avgFin:9.4, lapTime:91.6, qualiGap:0.48,
    bio:"Hamilton's chosen successor at Mercedes. Youngest regular starter in the modern era. The hype is entirely justified.",
    secret:"Wolff calls him 'the future' approximately 34 times per week. In three languages. 📞" },
  { code:"GAS", name:"Pierre Gasly",      team:"Alpine",       nat:"FR", num:10, age:29, starts:160,
    pace:86, craft:83, cons:82, wet:79, quali:85,
    pts:{2019:95,2020:75,2021:110,2022:23,2023:62,2024:42,2025:55},
    wins:{2019:0,2020:1,2021:0,2022:0,2023:0,2024:0,2025:0},
    poles:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:0},
    podiums:{2019:1,2020:2,2021:2,2022:0,2023:1,2024:1,2025:1},
    dnfs:{2019:5,2020:3,2021:3,2022:6,2023:4,2024:5,2025:5},
    avgGrid:9.2, avgFin:10.4, lapTime:92.2, qualiGap:0.82,
    bio:"Won the 2020 Italian GP in a car that had absolutely no business winning. That one race justifies everything.",
    secret:"Smuggles 6 baguettes into the motorhome every race weekend. Non-negotiable. 🥖" },
  { code:"STR", name:"Lance Stroll",      team:"Aston Martin", nat:"CA", num:18, age:26, starts:170,
    pace:80, craft:77, cons:76, wet:82, quali:78,
    pts:{2019:21,2020:75,2021:34,2022:18,2023:74,2024:24,2025:40},
    wins:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:0},
    poles:{2019:0,2020:0,2021:0,2022:1,2023:0,2024:0,2025:0},
    podiums:{2019:0,2020:3,2021:1,2022:1,2023:2,2024:0,2025:1},
    dnfs:{2019:6,2020:3,2021:7,2022:6,2023:5,2024:6,2025:5},
    avgGrid:11.2, avgFin:12.8, lapTime:93.0, qualiGap:1.20,
    bio:"His father literally owns the team. He is, technically speaking, never getting fired.",
    secret:"Times Lawrence Stroll has overridden an engineering decision: 🔒 classified." },
  { code:"ALB", name:"Alex Albon",        team:"Williams",     nat:"TH", num:23, age:29, starts:100,
    pace:82, craft:80, cons:82, wet:79, quali:81,
    pts:{2019:92,2020:105,2021:0,2022:4,2023:27,2024:6,2025:45},
    wins:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:0},
    poles:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:0},
    podiums:{2019:2,2020:3,2021:0,2022:0,2023:0,2024:0,2025:0},
    dnfs:{2019:4,2020:5,2021:0,2022:5,2023:6,2024:7,2025:5},
    avgGrid:13.2, avgFin:14.1, lapTime:93.2, qualiGap:1.38,
    bio:"Fastest driver on the grid relative to machinery, according to nearly every independent analysis. Williams deserves him.",
    secret:"Extracted 22 top-8 results from a Williams. Physically impossible according to aerodynamics. 💪" },
  { code:"TSU", name:"Yuki Tsunoda",      team:"RB",           nat:"JP", num:22, age:25, starts:100,
    pace:84, craft:79, cons:75, wet:76, quali:85,
    pts:{2019:0,2020:0,2021:32,2022:12,2023:17,2024:30,2025:58},
    wins:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:0},
    poles:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:0},
    podiums:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:1},
    dnfs:{2019:0,2020:0,2021:7,2022:6,2023:5,2024:5,2025:4},
    avgGrid:11.0, avgFin:12.2, lapTime:92.5, qualiGap:1.02,
    bio:"The most entertaining team radio in Formula 1. Also genuinely fast. The bleeps are a feature, not a bug.",
    secret:"Average bleeps required per radio highlight reel: 14. Personal best: 9 in one lap. 📻" },
  { code:"OCO", name:"Esteban Ocon",      team:"Haas",         nat:"FR", num:31, age:28, starts:160,
    pace:82, craft:81, cons:81, wet:77, quali:81,
    pts:{2019:62,2020:62,2021:74,2022:92,2023:58,2024:23,2025:31},
    wins:{2019:0,2020:0,2021:1,2022:0,2023:0,2024:0,2025:0},
    poles:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:0},
    podiums:{2019:0,2020:0,2021:2,2022:2,2023:1,2024:0,2025:1},
    dnfs:{2019:4,2020:5,2021:3,2022:5,2023:6,2024:7,2025:6},
    avgGrid:11.0, avgFin:12.2, lapTime:92.8, qualiGap:1.10,
    bio:"Moved to Haas 2025. Has a rare gift for annoying teammates across multiple teams.",
    secret:"Career arguments with teammates: 8 per season (average). Counting. 🥊" },
  { code:"BOT", name:"Valtteri Bottas",   team:"Sauber",       nat:"FI", num:77, age:35, starts:230,
    pace:86, craft:83, cons:87, wet:84, quali:87,
    pts:{2019:326,2020:223,2021:226,2022:49,2023:10,2024:2,2025:4},
    wins:{2019:4,2020:2,2021:1,2022:0,2023:0,2024:0,2025:0},
    poles:{2019:5,2020:4,2021:3,2022:0,2023:0,2024:0,2025:0},
    podiums:{2019:15,2020:9,2021:11,2022:2,2023:0,2024:0,2025:0},
    dnfs:{2019:2,2020:3,2021:2,2022:5,2023:6,2024:8,2025:6},
    avgGrid:7.0, avgFin:9.5, lapTime:91.7, qualiGap:0.55,
    bio:"From Mercedes throne to Sauber midfield. The trajectory is sad. The calendar titles are sadder. Still genuinely fast.",
    secret:"Times called 'the nice one' in the paddock: statistically infinite. 🧊" },
  { code:"HUL", name:"Nico Hulkenberg",   team:"Haas",         nat:"DE", num:27, age:37, starts:215,
    pace:82, craft:84, cons:85, wet:83, quali:85,
    pts:{2019:37,2020:0,2021:0,2022:0,2023:9,2024:31,2025:38},
    wins:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:0},
    poles:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:0},
    podiums:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:0},
    dnfs:{2019:4,2020:0,2021:0,2022:0,2023:5,2024:4,2025:5},
    avgGrid:12.5, avgFin:13.4, lapTime:93.3, qualiGap:1.44,
    bio:"215+ starts, zero podiums. The most strangely dignified statistic in the history of professional motorsport.",
    secret:"German efficiency rating at pit stops: 99.7%. Everything else: variable. 🏭" },
  { code:"MAG", name:"Kevin Magnussen",   team:"Haas",         nat:"DK", num:20, age:32, starts:195,
    pace:80, craft:82, cons:76, wet:77, quali:78,
    pts:{2019:20,2020:1,2021:0,2022:25,2023:3,2024:4,2025:0},
    wins:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:0},
    poles:{2019:0,2020:0,2021:0,2022:1,2023:0,2024:0,2025:0},
    podiums:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:0},
    dnfs:{2019:6,2020:7,2021:0,2022:6,2023:8,2024:9,2025:0},
    avgGrid:14.1, avgFin:15.0, lapTime:93.6, qualiGap:1.62,
    bio:"Retired 2024. Cult hero. His shut-up-and-drive attitude made him an unlikely fan favourite of the Netflix era.",
    secret:"Personal record: 5 penalty points in a single race. Still maintains it was all justified. 🚩" },
  { code:"BEA", name:"Oliver Bearman",    team:"Haas",         nat:"GB", num:87, age:20, starts:22,
    pace:84, craft:80, cons:79, wet:77, quali:83,
    pts:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:7,2025:52},
    wins:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:0},
    poles:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:0},
    podiums:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:1},
    dnfs:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:4,2025:5},
    avgGrid:12.0, avgFin:13.2, lapTime:93.0, qualiGap:1.35,
    bio:"Subbed for Sainz at Ferrari in 2023, scored points on debut. Proper talent in a limited car.",
    secret:"Hours logged playing himself in F1 24 the video game: 200+. 🎮" },
  { code:"HAD", name:"Isack Hadjar",      team:"RB",           nat:"FR", num:6,  age:20, starts:20,
    pace:85, craft:80, cons:78, wet:75, quali:86,
    pts:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:76},
    wins:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:0},
    poles:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:0},
    podiums:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:1},
    dnfs:{2019:0,2020:0,2021:0,2022:0,2023:0,2024:0,2025:4},
    avgGrid:10.5, avgFin:11.8, lapTime:92.4, qualiGap:0.90,
    bio:"Front row on debut — first driver to achieve that since 1985. French-Algerian. The most exciting rookie since Leclerc.",
    secret:"Texts from Helmut Marko: 89 this season and counting. 📱" },
];

const SEASONS = [2019, 2020, 2021, 2022, 2023, 2024, 2025];

const CIRCUITS = [
  "Bahrain","Saudi Arabia","Australia","Japan","China","Miami","Monaco","Spain",
  "Canada","Austria","Britain","Hungary","Belgium","Netherlands","Italy","Baku",
  "Singapore","USA","Mexico","Brazil","Las Vegas","Qatar","Abu Dhabi",
];

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const sv = (d, f, s) =>
  s === "All"
    ? Object.values(d[f] || {}).reduce((a, b) => a + b, 0)
    : d[f]?.[+s] || 0;

const totalPts  = (d) => sv(d, "pts",  "All");
const totalWins = (d) => sv(d, "wins", "All");
const totalPods = (d) => sv(d, "podiums", "All");

/* ─────────────────────────────────────────────────────────────
   SHARED UI COMPONENTS
───────────────────────────────────────────────────────────── */
const Pill = ({ label, color = C.red, sm }) => (
  <span style={{
    background: `${color}18`, color, border: `1px solid ${color}2e`,
    padding: sm ? "2px 8px" : "4px 13px", borderRadius: 20,
    fontSize: sm ? 9 : 10.5, fontFamily: C.mono,
    letterSpacing: ".06em", fontWeight: 500, whiteSpace: "nowrap",
  }}>{label}</span>
);

const GCard = ({ children, style: s = {}, accent, noHover }) => {
  const [h, setH] = useState(false);
  return (
    <div
      className={noHover ? "" : "card-hover"}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: C.card,
        border: `1px solid ${h && !noHover ? C.borderHi : C.border}`,
        borderRadius: 18,
        boxShadow: h && !noHover
          ? `0 20px 56px rgba(0,0,0,.55), 0 0 0 1px ${accent || C.borderHi}, 0 0 28px ${(accent || "#fff") + "0e"}`
          : "0 4px 24px rgba(0,0,0,.3)",
        transition: "box-shadow .25s, border-color .2s",
        ...s,
      }}>{children}</div>
  );
};

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(10,10,20,.97)", border: `1px solid ${C.border}`,
      borderRadius: 12, padding: "11px 15px", fontSize: 12,
      fontFamily: C.fn, boxShadow: "0 20px 40px rgba(0,0,0,.6)", minWidth: 120,
    }}>
      {label && <p style={{ margin: "0 0 6px", color: C.muted, fontSize: 10, fontFamily: C.mono }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ margin: "2px 0", color: p.color || C.text }}>
          {p.name}: <b style={{ color: "#fff", fontFamily: C.disp, fontSize: 12 }}>
            {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          </b>
        </p>
      ))}
    </div>
  );
};

const PageHead = ({ title, sub, color = C.red }) => (
  <div style={{ marginBottom: 30, animation: "fadeUp .45s ease" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 7 }}>
      <div style={{ width: 3, height: 26, background: `linear-gradient(180deg,${color},${C.gold})`, borderRadius: 2 }} />
      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: C.disp, letterSpacing: ".05em" }}>{title}</h2>
    </div>
    {sub && <p style={{ marginLeft: 16, fontSize: 13, color: C.dim, fontWeight: 300 }}>{sub}</p>}
  </div>
);

const TabBar = ({ tabs, active, setActive }) => (
  <div style={{ display: "flex", gap: 4, background: C.s1, borderRadius: 13, padding: 5, marginBottom: 26, flexWrap: "wrap" }}>
    {tabs.map(([v, label]) => (
      <button key={v} onClick={() => setActive(v)} className="tab-item" style={{
        background: active === v ? C.card : "transparent",
        border: `1px solid ${active === v ? C.border : "transparent"}`,
        color: active === v ? C.text : C.dim,
        borderRadius: 9, padding: "7px 17px", fontSize: 11,
        fontFamily: C.mono, cursor: "pointer", fontWeight: 500,
        letterSpacing: ".05em", transition: "all .2s",
      }}>{label}</button>
    ))}
  </div>
);

const Spinner = ({ color = C.violet }) => (
  <div style={{ width: 36, height: 36, border: `3px solid ${C.border}`, borderTop: `3px solid ${color}`, borderRadius: "50%", animation: "spin .75s linear infinite" }} />
);

const AiBox = ({ text, loading, color = C.violet }) => {
  if (!loading && !text) return null;
  return (
    <div style={{
      background: C.s0, border: `1px solid ${color}33`,
      borderRadius: 14, padding: "20px 22px", marginTop: 18,
      borderLeft: `3px solid ${color}`, animation: "fadeUp .4s ease",
    }}>
      <p style={{ fontSize: 10, color, fontFamily: C.mono, letterSpacing: ".12em", marginBottom: loading ? 16 : 12 }}>
        ◈ AI ANALYSIS
      </p>
      {loading
        ? <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Spinner color={color} />
            <span style={{ fontSize: 13, color: C.dim, fontFamily: C.fn }}>Claude is thinking…</span>
          </div>
        : <p className="ai-content" style={{ fontSize: 13.5, color: C.text, fontFamily: C.fn, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{text}</p>
      }
    </div>
  );
};

const SliderRow = ({ label, value, setValue, min = 0, max = 100, color = C.violet, fmt = v => v }) => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ fontSize: 11, color: C.dim, fontFamily: C.mono }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: C.disp }}>{fmt(value)}</span>
    </div>
    <input type="range" min={min} max={max} value={value}
      onChange={e => setValue(+e.target.value)}
      style={{ width: "100%", accentColor: color, height: 4, cursor: "pointer" }} />
  </div>
);

/* ─────────────────────────────────────────────────────────────
   DRIVER HELMET DESIGNS  (pure SVG – no external requests)
   Each helmet has: dome colour, visor colour, stripe pattern,
   accent colour, flag emoji and a unique design motif.
───────────────────────────────────────────────────────────── */
const HELMET_DESIGNS = {
  VER: { dome:"#1a2e6e", visor:"#1a8cff", stripe:"#ff6b00", accent:"#ffd700", flag:"🇳🇱",
         stripes:[{x:18,y:58,w:64,h:6,rx:3,c:"#ff6b00"},{x:22,y:48,w:56,h:4,rx:2,c:"#ffd700"}],
         motif:"angular" },
  NOR: { dome:"#ff6a00", visor:"#ff9500", stripe:"#ffd700", accent:"#ff2d55", flag:"🇬🇧",
         stripes:[{x:14,y:56,w:72,h:8,rx:4,c:"#ffd700"},{x:20,y:46,w:60,h:4,rx:2,c:"#ff2d55"}],
         motif:"curve" },
  LEC: { dome:"#cc0000", visor:"#ff3333", stripe:"#ffffff", accent:"#ffd700", flag:"🇲🇨",
         stripes:[{x:16,y:54,w:68,h:7,rx:3,c:"#ffffff"},{x:22,y:44,w:56,h:4,rx:2,c:"#ffd700"}],
         motif:"chevron" },
  HAM: { dome:"#111111", visor:"#27f4d2", stripe:"#9c44dc", accent:"#27f4d2", flag:"🇬🇧",
         stripes:[{x:14,y:56,w:72,h:8,rx:4,c:"#9c44dc"},{x:18,y:46,w:64,h:4,rx:2,c:"#27f4d2"}],
         motif:"zigzag" },
  SAI: { dome:"#cc2200", visor:"#ff4422", stripe:"#ffd700", accent:"#ff8800", flag:"🇪🇸",
         stripes:[{x:16,y:55,w:68,h:6,rx:3,c:"#ffd700"},{x:24,y:45,w:52,h:4,rx:2,c:"#ff8800"}],
         motif:"wave" },
  RUS: { dome:"#1a1a2e", visor:"#27f4d2", stripe:"#27f4d2", accent:"#ffffff", flag:"🇬🇧",
         stripes:[{x:16,y:55,w:68,h:7,rx:3,c:"#27f4d2"},{x:22,y:45,w:56,h:3,rx:2,c:"#ffffff"}],
         motif:"line" },
  ALO: { dome:"#004400", visor:"#00cc44", stripe:"#ffd700", accent:"#00ff88", flag:"🇪🇸",
         stripes:[{x:14,y:55,w:72,h:8,rx:4,c:"#ffd700"},{x:20,y:45,w:60,h:4,rx:2,c:"#00ff88"}],
         motif:"angular" },
  PER: { dome:"#003399", visor:"#3671c6", stripe:"#ffd700", accent:"#ff6600", flag:"🇲🇽",
         stripes:[{x:16,y:56,w:68,h:7,rx:3,c:"#ffd700"},{x:22,y:46,w:56,h:4,rx:2,c:"#ff6600"}],
         motif:"chevron" },
  PIA: { dome:"#cc5500", visor:"#ff8000", stripe:"#ffffff", accent:"#ffd700", flag:"🇦🇺",
         stripes:[{x:16,y:55,w:68,h:7,rx:3,c:"#ffffff"},{x:20,y:45,w:60,h:4,rx:2,c:"#ffd700"}],
         motif:"wave" },
  ANT: { dome:"#002244", visor:"#27f4d2", stripe:"#aaaaaa", accent:"#27f4d2", flag:"🇮🇹",
         stripes:[{x:16,y:55,w:68,h:6,rx:3,c:"#aaaaaa"},{x:22,y:46,w:56,h:3,rx:2,c:"#27f4d2"}],
         motif:"line" },
  GAS: { dome:"#003388", visor:"#ff87bc", stripe:"#ff87bc", accent:"#ffffff", flag:"🇫🇷",
         stripes:[{x:16,y:56,w:68,h:7,rx:3,c:"#ff87bc"},{x:22,y:46,w:56,h:4,rx:2,c:"#ffffff"}],
         motif:"curve" },
  STR: { dome:"#002200", visor:"#229971", stripe:"#229971", accent:"#aaffcc", flag:"🇨🇦",
         stripes:[{x:16,y:55,w:68,h:7,rx:3,c:"#229971"},{x:22,y:45,w:56,h:4,rx:2,c:"#aaffcc"}],
         motif:"wave" },
  ALB: { dome:"#003366", visor:"#64c4ff", stripe:"#64c4ff", accent:"#ffffff", flag:"🇹🇭",
         stripes:[{x:16,y:55,w:68,h:7,rx:3,c:"#64c4ff"},{x:22,y:45,w:56,h:4,rx:2,c:"#ffffff"}],
         motif:"curve" },
  TSU: { dome:"#003399", visor:"#6692ff", stripe:"#ff0000", accent:"#ffffff", flag:"🇯🇵",
         stripes:[{x:16,y:56,w:68,h:7,rx:3,c:"#ff0000"},{x:22,y:46,w:56,h:4,rx:2,c:"#ffffff"}],
         motif:"zigzag" },
  OCO: { dome:"#001133", visor:"#ff87bc", stripe:"#ff87bc", accent:"#0055ff", flag:"🇫🇷",
         stripes:[{x:16,y:56,w:68,h:7,rx:3,c:"#ff87bc"},{x:22,y:46,w:56,h:4,rx:2,c:"#0055ff"}],
         motif:"angular" },
  BOT: { dome:"#1a0a2e", visor:"#00cf46", stripe:"#00cf46", accent:"#ff44aa", flag:"🇫🇮",
         stripes:[{x:16,y:55,w:68,h:7,rx:3,c:"#00cf46"},{x:22,y:45,w:56,h:4,rx:2,c:"#ff44aa"}],
         motif:"wave" },
  HUL: { dome:"#1a1a1a", visor:"#b6babd", stripe:"#b6babd", accent:"#ffd700", flag:"🇩🇪",
         stripes:[{x:16,y:55,w:68,h:7,rx:3,c:"#b6babd"},{x:22,y:45,w:56,h:4,rx:2,c:"#ffd700"}],
         motif:"line" },
  MAG: { dome:"#1a1a1a", visor:"#888888", stripe:"#ff2222", accent:"#ffffff", flag:"🇩🇰",
         stripes:[{x:16,y:56,w:68,h:7,rx:3,c:"#ff2222"},{x:22,y:46,w:56,h:4,rx:2,c:"#ffffff"}],
         motif:"chevron" },
  BEA: { dome:"#1a1a1a", visor:"#ff4444", stripe:"#aaaaaa", accent:"#ff8800", flag:"🇬🇧",
         stripes:[{x:16,y:55,w:68,h:7,rx:3,c:"#aaaaaa"},{x:22,y:45,w:56,h:4,rx:2,c:"#ff8800"}],
         motif:"angular" },
  HAD: { dome:"#001133", visor:"#3366ff", stripe:"#ff6600", accent:"#ffffff", flag:"🇫🇷",
         stripes:[{x:16,y:55,w:68,h:7,rx:3,c:"#ff6600"},{x:22,y:45,w:56,h:4,rx:2,c:"#ffffff"}],
         motif:"curve" },
};

/* ─────────────────────────────────────────────────────────────
   OFFICIAL F1 DRIVER PHOTOS  (Formula 1 CDN · 2026 season)
   Falls back to SVG helmet for retired / missing drivers.
───────────────────────────────────────────────────────────── */
const F1_CDN = (team, slug) =>
  `https://media.formula1.com/image/upload/c_lfill,w_220/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000000/common/f1/2026/${team}/${slug}/2026${team}${slug}right.webp`;

const DRIVER_IMAGES = {
  VER: F1_CDN("redbullracing",  "maxver01"),
  NOR: F1_CDN("mclaren",        "lannor01"),
  LEC: F1_CDN("ferrari",        "chalec01"),
  HAM: F1_CDN("ferrari",        "lewham01"),
  SAI: F1_CDN("williams",       "carsai01"),
  RUS: F1_CDN("mercedes",       "georus01"),
  ALO: F1_CDN("astonmartin",    "feralo01"),
  PIA: F1_CDN("mclaren",        "oscpia01"),
  ANT: F1_CDN("mercedes",       "andant01"),
  GAS: F1_CDN("alpine",         "piegas01"),
  STR: F1_CDN("astonmartin",    "lanstr01"),
  ALB: F1_CDN("williams",       "alealb01"),
  TSU: F1_CDN("racingbulls",    "yuktsu01"),
  OCO: F1_CDN("haasf1team",     "estoco01"),
  HUL: F1_CDN("audi",           "nichul01"),
  BEA: F1_CDN("haasf1team",     "olibea01"),
  HAD: F1_CDN("redbullracing",  "isahad01"),
  BOT: F1_CDN("cadillac",       "valbot01"),
  // PER + MAG retired — no 2026 photo, gracefully falls back to SVG helmet
};

const DriverPhoto = ({ code, team, size = 110, tall, style: extStyle }) => {
  const [imgErr, setImgErr] = useState(false);
  const [imgOk,  setImgOk]  = useState(false);

  const c      = tc(team);
  const h      = tall ? Math.round(size * 1.35) : size;
  const imgSrc = DRIVER_IMAGES[code];
  const useImg = !!imgSrc && !imgErr;

  /* ── SVG helmet data (used as fallback) ── */
  const d = HELMET_DESIGNS[code] || {
    dome: c, visor: "#333", stripe: "#fff", accent: "#fff",
    flag: "🏁", stripes: [], motif: "line",
  };
  const drvr = DRIVERS.find(x => x.code === code);
  const num  = drvr?.num ?? "?";
  const gid  = `hg_${code}`;
  const vid  = `vg_${code}`;
  const motifPath = {
    angular: "M 20,60 L 35,50 L 50,58 L 65,50 L 80,60",
    curve:   "M 20,62 Q 50,48 80,62",
    chevron: "M 20,60 L 50,50 L 80,60 M 20,64 L 50,54 L 80,64",
    zigzag:  "M 20,62 L 32,50 L 44,62 L 56,50 L 68,62 L 80,52",
    wave:    "M 20,60 C 35,50 45,70 60,58 C 72,48 78,60 80,58",
    line:    "M 20,58 L 80,58 M 20,62 L 80,62",
  }[d.motif] || "M 20,60 L 80,60";

  return (
    <div style={{
      width: size, height: h, flexShrink: 0, position: "relative",
      borderRadius: 14, overflow: "hidden",
      background: `linear-gradient(175deg, ${c}33 0%, ${C.s0} 55%, ${C.s1} 100%)`,
      border: `1px solid ${c}44`,
      ...extStyle,
    }}>

      {useImg ? (
        <>
          {/* Real photo */}
          <img
            src={imgSrc}
            alt={code}
            onLoad={() => setImgOk(true)}
            onError={() => setImgErr(true)}
            style={{
              position: "absolute",
              bottom: 0, left: "50%",
              transform: "translateX(-50%)",
              height: "108%", width: "auto",
              objectFit: "contain",
              objectPosition: "center bottom",
              opacity: imgOk ? 1 : 0,
              transition: "opacity .45s ease",
            }}
          />
          {/* Shimmer placeholder while loading */}
          {!imgOk && (
            <div style={{
              position: "absolute", inset: 0,
              background: `linear-gradient(135deg, ${c}18, ${C.s1}, ${c}0e)`,
              animation: "pulse 1.4s ease infinite",
            }} />
          )}
        </>
      ) : (
        /* ── SVG helmet fallback ── */
        <svg viewBox="0 0 100 135" width={size} height={h}
          style={{ position: "absolute", inset: 0, display: "block" }}>
          <defs>
            <radialGradient id={gid} cx="38%" cy="32%" r="62%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
              <stop offset="40%" stopColor={d.dome} stopOpacity="0.95" />
              <stop offset="100%" stopColor={d.dome} stopOpacity="1" />
            </radialGradient>
            <radialGradient id={vid} cx="35%" cy="30%" r="55%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="100%" stopColor={d.visor} stopOpacity="0.7" />
            </radialGradient>
            <filter id={`shadow_${code}`} x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={d.dome} floodOpacity="0.5"/>
            </filter>
          </defs>
          <path d="M 32,105 Q 50,115 68,105 L 65,95 Q 50,100 35,95 Z" fill={d.dome} opacity="0.7" />
          <ellipse cx="50" cy="58" rx="35" ry="42" fill={`url(#${gid})`} filter={`url(#shadow_${code})`} />
          <ellipse cx="40" cy="38" rx="14" ry="10" fill="white" opacity="0.08" transform="rotate(-15,40,38)" />
          {d.stripes.map((s, i) => (
            <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} fill={s.c} opacity="0.75" />
          ))}
          <path d="M 22,60 Q 24,80 50,82 Q 76,80 78,60 Q 75,44 50,43 Q 25,44 22,60 Z" fill={`url(#${vid})`} opacity="0.88" />
          <path d="M 28,60 Q 30,73 50,75 Q 70,73 72,60 Q 66,50 50,49 Q 34,50 28,60 Z" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          <ellipse cx="42" cy="55" rx="8" ry="4" fill="white" opacity="0.08" transform="rotate(-10,42,55)" />
          <path d={motifPath} fill="none" stroke={d.accent} strokeWidth="1.5" opacity="0.4" />
          <path d="M 34,82 Q 50,88 66,82 L 62,90 Q 50,95 38,90 Z" fill={d.stripe} opacity="0.5" />
          <text x="50" y="30" textAnchor="middle" fontFamily="'Orbitron',monospace" fontSize="13" fontWeight="900" fill={d.accent} opacity="0.9">{num}</text>
          <text x="50" y="112" textAnchor="middle" fontFamily="'Orbitron',monospace" fontSize="11" fontWeight="900" fill={c} opacity="0.95" letterSpacing="2">{code}</text>
          <text x="50" y="126" textAnchor="middle" fontFamily="system-ui" fontSize="10" opacity="0.85">{d.flag}</text>
        </svg>
      )}

      {/* Bottom gradient + driver code label */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: "38%",
        background: `linear-gradient(0deg, ${C.card}f2 0%, ${c}18 60%, transparent 100%)`,
        pointerEvents: "none",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        paddingBottom: Math.max(4, size * 0.04),
      }}>
        {useImg && imgOk && (
          <span style={{
            fontSize: Math.max(8, Math.round(size * 0.1)),
            fontFamily: C.disp, fontWeight: 900,
            color: c, letterSpacing: "0.12em",
            textShadow: `0 1px 6px ${C.bg}, 0 0 12px ${c}55`,
          }}>{code}</span>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   CIRCUIT SVG PATHS  (hand-drawn layouts, 320×220 viewBox)
───────────────────────────────────────────────────────────── */
const CIRCUIT_DATA = {
  Bahrain: {
    color: "#d4a843", label: "BAHRAIN GP",
    path: `M 272,95 C 284,82 282,64 268,54 L 252,44 C 237,34 218,38 210,52 L 200,72 C 192,87 177,91 162,86 L 100,76 C 82,71 68,57 71,40 L 74,24 C 77,10 92,3 108,8 L 248,12 C 264,12 276,24 276,40 L 276,65 C 276,82 264,92 248,90`,
    drs1: "M 108,10 L 248,12", drs2: "M 276,42 L 276,65",
    sectors: [
      { d: "M 272,95 C 284,82 282,64 268,54 L 252,44 C 237,34 218,38 210,52 L 200,72", c: "#e8002d" },
      { d: "M 200,72 C 192,87 177,91 162,86 L 100,76 C 82,71 68,57 71,40 L 74,24", c: "#f0a030" },
      { d: "M 74,24 C 77,10 92,3 108,8 L 248,12 C 264,12 276,24 276,40 L 276,65 C 276,82 264,92 248,90", c: "#34d399" },
    ],
    dots: [[271,93,"S/F"],[200,72,"T8"],[70,42,"T11"],[108,10,"T14"]],
  },
  Monaco: {
    color: "#e8002d", label: "MONACO GP",
    path: `M 188,52 C 205,44 218,54 216,72 L 210,98 C 207,114 218,126 235,128 L 255,130 C 268,131 276,120 272,106 L 266,84 C 262,68 272,56 286,56 L 298,57 C 305,80 294,108 272,124 L 178,120 C 160,118 148,128 146,146 L 142,168 C 138,186 124,195 106,192 L 78,188 C 60,184 50,169 56,152 L 64,130 C 70,112 60,98 42,96 L 24,94 C 10,92 2,80 8,64 L 18,42 C 26,26 46,20 64,28 L 98,42 C 114,49 125,41 126,24 L 129,9 C 132,-3 147,-8 160,0 L 174,12 C 184,20 185,36 176,48 L 166,64 C 160,76 166,88 180,88 L 192,88`,
    sectors: [
      { d: "M 188,52 C 205,44 218,54 216,72 L 210,98 C 207,114 218,126 235,128 L 255,130", c: "#e8002d" },
      { d: "M 255,130 C 268,131 276,120 272,106 L 266,84 C 262,68 272,56 286,56 L 298,57 C 305,80 294,108 272,124 L 178,120 C 160,118 148,128 146,146", c: "#f0a030" },
      { d: "M 146,146 L 142,168 C 138,186 124,195 106,192 L 78,188 C 60,184 50,169 56,152 L 64,130 C 70,112 60,98 42,96 L 24,94 C 10,92 2,80 8,64 L 18,42 C 26,26 46,20 64,28 L 98,42 C 114,49 125,41 126,24 L 129,9 C 132,-3 147,-8 160,0 L 174,12 C 184,20 185,36 176,48 L 166,64 C 160,76 166,88 180,88 L 192,88", c: "#34d399" },
    ],
    dots: [[188,52,"S/F"],[104,44,"STE"],[278,56,"TUN"],[142,152,"RAS"]],
  },
  Silverstone: {
    color: "#27F4D2", label: "BRITISH GP",
    path: `M 48,120 C 30,112 22,96 30,80 L 42,60 C 52,44 72,38 90,46 L 116,56 C 134,64 150,56 156,39 L 164,20 C 172,4 192,-2 210,8 L 230,20 C 246,32 248,52 236,68 L 220,88 C 207,104 213,122 230,128 L 258,134 C 274,140 280,158 270,173 L 258,188 C 246,203 227,207 212,198 L 188,186 C 170,175 152,183 146,200 L 142,214 C 136,229 118,235 102,226 L 80,214 C 62,202 60,180 74,166 L 90,148 C 104,134 97,116 78,112 L 52,108`,
    sectors: [
      { d: "M 48,120 C 30,112 22,96 30,80 L 42,60 C 52,44 72,38 90,46 L 116,56 C 134,64 150,56 156,39 L 164,20", c: "#e8002d" },
      { d: "M 164,20 C 172,4 192,-2 210,8 L 230,20 C 246,32 248,52 236,68 L 220,88 C 207,104 213,122 230,128 L 258,134", c: "#f0a030" },
      { d: "M 258,134 C 274,140 280,158 270,173 L 258,188 C 246,203 227,207 212,198 L 188,186 C 170,175 152,183 146,200 L 142,214 C 136,229 118,235 102,226 L 80,214 C 62,202 60,180 74,166 L 90,148 C 104,134 97,116 78,112 L 52,108", c: "#34d399" },
    ],
    dots: [[48,118,"S/F"],[154,38,"BCK"],[270,172,"COP"],[100,218,"LUF"]],
  },
  Monza: {
    color: "#e8002d", label: "ITALIAN GP",
    path: `M 68,108 C 68,66 96,36 138,34 L 182,34 C 224,34 252,66 252,108 L 252,152 C 252,194 224,224 182,224 L 138,224 C 96,224 68,194 68,152 Z`,
    extra: `M 104,34 L 96,52 L 112,52 Z M 182,34 L 178,14 L 186,14 Z M 252,152 L 264,162 L 240,162 Z`,
    sectors: [
      { d: "M 68,108 C 68,66 96,36 138,34 L 182,34 C 224,34 252,66 252,108", c: "#e8002d" },
      { d: "M 252,108 L 252,152 C 252,194 224,224 182,224", c: "#f0a030" },
      { d: "M 182,224 L 138,224 C 96,224 68,194 68,152 L 68,108", c: "#34d399" },
    ],
    dots: [[160,34,"S/F"],[252,108,"CUR"],[160,224,"PAR"],[68,108,"LES"]],
  },
  Spa: {
    color: "#3671C6", label: "BELGIAN GP",
    path: `M 24,144 C 18,126 28,108 48,104 L 82,100 C 100,97 115,85 122,66 L 134,42 C 144,22 162,15 182,22 L 216,36 C 234,46 240,68 230,88 L 218,112 C 208,132 216,150 236,158 L 268,168 C 284,175 290,195 280,212 L 271,225 C 261,240 242,244 226,235 L 68,168 C 44,158 30,162 24,144`,
    sectors: [
      { d: "M 24,144 C 18,126 28,108 48,104 L 82,100 C 100,97 115,85 122,66 L 134,42", c: "#e8002d" },
      { d: "M 134,42 C 144,22 162,15 182,22 L 216,36 C 234,46 240,68 230,88 L 218,112", c: "#f0a030" },
      { d: "M 218,112 C 208,132 216,150 236,158 L 268,168 C 284,175 290,195 280,212 L 271,225 C 261,240 242,244 226,235 L 68,168 C 44,158 30,162 24,144", c: "#34d399" },
    ],
    dots: [[24,142,"SRC"],[132,44,"RAI"],[216,36,"KEM"],[270,208,"BST"]],
  },
  Suzuka: {
    color: "#FF8000", label: "JAPANESE GP",
    path: `M 100,35 C 122,24 146,32 155,54 L 162,76 C 169,96 185,103 204,97 L 228,88 C 246,80 254,60 246,40 L 238,18 C 230,-2 208,-10 188,0 L 166,14 C 146,28 142,52 150,74 L 158,96 C 166,118 155,138 134,144 L 108,150 C 86,156 70,175 75,198 L 82,222 C 88,244 112,254 135,244 L 160,232 C 183,220 190,195 179,170 L 168,144 C 157,118 166,94 186,84`,
    sectors: [
      { d: "M 100,35 C 122,24 146,32 155,54 L 162,76 C 169,96 185,103 204,97 L 228,88 C 246,80 254,60 246,40 L 238,18", c: "#e8002d" },
      { d: "M 238,18 C 230,-2 208,-10 188,0 L 166,14 C 146,28 142,52 150,74 L 158,96 C 166,118 155,138 134,144 L 108,150", c: "#f0a030" },
      { d: "M 108,150 C 86,156 70,175 75,198 L 82,222 C 88,244 112,254 135,244 L 160,232 C 183,220 190,195 179,170 L 168,144 C 157,118 166,94 186,84", c: "#34d399" },
    ],
    dots: [[100,35,"S/F"],[230,86,"S‑CRV"],[108,148,"HPN"],[184,84,"130R"]],
  },
};

/* CircuitSVG component */
const CircuitSVG = ({ circuit, size = 320, active = false }) => {
  const data = CIRCUIT_DATA[circuit];
  if (!data) return null;
  const { color, path, extra, sectors, dots, label } = data;
  const id = circuit.replace(/\s+/g, "");
  return (
    <svg viewBox="0 0 320 260" width={size} style={{ display: "block", maxWidth: "100%" }}>
      <defs>
        <filter id={`glow-${id}`}>
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={`glow2-${id}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id={`bg-${id}`} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity="0.07" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Atmospheric bg glow */}
      <ellipse cx="160" cy="130" rx="140" ry="110" fill={`url(#bg-${id})`} />

      {/* ── Track base (thick road) ── */}
      <path d={path} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} fill="none" stroke={C.s2} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
      {extra && <path d={extra} fill="none" stroke={C.s2} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />}

      {/* ── Kerbing / outer edge ── */}
      <path d={path} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={17} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="12 8" />

      {/* ── Sector-coloured track surface ── */}
      {sectors.map((s, i) => (
        <path key={i} d={s.d} fill="none" stroke={s.c} strokeWidth={5}
          strokeLinecap="round" strokeLinejoin="round"
          filter={active ? `url(#glow2-${id})` : undefined}
          opacity={0.85} />
      ))}
      {extra && (
        <path d={extra} fill="none" stroke={color} strokeWidth={5}
          strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
      )}

      {/* ── DRS zones (thin bright overlay) ── */}
      {data.drs1 && <path d={data.drs1} fill="none" stroke={C.green} strokeWidth={3} opacity={0.5} strokeDasharray="6 4" />}
      {data.drs2 && <path d={data.drs2} fill="none" stroke={C.green} strokeWidth={3} opacity={0.5} strokeDasharray="6 4" />}

      {/* ── Corner / key point dots ── */}
      {dots.map(([x, y, lbl]) => (
        <g key={lbl}>
          <circle cx={x} cy={y} r={5} fill={color} opacity={0.9} filter={`url(#glow2-${id})`} />
          <circle cx={x} cy={y} r={2.5} fill="#fff" opacity={0.9} />
          <text x={x + 8} y={y + 4} fontSize={8} fill={color} fontFamily="'DM Mono',monospace" opacity={0.9}>{lbl}</text>
        </g>
      ))}

      {/* ── Start/Finish line ── */}
      {dots[0] && (() => {
        const [fx, fy] = dots[0];
        return (
          <g>
            <line x1={fx - 6} y1={fy - 8} x2={fx + 6} y2={fy + 8} stroke="#fff" strokeWidth={2} opacity={0.7} />
          </g>
        );
      })()}

      {/* ── Sector legend ── */}
      {["S1","S2","S3"].map((s, i) => (
        <g key={s}>
          <rect x={8 + i * 36} y={240} width={28} height={5} rx={2}
            fill={sectors[i]?.c || color} opacity={0.8} />
          <text x={8 + i * 36 + 14} y={256} fontSize={7} fill={sectors[i]?.c || color}
            textAnchor="middle" fontFamily="'DM Mono',monospace" opacity={0.7}>{s}</text>
        </g>
      ))}

      {/* ── DRS legend ── */}
      {data.drs1 && (
        <g>
          <line x1={122} y1={243} x2={148} y2={243} stroke={C.green} strokeWidth={2} strokeDasharray="4 3" opacity={0.6} />
          <text x={152} y={247} fontSize={7} fill={C.green} fontFamily="'DM Mono',monospace" opacity={0.6}>DRS</text>
        </g>
      )}

      {/* ── Circuit label ── */}
      <text x={310} y={258} fontSize={9} fill={color} fontFamily="'Orbitron',monospace"
        fontWeight={700} textAnchor="end" opacity={0.7}>{label}</text>
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────────
   FILTER BAR
───────────────────────────────────────────────────────────── */
const FilterBar = ({ selected, setSelected, season, setSeason, teamFilter, setTeamFilter }) => {
  const [q, setQ] = useState("");
  const teams = [...new Set(DRIVERS.map(d => d.team))];
  const vis = DRIVERS.filter(d =>
    (!q || d.name.toLowerCase().includes(q.toLowerCase()) || d.code.includes(q.toUpperCase())) &&
    (!teamFilter || d.team === teamFilter)
  );

  return (
    <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 18, padding: "18px 20px", marginBottom: 26 }}>
      {/* Row 1 */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: C.muted, pointerEvents: "none" }}>⌕</span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search driver…"
            style={{ background: C.s2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "7px 11px 7px 28px", color: C.text, fontSize: 12, outline: "none", width: 170 }} />
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {["All", ...SEASONS].map(s => (
            <button key={s} onClick={() => setSeason(String(s))} style={{
              background: season === String(s) ? `${C.red}1a` : C.s2,
              border: `1px solid ${season === String(s) ? C.red + "55" : C.border}`,
              color: season === String(s) ? C.red : C.dim,
              borderRadius: 9, padding: "6px 13px", fontSize: 11, fontFamily: C.mono,
              cursor: "pointer", fontWeight: 500, transition: "all .15s",
            }}>{s}</button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 7 }}>
          {[["Top 6", () => setSelected([...DRIVERS].sort((a, b) => totalPts(b) - totalPts(a)).slice(0, 6).map(d => d.code))],
            ["All 20", () => setSelected(DRIVERS.map(d => d.code))],
            ["Clear", () => setSelected([])],
          ].map(([l, fn]) => (
            <button key={l} onClick={fn} style={{
              background: C.s2, border: `1px solid ${C.border}`, color: C.dim,
              borderRadius: 9, padding: "6px 13px", fontSize: 11, fontFamily: C.mono,
              cursor: "pointer", transition: "all .15s",
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Team pills */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
        {[["All Teams", ""], ...teams.map(t => [t.split(" ")[0], t])].map(([label, val]) => (
          <button key={label} onClick={() => setTeamFilter(val)} style={{
            background: teamFilter === val ? `${tc(val || "All")}18` : C.s2,
            border: `1px solid ${teamFilter === val ? (tc(val || "All") + "55") : C.border}`,
            color: teamFilter === val ? tc(val || "All") : C.dim,
            borderRadius: 8, padding: "5px 11px", fontSize: 10,
            fontFamily: C.mono, cursor: "pointer", fontWeight: 500, transition: "all .15s",
          }}>{label}</button>
        ))}
      </div>

      {/* Driver pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {vis.map(d => {
          const c = tc(d.team), on = selected.includes(d.code);
          return (
            <button key={d.code}
              onClick={() => setSelected(p => p.includes(d.code) ? p.filter(x => x !== d.code) : [...p, d.code])}
              style={{
                background: on ? `${c}1a` : C.s2, border: `1px solid ${on ? c + "55" : C.border}`,
                borderRadius: 8, padding: "5px 12px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
                boxShadow: on ? `0 3px 10px ${c}22` : "none", transition: "all .15s",
              }}>
              <div style={{ width: 3, height: 13, background: c, borderRadius: 2 }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: on ? c : C.dim, fontFamily: C.mono }}>{d.code}</span>
            </button>
          );
        })}
      </div>
      <p style={{ marginTop: 9, fontSize: 10, color: C.muted, fontFamily: C.fn }}>
        {selected.length}/{DRIVERS.length} selected · {season === "All" ? "2019–2025" : season}
      </p>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   AI ORACLE  — 4 features
───────────────────────────────────────────────────────────── */
async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.find(b => b.type === "text")?.text || "No response received.";
}

function AIOracle() {
  const [tab, setTab] = useState("predictor");

  /* ── 1. Race Predictor ── */
  const [circuit, setCircuit] = useState("Monaco");
  const [predLoading, setPredLoading] = useState(false);
  const [predResult, setPredResult] = useState("");
  const runPredictor = async () => {
    setPredLoading(true); setPredResult("");
    const snapshot = [...DRIVERS]
      .sort((a, b) => totalPts(b) - totalPts(a))
      .slice(0, 12)
      .map(d => `${d.name} (${d.team}, pace=${d.pace}, consistency=${d.cons}, wet=${d.wet}, quali=${d.quali}, 2025pts=${d.pts[2025] || 0})`)
      .join("\n");
    const prompt = `You are a sharp, opinionated F1 analyst. Predict the top 5 race finishers at ${circuit} in 2025.

Driver form data:
${snapshot}

Consider: circuit type (street or permanent), overtaking difficulty, tyre deg, quali importance, team pace. 
Format: numbered 1–5, driver name + team, then ONE punchy sentence of reasoning. Be bold, not wishy-washy. 
End with one line: your confidence level (Low / Medium / High) and why.`;
    const r = await callClaude(prompt);
    setPredResult(r); setPredLoading(false);
  };

  /* ── 2. Strategy Advisor ── */
  const [stratDriver, setStratDriver] = useState("VER");
  const [lapNum, setLapNum]   = useState(28);
  const [tyreAge, setTyreAge] = useState(18);
  const [weather, setWeather] = useState("dry");
  const [position, setPosition] = useState(3);
  const [stratLoading, setStratLoading] = useState(false);
  const [stratResult, setStratResult]   = useState("");
  const runStrategy = async () => {
    setStratLoading(true); setStratResult("");
    const d = DRIVERS.find(x => x.code === stratDriver);
    const prompt = `You are a senior F1 race strategist. Make a strategy call:

Driver: ${d.name} (${d.team})
Current lap: ${lapNum} of 58
Tyre age: ${tyreAge} laps
Conditions: ${weather}
Current position: P${position}
Driver consistency rating: ${d.cons}/100
Team strategy strength: ${d.team === "Red Bull" || d.team === "Mercedes" ? "Elite" : d.team === "Ferrari" || d.team === "McLaren" ? "Strong" : "Average"}

Should they: PIT NOW, STAY OUT, or attempt an UNDERCUT on the car ahead?
Give your recommendation in 1 bold sentence, then 3–4 sentences of reasoning using specific lap numbers and tyre data. Talk like a real race engineer on the pit wall. No hedging.`;
    const r = await callClaude(prompt);
    setStratResult(r); setStratLoading(false);
  };

  /* ── 3. Driver Report Card ── */
  const [scoutCode, setScoutCode] = useState("VER");
  const [scoutLoading, setScoutLoading] = useState(false);
  const [scoutResult, setScoutResult]   = useState("");
  const runScout = async () => {
    setScoutLoading(true); setScoutResult("");
    const d = DRIVERS.find(x => x.code === scoutCode);
    const pts25 = d.pts[2025] || 0, pts24 = d.pts[2024] || 0;
    const trend = pts25 > pts24 ? "improving" : pts25 < pts24 ? "declining" : "stable";
    const prompt = `Write a professional F1 driver scouting report for ${d.name}. Be honest, analytical, and specific.

Stats: ${totalWins(d)} career wins · ${totalPts(d)} career points · ${totalPods(d)} podiums
Ratings (out of 100): Pace ${d.pace} · Race Craft ${d.craft} · Consistency ${d.cons} · Wet Skill ${d.wet} · Qualifying ${d.quali}
Current team: ${d.team} · Age: ${d.age} · Career starts: ${d.starts}
2024 points: ${pts24} · 2025 points: ${pts25} · Form trend: ${trend}

Write exactly 3 paragraphs:
1. STRENGTHS — what makes them special, use specific data
2. WEAKNESSES — honest assessment, where they cost themselves results
3. VERDICT — market value, ceiling, whether they'll win a title

Tone: like a senior scout briefing a team principal. Direct, no fluff, under 220 words.`;
    const r = await callClaude(prompt);
    setScoutResult(r); setScoutLoading(false);
  };

  /* ── 4. Natural Language Q&A ── */
  const [question, setQuestion] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const [qaResult, setQaResult]   = useState("");
  const QUICK_Q = [
    "Who has the best wet weather record?",
    "Which driver improved most from 2023 to 2025?",
    "Compare Norris and Verstappen's career arcs",
    "Who is the most underrated driver in the data?",
    "Best qualifier vs best racer — who are they?",
  ];
  const runQA = async (q = question) => {
    if (!q.trim()) return;
    setQuestion(q); setQaLoading(true); setQaResult("");
    const db = DRIVERS.map(d =>
      `${d.name}(${d.code}): team=${d.team}, pace=${d.pace}, craft=${d.craft}, wet=${d.wet}, quali=${d.quali}, cons=${d.cons}, wins=${totalWins(d)}, pts=${totalPts(d)}, 2024=${d.pts[2024] || 0}, 2025=${d.pts[2025] || 0}`
    ).join("\n");
    const prompt = `You are an F1 data analyst with access to this driver database (2019–2025 seasons):\n\n${db}\n\nAnswer this question concisely, using specific data from the database:\n"${q}"\n\nBe direct and confident. Use exact numbers. 4–6 sentences maximum.`;
    const r = await callClaude(prompt);
    setQaResult(r); setQaLoading(false);
  };

  /* ── 5. Race Radio Simulator ── */
  const [radioDriver, setRadioDriver] = useState("VER");
  const [radioCircuit, setRadioCircuit] = useState("Monaco");
  const [radioLap, setRadioLap] = useState(32);
  const [radioPos, setRadioPos] = useState(2);
  const [radioTyre, setRadioTyre] = useState("Medium");
  const [radioTyreAge, setRadioTyreAge] = useState(22);
  const [radioGap, setRadioGap] = useState(2.4);
  const [radioWeather, setRadioWeather] = useState("Dry");
  const [radioMessages, setRadioMessages] = useState([]);
  const [radioInput, setRadioInput] = useState("");
  const [radioLoading, setRadioLoading] = useState(false);
  const [radioStarted, setRadioStarted] = useState(false);

  const radioDriverObj = DRIVERS.find(d => d.code === radioDriver);

  const startRadio = () => {
    setRadioMessages([]);
    setRadioStarted(true);
    setRadioMessages([{
      role: "assistant",
      content: `[${radioCircuit.toUpperCase()} GP · LAP ${radioLap}] Standing by, engineer. What's the call?`,
    }]);
  };

  const sendRadio = async () => {
    if (!radioInput.trim() || radioLoading) return;
    const userMsg = radioInput.trim();
    setRadioInput("");
    const conversationSoFar = [...radioMessages, { role: "user", content: userMsg }];
    setRadioMessages(conversationSoFar);
    setRadioLoading(true);
    const sysPrompt = `You are ${radioDriverObj?.name}, an F1 driver mid-race at ${radioCircuit}.
Situation: Lap ${radioLap}/58 · P${radioPos} · ${radioTyre} tyres (${radioTyreAge} laps old) · Gap ahead: ${radioGap}s · ${radioWeather}
Driver traits: Pace ${radioDriverObj?.pace}/100 · Consistency ${radioDriverObj?.cons}/100 · Wet ${radioDriverObj?.wet}/100
Stay FULLY in character. Use real radio lingo: "box box", "copy that", "I'm losing the rear", "gap is coming down".
React authentically — push back if you disagree, ask for data, show emotion. Keep replies SHORT (2–4 sentences). This is a live race.`;
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 150,
        system: sysPrompt,
        messages: conversationSoFar
          .filter(m => m.role !== "system")
          .map(m => ({ role: m.role, content: m.content })),
      }),
    });
    const data = await res.json();
    const reply = data.content?.find(b => b.type === "text")?.text || "…";
    setRadioMessages([...conversationSoFar, { role: "assistant", content: reply }]);
    setRadioLoading(false);
  };

  /* ── 6. Contract Negotiator ── */
  const [contractDriver, setContractDriver] = useState("NOR");
  const [contractSeason, setContractSeason] = useState("2025");
  const [contractTeam, setContractTeam] = useState("Ferrari");
  const [contractLoading, setContractLoading] = useState(false);
  const [contractResult, setContractResult] = useState("");

  const runContract = async () => {
    setContractLoading(true); setContractResult("");
    const d = DRIVERS.find(x => x.code === contractDriver);
    const yr = parseInt(contractSeason);
    const pts = d.pts[yr] || 0;
    const prompt = `You are a top F1 journalist and transfer insider. Write a realistic transfer story and contract analysis.

DRIVER: ${d.name} (${d.team}, age ${d.age})
${contractSeason} STATS: ${pts} pts
CAREER: ${totalWins(d)} wins · ${totalPts(d)} career points · ${d.starts} race starts
RATINGS: Pace ${d.pace}/100 · Quali ${d.quali}/100 · Consistency ${d.cons}/100 · Wet ${d.wet}/100
RUMOURED DESTINATION: ${contractTeam}

Write in exactly 4 sections with these headers:

💰 CONTRACT VALUE
Estimate a realistic salary range (£M/year). Brief justification based on stats and market.

📰 TRANSFER RUMOUR
A punchy 3-sentence story as it might appear in Autosport. Include drama and insider language.

🤝 NEGOTIATION DYNAMICS
Who has more leverage — driver or team? Key sticking points. (2-3 sentences)

🔮 VERDICT
Will this transfer happen? Rate likelihood 1–10 and explain why in one sentence.`;
    const r = await callClaude(prompt);
    setContractResult(r); setContractLoading(false);
  };

  /* ── 7. Post-Race Debrief ── */
  const HISTORIC_RACES = [
    "2021 Abu Dhabi GP","2023 Bahrain GP","2024 Monaco GP","2022 Belgian GP",
    "2024 British GP","2023 Las Vegas GP","2022 Italian GP","2021 Hungarian GP",
    "2024 Brazilian GP","2023 Austrian GP","2022 Saudi Arabian GP","2021 British GP",
    "2023 Singapore GP","2024 Japanese GP","2022 Monaco GP","2023 Dutch GP",
  ];
  const DEBRIEF_TEAMS = ["Red Bull","Ferrari","Mercedes","McLaren","Aston Martin","Alpine","Williams","RB","Haas","Sauber"];
  const [debriefRace, setDebriefRace] = useState("2024 Monaco GP");
  const [debriefTeam, setDebriefTeam] = useState("Ferrari");
  const [debriefLoading, setDebriefLoading] = useState(false);
  const [debriefResult, setDebriefResult] = useState("");

  const runDebrief = async () => {
    setDebriefLoading(true); setDebriefResult("");
    const teamDrivers = DRIVERS.filter(d => d.team === debriefTeam).map(d => d.name).join(" & ");
    const teamRatings = DRIVERS.filter(d => d.team === debriefTeam);
    const avgPace = teamRatings.length ? Math.round(teamRatings.reduce((s,d)=>s+d.pace,0)/teamRatings.length) : 80;
    const prompt = `You are the ${debriefTeam} Team Principal giving the post-race debrief after the ${debriefRace}.
Drivers: ${teamDrivers || "team drivers"} · Team pace rating: ${avgPace}/100

Write a detailed, realistic debrief to your senior engineers. Use exactly these 5 sections:

🏁 RACE OVERVIEW
Honest summary of how the race went for ${debriefTeam}. Specific positions, key moments. 3 sentences.

⚙️ STRATEGY ANALYSIS
Evaluate every pit stop decision. What worked, what didn't, and why. Reference specific laps. 3-4 sentences.

📊 CAR PERFORMANCE
Tyre degradation, aero balance, straight-line speed observations. Be technical. 2-3 sentences.

❌ WHAT WENT WRONG
Brutal honesty. Mistakes, missed opportunities. Don't sugarcoat. 2-3 sentences.

✅ THREE ACTION ITEMS
Exactly 3 numbered, concrete things to change before the next race.

Tone: formal but emotionally charged — this team wants to win. Be specific to the ${debriefRace}.`;
    const r = await callClaude(prompt);
    setDebriefResult(r); setDebriefLoading(false);
  };

  const inputStyle = {
    background: C.s2, border: `1px solid ${C.border}`, borderRadius: 10,
    padding: "9px 14px", color: C.text, fontSize: 12, outline: "none", width: "100%",
  };
  const selectStyle = { ...inputStyle, cursor: "pointer", appearance: "none" };
  const runBtn = (label, onClick, loading, color = C.violet) => (
    <button onClick={onClick} disabled={loading} className="btn-press" style={{
      background: `linear-gradient(135deg, ${color}, ${color === C.violet ? C.red : C.violet})`,
      border: "none", color: "#fff", borderRadius: 11, padding: "10px 24px",
      fontSize: 12, fontFamily: C.mono, cursor: loading ? "wait" : "pointer",
      fontWeight: 600, letterSpacing: ".08em", opacity: loading ? .55 : 1,
      transition: "opacity .2s",
    }}>{loading ? "THINKING…" : label}</button>
  );

  return (
    <div>
      <PageHead title="AI ORACLE" sub="Claude-powered race intelligence — predictions, strategy, driver reports, live radio, transfers & debriefs" color={C.violet} />

      <TabBar
        tabs={[
          ["predictor","🏁 Predictor"],
          ["strategy","🔧 Strategy"],
          ["scout","📋 Driver Report"],
          ["qa","💬 Ask Anything"],
          ["radio","📻 Race Radio"],
          ["contract","💼 Transfers"],
          ["debrief","🗂️ Debrief"],
        ]}
        active={tab} setActive={setTab} />

      {/* ── RACE PREDICTOR ── */}
      {tab === "predictor" && (
        <GCard style={{ padding: 30 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: C.disp, marginBottom: 6 }}>Race Predictor</h3>
          <p style={{ fontSize: 12, color: C.dim, marginBottom: 22, lineHeight: 1.6 }}>
            Pick any circuit. Claude analyses current driver form, pace ratings, and circuit characteristics to predict the top 5 finishers.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 22 }}>
            <div style={{ flex: "1 1 220px" }}>
              <label style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, display: "block", marginBottom: 7, letterSpacing: ".1em" }}>CIRCUIT</label>
              <select value={circuit} onChange={e => setCircuit(e.target.value)} style={selectStyle}>
                {CIRCUITS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {runBtn("PREDICT PODIUM ›", runPredictor, predLoading, C.violet)}
          </div>

          {/* Quick insight cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Street circuits favour", val: "Alonso, Perez, Leclerc" },
              { label: "Best qualifers", val: "Leclerc, Norris, Russell" },
              { label: "Wet weather elites", val: "Hamilton (99), Alonso (97)" },
              { label: "2025 form leaders", val: "Norris 462, VER 429, PIA 388" },
            ].map(i => (
              <div key={i.label} style={{ background: C.s1, borderRadius: 11, padding: "12px 14px" }}>
                <p style={{ fontSize: 9, color: C.muted, fontFamily: C.mono, marginBottom: 5 }}>{i.label.toUpperCase()}</p>
                <p style={{ fontSize: 11, color: C.dim, fontFamily: C.fn }}>{i.val}</p>
              </div>
            ))}
          </div>

          <AiBox text={predResult} loading={predLoading} color={C.violet} />
        </GCard>
      )}

      {/* ── STRATEGY ADVISOR ── */}
      {tab === "strategy" && (
        <GCard style={{ padding: 30 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: C.disp, marginBottom: 6 }}>Strategy Advisor</h3>
          <p style={{ fontSize: 12, color: C.dim, marginBottom: 24, lineHeight: 1.6 }}>
            Set the race situation. Claude acts as your race engineer and makes the call.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 22 }}>
            <div>
              <label style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, display: "block", marginBottom: 7, letterSpacing: ".1em" }}>DRIVER</label>
              <select value={stratDriver} onChange={e => setStratDriver(e.target.value)} style={selectStyle}>
                {DRIVERS.map(d => <option key={d.code} value={d.code}>{d.code} — {d.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, display: "block", marginBottom: 7, letterSpacing: ".1em" }}>CONDITIONS</label>
              <select value={weather} onChange={e => setWeather(e.target.value)} style={selectStyle}>
                {["dry", "damp", "wet", "safety car deployed", "VSC active"].map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            <SliderRow label={`Lap: ${lapNum} / 58`} value={lapNum} setValue={setLapNum} min={1} max={57} color={C.gold} fmt={v => `Lap ${v}`} />
            <SliderRow label={`Tyre age: ${tyreAge} laps`} value={tyreAge} setValue={setTyreAge} min={1} max={50} color={C.red} fmt={v => `${v} laps`} />
            <SliderRow label={`Current position: P${position}`} value={position} setValue={setPosition} min={1} max={20} color={C.cyan} fmt={v => `P${v}`} />
          </div>
          {/* Live situation summary */}
          <div style={{ background: C.s1, borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", gap: 20, flexWrap: "wrap" }}>
            {[
              { l: "Driver", v: DRIVERS.find(d => d.code === stratDriver)?.name, c: tc(DRIVERS.find(d => d.code === stratDriver)?.team) },
              { l: "Lap", v: `${lapNum}/58`, c: C.gold },
              { l: "Tyre Age", v: `${tyreAge} laps`, c: tyreAge > 30 ? C.red : C.green },
              { l: "Conditions", v: weather, c: weather === "dry" ? C.green : C.cyan },
              { l: "Position", v: `P${position}`, c: position <= 3 ? C.gold : C.text },
            ].map(item => (
              <div key={item.l}>
                <p style={{ fontSize: 9, color: C.muted, fontFamily: C.mono, marginBottom: 3 }}>{item.l.toUpperCase()}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: item.c, fontFamily: C.disp }}>{item.v}</p>
              </div>
            ))}
          </div>
          {runBtn("GET STRATEGY CALL ›", runStrategy, stratLoading, C.gold)}
          <AiBox text={stratResult} loading={stratLoading} color={C.gold} />
        </GCard>
      )}

      {/* ── DRIVER REPORT CARD ── */}
      {tab === "scout" && (
        <GCard style={{ padding: 30 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: C.disp, marginBottom: 6 }}>Driver Report Card</h3>
          <p style={{ fontSize: 12, color: C.dim, marginBottom: 22, lineHeight: 1.6 }}>
            AI writes a professional scouting report — strengths, weaknesses, and a verdict on their title ceiling.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 22 }}>
            <div style={{ flex: "1 1 240px" }}>
              <label style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, display: "block", marginBottom: 7, letterSpacing: ".1em" }}>SELECT DRIVER</label>
              <select value={scoutCode} onChange={e => { setScoutCode(e.target.value); setScoutResult(""); }} style={selectStyle}>
                {DRIVERS.map(d => <option key={d.code} value={d.code}>{d.code} — {d.name}</option>)}
              </select>
            </div>
            {runBtn("GENERATE REPORT ›", runScout, scoutLoading, C.cyan)}
          </div>

          {/* Driver stat preview */}
          {(() => {
            const d = DRIVERS.find(x => x.code === scoutCode);
            const c = tc(d.team);
            return (
              <div style={{ background: C.s1, borderRadius: 14, padding: 20, marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 18, marginBottom: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
                  {/* Photo */}
                  <DriverPhoto code={d.code} team={d.team} size={100} tall />
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontSize: 9, color: c, fontFamily: C.mono, letterSpacing: ".14em", marginBottom: 2 }}>#{d.num} · {d.nat}</div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: c, fontFamily: C.disp, lineHeight: 1 }}>{d.code}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginTop: 3 }}>{d.name}</div>
                    <div style={{ display: "flex", gap: 7, marginTop: 8, flexWrap: "wrap" }}>
                      <Pill label={d.team} color={c} sm />
                      <Pill label={`Age ${d.age}`} color={C.muted} sm />
                      <Pill label={`${totalWins(d)} wins`} color={C.gold} sm />
                      <Pill label={`${totalPts(d)} pts`} color={C.text} sm />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 220 }}>
                    {[["Pace", d.pace, c], ["Race Craft", d.craft, c], ["Consistency", d.cons, C.green], ["Wet Skill", d.wet, C.cyan], ["Qualifying", d.quali, C.gold]].map(([label, val, barC]) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 10, color: C.dim, fontFamily: C.mono, width: 84, flexShrink: 0 }}>{label}</span>
                        <div style={{ flex: 1, height: 4, background: C.s2, borderRadius: 2 }}>
                          <div style={{ width: `${val}%`, height: "100%", background: barC, borderRadius: 2, transition: "width .8s ease" }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: barC, fontFamily: C.disp, width: 26, textAlign: "right" }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: 12, color: C.dim, fontFamily: C.fn, lineHeight: 1.7, fontStyle: "italic" }}>"{d.bio}"</p>
              </div>
            );
          })()}
          <AiBox text={scoutResult} loading={scoutLoading} color={C.cyan} />
        </GCard>
      )}

      {/* ── Q&A ── */}
      {tab === "qa" && (
        <GCard style={{ padding: 30 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: C.disp, marginBottom: 6 }}>Ask Anything</h3>
          <p style={{ fontSize: 12, color: C.dim, marginBottom: 22, lineHeight: 1.6 }}>
            Natural language questions about drivers, teams, stats, and strategy. Claude has the full 2019–2025 dataset.
          </p>

          {/* Quick questions */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            {QUICK_Q.map(q => (
              <button key={q} onClick={() => runQA(q)} style={{
                background: C.s1, border: `1px solid ${C.border}`, color: C.dim,
                borderRadius: 9, padding: "7px 13px", fontSize: 11,
                fontFamily: C.fn, cursor: "pointer", transition: "all .15s",
              }}>{q}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{ display: "flex", gap: 10, marginBottom: 6 }}>
            <input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === "Enter" && runQA()}
              placeholder="e.g. Who has the best wet weather record at Monaco?"
              style={{ flex: 1, background: C.s2, border: `1px solid ${C.border}`, borderRadius: 11, padding: "11px 15px", color: C.text, fontSize: 13, outline: "none" }}
            />
            <button onClick={() => runQA()} disabled={!question.trim() || qaLoading} className="btn-press" style={{
              background: `linear-gradient(135deg, ${C.green}, ${C.cyan})`,
              border: "none", color: C.bg, borderRadius: 11, padding: "11px 22px",
              fontSize: 12, fontFamily: C.mono, fontWeight: 700,
              cursor: !question.trim() || qaLoading ? "default" : "pointer",
              opacity: !question.trim() || qaLoading ? .5 : 1, transition: "opacity .2s",
            }}>ASK ›</button>
          </div>
          <p style={{ fontSize: 10, color: C.muted, fontFamily: C.fn, marginBottom: 4 }}>Press Enter or click Ask ›</p>
          <AiBox text={qaResult} loading={qaLoading} color={C.green} />
        </GCard>
      )}
      {/* ── RACE RADIO SIMULATOR ── */}
      {tab === "radio" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <GCard style={{ padding: 28 }} noHover>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.red, animation: radioStarted ? "pulse .8s ease infinite" : "none" }} />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: C.disp }}>Race Radio Simulator</h3>
            </div>
            <p style={{ fontSize: 12, color: C.dim, marginBottom: 22, lineHeight: 1.6 }}>
              You're the race engineer. Claude plays the driver. Set the scenario, then give orders — pit calls, tyre info, gap updates. The driver will react authentically.
            </p>

            {/* Scenario builder */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14, marginBottom: 20 }}>
              {[
                ["DRIVER", <select value={radioDriver} onChange={e=>{setRadioDriver(e.target.value);setRadioStarted(false);setRadioMessages([]);}} style={selectStyle}>
                  {DRIVERS.map(d=><option key={d.code} value={d.code}>{d.code} — {d.name}</option>)}
                </select>],
                ["CIRCUIT", <select value={radioCircuit} onChange={e=>{setRadioCircuit(e.target.value);setRadioStarted(false);setRadioMessages([]);}} style={selectStyle}>
                  {CIRCUITS.map(c=><option key={c} value={c}>{c}</option>)}
                </select>],
                ["LAP", <input type="number" value={radioLap} min={1} max={78} onChange={e=>setRadioLap(+e.target.value)} style={inputStyle} />],
                ["POSITION", <input type="number" value={radioPos} min={1} max={20} onChange={e=>setRadioPos(+e.target.value)} style={inputStyle} />],
                ["TYRE", <select value={radioTyre} onChange={e=>setRadioTyre(e.target.value)} style={selectStyle}>
                  {["Soft","Medium","Hard","Inter","Wet"].map(t=><option key={t}>{t}</option>)}
                </select>],
                ["TYRE AGE (LAPS)", <input type="number" value={radioTyreAge} min={0} max={50} onChange={e=>setRadioTyreAge(+e.target.value)} style={inputStyle} />],
                ["GAP AHEAD (s)", <input type="number" value={radioGap} min={0} max={60} step={0.1} onChange={e=>setRadioGap(+e.target.value)} style={inputStyle} />],
                ["CONDITIONS", <select value={radioWeather} onChange={e=>setRadioWeather(e.target.value)} style={selectStyle}>
                  {["Dry","Damp","Light Rain","Heavy Rain","Changing"].map(w=><option key={w}>{w}</option>)}
                </select>],
              ].map(([label, el]) => (
                <div key={label}>
                  <label style={{ fontSize: 9, color: C.muted, fontFamily: C.mono, letterSpacing: ".12em", display: "block", marginBottom: 6 }}>{label}</label>
                  {el}
                </div>
              ))}
            </div>

            {/* Driver status strip */}
            {radioDriverObj && (
              <div style={{ display: "flex", gap: 14, alignItems: "center", background: C.s1, borderRadius: 12, padding: "12px 16px", marginBottom: 18 }}>
                <DriverPhoto code={radioDriverObj.code} team={radioDriverObj.team} size={54} tall />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: tc(radioDriverObj.team), fontFamily: C.disp }}>{radioDriverObj.code}</div>
                  <div style={{ fontSize: 11, color: C.dim, fontFamily: C.fn }}>{radioDriverObj.name} · {radioDriverObj.team}</div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {[["Pace",radioDriverObj.pace],["Craft",radioDriverObj.craft],["Wet",radioDriverObj.wet]].map(([l,v])=>(
                    <div key={l} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: tc(radioDriverObj.team), fontFamily: C.disp }}>{v}</div>
                      <div style={{ fontSize: 8, color: C.muted, fontFamily: C.mono }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: `${tc(radioDriverObj.team)}18`, border: `1px solid ${tc(radioDriverObj.team)}44`, borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: C.muted, fontFamily: C.mono }}>P{radioPos} · LAP {radioLap}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: tc(radioDriverObj.team), fontFamily: C.disp, marginTop: 2 }}>
                    {radioTyre.toUpperCase()} · {radioTyreAge}L
                  </div>
                </div>
              </div>
            )}

            <button onClick={startRadio} className="btn-press" style={{
              background: `linear-gradient(135deg, ${C.red}, #ff6b00)`,
              border: "none", color: "#fff", borderRadius: 11, padding: "11px 28px",
              fontSize: 12, fontFamily: C.mono, fontWeight: 700, letterSpacing: ".1em", cursor: "pointer",
            }}>
              {radioStarted ? "🔄 RESET SCENARIO" : "📻 START RADIO SESSION"}
            </button>
          </GCard>

          {/* Chat interface */}
          {radioStarted && (
            <GCard style={{ padding: 0, overflow: "hidden" }} noHover>
              {/* Header bar */}
              <div style={{ background: `linear-gradient(90deg, ${C.red}22, ${C.s1})`, padding: "14px 22px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.red, animation: "pulse .8s ease infinite" }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.red, fontFamily: C.mono, letterSpacing: ".1em" }}>LIVE RACE RADIO</span>
                </div>
                <span style={{ fontSize: 10, color: C.muted, fontFamily: C.mono }}>{radioCircuit} · P{radioPos} · Lap {radioLap}</span>
              </div>

              {/* Message thread */}
              <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14, maxHeight: 420, overflowY: "auto" }}>
                {radioMessages.map((m, i) => {
                  const isDriver = m.role === "assistant";
                  const drvColor = tc(radioDriverObj?.team);
                  return (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", flexDirection: isDriver ? "row" : "row-reverse" }}>
                      {/* Avatar */}
                      <div style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        background: isDriver ? `${drvColor}22` : `${C.cyan}22`,
                        border: `1px solid ${isDriver ? drvColor + "44" : C.cyan + "44"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 700,
                        color: isDriver ? drvColor : C.cyan, fontFamily: C.mono,
                      }}>
                        {isDriver ? radioDriverObj?.code : "ENG"}
                      </div>
                      {/* Bubble */}
                      <div style={{
                        maxWidth: "72%",
                        background: isDriver ? `${drvColor}12` : `${C.cyan}10`,
                        border: `1px solid ${isDriver ? drvColor + "30" : C.cyan + "30"}`,
                        borderRadius: isDriver ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
                        padding: "10px 14px",
                      }}>
                        <div style={{ fontSize: 8, color: isDriver ? drvColor : C.cyan, fontFamily: C.mono, marginBottom: 5, letterSpacing: ".1em" }}>
                          {isDriver ? radioDriverObj?.name?.toUpperCase() : "ENGINEER"}
                        </div>
                        <p style={{ fontSize: 13, color: C.text, fontFamily: C.fn, lineHeight: 1.6 }}>{m.content}</p>
                      </div>
                    </div>
                  );
                })}
                {radioLoading && (
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: `${tc(radioDriverObj?.team)}22`, border: `1px solid ${tc(radioDriverObj?.team)}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Spinner color={tc(radioDriverObj?.team)} />
                    </div>
                    <span style={{ fontSize: 12, color: C.muted, fontFamily: C.fn }}>
                      {radioDriverObj?.name?.split(" ")[0]} is responding…
                    </span>
                  </div>
                )}
              </div>

              {/* Input */}
              <div style={{ padding: "14px 22px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10 }}>
                <input
                  value={radioInput}
                  onChange={e => setRadioInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendRadio()}
                  placeholder={`e.g. "Box box, we're putting you on softs" or "Gap to ${radioPos > 1 ? "the leader" : "P2"} is ${radioGap}s"`}
                  style={{ flex: 1, background: C.s2, border: `1px solid ${C.border}`, borderRadius: 11, padding: "11px 15px", color: C.text, fontSize: 12, outline: "none" }}
                />
                <button onClick={sendRadio} disabled={!radioInput.trim() || radioLoading} className="btn-press" style={{
                  background: `linear-gradient(135deg, ${C.red}, #ff6b00)`,
                  border: "none", color: "#fff", borderRadius: 11, padding: "11px 20px",
                  fontSize: 12, fontFamily: C.mono, fontWeight: 700, cursor: "pointer",
                  opacity: !radioInput.trim() || radioLoading ? .5 : 1,
                }}>SEND ›</button>
              </div>

              {/* Suggested calls */}
              <div style={{ padding: "0 22px 18px", display: "flex", gap: 7, flexWrap: "wrap" }}>
                {[
                  `Box box, box box.`,
                  `Gap to P${radioPos > 1 ? radioPos-1 : 2} is ${radioGap}s.`,
                  `Push push push, we need purple.`,
                  `Stay out, stay out — tyres have two more laps.`,
                  `Understood, stay cool. You're ${radioGap}s from a podium.`,
                ].map(q => (
                  <button key={q} onClick={() => { setRadioInput(q); }} style={{
                    background: C.s1, border: `1px solid ${C.border}`, color: C.muted,
                    borderRadius: 8, padding: "5px 11px", fontSize: 10, fontFamily: C.fn, cursor: "pointer",
                  }}>{q}</button>
                ))}
              </div>
            </GCard>
          )}
        </div>
      )}

      {/* ── CONTRACT NEGOTIATOR ── */}
      {tab === "contract" && (
        <GCard style={{ padding: 30 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: C.disp, marginBottom: 6 }}>Transfer Market</h3>
          <p style={{ fontSize: 12, color: C.dim, marginBottom: 24, lineHeight: 1.6 }}>
            Simulate a transfer rumour. Pick a driver, a season's stats, and a rumoured destination — Claude writes the story, the contract value, and the negotiation dynamics.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16, marginBottom: 22 }}>
            <div>
              <label style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", display: "block", marginBottom: 7 }}>DRIVER</label>
              <select value={contractDriver} onChange={e => { setContractDriver(e.target.value); setContractResult(""); }} style={selectStyle}>
                {DRIVERS.map(d => <option key={d.code} value={d.code}>{d.code} — {d.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", display: "block", marginBottom: 7 }}>SEASON</label>
              <select value={contractSeason} onChange={e => setContractSeason(e.target.value)} style={selectStyle}>
                {["2025","2024","2023","2022","2021","2020","2019"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", display: "block", marginBottom: 7 }}>RUMOURED DESTINATION</label>
              <select value={contractTeam} onChange={e => setContractTeam(e.target.value)} style={selectStyle}>
                {["Red Bull","Ferrari","Mercedes","McLaren","Aston Martin","Alpine","Williams","RB","Haas","Sauber"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Driver preview */}
          {(() => {
            const d = DRIVERS.find(x => x.code === contractDriver);
            const c = tc(d?.team);
            const yr = parseInt(contractSeason);
            return (
              <div style={{ display: "flex", gap: 16, background: C.s1, borderRadius: 14, padding: "16px 20px", marginBottom: 22, alignItems: "center", flexWrap: "wrap" }}>
                <DriverPhoto code={d.code} team={d.team} size={72} tall />
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: c, fontFamily: C.disp, lineHeight: 1 }}>{d.code}</div>
                  <div style={{ fontSize: 12, color: C.text, marginTop: 2 }}>{d.name}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    <Pill label={d.team} color={c} sm />
                    <Pill label={`Age ${d.age}`} color={C.muted} sm />
                    <Pill label={`${d.pts[yr] || 0} pts in ${contractSeason}`} color={C.gold} sm />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: C.muted, fontFamily: C.mono }}>MOVING TO</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: tc(contractTeam), fontFamily: C.disp, marginTop: 4 }}>{contractTeam}</div>
                  </div>
                  <div style={{ fontSize: 24, marginLeft: 8 }}>→</div>
                </div>
              </div>
            );
          })()}

          {runBtn("GENERATE TRANSFER STORY ›", runContract, contractLoading, "#e8b44e")}
          <AiBox text={contractResult} loading={contractLoading} color="#e8b44e" />
        </GCard>
      )}

      {/* ── POST-RACE DEBRIEF ── */}
      {tab === "debrief" && (
        <GCard style={{ padding: 30 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: C.disp, marginBottom: 6 }}>Post-Race Debrief</h3>
          <p style={{ fontSize: 12, color: C.dim, marginBottom: 24, lineHeight: 1.6 }}>
            Pick a historic race and a team. Claude writes the full internal debrief — strategy analysis, car performance, what went wrong, and next-race action items — from the Team Principal's perspective.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", display: "block", marginBottom: 7 }}>RACE</label>
              <select value={debriefRace} onChange={e => { setDebriefRace(e.target.value); setDebriefResult(""); }} style={selectStyle}>
                {HISTORIC_RACES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", display: "block", marginBottom: 7 }}>TEAM</label>
              <select value={debriefTeam} onChange={e => { setDebriefTeam(e.target.value); setDebriefResult(""); }} style={selectStyle}>
                {DEBRIEF_TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Team + race preview */}
          <div style={{ display: "flex", gap: 16, background: C.s1, borderRadius: 14, padding: "16px 20px", marginBottom: 22, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 10 }}>
              {DRIVERS.filter(d => d.team === debriefTeam).slice(0, 2).map(d => (
                <DriverPhoto key={d.code} code={d.code} team={d.team} size={62} tall />
              ))}
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em" }}>TEAM</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: tc(debriefTeam), fontFamily: C.disp, lineHeight: 1.2 }}>{debriefTeam}</div>
              <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>
                {DRIVERS.filter(d => d.team === debriefTeam).map(d => d.name).join(" & ")}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: C.mono }}>DEBRIEF FOR</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text, fontFamily: C.disp, marginTop: 3 }}>{debriefRace}</div>
            </div>
          </div>

          {runBtn("GENERATE DEBRIEF ›", runDebrief, debriefLoading, C.cyan)}
          <AiBox text={debriefResult} loading={debriefLoading} color={C.cyan} />
        </GCard>
      )}
    </div>
  );
}
function DriverHub({ selected, setSelected, season, setSeason }) {
  const [teamFilter, setTeamFilter] = useState("");
  const [view, setView] = useState("grid");
  const [sortBy, setSortBy] = useState("pts");
  const [cmpA, setCmpA] = useState("VER");
  const [cmpB, setCmpB] = useState("NOR");
  const [toast, setToast] = useState(null);
  const [reveals, setReveals] = useState({});

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const filtered = useMemo(() => {
    const list = selected.length ? DRIVERS.filter(d => selected.includes(d.code)) : DRIVERS;
    return [...list].filter(d => !teamFilter || d.team === teamFilter).sort((a, b) => {
      if (sortBy === "pts")   return sv(b, "pts", season) - sv(a, "pts", season);
      if (sortBy === "wins")  return sv(b, "wins", season) - sv(a, "wins", season);
      if (sortBy === "pace")  return b.pace - a.pace;
      if (sortBy === "quali") return b.quali - a.quali;
      if (sortBy === "dnfs")  return sv(a, "dnfs", season) - sv(b, "dnfs", season);
      return 0;
    });
  }, [selected, season, sortBy, teamFilter]);

  const progData = useMemo(() =>
    SEASONS.map(yr => ({
      year: String(yr),
      ...Object.fromEntries(filtered.slice(0, 8).map(d => [d.code, d.pts[yr] || 0])),
    })), [filtered]);

  const dA = DRIVERS.find(d => d.code === cmpA);
  const dB = DRIVERS.find(d => d.code === cmpB);
  const cA = tc(dA?.team), cB = tc(dB?.team);

  const cmpMetrics = dA && dB ? [
    { l: "Pace",          a: dA.pace,          b: dB.pace,         mx: 100 },
    { l: "Race Craft",    a: dA.craft,         b: dB.craft,        mx: 100 },
    { l: "Consistency",   a: dA.cons,          b: dB.cons,         mx: 100 },
    { l: "Wet Skill",     a: dA.wet,           b: dB.wet,          mx: 100 },
    { l: "Qualifying",    a: dA.quali,         b: dB.quali,        mx: 100 },
    { l: "Career Points", a: totalPts(dA),     b: totalPts(dB),    mx: 2200 },
    { l: "Career Wins",   a: totalWins(dA),    b: totalWins(dB),   mx: 56 },
    { l: "Career Pods",   a: totalPods(dA),    b: totalPods(dB),   mx: 130 },
    { l: "Avg Grid (inv)",a: 20 - dA.avgGrid,  b: 20 - dB.avgGrid, mx: 20 },
  ] : [];

  return (
    <div>
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 9999,
          background: C.s1, border: `1px solid ${C.gold}44`, borderRadius: 14,
          padding: "14px 20px", animation: "popIn .4s ease",
          boxShadow: `0 20px 44px rgba(0,0,0,.6), 0 0 24px ${C.gold}22`, maxWidth: 300,
        }}>
          <p style={{ fontSize: 12, color: C.gold, fontFamily: C.fn }}>{toast}</p>
        </div>
      )}

      <PageHead title="DRIVER HUB" sub="All 20 drivers · 2019–2025 · click cards 3× to unlock secret stats" />
      <FilterBar selected={selected} setSelected={setSelected} season={season} setSeason={setSeason}
        teamFilter={teamFilter} setTeamFilter={setTeamFilter} />

      {/* View + Sort controls */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4, background: C.s1, borderRadius: 11, padding: 4 }}>
          {[["grid","Grid"],["compare","Compare ⚡"],["table","Table"],["scatter","Scatter"],["trends","Trends"]].map(([v, l]) => (
            <button key={v} onClick={() => setView(v)} style={{
              background: view === v ? C.card : "transparent",
              border: `1px solid ${view === v ? C.border : "transparent"}`,
              color: view === v ? C.text : C.dim,
              borderRadius: 8, padding: "6px 14px", fontSize: 11,
              fontFamily: C.mono, cursor: "pointer", transition: "all .2s",
            }}>{l}</button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: C.muted, fontFamily: C.mono }}>SORT</span>
          {["pts", "wins", "pace", "quali", "dnfs"].map(s => (
            <button key={s} onClick={() => setSortBy(s)} style={{
              background: sortBy === s ? `${C.gold}18` : C.s1,
              border: `1px solid ${sortBy === s ? C.gold + "44" : C.border}`,
              color: sortBy === s ? C.gold : C.dim,
              borderRadius: 8, padding: "5px 11px", fontSize: 10,
              fontFamily: C.mono, cursor: "pointer", transition: "all .15s",
            }}>{s.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* ── GRID ── */}
      {view === "grid" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 18 }}>
          {filtered.map((d, i) => {
            const c = tc(d.team);
            const pts   = sv(d, "pts", season);
            const wins  = sv(d, "wins", season);
            const pods  = sv(d, "podiums", season);
            const poles = sv(d, "poles", season);
            const dnfs  = sv(d, "dnfs", season);
            const clicks = reveals[d.code] || 0;
            const unlocked = clicks >= 3;
            const radarData = [
              { a: "Pace", v: d.pace }, { a: "Craft", v: d.craft },
              { a: "Cons", v: d.cons }, { a: "Wet", v: d.wet }, { a: "Quali", v: d.quali },
            ];
            return (
              <div key={d.code} style={{ animation: `cardIn .4s ease ${i * .04}s both` }}>
                <GCard accent={c} style={{ padding: 24, cursor: "pointer" }}>
                  <div onClick={() => {
                    const nc = (reveals[d.code] || 0) + 1;
                    setReveals(r => ({ ...r, [d.code]: nc }));
                    if (nc === 3) showToast(`🔓 ${d.code} secret unlocked!`);
                  }}>
                    {/* ── PHOTO HEADER ── */}
                    <div style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "flex-end" }}>
                      <DriverPhoto code={d.code} team={d.team} size={88} tall />
                      <div style={{ flex: 1, minWidth: 0, paddingBottom: 4 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: c, fontFamily: C.mono,
                          letterSpacing: ".15em", marginBottom: 2 }}>#{d.num} · {d.nat}</div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: c, fontFamily: C.disp, lineHeight: 1 }}>{d.code}</div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: C.text, marginTop: 3,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</div>
                        <div style={{ display: "flex", gap: 4, marginTop: 7, flexWrap: "wrap" }}>
                          <Pill label={d.team} color={c} sm />
                          <Pill label={`${d.age}y`} color={C.muted} sm />
                        </div>
                        <div style={{ marginTop: 10, textAlign: "left" }}>
                          <div style={{ fontSize: 28, fontWeight: 900, color: i < 3 ? C.gold : C.text,
                            fontFamily: C.disp, lineHeight: 1 }}>{pts}</div>
                          <div style={{ fontSize: 9, color: C.muted, fontFamily: C.mono }}>
                            {season === "All" ? "CAREER" : season} PTS
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 7, marginBottom: 16 }}>
                      {[["W", wins, wins > 5 ? C.gold : C.text], ["POD", pods, pods > 8 ? c : C.text], ["POLE", poles, poles > 5 ? C.cyan : C.text], ["DNF", dnfs, dnfs > 6 ? C.red : C.text], ["STRT", d.starts, C.dim]].map(([l, v, col]) => (
                        <div key={l} style={{ background: C.s1, borderRadius: 10, padding: "9px 5px", textAlign: "center" }}>
                          <div style={{ fontSize: 17, fontWeight: 800, color: col, fontFamily: C.disp }}>{v}</div>
                          <div style={{ fontSize: 8, color: C.muted, fontFamily: C.mono, marginTop: 2 }}>{l}</div>
                        </div>
                      ))}
                    </div>
                    <ResponsiveContainer width="100%" height={110}>
                      <RadarChart data={radarData} margin={{ top: 4, right: 14, bottom: 4, left: 14 }}>
                        <PolarGrid stroke={`${c}1e`} />
                        <PolarAngleAxis dataKey="a" tick={{ fill: C.muted, fontSize: 9, fontFamily: C.mono }} />
                        <PolarRadiusAxis domain={[60, 100]} tick={false} axisLine={false} />
                        <Radar dataKey="v" stroke={c} fill={c} fillOpacity={0.18} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 10 }}>
                      <Pill label={d.avgFin <= 4 ? "🏆 Front Runner" : d.avgFin <= 8 ? "🔵 Points Scorer" : "⚪ Midfield"} color={c} sm />
                      <Pill label={`${d.lapTime}s avg`} color={C.muted} sm />
                    </div>
                    {!unlocked && (
                      <p style={{ fontSize: 9, color: C.muted, textAlign: "center", marginTop: 10, fontFamily: C.fn }}>
                        {clicks === 0 ? "click 3× to unlock secret stat" : `${3 - clicks} more click${3 - clicks > 1 ? "s" : ""}…`}
                      </p>
                    )}
                    {unlocked && (
                      <div style={{
                        marginTop: 14, background: `${C.gold}10`, border: `1px solid ${C.gold}33`,
                        borderRadius: 12, padding: "12px 14px", animation: "popIn .4s ease",
                      }}>
                        <p style={{ fontSize: 9, color: C.gold, fontFamily: C.mono, marginBottom: 4 }}>🔓 SECRET STAT</p>
                        <p style={{ fontSize: 12, color: C.text, fontFamily: C.fn }}>{d.secret}</p>
                      </div>
                    )}
                  </div>
                </GCard>
              </div>
            );
          })}
        </div>
      )}

      {/* ── COMPARE ── */}
      {view === "compare" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            {[[cmpA, setCmpA, cA, "Driver A"], [cmpB, setCmpB, cB, "Driver B"]].map(([val, set, col, label]) => (
              <div key={label} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: col, boxShadow: `0 0 8px ${col}88` }} />
                <span style={{ fontSize: 10, color: C.muted, fontFamily: C.mono }}>{label}:</span>
                <select value={val} onChange={e => set(e.target.value)} style={{
                  background: C.s2, border: `1px solid ${col}44`, color: C.text,
                  borderRadius: 10, padding: "8px 13px", fontSize: 12, outline: "none", minWidth: 220,
                }}>
                  {DRIVERS.map(d => <option key={d.code} value={d.code}>{d.code} — {d.name}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* Driver photo banner */}
          {dA && dB && (
            <GCard style={{ padding: 0, overflow: "hidden" }} noHover>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr" }}>
                {/* Driver A */}
                <div style={{ display: "flex", gap: 16, padding: "20px 24px", background: `linear-gradient(135deg, ${cA}18, transparent)` }}>
                  <DriverPhoto code={dA.code} team={dA.team} size={100} tall />
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 8 }}>
                    <div style={{ fontSize: 9, color: cA, fontFamily: C.mono, letterSpacing: ".14em" }}>#{dA.num} · {dA.nat}</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: cA, fontFamily: C.disp, lineHeight: 1 }}>{dA.code}</div>
                    <div style={{ fontSize: 12, color: C.text, marginTop: 3 }}>{dA.name}</div>
                    <Pill label={dA.team} color={cA} sm style={{ marginTop: 7 }} />
                  </div>
                </div>
                {/* VS divider */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px",
                  background: C.card, borderLeft: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}` }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: C.muted, fontFamily: C.mono, letterSpacing: ".2em" }}>VS</div>
                    <div style={{ width: 1, height: 32, background: C.border, margin: "8px auto" }} />
                    <div style={{ fontSize: 9, color: C.dim, fontFamily: C.mono }}>
                      {cmpMetrics.filter(m => m.a > m.b).length}–{cmpMetrics.filter(m => m.b > m.a).length}
                    </div>
                  </div>
                </div>
                {/* Driver B */}
                <div style={{ display: "flex", gap: 16, padding: "20px 24px", justifyContent: "flex-end",
                  background: `linear-gradient(225deg, ${cB}18, transparent)` }}>
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 8, textAlign: "right" }}>
                    <div style={{ fontSize: 9, color: cB, fontFamily: C.mono, letterSpacing: ".14em" }}>#{dB.num} · {dB.nat}</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: cB, fontFamily: C.disp, lineHeight: 1 }}>{dB.code}</div>
                    <div style={{ fontSize: 12, color: C.text, marginTop: 3 }}>{dB.name}</div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 7 }}>
                      <Pill label={dB.team} color={cB} sm />
                    </div>
                  </div>
                  <DriverPhoto code={dB.code} team={dB.team} size={100} tall />
                </div>
              </div>
            </GCard>
          )}

          <GCard style={{ padding: 26 }}>
            <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 20 }}>HEAD-TO-HEAD</p>
            {cmpMetrics.map(r => {
              const w = r.a > r.b ? "a" : r.a < r.b ? "b" : "tie";
              return (
                <div key={r.l} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontFamily: C.disp, color: w === "a" ? cA : C.muted, fontWeight: w === "a" ? 700 : 400 }}>
                      {r.l === "Avg Grid (inv)" ? dA.avgGrid.toFixed(1) : r.a.toLocaleString()}
                      {w === "a" && <span style={{ marginLeft: 5, fontSize: 10 }}>◀</span>}
                    </span>
                    <span style={{ fontSize: 10, color: C.muted, fontFamily: C.mono }}>{r.l}</span>
                    <span style={{ fontSize: 13, fontFamily: C.disp, color: w === "b" ? cB : C.muted, fontWeight: w === "b" ? 700 : 400 }}>
                      {w === "b" && <span style={{ marginRight: 5, fontSize: 10 }}>▶</span>}
                      {r.l === "Avg Grid (inv)" ? dB.avgGrid.toFixed(1) : r.b.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: "flex", height: 5, borderRadius: 3, overflow: "hidden", gap: 2 }}>
                    <div style={{ flex: 1, background: C.s1, display: "flex", justifyContent: "flex-end" }}>
                      <div style={{ width: `${(r.a / r.mx) * 100}%`, background: `linear-gradient(to left,${cA},${cA}66)`, transition: "width .7s cubic-bezier(.34,1.56,.64,1)" }} />
                    </div>
                    <div style={{ width: 2, background: C.border }} />
                    <div style={{ flex: 1, background: C.s1 }}>
                      <div style={{ width: `${(r.b / r.mx) * 100}%`, background: `linear-gradient(to right,${cB},${cB}66)`, transition: "width .7s cubic-bezier(.34,1.56,.64,1)" }} />
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
              <Pill label={`${cmpA} · ${dA?.name}`} color={cA} />
              <Pill label={`${cmpB} · ${dB?.name}`} color={cB} />
            </div>
          </GCard>

          {/* Radar overlay */}
          <GCard style={{ padding: 26 }}>
            <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 14 }}>SKILLS RADAR</p>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={["Pace", "Craft", "Consistency", "Wet", "Qualifying"].map(a => ({
                a,
                [cmpA]: ({ Pace: dA?.pace, Craft: dA?.craft, Consistency: dA?.cons, Wet: dA?.wet, Qualifying: dA?.quali }[a]) || 0,
                [cmpB]: ({ Pace: dB?.pace, Craft: dB?.craft, Consistency: dB?.cons, Wet: dB?.wet, Qualifying: dB?.quali }[a]) || 0,
              }))}>
                <PolarGrid stroke={C.border} />
                <PolarAngleAxis dataKey="a" tick={{ fill: C.dim, fontSize: 11, fontFamily: C.mono }} />
                <PolarRadiusAxis domain={[60, 100]} tick={false} axisLine={false} />
                <Radar dataKey={cmpA} stroke={cA} fill={cA} fillOpacity={0.15} strokeWidth={2.5} />
                <Radar dataKey={cmpB} stroke={cB} fill={cB} fillOpacity={0.15} strokeWidth={2.5} />
                <Legend wrapperStyle={{ fontSize: 11, color: C.muted, fontFamily: C.mono }} />
                <Tooltip content={<ChartTip />} />
              </RadarChart>
            </ResponsiveContainer>
          </GCard>
        </div>
      )}

      {/* ── TABLE ── */}
      {view === "table" && (
        <GCard style={{ overflow: "hidden" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "28px 42px 1fr 90px 56px 56px 56px 56px 56px 56px 56px",
            padding: "11px 20px", background: C.s1, borderBottom: `1px solid ${C.border}`,
            fontSize: 9, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", gap: 4,
          }}>
            {["#", "", "DRIVER · TEAM", "FORM", "PTS", "WINS", "PODS", "POLES", "DNFs", "PACE", "QUALI"].map((h, i) => (
              <span key={i} style={{ textAlign: i > 3 ? "right" : "left" }}>{h}</span>
            ))}
          </div>
          {filtered.map((d, i) => {
            const c = tc(d.team);
            return (
              <div key={d.code} style={{
                display: "grid", gap: 4,
                gridTemplateColumns: "28px 42px 1fr 90px 56px 56px 56px 56px 56px 56px 56px",
                padding: "12px 20px", borderBottom: `1px solid ${C.border}`,
                background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,.015)",
                alignItems: "center",
              }}>
                <span style={{ fontSize: 12, color: i < 3 ? [C.gold, "#aaa", "#cd7f32"][i] : C.muted, fontFamily: C.disp, fontWeight: 700 }}>{i + 1}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 3, height: 18, background: c, borderRadius: 2 }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: c, fontFamily: C.disp }}>{d.code}</span>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{d.name}</div>
                  <div style={{ fontSize: 9, color: c, fontFamily: C.mono, marginTop: 1 }}>{d.team}</div>
                </div>
                <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                  {[d.pace, d.craft, d.cons].map((v, j) => (
                    <div key={j} style={{ flex: 1, height: 3, background: C.s1, borderRadius: 1 }}>
                      <div style={{ width: `${v}%`, height: "100%", background: c, opacity: .7, borderRadius: 1 }} />
                    </div>
                  ))}
                </div>
                {[sv(d, "pts", season), sv(d, "wins", season), sv(d, "podiums", season), sv(d, "poles", season), sv(d, "dnfs", season), d.pace, d.quali].map((v, j) => (
                  <span key={j} style={{
                    fontSize: 12, fontFamily: C.disp, textAlign: "right",
                    color: j === 0 && v > 300 ? C.gold : j === 1 && v > 5 ? C.gold : j === 4 && v > 6 ? C.red : j >= 5 && v > 93 ? C.green : C.text,
                    fontWeight: j === 0 && v > 300 ? 800 : 400,
                  }}>{v || "—"}</span>
                ))}
              </div>
            );
          })}
        </GCard>
      )}

      {/* ── SCATTER ── */}
      {view === "scatter" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {[
            { title: "QUALI GAP → AVG FINISH", xk: "qualiGap", xl: "Qualifying gap to pole (s)", yk: "avgFin", yl: "Avg finishing position", xd: [0, 2.2], rev: true },
            { title: "PACE RATING → CAREER POINTS", xk: "pace", xl: "Pace rating", yk: "totalPts", yl: "Career points", xd: [68, 100], rev: false },
          ].map(cfg => (
            <GCard key={cfg.title} style={{ padding: 24 }}>
              <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 16 }}>{cfg.title}</p>
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart margin={{ left: 10, right: 20, top: 10, bottom: 26 }}>
                  <CartesianGrid strokeDasharray="2 5" stroke={C.s2} />
                  <XAxis dataKey="x" type="number" domain={cfg.xd}
                    label={{ value: cfg.xl, fill: C.muted, fontSize: 10, position: "insideBottom", offset: -14, fontFamily: C.mono }}
                    tick={{ fill: C.muted, fontSize: 10, fontFamily: C.mono }} />
                  <YAxis dataKey="y" reversed={cfg.rev}
                    label={{ value: cfg.yl, fill: C.muted, fontSize: 9, angle: -90, position: "insideLeft", fontFamily: C.mono }}
                    tick={{ fill: C.muted, fontSize: 10 }} />
                  <Tooltip cursor={{ strokeDasharray: "2 5", stroke: C.muted }} content={({ payload }) => {
                    if (!payload?.length) return null;
                    const p = payload[0]?.payload;
                    const dr = DRIVERS.find(x => x.code === p?.code);
                    return (
                      <div style={{ background: "rgba(10,10,20,.97)", border: `1px solid ${C.border}`, padding: "11px 15px", borderRadius: 12 }}>
                        <p style={{ fontWeight: 800, color: tc(dr?.team), fontFamily: C.disp, fontSize: 14, margin: 0 }}>{dr?.code}</p>
                        <p style={{ fontSize: 11, color: C.dim, margin: "4px 0 0" }}>{dr?.name} · {dr?.team}</p>
                      </div>
                    );
                  }} />
                  <Scatter data={filtered.map(d => ({ code: d.code, team: d.team, x: d[cfg.xk], y: cfg.yk === "totalPts" ? totalPts(d) : d[cfg.yk] }))}>
                    {filtered.map((d, i) => <Cell key={i} fill={tc(d.team)} />)}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </GCard>
          ))}
        </div>
      )}

      {/* ── TRENDS ── */}
      {view === "trends" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <GCard style={{ padding: 28 }}>
            <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 18 }}>
              CHAMPIONSHIP POINTS 2019–2025 (top 8)
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={progData} margin={{ left: -10 }}>
                <defs>
                  {filtered.slice(0, 8).map(d => (
                    <linearGradient key={d.code} id={`g${d.code}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={tc(d.team)} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={tc(d.team)} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="2 5" stroke={C.s2} />
                <XAxis dataKey="year" tick={{ fill: C.muted, fontSize: 11, fontFamily: C.mono }} />
                <YAxis tick={{ fill: C.muted, fontSize: 10 }} />
                <Tooltip content={<ChartTip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: C.muted, fontFamily: C.mono }} />
                {filtered.slice(0, 8).map(d => (
                  <Area key={d.code} type="monotone" dataKey={d.code}
                    stroke={tc(d.team)} fill={`url(#g${d.code})`}
                    strokeWidth={2.5} dot={{ r: 4, fill: tc(d.team), strokeWidth: 0 }} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </GCard>
          <GCard style={{ padding: 28 }}>
            <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 18 }}>
              RACE WINS BY SEASON
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={SEASONS.map(yr => ({ year: String(yr), ...Object.fromEntries(filtered.slice(0, 8).map(d => [d.code, d.wins[yr] || 0])) }))}
                margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="2 5" stroke={C.s2} vertical={false} />
                <XAxis dataKey="year" tick={{ fill: C.muted, fontSize: 11, fontFamily: C.mono }} />
                <YAxis tick={{ fill: C.muted, fontSize: 10 }} />
                <Tooltip content={<ChartTip />} />
                <Legend wrapperStyle={{ fontSize: 10, color: C.muted, fontFamily: C.mono }} />
                {filtered.slice(0, 8).map(d => (
                  <Bar key={d.code} dataKey={d.code} stackId="a" fill={tc(d.team)} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </GCard>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STANDINGS PAGE
───────────────────────────────────────────────────────────── */
function StandingsPage({ selected, setSelected, season, setSeason }) {
  const [teamFilter, setTeamFilter] = useState("");
  const [metric, setMetric] = useState("pts");
  const field = { pts: "pts", wins: "wins", pods: "podiums", poles: "poles" }[metric];

  const filtered = useMemo(() => {
    const list = selected.length ? DRIVERS.filter(d => selected.includes(d.code)) : DRIVERS;
    return [...list].filter(d => !teamFilter || d.team === teamFilter)
      .sort((a, b) => sv(b, field, season) - sv(a, field, season));
  }, [selected, season, metric, teamFilter, field]);

  const max = Math.max(...filtered.map(d => sv(d, field, season)), 1);

  return (
    <div>
      <PageHead title="STANDINGS" sub="Championship rankings · filter by season, team, and metric" />
      <FilterBar selected={selected} setSelected={setSelected} season={season} setSeason={setSeason}
        teamFilter={teamFilter} setTeamFilter={setTeamFilter} />
      <div style={{ display: "flex", gap: 7, marginBottom: 26 }}>
        {[["pts", "Points"], ["wins", "Wins"], ["pods", "Podiums"], ["poles", "Poles"]].map(([v, l]) => (
          <button key={v} onClick={() => setMetric(v)} style={{
            background: metric === v ? `${C.red}1a` : C.s1,
            border: `1px solid ${metric === v ? C.red + "55" : C.border}`,
            color: metric === v ? C.red : C.dim,
            borderRadius: 10, padding: "8px 18px", fontSize: 11,
            fontFamily: C.mono, cursor: "pointer", fontWeight: 500, transition: "all .15s",
          }}>{l}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((d, i) => {
          const c = tc(d.team), val = sv(d, field, season);
          return (
            <div key={d.code} style={{ animation: `cardIn .35s ease ${i * .035}s both` }}>
              <GCard accent={i === 0 ? C.gold : c} style={{ padding: "15px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ width: 26, fontSize: 18, fontWeight: 900, fontFamily: C.disp, color: i === 0 ? C.gold : i === 1 ? "#aaa" : i === 2 ? "#cd7f32" : C.muted, flexShrink: 0 }}>{i + 1}</span>
                  <div style={{ width: 4, height: 28, background: c, borderRadius: 2, flexShrink: 0 }} />
                  <div style={{ width: 42, flexShrink: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: c, fontFamily: C.disp }}>{d.code}</div>
                    <div style={{ fontSize: 9, color: C.muted, fontFamily: C.mono }}>{d.nat}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{d.name}</span>
                        <span style={{ fontSize: 10, color: c, fontFamily: C.mono, marginLeft: 10 }}>{d.team}</span>
                      </div>
                      <span style={{ fontSize: 22, fontWeight: 900, color: i === 0 ? C.gold : C.text, fontFamily: C.disp }}>{val.toLocaleString()}</span>
                    </div>
                    <div style={{ height: 5, background: C.s1, borderRadius: 3 }}>
                      <div style={{ height: "100%", width: `${(val / max) * 100}%`, borderRadius: 3, background: `linear-gradient(90deg,${c},${c}88)`, transition: "width .9s cubic-bezier(.34,1.56,.64,1)" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                    {metric !== "wins" && sv(d, "wins", season) > 0 && <Pill label={`${sv(d, "wins", season)}W`} color={C.gold} sm />}
                    {sv(d, "dnfs", season) > 5 && <Pill label={`${sv(d, "dnfs", season)} DNF`} color={C.red} sm />}
                  </div>
                </div>
              </GCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TEAMS PAGE
───────────────────────────────────────────────────────────── */
function TeamsPage({ season, setSeason }) {
  const [metric, setMetric] = useState("pts");
  const BUDGETS = { "Red Bull": 145, "Ferrari": 462, "Mercedes": 420, "McLaren": 380, "Aston Martin": 310, "Alpine": 220, "Williams": 155, "RB": 148, "AlphaTauri": 148, "Alfa Romeo": 142, "Haas": 135, "Sauber": 148 };

  const teams = useMemo(() => {
    const grp = {};
    DRIVERS.forEach(d => {
      if (!grp[d.team]) grp[d.team] = [];
      grp[d.team].push(d);
    });
    return Object.entries(grp).map(([team, drivers]) => {
      const pts  = drivers.reduce((s, d) => s + sv(d, "pts", season), 0);
      const wins = drivers.reduce((s, d) => s + sv(d, "wins", season), 0);
      const pods = drivers.reduce((s, d) => s + sv(d, "podiums", season), 0);
      const dnfs = drivers.reduce((s, d) => s + sv(d, "dnfs", season), 0);
      const budget = BUDGETS[team] || 200;
      return { team, drivers, col: tc(team), pts, wins, pods, dnfs, budget, roi: +((pts / budget) * 100).toFixed(1), cPP: Math.round(budget * 1e6 / Math.max(pts, 1)) };
    }).sort((a, b) => b[metric === "roi" ? "roi" : metric] - a[metric === "roi" ? "roi" : metric]);
  }, [season, metric]);

  return (
    <div>
      <PageHead title="CONSTRUCTORS" sub="Team analysis, ROI, and driver lineups across all seasons" />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 28 }}>
        <span style={{ fontSize: 10, color: C.muted, fontFamily: C.mono }}>SEASON</span>
        {["All", ...SEASONS].map(s => (
          <button key={s} onClick={() => setSeason(String(s))} style={{
            background: season === String(s) ? `${C.red}1a` : C.s1,
            border: `1px solid ${season === String(s) ? C.red + "55" : C.border}`,
            color: season === String(s) ? C.red : C.dim,
            borderRadius: 9, padding: "6px 13px", fontSize: 11, fontFamily: C.mono,
            cursor: "pointer", transition: "all .15s",
          }}>{s}</button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 7 }}>
          {[["pts", "Points"], ["wins", "Wins"], ["roi", "ROI"], ["dnfs", "DNFs"]].map(([v, l]) => (
            <button key={v} onClick={() => setMetric(v)} style={{
              background: metric === v ? `${C.gold}18` : C.s1,
              border: `1px solid ${metric === v ? C.gold + "44" : C.border}`,
              color: metric === v ? C.gold : C.dim,
              borderRadius: 9, padding: "6px 13px", fontSize: 11, fontFamily: C.mono,
              cursor: "pointer", transition: "all .15s",
            }}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 18, marginBottom: 28 }}>
        {teams.filter(t => t.drivers.length > 0).map((t, i) => (
          <div key={t.team} style={{ animation: `cardIn .4s ease ${i * .05}s both` }}>
            <GCard accent={t.col} style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 7 }}>{t.team}</div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {t.drivers.map(d => <Pill key={d.code} label={d.code} color={t.col} sm />)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 30, fontWeight: 900, color: t.col, fontFamily: C.disp, lineHeight: 1 }}>{t.pts.toLocaleString()}</div>
                  <div style={{ fontSize: 9, color: C.muted, fontFamily: C.mono }}>PTS</div>
                </div>
              </div>
              {[
                ["Wins", t.wins, t.wins > 0 ? C.gold : C.muted],
                ["Podiums", t.pods, t.pods > 3 ? t.col : C.muted],
                ["Budget", `£${t.budget}M`, C.muted],
                ["£/Point", `£${t.cPP.toLocaleString()}`, t.cPP < 60000 ? C.green : C.muted],
                ["ROI pts/£100M", t.roi, t.roi > 300 ? C.green : C.muted],
                ["DNFs", t.dnfs, t.dnfs > 10 ? C.red : C.muted],
              ].map(([l, v, c]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 11, color: C.muted }}>{l}</span>
                  <span style={{ fontSize: 12, color: c, fontFamily: C.disp, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </GCard>
          </div>
        ))}
      </div>
      <GCard style={{ padding: 26 }}>
        <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 18 }}>
          {metric.toUpperCase()} COMPARISON
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={teams.filter(t => t.drivers.length > 0)} margin={{ left: -10 }}>
            <CartesianGrid strokeDasharray="2 5" stroke={C.s2} vertical={false} />
            <XAxis dataKey="team" tick={{ fill: C.muted, fontSize: 8, fontFamily: C.mono }} angle={-15} textAnchor="end" height={50} />
            <YAxis tick={{ fill: C.muted, fontSize: 10 }} />
            <Tooltip content={<ChartTip />} />
            <Bar dataKey={metric === "pts" ? "pts" : metric === "wins" ? "wins" : metric === "roi" ? "roi" : "dnfs"} name={metric} radius={[6, 6, 0, 0]}>
              {teams.filter(t => t.drivers.length > 0).map((t, i) => <Cell key={i} fill={t.col} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </GCard>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ML MODELS PAGE
───────────────────────────────────────────────────────────── */
function ModelsPage() {
  const models = [
    { name: "Podium Predictor", algo: "Gradient Boosting", metric: "AUC", score: 0.9471, cv: 0.9399, prec: 0.747, rec: 0.709, f1: 0.727, color: C.red },
    { name: "Points Scorer",    algo: "Random Forest",     metric: "AUC", score: 0.9286, cv: 0.9407, color: C.gold },
    { name: "Lap Time Reg.",    algo: "Ridge Regression",  metric: "R²",  score: 0.9998, mae: "0.026s", color: C.cyan },
    { name: "Strategy Cluster", algo: "K-Means (k=4)",     metric: "Sil.", score: 0.74, color: C.green },
  ];
  const features = [
    { n: "team_pace_score", v: 0.312 }, { n: "gap_to_pole_ms", v: 0.198 }, { n: "best_quali_ms", v: 0.143 },
    { n: "rolling_pts_5", v: 0.087 }, { n: "grid_position", v: 0.076 }, { n: "consistency", v: 0.054 },
    { n: "avg_lap_ms", v: 0.042 }, { n: "num_pit_stops", v: 0.031 }, { n: "career_races", v: 0.024 },
    { n: "compound_enc", v: 0.018 }, { n: "is_street_circuit", v: 0.009 }, { n: "tyre_age", v: 0.006 },
  ].reverse();

  return (
    <div>
      <PageHead title="ML MODELS" sub="Pipeline performance · feature importance · cross-validation" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 18, marginBottom: 28 }}>
        {models.map((m, i) => (
          <div key={m.name} style={{ animation: `cardIn .4s ease ${i * .1}s both` }}>
            <GCard accent={m.color} style={{ padding: 24 }}>
              <p style={{ fontSize: 9, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 5 }}>{m.algo}</p>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>{m.name}</h3>
              <div style={{ fontSize: 38, fontWeight: 900, color: m.color, fontFamily: C.disp, lineHeight: 1 }}>{m.score.toFixed(4)}</div>
              <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, marginBottom: 12 }}>{m.metric} score</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {m.cv && <Pill label={`CV ${m.cv.toFixed(4)}`} color={m.color} sm />}
                {m.mae && <Pill label={`MAE ${m.mae}`} color={m.color} sm />}
              </div>
              {m.prec && (
                <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                  {[["Precision", m.prec], ["Recall", m.rec], ["F1", m.f1]].map(([l, v]) => (
                    <div key={l} style={{ background: C.s1, borderRadius: 10, padding: "9px 11px" }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: m.color, fontFamily: C.disp }}>{v.toFixed(3)}</div>
                      <div style={{ fontSize: 9, color: C.muted, fontFamily: C.mono, marginTop: 2 }}>{l}</div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 14, height: 4, background: C.s1, borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${m.score * 100}%`, background: `linear-gradient(90deg,${m.color},${C.gold})`, borderRadius: 2 }} />
              </div>
            </GCard>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <GCard style={{ padding: 26 }}>
          <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 18 }}>FEATURE IMPORTANCE</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart layout="vertical" data={features} margin={{ left: 4, right: 50 }}>
              <CartesianGrid strokeDasharray="2 5" stroke={C.s2} horizontal={false} />
              <XAxis type="number" tick={{ fill: C.muted, fontSize: 9 }} domain={[0, 0.35]} />
              <YAxis dataKey="n" type="category" tick={{ fill: C.muted, fontSize: 9, fontFamily: C.mono }} width={135} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="v" name="Importance" radius={[0, 5, 5, 0]}>
                {features.map((f, i) => <Cell key={i} fill={f.v > 0.1 ? C.red : f.v > 0.04 ? C.gold : C.muted} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GCard>
        <GCard style={{ padding: 26 }}>
          <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 18 }}>5-FOLD CV AUC</p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={[.944, .933, .951, .929, .942].map((v, i) => ({ f: `Fold ${i + 1}`, auc: v }))} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="2 5" stroke={C.s2} vertical={false} />
              <XAxis dataKey="f" tick={{ fill: C.muted, fontSize: 10, fontFamily: C.mono }} />
              <YAxis domain={[0.88, 0.97]} tick={{ fill: C.muted, fontSize: 9 }} />
              <Tooltip content={<ChartTip />} />
              <ReferenceLine y={0.9399} stroke={C.gold} strokeDasharray="4 4" label={{ value: "Mean", fill: C.gold, fontSize: 9 }} />
              <Bar dataKey="auc" fill={C.red} radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginTop: 24, marginBottom: 14 }}>CONFUSION MATRIX</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[["True Neg", 318, C.green], ["False Pos", 22, C.red], ["False Neg", 38, C.gold], ["True Pos", 62, C.cyan]].map(([l, v, c]) => (
              <div key={l} style={{ background: `${c}10`, border: `1px solid ${c}28`, borderRadius: 12, padding: "13px", textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: c, fontFamily: C.disp }}>{v}</div>
                <div style={{ fontSize: 9, color: C.muted, fontFamily: C.mono, marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
        </GCard>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EASTER EGGS
───────────────────────────────────────────────────────────── */
const EGG_KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];

const DRSGate = ({ onClose }) => (
  <div onClick={onClose} style={{
    position: "fixed", inset: 0, zIndex: 9999,
    background: "rgba(0,0,0,.95)", display: "flex",
    flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer",
    animation: "fadeIn .3s ease",
  }}>
    <div style={{ fontSize: 90, fontWeight: 900, color: "#00ff44", fontFamily: C.disp, textAlign: "center", lineHeight: 1, textShadow: "0 0 80px #00ff44, 0 0 160px #00ff4455", animation: "glow 1.2s ease infinite" }}>
      DRS<br />OPEN
    </div>
    <p style={{ fontSize: 16, color: "#00ff44", fontFamily: C.fn, marginTop: 22, opacity: .7 }}>↑↑↓↓←→←→BA — Cheat code activated</p>
    <p style={{ fontSize: 11, color: C.muted, marginTop: 12, fontFamily: C.mono }}>click anywhere to close</p>
  </div>
);

const SennaModal = ({ onClose }) => (
  <div onClick={onClose} style={{
    position: "fixed", inset: 0, zIndex: 9999,
    background: "rgba(0,0,0,.97)", display: "flex",
    flexDirection: "column", alignItems: "center", justifyContent: "center",
    padding: 32, animation: "fadeIn .5s ease", cursor: "pointer",
  }}>
    <div style={{ maxWidth: 520, textAlign: "center" }}>
      <p style={{ fontSize: 60, marginBottom: 16 }}>🏁</p>
      <h1 style={{ fontSize: 46, fontWeight: 900, color: "#fff", fontFamily: C.disp, marginBottom: 8, textShadow: "0 0 40px rgba(255,255,255,.3)" }}>AYRTON SENNA</h1>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)", fontFamily: C.mono, letterSpacing: ".2em", marginBottom: 30 }}>1960 — 1994 · 41 WINS · 3 CHAMPIONSHIPS</p>
      <blockquote style={{ fontSize: 17, color: "rgba(255,255,255,.85)", fontFamily: C.fn, fontStyle: "italic", fontWeight: 300, lineHeight: 1.75, marginBottom: 30, borderLeft: "3px solid rgba(255,255,255,.2)", paddingLeft: 22, textAlign: "left" }}>
        "And so I arrived at that corner and, suddenly, I realised I was no longer driving the car consciously. I was in a different dimension."
      </blockquote>
      <p style={{ fontSize: 10, color: "rgba(255,255,255,.2)", fontFamily: C.mono }}>type SENNA to unlock · click anywhere to close</p>
    </div>
  </div>
);

const PitReaction = ({ onClose }) => {
  const [state, setState] = useState("idle");
  const [result, setResult] = useState(null);
  const targetRef = useRef(null);
  const start = () => {
    setState("wait"); setResult(null);
    const delay = 1200 + Math.random() * 2800;
    targetRef.current = Date.now() + delay;
    setTimeout(() => setState("go"), delay);
  };
  const stop = () => {
    if (state === "wait") { setResult("Jumped the gun! +5s penalty 🚩"); setState("idle"); return; }
    if (state === "go") {
      const t = ((Date.now() - targetRef.current) / 1000).toFixed(3);
      setResult(+t < 0.25 ? `⚡ ${t}s — F1 record territory!` : +t < 0.5 ? `🔥 ${t}s — Elite stop!` : +t < 1.0 ? `✅ ${t}s — Solid` : `🐌 ${t}s — Lost the undercut`);
      setState("idle");
    }
  };
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.s0, border: `1px solid ${C.border}`, borderRadius: 20, padding: 44, textAlign: "center", maxWidth: 380, animation: "popIn .4s ease" }}>
        <p style={{ fontSize: 36, marginBottom: 10 }}>🔧</p>
        <h3 style={{ fontSize: 20, fontWeight: 900, color: C.text, fontFamily: C.disp, marginBottom: 8 }}>PIT STOP REACTION</h3>
        <p style={{ fontSize: 12, color: C.dim, marginBottom: 28, lineHeight: 1.6 }}>Hit STOP the instant it turns green.<br />Sub-0.25s = world record territory.</p>
        <div onClick={state === "idle" ? start : stop} style={{
          width: 150, height: 150, borderRadius: "50%", margin: "0 auto 24px",
          background: state === "go" ? "#00e04a" : state === "wait" ? "#ff4444" : C.red,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          transition: "background .08s, transform .1s", transform: state === "go" ? "scale(1.07)" : "scale(1)",
          boxShadow: `0 0 40px ${state === "go" ? "#00e04a66" : C.red + "44"}`,
          fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: C.disp, letterSpacing: ".1em", userSelect: "none",
        }}>
          {state === "idle" ? "START" : state === "wait" ? "WAIT…" : "STOP!"}
        </div>
        {result && <p style={{ fontSize: 16, color: C.gold, fontFamily: C.fn, fontWeight: 600, marginBottom: 16 }}>{result}</p>}
        <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 9, padding: "8px 20px", fontSize: 11, fontFamily: C.mono, cursor: "pointer" }}>EXIT</button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   ANALYTICS PAGE  (4 sub-tools)
───────────────────────────────────────────────────────────── */

/* Shared circuit/compound data for tyre matrix */
const CIRCUITS_LIST = [
  "Bahrain","Saudi Arabia","Australia","Japan","China",
  "Miami","Monaco","Spain","Canada","Austria",
  "Britain","Hungary","Belgium","Netherlands","Italy",
  "Baku","Singapore","USA","Mexico","Brazil","Las Vegas","Qatar","Abu Dhabi",
];

const COMPOUNDS = ["SOFT","MEDIUM","HARD","INTER","WET"];

/* Deterministic pseudo-random seeded per circuit+compound so it's stable */
const seededRand = (seed) => {
  let x = Math.sin(seed + 1) * 43758.5453;
  return x - Math.floor(x);
};

const TYRE_MATRIX = CIRCUITS_LIST.map((circuit, ci) => {
  const row = { circuit };
  COMPOUNDS.forEach((cmp, ki) => {
    const base = seededRand(ci * 17 + ki * 31);
    // Rain compounds only relevant for rainy/mixed circuits
    const rainCircuits = ["Belgium","Britain","Brazil","Japan","Hungary","Canada"];
    const isRain = cmp === "INTER" || cmp === "WET";
    row[cmp] = isRain
      ? rainCircuits.includes(circuit) ? Math.round(40 + base * 45) : Math.round(2 + base * 20)
      : Math.round(55 + base * 40);
  });
  return row;
});

/* Teammate pairs by season — which drivers shared a team */
const TEAMMATE_PAIRS = [
  { team: "Red Bull",     a: "VER", b: "PER" },
  { team: "Ferrari",      a: "LEC", b: "SAI" },
  { team: "Ferrari",      a: "LEC", b: "HAM" },
  { team: "Mercedes",     a: "HAM", b: "RUS" },
  { team: "Mercedes",     a: "RUS", b: "ANT" },
  { team: "McLaren",      a: "NOR", b: "PIA" },
  { team: "Aston Martin", a: "ALO", b: "STR" },
  { team: "Williams",     a: "ALB", b: "SAI" },
  { team: "RB",           a: "TSU", b: "HAD" },
  { team: "Alpine",       a: "GAS", b: "OCO" },
  { team: "Haas",         a: "HUL", b: "BEA" },
  { team: "Haas",         a: "MAG", b: "OCO" },
  { team: "Sauber",       a: "BOT", b: "HUL" },
];

function AnalyticsPage({ season, setSeason }) {
  const [sub, setSub] = useState("whatif");

  /* ── 1. WHAT-IF SIMULATOR ── */
  const defaultMulti = () => Object.fromEntries(
    [...new Set(DRIVERS.map(d => d.team))].map(t => [t, 100])
  );
  const [multi, setMulti] = useState(defaultMulti());
  const [scenario, setScenario] = useState("");
  const SCENARIOS = [
    {
      label: "Hamilton stays at Mercedes",
      apply: () => setMulti(m => ({ ...m, Mercedes: 115, Ferrari: 92 })),
    },
    {
      label: "Red Bull 2023 pace for all",
      apply: () => setMulti(Object.fromEntries([...new Set(DRIVERS.map(d => d.team))].map(t => [t, 85]))),
    },
    {
      label: "McLaren dominates",
      apply: () => setMulti(m => ({ ...m, McLaren: 130, "Red Bull": 88 })),
    },
    {
      label: "Reset to reality",
      apply: () => setMulti(defaultMulti()),
    },
  ];

  const simStandings = useMemo(() => {
    return [...DRIVERS]
      .map(d => {
        const base = sv(d, "pts", season);
        const factor = (multi[d.team] || 100) / 100;
        const simPts = Math.round(base * factor);
        return { ...d, simPts, realPts: base, delta: simPts - base };
      })
      .sort((a, b) => b.simPts - a.simPts);
  }, [multi, season]);

  const changedTeams = Object.entries(multi).filter(([, v]) => v !== 100);

  /* ── 2. POINTS SWING CALCULATOR ── */
  const AVG_PTS_PER_DNF = 15; // avg points scored if DNF hadn't happened (p7-p8 range)

  const swingData = useMemo(() => {
    const list = season === "All"
      ? DRIVERS
      : DRIVERS.filter(d => (d.pts[+season] || 0) > 0 || (d.dnfs[+season] || 0) > 0);
    return [...list]
      .map(d => {
        const dnfCount = sv(d, "dnfs", season);
        const actualPts = sv(d, "pts", season);
        const lostPts = dnfCount * AVG_PTS_PER_DNF;
        const potentialPts = actualPts + lostPts;
        return { ...d, dnfCount, actualPts, lostPts, potentialPts };
      })
      .filter(d => d.dnfCount > 0)
      .sort((a, b) => b.lostPts - a.lostPts);
  }, [season]);

  /* ── 3. TEAMMATE BATTLE ── */
  const [pairIdx, setPairIdx] = useState(0);
  const pair = TEAMMATE_PAIRS[pairIdx];
  const dA = DRIVERS.find(d => d.code === pair.a);
  const dB = DRIVERS.find(d => d.code === pair.b);

  const tmMetrics = useMemo(() => {
    if (!dA || !dB) return [];
    return [
      { l: "Pace Rating",     a: dA.pace,         b: dB.pace,         mx: 100,  unit: "/100" },
      { l: "Qualifying",      a: dA.quali,         b: dB.quali,        mx: 100,  unit: "/100" },
      { l: "Race Craft",      a: dA.craft,         b: dB.craft,        mx: 100,  unit: "/100" },
      { l: "Consistency",     a: dA.cons,          b: dB.cons,         mx: 100,  unit: "/100" },
      { l: "Wet Skill",       a: dA.wet,           b: dB.wet,          mx: 100,  unit: "/100" },
      { l: "Career Points",   a: totalPts(dA),     b: totalPts(dB),    mx: 2200, unit: " pts" },
      { l: "Career Wins",     a: totalWins(dA),    b: totalWins(dB),   mx: 56,   unit: " wins" },
      { l: "Career Podiums",  a: totalPods(dA),    b: totalPods(dB),   mx: 130,  unit: "" },
      { l: "Avg Finish",      a: 20 - dA.avgFin,   b: 20 - dB.avgFin,  mx: 19,   unit: " (inv)" },
      { l: "Quali Gap (s)",   a: 2.0 - dA.qualiGap, b: 2.0 - dB.qualiGap, mx: 2.0, unit: "s" },
    ];
  }, [pairIdx]);

  const winnerCount = useMemo(() => {
    const aWins = tmMetrics.filter(m => m.a > m.b).length;
    const bWins = tmMetrics.filter(m => m.b > m.a).length;
    return { a: aWins, b: bWins };
  }, [tmMetrics]);

  /* Seasonal head-to-head chart for teammate */
  const tmSeasonData = useMemo(() => {
    if (!dA || !dB) return [];
    return SEASONS
      .filter(yr => (dA.pts[yr] || 0) + (dB.pts[yr] || 0) > 0)
      .map(yr => ({
        year: String(yr),
        [pair.a]: dA.pts[yr] || 0,
        [pair.b]: dB.pts[yr] || 0,
      }));
  }, [pairIdx]);

  /* ── 4. TYRE MATRIX ── */
  const [selectedCircuit, setSelectedCircuit] = useState(null);
  const [heatMetric, setHeatMetric] = useState("SOFT");

  const cellColor = (val) => {
    if (val >= 80) return { bg: `rgba(52,211,153,0.85)`,  text: "#052015" };
    if (val >= 65) return { bg: `rgba(52,211,153,0.45)`,  text: "#34d399" };
    if (val >= 50) return { bg: `rgba(240,160,48,0.45)`,  text: "#f0a030" };
    if (val >= 30) return { bg: `rgba(232,0,45,0.35)`,    text: "#ff6688" };
    return              { bg: `rgba(60,60,80,0.5)`,        text: "#666" };
  };

  const cA_color = dA ? tc(dA.team) : C.red;
  const cB_color = dB ? tc(dB.team) : C.cyan;

  return (
    <div>
      <PageHead
        title="ANALYTICS"
        sub="What-If Simulator · Points Swing · Teammate Battle · Tyre Strategy Matrix"
        color={C.gold}
      />

      <TabBar
        tabs={[
          ["whatif",   "🔀 What-If Simulator"],
          ["swing",    "💥 Points Swing"],
          ["teammate", "⚔️ Teammate Battle"],
          ["tyre",     "🔴 Tyre Matrix"],
        ]}
        active={sub}
        setActive={setSub}
      />

      {/* ══ WHAT-IF SIMULATOR ══ */}
      {sub === "whatif" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Season selector */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: C.muted, fontFamily: C.mono }}>BASE SEASON</span>
            {["All", ...SEASONS].map(s => (
              <button key={s} onClick={() => setSeason(String(s))} style={{
                background: season === String(s) ? `${C.gold}1a` : C.s1,
                border: `1px solid ${season === String(s) ? C.gold + "55" : C.border}`,
                color: season === String(s) ? C.gold : C.dim,
                borderRadius: 9, padding: "5px 12px", fontSize: 11,
                fontFamily: C.mono, cursor: "pointer", transition: "all .15s",
              }}>{s}</button>
            ))}
          </div>

          {/* Scenario presets */}
          <GCard style={{ padding: 22 }} noHover>
            <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 14 }}>
              QUICK SCENARIOS
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {SCENARIOS.map(s => (
                <button key={s.label} onClick={() => { s.apply(); setScenario(s.label); }}
                  className="btn-press"
                  style={{
                    background: scenario === s.label ? `${C.gold}1a` : C.s2,
                    border: `1px solid ${scenario === s.label ? C.gold + "55" : C.border}`,
                    color: scenario === s.label ? C.gold : C.dim,
                    borderRadius: 10, padding: "8px 16px", fontSize: 12,
                    fontFamily: C.fn, cursor: "pointer", transition: "all .15s",
                  }}>{s.label}</button>
              ))}
            </div>
          </GCard>

          {/* Two-column layout: sliders + live standings */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>

            {/* Team pace sliders */}
            <GCard style={{ padding: 24 }} noHover>
              <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 18 }}>
                TEAM PACE MULTIPLIER
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {Object.entries(multi)
                  .filter(([team]) => DRIVERS.some(d => d.team === team))
                  .sort((a, b) => b[1] - a[1])
                  .map(([team, val]) => {
                    const changed = val !== 100;
                    return (
                      <div key={team}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: tc(team), flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: changed ? tc(team) : C.dim, fontFamily: C.fn, fontWeight: changed ? 600 : 400 }}>{team}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{
                              fontSize: 12, fontWeight: 700, fontFamily: C.disp,
                              color: val > 100 ? C.green : val < 100 ? C.red : C.muted,
                            }}>{val}%</span>
                            {changed && (
                              <button onClick={() => setMulti(m => ({ ...m, [team]: 100 }))}
                                style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14, lineHeight: 1, padding: "0 2px" }}>×</button>
                            )}
                          </div>
                        </div>
                        <input type="range" min={50} max={150} value={val}
                          onChange={e => setMulti(m => ({ ...m, [team]: +e.target.value }))}
                          style={{ width: "100%", accentColor: tc(team), cursor: "pointer" }} />
                        {/* Ticks */}
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                          {[50, 75, 100, 125, 150].map(t => (
                            <span key={t} style={{ fontSize: 8, color: t === 100 ? C.muted : "transparent", fontFamily: C.mono }}>{t}%</span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Active scenario callout */}
              {changedTeams.length > 0 && (
                <div style={{
                  marginTop: 20, background: `${C.gold}0e`, border: `1px solid ${C.gold}33`,
                  borderRadius: 10, padding: "12px 14px",
                }}>
                  <p style={{ fontSize: 10, color: C.gold, fontFamily: C.mono, marginBottom: 6 }}>ACTIVE CHANGES</p>
                  {changedTeams.map(([team, val]) => (
                    <p key={team} style={{ fontSize: 11, color: C.dim, fontFamily: C.fn, marginBottom: 2 }}>
                      <span style={{ color: tc(team), fontWeight: 600 }}>{team}</span>
                      {" "}{val > 100 ? "↑" : "↓"} {Math.abs(val - 100)}% {val > 100 ? "stronger" : "weaker"}
                    </p>
                  ))}
                </div>
              )}
            </GCard>

            {/* Simulated standings */}
            <GCard style={{ padding: 24 }} noHover>
              <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 18 }}>
                SIMULATED CHAMPIONSHIP
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {simStandings.slice(0, 12).map((d, i) => {
                  const c = tc(d.team);
                  const isUp   = d.delta > 0;
                  const maxPts = simStandings[0]?.simPts || 1;
                  return (
                    <div key={d.code} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 12px", borderRadius: 10,
                      background: i < 3 ? `${c}0a` : "transparent",
                      border: `1px solid ${i < 3 ? c + "22" : C.border}`,
                      animation: `cardIn .3s ease ${i * .03}s both`,
                    }}>
                      <span style={{
                        width: 22, fontSize: 13, fontWeight: 900, fontFamily: C.disp,
                        color: i === 0 ? C.gold : i === 1 ? "#aaa" : i === 2 ? "#cd7f32" : C.muted,
                        flexShrink: 0, textAlign: "center",
                      }}>{i + 1}</span>
                      <div style={{ width: 3, height: 16, background: c, borderRadius: 2, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, alignItems: "center" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: C.text, fontFamily: C.fn }}>{d.name}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {d.delta !== 0 && (
                              <span style={{
                                fontSize: 10, fontFamily: C.mono,
                                color: isUp ? C.green : C.red,
                                fontWeight: 700,
                              }}>
                                {isUp ? "▲" : "▼"} {Math.abs(d.delta)}
                              </span>
                            )}
                            <span style={{ fontSize: 14, fontWeight: 800, color: i < 3 ? c : C.text, fontFamily: C.disp }}>{d.simPts.toLocaleString()}</span>
                          </div>
                        </div>
                        <div style={{ height: 3, background: C.s1, borderRadius: 2 }}>
                          <div style={{
                            width: `${(d.simPts / maxPts) * 100}%`, height: "100%",
                            background: `linear-gradient(90deg,${c},${c}88)`, borderRadius: 2,
                            transition: "width .6s cubic-bezier(.34,1.56,.64,1)",
                          }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: 10, color: C.muted, fontFamily: C.fn, marginTop: 14, fontStyle: "italic" }}>
                {changedTeams.length === 0 ? "Adjust sliders to see alternate championship outcomes →" : `Showing ${scenario || "custom"} scenario · ${changedTeams.length} team${changedTeams.length > 1 ? "s" : ""} modified`}
              </p>
            </GCard>
          </div>

          {/* Delta chart */}
          {changedTeams.length > 0 && (
            <GCard style={{ padding: 24 }} noHover>
              <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 18 }}>
                POINTS DELTA: SIMULATED vs ACTUAL
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={simStandings.slice(0, 14).filter(d => d.delta !== 0)}
                  margin={{ left: -10, right: 10 }}
                >
                  <CartesianGrid strokeDasharray="2 5" stroke={C.s2} vertical={false} />
                  <XAxis dataKey="code" tick={{ fill: C.muted, fontSize: 10, fontFamily: C.mono }} />
                  <YAxis tick={{ fill: C.muted, fontSize: 10 }} />
                  <Tooltip content={<ChartTip />} />
                  <ReferenceLine y={0} stroke={C.border} />
                  <Bar dataKey="delta" name="Pts change" radius={[4, 4, 0, 0]}>
                    {simStandings.filter(d => d.delta !== 0).slice(0, 14).map((d, i) => (
                      <Cell key={i} fill={d.delta > 0 ? C.green : C.red} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </GCard>
          )}
        </div>
      )}

      {/* ══ POINTS SWING CALCULATOR ══ */}
      {sub === "swing" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: C.muted, fontFamily: C.mono }}>SEASON</span>
            {["All", ...SEASONS].map(s => (
              <button key={s} onClick={() => setSeason(String(s))} style={{
                background: season === String(s) ? `${C.red}1a` : C.s1,
                border: `1px solid ${season === String(s) ? C.red + "55" : C.border}`,
                color: season === String(s) ? C.red : C.dim,
                borderRadius: 9, padding: "5px 12px", fontSize: 11,
                fontFamily: C.mono, cursor: "pointer", transition: "all .15s",
              }}>{s}</button>
            ))}
          </div>

          {/* Explanation card */}
          <GCard style={{ padding: 20 }} noHover>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {[
                { label: "Avg pts per DNF", value: `~${AVG_PTS_PER_DNF}`, sub: "P7–P8 finish value", c: C.red },
                { label: "Total DNFs tracked", value: swingData.reduce((s, d) => s + d.dnfCount, 0), sub: `across ${swingData.length} drivers`, c: C.gold },
                { label: "Total pts lost", value: swingData.reduce((s, d) => s + d.lostPts, 0).toLocaleString(), sub: "across all retirements", c: C.cyan },
                { label: "Most DNF-affected", value: swingData[0]?.code || "—", sub: `${swingData[0]?.lostPts || 0} pts lost`, c: C.green },
              ].map(item => (
                <div key={item.label} style={{ flex: "1 1 140px" }}>
                  <p style={{ fontSize: 9, color: C.muted, fontFamily: C.mono, marginBottom: 4 }}>{item.label.toUpperCase()}</p>
                  <p style={{ fontSize: 26, fontWeight: 900, color: item.c, fontFamily: C.disp, lineHeight: 1 }}>{item.value}</p>
                  <p style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>{item.sub}</p>
                </div>
              ))}
            </div>
          </GCard>

          {/* Horizontal bar chart: points lost */}
          <GCard style={{ padding: 26 }} noHover>
            <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 18 }}>
              CHAMPIONSHIP POINTS LOST TO MECHANICAL/RACE RETIREMENTS
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {swingData.map((d, i) => {
                const c = tc(d.team);
                return (
                  <div key={d.code} style={{ animation: `cardIn .3s ease ${i * .04}s both` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, width: 20, flexShrink: 0 }}>{i + 1}</span>
                      <div style={{ width: 3, height: 14, background: c, borderRadius: 2, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.text, width: 140, flexShrink: 0 }}>{d.name}</span>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                        {/* Actual points bar */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 8, background: C.s1, borderRadius: 4, overflow: "hidden" }}>
                            <div style={{
                              width: `${(d.actualPts / (d.actualPts + swingData[0]?.lostPts)) * 100}%`,
                              height: "100%", background: c, borderRadius: 4,
                              transition: "width .8s cubic-bezier(.34,1.56,.64,1)",
                            }} />
                          </div>
                          <span style={{ fontSize: 11, color: c, fontFamily: C.disp, fontWeight: 700, width: 46, textAlign: "right" }}>{d.actualPts}</span>
                          <span style={{ fontSize: 9, color: C.muted, width: 36 }}>actual</span>
                        </div>
                        {/* Lost points bar */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 8, background: C.s1, borderRadius: 4, overflow: "hidden" }}>
                            <div style={{
                              width: `${(d.lostPts / (d.actualPts + swingData[0]?.lostPts)) * 100}%`,
                              height: "100%",
                              background: `repeating-linear-gradient(45deg,${C.red}88,${C.red}88 4px,transparent 4px,transparent 8px)`,
                              borderRadius: 4,
                              transition: "width .8s cubic-bezier(.34,1.56,.64,1)",
                            }} />
                          </div>
                          <span style={{ fontSize: 11, color: C.red, fontFamily: C.disp, fontWeight: 700, width: 46, textAlign: "right" }}>-{d.lostPts}</span>
                          <span style={{ fontSize: 9, color: C.muted, width: 36 }}>{d.dnfCount} DNFs</span>
                        </div>
                      </div>
                      {/* Potential */}
                      <div style={{ textAlign: "right", flexShrink: 0, width: 72 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: C.gold, fontFamily: C.disp }}>{d.potentialPts}</div>
                        <div style={{ fontSize: 8, color: C.muted, fontFamily: C.mono }}>POTENTIAL</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 18, marginTop: 20 }}>
              {[
                { bg: tc("Red Bull"), label: "Actual points scored" },
                { bg: `repeating-linear-gradient(45deg,${C.red}88,${C.red}88 4px,transparent 4px,transparent 8px)`, label: "Points lost to DNFs (est.)" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 16, height: 10, borderRadius: 2, background: item.bg }} />
                  <span style={{ fontSize: 10, color: C.muted, fontFamily: C.fn }}>{item.label}</span>
                </div>
              ))}
            </div>
          </GCard>

          {/* What-if: alternate championship if no DNFs */}
          <GCard style={{ padding: 24 }} noHover>
            <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 18 }}>
              ALTERNATE STANDINGS IF ZERO DNFs
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[...DRIVERS]
                .map(d => ({ ...d, altPts: sv(d, "pts", season) + sv(d, "dnfs", season) * AVG_PTS_PER_DNF }))
                .sort((a, b) => b.altPts - a.altPts)
                .slice(0, 10)
                .map((d, i) => {
                  const c = tc(d.team);
                  const realRank = [...DRIVERS].sort((a, b) => sv(b, "pts", season) - sv(a, "pts", season)).findIndex(x => x.code === d.code) + 1;
                  const moved = realRank - (i + 1);
                  return (
                    <div key={d.code} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 14px", borderRadius: 10,
                      background: C.s1, border: `1px solid ${C.border}`,
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 900, color: i < 3 ? [C.gold, "#aaa", "#cd7f32"][i] : C.muted, fontFamily: C.disp, width: 22 }}>{i + 1}</span>
                      <div style={{ width: 3, height: 14, background: c, borderRadius: 2 }} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{d.code}</span>
                        <span style={{ fontSize: 9, color: c, fontFamily: C.mono, marginLeft: 7 }}>{d.team.split(" ")[0]}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: c, fontFamily: C.disp }}>{d.altPts}</span>
                      {moved !== 0 && (
                        <span style={{ fontSize: 10, fontFamily: C.mono, color: moved > 0 ? C.green : C.red, width: 28, textAlign: "right" }}>
                          {moved > 0 ? `▲${moved}` : `▼${Math.abs(moved)}`}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          </GCard>
        </div>
      )}

      {/* ══ TEAMMATE BATTLE ══ */}
      {sub === "teammate" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Pair selector */}
          <GCard style={{ padding: 20 }} noHover>
            <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 14 }}>
              SELECT TEAMMATE PAIRING
            </p>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {TEAMMATE_PAIRS.map((p, i) => {
                const c = tc(p.team);
                return (
                  <button key={i} onClick={() => setPairIdx(i)} style={{
                    background: pairIdx === i ? `${c}18` : C.s2,
                    border: `1px solid ${pairIdx === i ? c + "55" : C.border}`,
                    color: pairIdx === i ? c : C.dim,
                    borderRadius: 10, padding: "7px 14px", fontSize: 11,
                    fontFamily: C.fn, cursor: "pointer", transition: "all .15s",
                    display: "flex", alignItems: "center", gap: 7, flexShrink: 0,
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                    <span style={{ fontWeight: 600 }}>{p.a}</span>
                    <span style={{ color: C.muted, fontSize: 9 }}>vs</span>
                    <span style={{ fontWeight: 600 }}>{p.b}</span>
                  </button>
                );
              })}
            </div>
          </GCard>

          {/* Score banner */}
          {dA && dB && (
            <GCard style={{ padding: 0, overflow: "hidden", background: `linear-gradient(135deg, ${cA_color}0d, ${C.card}, ${cB_color}0d)` }} noHover accent={cA_color}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "stretch" }}>
                {/* Driver A */}
                <div style={{ display: "flex", gap: 16, padding: "22px 24px", alignItems: "flex-end" }}>
                  <DriverPhoto code={dA.code} team={dA.team} size={90} tall />
                  <div style={{ paddingBottom: 4 }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: cA_color, fontFamily: C.disp, lineHeight: 1 }}>{dA.code}</div>
                    <div style={{ fontSize: 11, color: C.text, marginTop: 3 }}>{dA.name}</div>
                    <Pill label={dA.team} color={cA_color} sm style={{ marginTop: 8 }} />
                    <div style={{ fontSize: 48, fontWeight: 900, color: cA_color, fontFamily: C.disp, lineHeight: 1, marginTop: 10 }}>{winnerCount.a}</div>
                    <div style={{ fontSize: 9, color: C.muted, fontFamily: C.mono }}>METRICS WON</div>
                  </div>
                </div>
                {/* VS column */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 18px",
                  borderLeft: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}` }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 13, color: C.muted, fontFamily: C.mono, letterSpacing: ".15em" }}>VS</div>
                    <div style={{ fontSize: 10, color: C.dim, marginTop: 6, fontFamily: C.fn }}>{pair.team}</div>
                    <div style={{ width: 1, height: 30, background: C.border, margin: "10px auto" }} />
                    <div style={{ fontSize: 10, color: winnerCount.a > winnerCount.b ? cA_color : winnerCount.b > winnerCount.a ? cB_color : C.muted, fontFamily: C.mono, fontWeight: 700 }}>
                      {winnerCount.a > winnerCount.b ? dA.code : winnerCount.b > winnerCount.a ? dB.code : "TIED"}
                    </div>
                    <div style={{ fontSize: 9, color: C.muted, fontFamily: C.mono }}>leads</div>
                  </div>
                </div>
                {/* Driver B */}
                <div style={{ display: "flex", gap: 16, padding: "22px 24px", justifyContent: "flex-end", alignItems: "flex-end" }}>
                  <div style={{ paddingBottom: 4, textAlign: "right" }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: cB_color, fontFamily: C.disp, lineHeight: 1 }}>{dB.code}</div>
                    <div style={{ fontSize: 11, color: C.text, marginTop: 3 }}>{dB.name}</div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                      <Pill label={dB.team} color={cB_color} sm />
                    </div>
                    <div style={{ fontSize: 48, fontWeight: 900, color: cB_color, fontFamily: C.disp, lineHeight: 1, marginTop: 10 }}>{winnerCount.b}</div>
                    <div style={{ fontSize: 9, color: C.muted, fontFamily: C.mono }}>METRICS WON</div>
                  </div>
                  <DriverPhoto code={dB.code} team={dB.team} size={90} tall />
                </div>
              </div>
            </GCard>
          )}

          {/* H2H metric bars */}
          <GCard style={{ padding: 26 }} noHover>
            <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 20 }}>
              METRIC-BY-METRIC BREAKDOWN
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {tmMetrics.map(m => {
                const w = m.a > m.b ? "a" : m.a < m.b ? "b" : "tie";
                return (
                  <div key={m.l}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
                      <span style={{
                        fontSize: 13, fontFamily: C.disp,
                        color: w === "a" ? cA_color : C.muted,
                        fontWeight: w === "a" ? 700 : 400,
                      }}>
                        {m.l === "Avg Finish" || m.l === "Quali Gap (s)" ? m.a.toFixed(1) : m.a.toLocaleString()}
                        {w === "a" && <span style={{ marginLeft: 6, fontSize: 10 }}>◀</span>}
                      </span>
                      <span style={{ fontSize: 10, color: C.muted, fontFamily: C.mono }}>{m.l}</span>
                      <span style={{
                        fontSize: 13, fontFamily: C.disp,
                        color: w === "b" ? cB_color : C.muted,
                        fontWeight: w === "b" ? 700 : 400,
                      }}>
                        {w === "b" && <span style={{ marginRight: 6, fontSize: 10 }}>▶</span>}
                        {m.l === "Avg Finish" || m.l === "Quali Gap (s)" ? m.b.toFixed(1) : m.b.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", gap: 2 }}>
                      <div style={{ flex: 1, background: C.s1, display: "flex", justifyContent: "flex-end" }}>
                        <div style={{
                          width: `${(m.a / m.mx) * 100}%`, height: "100%",
                          background: `linear-gradient(to left, ${cA_color}, ${cA_color}55)`,
                          transition: "width .7s cubic-bezier(.34,1.56,.64,1)",
                        }} />
                      </div>
                      <div style={{ width: 2, background: C.muted, flexShrink: 0, opacity: .3 }} />
                      <div style={{ flex: 1, background: C.s1 }}>
                        <div style={{
                          width: `${(m.b / m.mx) * 100}%`, height: "100%",
                          background: `linear-gradient(to right, ${cB_color}, ${cB_color}55)`,
                          transition: "width .7s cubic-bezier(.34,1.56,.64,1)",
                        }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GCard>

          {/* Season-by-season points chart */}
          {tmSeasonData.length > 0 && (
            <GCard style={{ padding: 26 }} noHover>
              <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 18 }}>
                POINTS PER SEASON — HEAD TO HEAD
              </p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={tmSeasonData} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="2 5" stroke={C.s2} vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: C.muted, fontSize: 11, fontFamily: C.mono }} />
                  <YAxis tick={{ fill: C.muted, fontSize: 10 }} />
                  <Tooltip content={<ChartTip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: C.muted, fontFamily: C.mono }} />
                  <Bar dataKey={pair.a} fill={cA_color} radius={[4, 4, 0, 0]} />
                  <Bar dataKey={pair.b} fill={cB_color} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GCard>
          )}

          {/* Career comparison radar */}
          {dA && dB && (
            <GCard style={{ padding: 26 }} noHover>
              <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 16 }}>
                SKILLS RADAR OVERLAY
              </p>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={["Pace","Craft","Consistency","Wet","Qualifying"].map(k => ({
                  k,
                  [dA.code]: { Pace: dA.pace, Craft: dA.craft, Consistency: dA.cons, Wet: dA.wet, Qualifying: dA.quali }[k] || 0,
                  [dB.code]: { Pace: dB.pace, Craft: dB.craft, Consistency: dB.cons, Wet: dB.wet, Qualifying: dB.quali }[k] || 0,
                }))}>
                  <PolarGrid stroke={C.border} />
                  <PolarAngleAxis dataKey="k" tick={{ fill: C.dim, fontSize: 11, fontFamily: C.mono }} />
                  <PolarRadiusAxis domain={[60, 100]} tick={false} axisLine={false} />
                  <Radar dataKey={dA.code} stroke={cA_color} fill={cA_color} fillOpacity={0.15} strokeWidth={2.5} />
                  <Radar dataKey={dB.code} stroke={cB_color} fill={cB_color} fillOpacity={0.15} strokeWidth={2.5} />
                  <Legend wrapperStyle={{ fontSize: 11, color: C.muted, fontFamily: C.mono }} />
                  <Tooltip content={<ChartTip />} />
                </RadarChart>
              </ResponsiveContainer>
            </GCard>
          )}
        </div>
      )}

      {/* ══ TYRE MATRIX ══ */}
      {sub === "tyre" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Legend + metric toggle */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { label: "90–100", bg: "rgba(52,211,153,.85)", text: "Elite" },
                { label: "65–89",  bg: "rgba(52,211,153,.4)", text: "Good" },
                { label: "50–64",  bg: "rgba(240,160,48,.4)", text: "Marginal" },
                { label: "30–49",  bg: "rgba(232,0,45,.35)",  text: "Poor" },
                { label: "0–29",   bg: "rgba(60,60,80,.5)",   text: "N/A" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 22, height: 14, borderRadius: 4, background: item.bg }} />
                  <span style={{ fontSize: 9, color: C.muted, fontFamily: C.fn }}>{item.text}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              {COMPOUNDS.map(c => (
                <button key={c} onClick={() => setHeatMetric(c)} style={{
                  background: heatMetric === c
                    ? c === "SOFT" ? `${C.red}22` : c === "MEDIUM" ? `${C.gold}22` : c === "HARD" ? "rgba(180,180,200,.2)" : c === "INTER" ? `${C.green}22` : `${C.cyan}22`
                    : C.s1,
                  border: `1px solid ${heatMetric === c
                    ? c === "SOFT" ? C.red + "55" : c === "MEDIUM" ? C.gold + "55" : c === "HARD" ? "rgba(180,180,200,.4)" : c === "INTER" ? C.green + "55" : C.cyan + "55"
                    : C.border}`,
                  color: heatMetric === c
                    ? c === "SOFT" ? C.red : c === "MEDIUM" ? C.gold : c === "HARD" ? "#bbb" : c === "INTER" ? C.green : C.cyan
                    : C.dim,
                  borderRadius: 9, padding: "6px 13px", fontSize: 11, fontFamily: C.mono,
                  cursor: "pointer", transition: "all .15s",
                }}>{c}</button>
              ))}
            </div>
          </div>

          {/* Full heatmap table */}
          <GCard style={{ padding: 0, overflow: "hidden" }} noHover>
            {/* Header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "160px repeat(5, 1fr)",
              background: C.s1, borderBottom: `1px solid ${C.border}`,
              padding: "10px 16px",
            }}>
              <span style={{ fontSize: 9, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em" }}>CIRCUIT</span>
              {COMPOUNDS.map(c => (
                <span key={c} style={{
                  fontSize: 11, fontWeight: 700, textAlign: "center", fontFamily: C.mono,
                  color: c === "SOFT" ? C.red : c === "MEDIUM" ? C.gold : c === "HARD" ? "#aaa" : c === "INTER" ? C.green : C.cyan,
                }}>
                  {c === "SOFT" ? "S" : c === "MEDIUM" ? "M" : c === "HARD" ? "H" : c === "INTER" ? "I" : "W"}
                </span>
              ))}
            </div>

            {/* Rows */}
            {TYRE_MATRIX.map((row, ri) => {
              const isSelected = selectedCircuit === row.circuit;
              return (
                <div
                  key={row.circuit}
                  onClick={() => setSelectedCircuit(isSelected ? null : row.circuit)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "160px repeat(5, 1fr)",
                    padding: "7px 16px", alignItems: "center",
                    borderBottom: `1px solid ${C.border}`,
                    background: isSelected ? `${C.gold}0a` : ri % 2 === 0 ? "transparent" : "rgba(255,255,255,.012)",
                    cursor: "pointer",
                    transition: "background .15s",
                  }}>
                  <span style={{
                    fontSize: 12, fontWeight: isSelected ? 700 : 400,
                    color: isSelected ? C.gold : C.text, fontFamily: C.fn,
                  }}>
                    {isSelected ? "▶ " : ""}{row.circuit}
                  </span>
                  {COMPOUNDS.map(cmp => {
                    const val = row[cmp];
                    const { bg, text } = cellColor(val);
                    const isActive = heatMetric === cmp;
                    return (
                      <div key={cmp} style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 4px",
                      }}>
                        <div style={{
                          width: isActive ? 52 : 42,
                          height: isActive ? 28 : 22,
                          borderRadius: 6,
                          background: bg,
                          border: isActive ? `2px solid ${text}55` : "none",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all .2s",
                        }}>
                          <span style={{ fontSize: isActive ? 13 : 11, fontWeight: 700, color: text, fontFamily: C.disp }}>
                            {val}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </GCard>

          {/* Circuit detail panel (shown when a circuit is selected) */}
          {selectedCircuit && (() => {
            const row = TYRE_MATRIX.find(r => r.circuit === selectedCircuit);
            const best = COMPOUNDS.reduce((a, b) => row[a] >= row[b] ? a : b);
            const worst = COMPOUNDS.reduce((a, b) => row[a] <= row[b] ? a : b);
            return (
              <GCard style={{ padding: 24, animation: "popIn .35s ease" }} noHover accent={C.gold}>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start", marginBottom: 18 }}>
                  {/* SVG track art */}
                  {CIRCUIT_DATA[selectedCircuit] && (
                    <div style={{
                      flex: "0 0 auto",
                      background: C.s1, borderRadius: 14, padding: 12,
                      border: `1px solid ${(CIRCUIT_DATA[selectedCircuit].color || C.border) + "44"}`,
                    }}>
                      <CircuitSVG circuit={selectedCircuit} size={220} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <p style={{ fontSize: 10, color: C.gold, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 4 }}>CIRCUIT DETAIL</p>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: C.text, fontFamily: C.disp, marginBottom: 14 }}>{selectedCircuit}</h3>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, marginBottom: 4 }}>BEST COMPOUND</div>
                        <Pill label={best} color={best === "SOFT" ? C.red : best === "MEDIUM" ? C.gold : best === "HARD" ? "#bbb" : best === "INTER" ? C.green : C.cyan} />
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, marginBottom: 4 }}>AVOID</div>
                        <Pill label={worst} color={C.red} />
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
                  {COMPOUNDS.map(cmp => {
                    const val = row[cmp];
                    const { bg, text } = cellColor(val);
                    return (
                      <div key={cmp} style={{
                        flex: "1 1 80px", background: bg, borderRadius: 12, padding: "14px 10px", textAlign: "center",
                        border: `1px solid ${text}33`,
                      }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: text, fontFamily: C.disp }}>{val}</div>
                        <div style={{ fontSize: 10, color: text, fontFamily: C.mono, marginTop: 4, opacity: .8 }}>{cmp}</div>
                      </div>
                    );
                  })}
                </div>
                <p style={{ fontSize: 11, color: C.muted, marginTop: 14, fontFamily: C.fn }}>
                  Click the same circuit again to close, or click another to compare.
                </p>
              </GCard>
            );
          })()}

          {/* Compound dominance summary chart */}
          <GCard style={{ padding: 26 }} noHover>
            <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 18 }}>
              AVERAGE COMPOUND SCORE ACROSS ALL {CIRCUITS_LIST.length} CIRCUITS
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={COMPOUNDS.map(cmp => ({
                  compound: cmp,
                  score: Math.round(TYRE_MATRIX.reduce((s, r) => s + r[cmp], 0) / TYRE_MATRIX.length),
                }))}
                margin={{ left: -10 }}
              >
                <CartesianGrid strokeDasharray="2 5" stroke={C.s2} vertical={false} />
                <XAxis dataKey="compound" tick={{ fill: C.muted, fontSize: 12, fontFamily: C.mono }} />
                <YAxis domain={[0, 100]} tick={{ fill: C.muted, fontSize: 10 }} />
                <Tooltip content={<ChartTip />} />
                <ReferenceLine y={70} stroke={C.green} strokeDasharray="4 4"
                  label={{ value: "Good threshold", fill: C.green, fontSize: 9, fontFamily: C.mono }} />
                <Bar dataKey="score" name="Avg score" radius={[6, 6, 0, 0]}>
                  {COMPOUNDS.map((cmp, i) => (
                    <Cell key={i} fill={cmp === "SOFT" ? C.red : cmp === "MEDIUM" ? C.gold : cmp === "HARD" ? "#aaa" : cmp === "INTER" ? C.green : C.cyan} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GCard>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   GAMES PAGE
───────────────────────────────────────────────────────────── */

/* ── Quiz bank ── */
const QUIZ_BANK = [
  { q: "Who scored the most points in a single season in this dataset?",
    opts: ["HAM","VER","LEC","NOR"], a: "VER", hint: "2023 · 575 points" },
  { q: "Which driver has the highest qualifying rating in this dataset?",
    opts: ["VER","LEC","NOR","RUS"], a: "LEC", hint: "Raw one-lap pace" },
  { q: "Who has the most career wins across 2019–2025?",
    opts: ["VER","HAM","NOR","LEC"], a: "HAM", hint: "7× World Champion" },
  { q: "Which team does Oscar Piastri drive for?",
    opts: ["Ferrari","Red Bull","McLaren","Mercedes"], a: "McLaren", hint: "Papaya orange" },
  { q: "What is Lewis Hamilton's wet skill rating?",
    opts: ["91","95","99","97"], a: "99", hint: "He's almost unbeatable in the rain" },
  { q: "Which driver moved to Ferrari in 2025?",
    opts: ["Russell","Norris","Hamilton","Alonso"], a: "Hamilton", hint: "7× champion, new chapter" },
  { q: "Who has the highest race craft rating?",
    opts: ["VER","ALO","HAM","NOR"], a: "ALO", hint: "43 years old and still at it" },
  { q: "What does DRS stand for?",
    opts: ["Drag Reduction System","Driver Response Signal","Dynamic Racing Speed","Directional Rear Stabiliser"],
    a: "Drag Reduction System", hint: "Opens a flap on the rear wing" },
  { q: "Which driver has zero career podiums despite 215+ starts?",
    opts: ["BOT","HUL","STR","OCO"], a: "HUL", hint: "German. Very efficient. Somehow." },
  { q: "Lando Norris scored how many points in 2025?",
    opts: ["374","462","205","388"], a: "462", hint: "His best season so far" },
  { q: "Who has the best consistency rating in this dataset?",
    opts: ["HAM","VER","BOT","SAI"], a: "HAM", hint: "Rarely makes mistakes over a season" },
  { q: "Which circuit is the Monaco Grand Prix held at?",
    opts: ["Circuit de Catalunya","Circuit de Monaco","Autodromo Nazionale Monza","Baku City Circuit"],
    a: "Circuit de Monaco", hint: "The jewel in the F1 crown" },
  { q: "Oscar Piastri is from which country?",
    opts: ["New Zealand","UK","Australia","Canada"], a: "Australia", hint: "First Aussie race winner since 2012" },
  { q: "Which team has the highest budget in this dataset?",
    opts: ["Red Bull","Mercedes","Ferrari","McLaren"], a: "Ferrari",
    hint: "£462M — and they still make strategy errors" },
  { q: "Who has the most career DNFs in this dataset?",
    opts: ["MAG","BOT","PER","STR"], a: "MAG", hint: "Retired 2024 · very aggressive driver" },
];

/* ── Sector time helpers for Lap Time Challenge ── */
const SECTOR_PROFILES = {
  "Bahrain":      { s1: [26.1, 0.8], s2: [38.4, 1.0], s3: [24.8, 0.7] },
  "Monaco":       { s1: [18.2, 0.6], s2: [22.1, 0.8], s3: [14.9, 0.5] },
  "Silverstone":  { s1: [29.3, 0.9], s2: [22.8, 0.7], s3: [28.5, 0.8] },
  "Monza":        { s1: [26.3, 0.7], s2: [28.9, 0.9], s3: [19.1, 0.6] },
  "Spa":          { s1: [29.5, 1.0], s2: [42.1, 1.2], s3: [22.3, 0.8] },
  "Suzuka":       { s1: [32.7, 0.9], s2: [40.2, 1.1], s3: [17.8, 0.6] },
};
const LAP_CIRCUITS = Object.keys(SECTOR_PROFILES);

function GamesPage({ season, setSeason }) {
  const [sub, setSub] = useState("fantasy");

  /* ════════════════════════════════
     1. FANTASY F1 DRAFT
  ════════════════════════════════ */
  const MAX_PICKS = 5;
  const BUDGET = 100; // £M notional
  const driverPrice = (d) => {
    const pts = totalPts(d);
    if (pts > 1500) return 25;
    if (pts > 900)  return 20;
    if (pts > 500)  return 15;
    if (pts > 200)  return 10;
    return 5;
  };
  const [fantasyPicks, setFantasyPicks] = useState([]);
  const [fantasySort, setFantasySort] = useState("pts");

  const fantasyScore = useMemo(() =>
    fantasyPicks.reduce((sum, code) => {
      const d = DRIVERS.find(x => x.code === code);
      return sum + (d ? sv(d, "pts", season) : 0);
    }, 0), [fantasyPicks, season]);

  const spent = fantasyPicks.reduce((s, code) => {
    const d = DRIVERS.find(x => x.code === code);
    return s + (d ? driverPrice(d) : 0);
  }, 0);
  const budgetLeft = BUDGET - spent;

  const sortedForDraft = useMemo(() => [...DRIVERS].sort((a, b) => {
    if (fantasySort === "pts")   return sv(b, "pts", season) - sv(a, "pts", season);
    if (fantasySort === "price") return driverPrice(b) - driverPrice(a);
    if (fantasySort === "pace")  return b.pace - a.pace;
    if (fantasySort === "value") {
      const valA = sv(a, "pts", season) / driverPrice(a);
      const valB = sv(b, "pts", season) / driverPrice(b);
      return valB - valA;
    }
    return 0;
  }), [season, fantasySort]);

  const teamRating = (score) => {
    if (score > 2000) return { label: "🏆 World Beaters", color: C.gold };
    if (score > 1400) return { label: "🔥 Podium Contenders", color: C.red };
    if (score > 800)  return { label: "🔵 Points Finishers", color: C.cyan };
    return               { label: "⚪ Midfield Builders", color: C.dim };
  };

  /* ════════════════════════════════
     2. DRIVER QUIZ
  ════════════════════════════════ */
  const [quizActive, setQuizActive] = useState(false);
  const [quizIdx,    setQuizIdx]    = useState(0);
  const [quizScore,  setQuizScore]  = useState(0);
  const [answered,   setAnswered]   = useState(null); // the chosen option or null
  const [quizDone,   setQuizDone]   = useState(false);
  const [quizOrder,  setQuizOrder]  = useState([]);

  const startQuiz = () => {
    const shuffled = [...QUIZ_BANK].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuizOrder(shuffled);
    setQuizIdx(0); setQuizScore(0);
    setAnswered(null); setQuizDone(false);
    setQuizActive(true);
  };

  const currentQ = quizOrder[quizIdx];

  const pickAnswer = (opt) => {
    if (answered !== null) return;
    setAnswered(opt);
    if (opt === currentQ.a) setQuizScore(s => s + 1);
  };

  const nextQuestion = () => {
    if (quizIdx + 1 >= quizOrder.length) { setQuizDone(true); return; }
    setQuizIdx(i => i + 1);
    setAnswered(null);
  };

  const quizGrade = (score) => {
    if (score >= 9) return { emoji: "🏆", label: "Absolute Legend", color: C.gold };
    if (score >= 7) return { emoji: "🥈", label: "Serious F1 Fan", color: "#aaa" };
    if (score >= 5) return { emoji: "🔵", label: "Decent Knowledge", color: C.cyan };
    if (score >= 3) return { emoji: "🔧", label: "Needs More Laps", color: C.dim };
    return               { emoji: "🏁", label: "Back to the Academy", color: C.red };
  };

  /* ════════════════════════════════
     3. PREDICTION LEADERBOARD
  ════════════════════════════════ */
  const [predP1, setPredP1] = useState("");
  const [predP2, setPredP2] = useState("");
  const [predP3, setPredP3] = useState("");
  const [predName, setPredName] = useState("");
  const [predRace, setPredRace] = useState("Monaco");
  const [predictions, setPredictions] = useState([]);
  const [predSaved, setPredSaved] = useState(false);
  const [predLoading, setPredLoading] = useState(true);
  const PRED_RACES = ["Monaco","Silverstone","Monza","Suzuka","Spa","Singapore","Bahrain","Abu Dhabi"];

  // Load stored predictions on mount
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("f1_predictions_v2", true);
        if (r?.value) setPredictions(JSON.parse(r.value));
      } catch {}
      setPredLoading(false);
    })();
  }, []);

  const savePrediction = async () => {
    if (!predP1 || !predP2 || !predP3 || !predName.trim()) return;
    const entry = {
      id: Date.now(),
      name: predName.trim(),
      race: predRace,
      p1: predP1, p2: predP2, p3: predP3,
      ts: Date.now(),
    };
    const updated = [entry, ...predictions].slice(0, 50);
    setPredictions(updated);
    try { await window.storage.set("f1_predictions_v2", JSON.stringify(updated), true); } catch {}
    setPredSaved(true);
    setTimeout(() => setPredSaved(false), 2500);
    setPredP1(""); setPredP2(""); setPredP3(""); setPredName("");
  };

  const deletePred = async (id) => {
    const updated = predictions.filter(p => p.id !== id);
    setPredictions(updated);
    try { await window.storage.set("f1_predictions_v2", JSON.stringify(updated), true); } catch {}
  };

  /* Score a stored prediction against actual 2025 data (simulated "results") */
  const ACTUAL_RESULTS = {
    Monaco:       ["LEC","NOR","VER"],
    Silverstone:  ["NOR","RUS","HAM"],
    Monza:        ["NOR","PIA","VER"],
    Suzuka:       ["VER","NOR","LEC"],
    Spa:          ["VER","NOR","HAM"],
    Singapore:    ["NOR","LEC","PIA"],
    Bahrain:      ["VER","NOR","LEC"],
    "Abu Dhabi":  ["VER","NOR","PIA"],
  };

  const scorePrediction = (pred) => {
    const actual = ACTUAL_RESULTS[pred.race];
    if (!actual) return null;
    let pts = 0;
    if (pred.p1 === actual[0]) pts += 3;
    if (pred.p2 === actual[1]) pts += 3;
    if (pred.p3 === actual[2]) pts += 3;
    if (actual.includes(pred.p1)) pts += 1;
    if (actual.includes(pred.p2)) pts += 1;
    if (actual.includes(pred.p3)) pts += 1;
    return pts;
  };

  /* Leaderboard: group by name, sum scores */
  const leaderboard = useMemo(() => {
    const map = {};
    predictions.forEach(pred => {
      const pts = scorePrediction(pred);
      if (pts === null) return;
      if (!map[pred.name]) map[pred.name] = { name: pred.name, total: 0, count: 0 };
      map[pred.name].total += pts;
      map[pred.name].count += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [predictions]);

  /* ════════════════════════════════
     4. LAP TIME CHALLENGE
  ════════════════════════════════ */
  const [lapCircuit, setLapCircuit] = useState("Bahrain");
  const [lapDriver,  setLapDriver]  = useState("VER");
  const [lapPhase,   setLapPhase]   = useState("idle"); // idle | s1_wait | s1_go | s2_wait | s2_go | s3_wait | s3_go | done
  const [sectors,    setSectors]    = useState([null, null, null]);
  const [lapTarget,  setLapTarget]  = useState(null);
  const [lapResults, setLapResults] = useState([]);

  const profile = SECTOR_PROFILES[lapCircuit];
  const driverObj = DRIVERS.find(d => d.code === lapDriver);
  const driverBonus = driverObj ? (driverObj.pace - 80) / 100 : 0; // 0–0.18s bonus

  const targetSectorTime = (sectorKey) => {
    const [base, spread] = profile[sectorKey];
    return base - driverBonus * spread;
  };

  const advanceLap = useCallback(() => {
    const phase = lapPhase;
    const now = Date.now();

    if (phase === "idle") {
      setSectors([null, null, null]);
      setLapPhase("s1_wait");
      const delay = 800 + Math.random() * 1500;
      setTimeout(() => setLapPhase("s1_go"), delay);
      setLapTarget(null);
      return;
    }

    if (phase === "s1_go") {
      const target = targetSectorTime("s1");
      const actual = lapTarget ? (now - lapTarget) / 1000 : target + 0.5;
      const delta = +(actual - target).toFixed(3);
      setSectors(s => [delta, s[1], s[2]]);
      setLapPhase("s2_wait");
      const delay = 600 + Math.random() * 1200;
      setTimeout(() => setLapPhase("s2_go"), delay);
      return;
    }

    if (phase === "s2_go") {
      const target = targetSectorTime("s2");
      const actual = lapTarget ? (now - lapTarget) / 1000 : target + 0.5;
      const delta = +(actual - target).toFixed(3);
      setSectors(s => [s[0], delta, s[2]]);
      setLapPhase("s3_wait");
      const delay = 600 + Math.random() * 1200;
      setTimeout(() => setLapPhase("s3_go"), delay);
      return;
    }

    if (phase === "s3_go") {
      const target = targetSectorTime("s3");
      const actual = lapTarget ? (now - lapTarget) / 1000 : target + 0.5;
      const delta = +(actual - target).toFixed(3);
      const newSectors = [sectors[0], sectors[1], delta];
      setSectors(newSectors);
      setLapPhase("done");
      const total = newSectors.reduce((sum, d) => sum + d, 0);
      const baseTime = Object.values(profile).reduce((s, [b]) => s + b, 0);
      const lapTime = (baseTime - driverBonus * 2 + total).toFixed(3);
      setLapResults(prev => [{
        circuit: lapCircuit,
        driver: lapDriver,
        s1: newSectors[0],
        s2: newSectors[1],
        s3: newSectors[2],
        total: +lapTime,
        ts: Date.now(),
      }, ...prev].slice(0, 8));
      return;
    }
  }, [lapPhase, lapTarget, sectors, lapCircuit, lapDriver, profile, driverBonus]);

  // Set the target timestamp when a sector goes green
  useEffect(() => {
    if (lapPhase === "s1_go" || lapPhase === "s2_go" || lapPhase === "s3_go") {
      setLapTarget(Date.now());
    }
  }, [lapPhase]);

  const sectorLabel = (phase) => {
    if (phase === "s1_wait" || phase === "s1_go") return 1;
    if (phase === "s2_wait" || phase === "s2_go") return 2;
    if (phase === "s3_wait" || phase === "s3_go") return 3;
    return null;
  };

  const isGo = lapPhase === "s1_go" || lapPhase === "s2_go" || lapPhase === "s3_go";
  const isWait = lapPhase === "s1_wait" || lapPhase === "s2_wait" || lapPhase === "s3_wait";

  const sectorColor = (delta) => {
    if (delta === null) return C.muted;
    if (delta < -0.05) return "#cc44ff"; // purple = personal best
    if (delta < 0.1)   return C.green;
    if (delta < 0.3)   return C.gold;
    return C.red;
  };

  /* ════════════════════════════════
     RENDER
  ════════════════════════════════ */
  return (
    <div>
      <PageHead title="GAMES" sub="Fantasy Draft · Driver Quiz · Prediction Leaderboard · Lap Time Challenge" color={C.green} />

      <TabBar
        tabs={[
          ["fantasy",  "🏎 Fantasy Draft"],
          ["quiz",     "🧠 Driver Quiz"],
          ["predict",  "🔮 Predictions"],
          ["laptime",  "⏱ Lap Challenge"],
        ]}
        active={sub}
        setActive={setSub}
      />

      {/* ══════════════════════════
          FANTASY DRAFT
      ══════════════════════════ */}
      {sub === "fantasy" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Season + sort controls */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: C.muted, fontFamily: C.mono }}>SCORE SEASON</span>
            {["All", ...SEASONS].map(s => (
              <button key={s} onClick={() => setSeason(String(s))} style={{
                background: season === String(s) ? `${C.green}1a` : C.s1,
                border: `1px solid ${season === String(s) ? C.green + "55" : C.border}`,
                color: season === String(s) ? C.green : C.dim,
                borderRadius: 9, padding: "5px 12px", fontSize: 11, fontFamily: C.mono,
                cursor: "pointer", transition: "all .15s",
              }}>{s}</button>
            ))}
          </div>

          {/* Team score banner */}
          <GCard style={{
            padding: 22,
            background: fantasyPicks.length === MAX_PICKS
              ? `linear-gradient(135deg, ${C.green}12, ${C.card}, ${C.gold}0a)`
              : C.card,
          }} noHover accent={fantasyPicks.length === MAX_PICKS ? C.green : undefined}>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 9, color: C.muted, fontFamily: C.mono, letterSpacing: ".12em", marginBottom: 4 }}>TEAM SCORE</p>
                <p style={{ fontSize: 40, fontWeight: 900, color: C.green, fontFamily: C.disp, lineHeight: 1 }}>
                  {fantasyScore.toLocaleString()}
                </p>
                <p style={{ fontSize: 11, color: C.dim, marginTop: 4, fontFamily: C.fn }}>
                  {season === "All" ? "career points" : `${season} points`}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 9, color: C.muted, fontFamily: C.mono, letterSpacing: ".12em", marginBottom: 4 }}>BUDGET</p>
                <p style={{ fontSize: 28, fontWeight: 900, color: budgetLeft < 10 ? C.red : C.gold, fontFamily: C.disp, lineHeight: 1 }}>
                  £{budgetLeft}M
                </p>
                <p style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>of £{BUDGET}M remaining</p>
              </div>
              <div>
                <p style={{ fontSize: 9, color: C.muted, fontFamily: C.mono, letterSpacing: ".12em", marginBottom: 4 }}>PICKS</p>
                <p style={{ fontSize: 28, fontWeight: 900, color: C.text, fontFamily: C.disp, lineHeight: 1 }}>
                  {fantasyPicks.length}<span style={{ fontSize: 16, color: C.muted }}>/{MAX_PICKS}</span>
                </p>
              </div>
              {fantasyPicks.length === MAX_PICKS && (
                <div style={{ flex: 1, textAlign: "right" }}>
                  <p style={{ fontSize: 24, fontWeight: 800, color: teamRating(fantasyScore).color, fontFamily: C.disp }}>
                    {teamRating(fantasyScore).label}
                  </p>
                </div>
              )}
            </div>

            {/* Selected driver chips */}
            {fantasyPicks.length > 0 && (
              <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                {fantasyPicks.map(code => {
                  const d = DRIVERS.find(x => x.code === code);
                  const c = tc(d.team);
                  return (
                    <div key={code} style={{
                      background: `${c}18`, border: `1px solid ${c}44`,
                      borderRadius: 10, padding: "8px 14px",
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <div style={{ width: 3, height: 16, background: c, borderRadius: 2 }} />
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: c, fontFamily: C.disp }}>{d.code}</span>
                        <span style={{ fontSize: 10, color: C.dim, marginLeft: 6 }}>
                          £{driverPrice(d)}M · {sv(d, "pts", season)} pts
                        </span>
                      </div>
                      <button onClick={() => setFantasyPicks(p => p.filter(x => x !== code))}
                        style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
                    </div>
                  );
                })}
              </div>
            )}
          </GCard>

          {/* Draft board */}
          <GCard style={{ padding: 24 }} noHover>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em" }}>
                DRIVER POOL — PICK UP TO {MAX_PICKS} · BUDGET £{BUDGET}M
              </p>
              <div style={{ display: "flex", gap: 5 }}>
                {[["pts","Pts"],["price","Price"],["pace","Pace"],["value","Value"]].map(([v,l]) => (
                  <button key={v} onClick={() => setFantasySort(v)} style={{
                    background: fantasySort === v ? `${C.green}18` : C.s2,
                    border: `1px solid ${fantasySort === v ? C.green + "44" : C.border}`,
                    color: fantasySort === v ? C.green : C.dim,
                    borderRadius: 8, padding: "4px 11px", fontSize: 10,
                    fontFamily: C.mono, cursor: "pointer", transition: "all .15s",
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 8 }}>
              {sortedForDraft.map((d) => {
                const c = tc(d.team);
                const picked = fantasyPicks.includes(d.code);
                const tooExpensive = !picked && budgetLeft < driverPrice(d);
                const full = !picked && fantasyPicks.length >= MAX_PICKS;
                const disabled = tooExpensive || full;
                const pts = sv(d, "pts", season);
                const value = (pts / driverPrice(d)).toFixed(0);
                return (
                  <button
                    key={d.code}
                    disabled={disabled}
                    onClick={() => setFantasyPicks(p =>
                      p.includes(d.code)
                        ? p.filter(x => x !== d.code)
                        : [...p, d.code]
                    )}
                    style={{
                      background: picked ? `${c}1a` : C.s1,
                      border: `1px solid ${picked ? c + "55" : disabled ? C.muted + "22" : C.border}`,
                      borderRadius: 12, padding: "12px 14px",
                      cursor: disabled ? "not-allowed" : "pointer",
                      textAlign: "left", transition: "all .18s",
                      opacity: disabled ? 0.4 : 1,
                      display: "flex", alignItems: "center", gap: 10,
                    }}>
                    <div style={{ width: 3, height: 32, background: picked ? c : C.muted, borderRadius: 2, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: picked ? c : C.text, fontFamily: C.disp }}>{d.code}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.gold, fontFamily: C.disp }}>£{driverPrice(d)}M</span>
                      </div>
                      <div style={{ fontSize: 10, color: C.dim, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {d.name} · {d.team}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <span style={{ fontSize: 10, color: pts > 300 ? C.gold : C.muted, fontFamily: C.mono }}>
                          {pts} pts
                        </span>
                        <span style={{ fontSize: 10, color: +value > 30 ? C.green : C.muted, fontFamily: C.mono }}>
                          val: {value}
                        </span>
                      </div>
                    </div>
                    {picked && <span style={{ fontSize: 16, color: c }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </GCard>
        </div>
      )}

      {/* ══════════════════════════
          DRIVER QUIZ
      ══════════════════════════ */}
      {sub === "quiz" && (
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          {!quizActive && !quizDone && (
            <GCard style={{ padding: 40, textAlign: "center" }} noHover>
              <p style={{ fontSize: 48, marginBottom: 16 }}>🧠</p>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: C.text, fontFamily: C.disp, marginBottom: 10 }}>
                F1 KNOWLEDGE TEST
              </h3>
              <p style={{ fontSize: 14, color: C.dim, lineHeight: 1.7, marginBottom: 30, fontFamily: C.fn }}>
                10 questions drawn from {QUIZ_BANK.length} in the bank.<br />
                Drivers, stats, teams, history. No bluffing allowed.
              </p>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
                {[["10", "Questions"],["10", "Seconds avg"],["🏆", "Leaderboard"]].map(([val, lbl]) => (
                  <div key={lbl} style={{ background: C.s1, borderRadius: 12, padding: "14px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: C.green, fontFamily: C.disp }}>{val}</div>
                    <div style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, marginTop: 3 }}>{lbl}</div>
                  </div>
                ))}
              </div>
              <button onClick={startQuiz} className="btn-press" style={{
                background: `linear-gradient(135deg, ${C.green}, ${C.cyan})`,
                border: "none", color: C.bg, borderRadius: 14, padding: "14px 36px",
                fontSize: 14, fontFamily: C.mono, cursor: "pointer", fontWeight: 700, letterSpacing: ".1em",
              }}>START QUIZ ›</button>
            </GCard>
          )}

          {quizActive && !quizDone && currentQ && (
            <GCard style={{ padding: 32 }} noHover>
              {/* Progress */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: C.muted, fontFamily: C.mono }}>Q {quizIdx + 1} / {quizOrder.length}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.green, fontFamily: C.disp }}>
                  {quizScore} / {quizIdx}
                </span>
              </div>
              <div style={{ height: 3, background: C.s1, borderRadius: 2, marginBottom: 26 }}>
                <div style={{
                  height: "100%", borderRadius: 2,
                  width: `${(quizIdx / quizOrder.length) * 100}%`,
                  background: `linear-gradient(90deg, ${C.green}, ${C.cyan})`,
                  transition: "width .5s cubic-bezier(.34,1.56,.64,1)",
                }} />
              </div>

              <h3 style={{ fontSize: 17, fontWeight: 600, color: C.text, fontFamily: C.fn, lineHeight: 1.55, marginBottom: 8 }}>
                {currentQ.q}
              </h3>
              <p style={{ fontSize: 11, color: C.muted, fontFamily: C.mono, marginBottom: 24 }}>
                💡 {currentQ.hint}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {currentQ.opts.map((opt) => {
                  const isChosen  = answered === opt;
                  const isCorrect = opt === currentQ.a;
                  const wasAnswered = answered !== null;
                  const bg = wasAnswered
                    ? isCorrect ? `${C.green}22` : isChosen ? `${C.red}22` : C.s1
                    : C.s1;
                  const border = wasAnswered
                    ? isCorrect ? C.green + "66" : isChosen ? C.red + "66" : C.border
                    : C.border;
                  const textColor = wasAnswered
                    ? isCorrect ? C.green : isChosen ? C.red : C.dim
                    : C.text;
                  return (
                    <button key={opt} onClick={() => pickAnswer(opt)}
                      disabled={wasAnswered}
                      style={{
                        background: bg, border: `1px solid ${border}`,
                        borderRadius: 12, padding: "14px 18px",
                        cursor: wasAnswered ? "default" : "pointer",
                        textAlign: "left", transition: "all .2s",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}>
                      <span style={{ fontSize: 14, color: textColor, fontFamily: C.fn, fontWeight: 500 }}>{opt}</span>
                      {wasAnswered && isCorrect && <span style={{ fontSize: 18 }}>✓</span>}
                      {wasAnswered && isChosen && !isCorrect && <span style={{ fontSize: 18 }}>✗</span>}
                    </button>
                  );
                })}
              </div>

              {answered !== null && (
                <button onClick={nextQuestion} className="btn-press" style={{
                  width: "100%", background: C.green, border: "none",
                  color: C.bg, borderRadius: 12, padding: "13px",
                  fontSize: 13, fontFamily: C.mono, cursor: "pointer", fontWeight: 700, letterSpacing: ".08em",
                }}>
                  {quizIdx + 1 >= quizOrder.length ? "See Results →" : "Next Question →"}
                </button>
              )}
            </GCard>
          )}

          {quizDone && (
            <GCard style={{ padding: 40, textAlign: "center" }} noHover>
              {(() => { const g = quizGrade(quizScore); return (
                <>
                  <p style={{ fontSize: 64, marginBottom: 12 }}>{g.emoji}</p>
                  <h3 style={{ fontSize: 28, fontWeight: 900, color: g.color, fontFamily: C.disp, marginBottom: 6 }}>
                    {quizScore} / {quizOrder.length}
                  </h3>
                  <p style={{ fontSize: 16, color: C.text, fontFamily: C.fn, marginBottom: 8 }}>{g.label}</p>
                  <p style={{ fontSize: 12, color: C.dim, marginBottom: 32, fontFamily: C.fn }}>
                    {quizScore >= 9 ? "You should be a pundit. Seriously." :
                     quizScore >= 7 ? "Strong result. You've watched a lot of races." :
                     quizScore >= 5 ? "Decent. Keep watching the Netflix series." :
                     "Maybe start with the highlights on YouTube."}
                  </p>
                  <div style={{ height: 3, background: C.s1, borderRadius: 2, marginBottom: 28, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(quizScore / quizOrder.length) * 100}%`, background: `linear-gradient(90deg,${g.color},${C.cyan})`, borderRadius: 2 }} />
                  </div>
                  <button onClick={startQuiz} className="btn-press" style={{
                    background: `linear-gradient(135deg,${C.green},${C.cyan})`, border: "none",
                    color: C.bg, borderRadius: 12, padding: "13px 32px",
                    fontSize: 13, fontFamily: C.mono, cursor: "pointer", fontWeight: 700, letterSpacing: ".08em",
                  }}>PLAY AGAIN</button>
                </>
              ); })()}
            </GCard>
          )}
        </div>
      )}

      {/* ══════════════════════════
          PREDICTION LEADERBOARD
      ══════════════════════════ */}
      {sub === "predict" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Submit form */}
          <GCard style={{ padding: 28 }} noHover>
            <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 18 }}>
              SUBMIT YOUR PODIUM PREDICTION
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, display: "block", marginBottom: 6 }}>YOUR NAME</label>
                <input value={predName} onChange={e => setPredName(e.target.value)}
                  placeholder="e.g. Max_Fan_99"
                  style={{
                    width: "100%", background: C.s2, border: `1px solid ${C.border}`,
                    borderRadius: 10, padding: "9px 13px", color: C.text, fontSize: 12, outline: "none",
                  }} />
              </div>
              <div>
                <label style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, display: "block", marginBottom: 6 }}>RACE</label>
                <select value={predRace} onChange={e => setPredRace(e.target.value)} style={{
                  width: "100%", background: C.s2, border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: "9px 13px", color: C.text, fontSize: 12, outline: "none",
                  appearance: "none", cursor: "pointer",
                }}>
                  {PRED_RACES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
              {[["P1 🥇", predP1, setPredP1, C.gold], ["P2 🥈", predP2, setPredP2, "#aaa"], ["P3 🥉", predP3, setPredP3, "#cd7f32"]].map(([label, val, setter, medalColor]) => (
                <div key={label}>
                  <label style={{ fontSize: 10, color: medalColor, fontFamily: C.mono, display: "block", marginBottom: 6 }}>{label}</label>
                  <select value={val} onChange={e => setter(e.target.value)} style={{
                    width: "100%", background: C.s2, border: `1px solid ${val ? C.border : C.muted + "44"}`,
                    borderRadius: 10, padding: "9px 13px", color: val ? C.text : C.muted,
                    fontSize: 12, outline: "none", appearance: "none", cursor: "pointer",
                  }}>
                    <option value="">Select…</option>
                    {DRIVERS.map(d => <option key={d.code} value={d.code}>{d.code} — {d.name}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <button
              onClick={savePrediction}
              disabled={!predP1 || !predP2 || !predP3 || !predName.trim() || predSaved}
              className="btn-press"
              style={{
                background: predSaved ? C.green : `linear-gradient(135deg, ${C.violet}, ${C.cyan})`,
                border: "none", color: predSaved ? C.bg : "#fff",
                borderRadius: 11, padding: "11px 28px",
                fontSize: 12, fontFamily: C.mono, cursor: "pointer",
                fontWeight: 700, letterSpacing: ".08em",
                opacity: !predP1 || !predP2 || !predP3 || !predName.trim() ? 0.5 : 1,
                transition: "background .3s",
              }}>
              {predSaved ? "✓ PREDICTION SAVED!" : "SUBMIT PREDICTION ›"}
            </button>
            <p style={{ fontSize: 10, color: C.muted, marginTop: 10, fontFamily: C.fn }}>
              Predictions are shared publicly with all visitors. Scoring: 3pts exact position, 1pt correct driver in top 3.
            </p>
          </GCard>

          {/* Scoring key + actual results */}
          <GCard style={{ padding: 22 }} noHover>
            <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 14 }}>
              2025 ACTUAL RESULTS (USED FOR SCORING)
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.entries(ACTUAL_RESULTS).map(([race, podium]) => (
                <div key={race} style={{
                  background: C.s1, border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: "10px 14px", minWidth: 130,
                }}>
                  <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, marginBottom: 7 }}>{race}</p>
                  {podium.map((code, i) => (
                    <p key={i} style={{ fontSize: 11, color: i === 0 ? C.gold : i === 1 ? "#aaa" : "#cd7f32", fontFamily: C.fn, marginBottom: 2 }}>
                      P{i + 1} {code}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </GCard>

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <GCard style={{ padding: 24 }} noHover>
              <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 18 }}>
                🏆 PREDICTION LEADERBOARD
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {leaderboard.map((entry, i) => (
                  <div key={entry.name} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "11px 16px", borderRadius: 11,
                    background: i === 0 ? `${C.gold}0e` : C.s1,
                    border: `1px solid ${i === 0 ? C.gold + "33" : C.border}`,
                    animation: `cardIn .3s ease ${i * .04}s both`,
                  }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: i === 0 ? C.gold : i === 1 ? "#aaa" : i === 2 ? "#cd7f32" : C.muted, fontFamily: C.disp, width: 26, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.text, fontFamily: C.fn }}>{entry.name}</span>
                    <span style={{ fontSize: 11, color: C.dim, fontFamily: C.mono }}>{entry.count} pred{entry.count > 1 ? "s" : ""}</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: i === 0 ? C.gold : C.text, fontFamily: C.disp }}>{entry.total} pts</span>
                  </div>
                ))}
              </div>
            </GCard>
          )}

          {/* All predictions feed */}
          {predictions.length > 0 && (
            <GCard style={{ padding: 24 }} noHover>
              <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 16 }}>
                ALL PREDICTIONS ({predictions.length})
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {predictions.map((pred) => {
                  const pts = scorePrediction(pred);
                  return (
                    <div key={pred.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 14px", borderRadius: 10,
                      background: C.s1, border: `1px solid ${C.border}`,
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{pred.name}</span>
                          <Pill label={pred.race} color={C.violet} sm />
                          <span style={{ fontSize: 10, color: C.muted, fontFamily: C.mono }}>
                            {new Date(pred.ts).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                          {[pred.p1, pred.p2, pred.p3].map((code, i) => (
                            <span key={i} style={{
                              fontSize: 12, color: i === 0 ? C.gold : i === 1 ? "#aaa" : "#cd7f32",
                              fontFamily: C.disp, fontWeight: 700,
                            }}>P{i+1}: {code}</span>
                          ))}
                        </div>
                      </div>
                      {pts !== null && (
                        <span style={{
                          fontSize: 15, fontWeight: 800, fontFamily: C.disp,
                          color: pts >= 6 ? C.green : pts >= 3 ? C.gold : C.dim,
                          flexShrink: 0,
                        }}>{pts}pts</span>
                      )}
                      <button onClick={() => deletePred(pred.id)} style={{
                        background: "none", border: "none", color: C.muted,
                        cursor: "pointer", fontSize: 14, padding: "0 4px", flexShrink: 0,
                      }}>×</button>
                    </div>
                  );
                })}
              </div>
            </GCard>
          )}

          {predLoading && (
            <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
              <div style={{ width: 28, height: 28, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.violet}`, borderRadius: "50%", animation: "spin .75s linear infinite" }} />
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════
          LAP TIME CHALLENGE
      ══════════════════════════ */}
      {sub === "laptime" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Setup */}
          <GCard style={{ padding: 26 }} noHover>
            <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 18 }}>
              CONFIGURE YOUR LAP
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, display: "block", marginBottom: 7 }}>CIRCUIT</label>
                <select value={lapCircuit} onChange={e => { setLapCircuit(e.target.value); setLapPhase("idle"); setSectors([null,null,null]); }}
                  style={{
                    width: "100%", background: C.s2, border: `1px solid ${C.border}`,
                    borderRadius: 10, padding: "9px 13px", color: C.text, fontSize: 12, outline: "none",
                    appearance: "none", cursor: "pointer",
                  }}>
                  {LAP_CIRCUITS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, display: "block", marginBottom: 7 }}>DRIVER</label>
                <select value={lapDriver} onChange={e => setLapDriver(e.target.value)} style={{
                  width: "100%", background: C.s2, border: `1px solid ${C.border}`,
                  borderRadius: 10, padding: "9px 13px", color: C.text, fontSize: 12, outline: "none",
                  appearance: "none", cursor: "pointer",
                }}>
                  {DRIVERS.map(d => <option key={d.code} value={d.code}>{d.code} — {d.name}</option>)}
                </select>
              </div>
            </div>
            {/* Driver bonus indicator */}
            <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ flex: 1, height: 4, background: C.s1, borderRadius: 2 }}>
                <div style={{
                  width: `${Math.min(driverBonus * 6 * 100, 100)}%`,
                  height: "100%", background: tc(driverObj?.team),
                  borderRadius: 2, transition: "width .5s ease",
                }} />
              </div>
              <span style={{ fontSize: 10, color: tc(driverObj?.team), fontFamily: C.mono, whiteSpace: "nowrap" }}>
                {driverObj?.code} pace bonus: -{(driverBonus * 0.5).toFixed(3)}s/sector
              </span>
            </div>

            {/* Circuit + driver visual */}
            <div style={{ display: "flex", gap: 20, marginTop: 22, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{
                flex: "1 1 280px", background: C.s1, borderRadius: 14,
                padding: "16px", display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${(CIRCUIT_DATA[lapCircuit]?.color || C.border) + "33"}`,
                minHeight: 180,
              }}>
                <CircuitSVG circuit={lapCircuit} size={280} active={lapPhase !== "idle"} />
              </div>
              <div style={{ flex: "0 0 auto" }}>
                <DriverPhoto code={lapDriver} team={driverObj?.team} size={130} tall />
                <div style={{ textAlign: "center", marginTop: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: tc(driverObj?.team), fontFamily: C.disp }}>{lapDriver}</div>
                  <div style={{ fontSize: 10, color: C.muted, fontFamily: C.fn }}>{driverObj?.name}</div>
                  <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 6 }}>
                    <Pill label={`Pace ${driverObj?.pace}`} color={tc(driverObj?.team)} sm />
                  </div>
                </div>
              </div>
            </div>
          </GCard>

          {/* Live cockpit */}
          <GCard style={{
            padding: 32, textAlign: "center", position: "relative", overflow: "hidden",
            background: lapPhase !== "idle"
              ? `linear-gradient(135deg, ${C.card}, ${isGo ? `${C.green}08` : `${C.gold}06`})`
              : C.card,
          }} noHover accent={isGo ? C.green : undefined}>

            {/* Watermark circuit SVG */}
            <div style={{ position: "absolute", right: -20, top: "50%", transform: "translateY(-50%)", opacity: 0.06, pointerEvents: "none" }}>
              <CircuitSVG circuit={lapCircuit} size={360} active={false} />
            </div>

            {/* Sector indicators */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 28 }}>
              {[1, 2, 3].map((sn) => {
                const delta = sectors[sn - 1];
                const isActive = sectorLabel(lapPhase) === sn;
                const isDone = delta !== null;
                return (
                  <div key={sn} style={{
                    flex: 1, maxWidth: 180,
                    background: isActive && isGo ? `${C.green}22`
                      : isActive && isWait ? `${C.gold}12`
                      : isDone ? `${sectorColor(delta)}14`
                      : C.s1,
                    border: `1px solid ${isActive && isGo ? C.green + "55"
                      : isActive && isWait ? C.gold + "44"
                      : isDone ? sectorColor(delta) + "44"
                      : C.border}`,
                    borderRadius: 14, padding: "16px 12px",
                    transition: "all .15s",
                  }}>
                    <p style={{ fontSize: 9, color: C.muted, fontFamily: C.mono, marginBottom: 6 }}>
                      SECTOR {sn}
                    </p>
                    {isDone ? (
                      <>
                        <p style={{ fontSize: 16, fontWeight: 800, color: sectorColor(delta), fontFamily: C.disp, lineHeight: 1 }}>
                          {delta > 0 ? "+" : ""}{delta.toFixed(3)}s
                        </p>
                        <p style={{ fontSize: 9, color: sectorColor(delta), fontFamily: C.mono, marginTop: 4, opacity: .8 }}>
                          {delta < -0.05 ? "PURPLE" : delta < 0.1 ? "GREEN" : delta < 0.3 ? "YELLOW" : "RED"}
                        </p>
                      </>
                    ) : isActive ? (
                      <p style={{ fontSize: 14, fontWeight: 700, color: isGo ? C.green : C.gold, fontFamily: C.disp, animation: isWait ? "pulse .6s ease infinite" : "none" }}>
                        {isGo ? "HIT ►" : "READY…"}
                      </p>
                    ) : (
                      <p style={{ fontSize: 20, color: C.muted, fontFamily: C.disp }}>—</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Big action button */}
            <div
              onClick={lapPhase === "idle" || lapPhase === "done" ? advanceLap : isGo ? advanceLap : undefined}
              style={{
                width: 180, height: 180, borderRadius: "50%",
                margin: "0 auto 24px",
                background: lapPhase === "idle" || lapPhase === "done"
                  ? C.red
                  : isGo ? "#00e04a" : "#f0a030",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                cursor: lapPhase === "idle" || lapPhase === "done" || isGo ? "pointer" : "default",
                transition: "background .1s, transform .1s",
                transform: isGo ? "scale(1.05)" : "scale(1)",
                boxShadow: isGo
                  ? "0 0 60px #00e04a66"
                  : lapPhase === "idle" || lapPhase === "done"
                  ? `0 0 40px ${C.red}44`
                  : "0 0 30px #f0a03044",
                userSelect: "none",
              }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: C.disp, letterSpacing: ".08em", lineHeight: 1 }}>
                {lapPhase === "idle" ? "START LAP" :
                 isWait ? "WAIT…" :
                 isGo ? "HIT!" :
                 lapPhase === "done" ? "NEW LAP" : ""}
              </span>
              {(lapPhase === "idle" || lapPhase === "done") && (
                <span style={{ fontSize: 9, color: "rgba(255,255,255,.6)", fontFamily: C.mono, marginTop: 6 }}>
                  {lapCircuit.toUpperCase()}
                </span>
              )}
            </div>

            {/* Total lap time on completion */}
            {lapPhase === "done" && sectors[2] !== null && lapResults[0] && (
              <div style={{ animation: "popIn .4s cubic-bezier(.34,1.56,.64,1)" }}>
                <p style={{ fontSize: 11, color: C.muted, fontFamily: C.mono, marginBottom: 6 }}>TOTAL LAP DELTA</p>
                <p style={{ fontSize: 36, fontWeight: 900, fontFamily: C.disp,
                  color: lapResults[0].s1 + lapResults[0].s2 + lapResults[0].s3 < 0.3 ? C.green : lapResults[0].s1 + lapResults[0].s2 + lapResults[0].s3 < 0.9 ? C.gold : C.red,
                  lineHeight: 1, marginBottom: 4,
                }}>
                  {(lapResults[0].s1 + lapResults[0].s2 + lapResults[0].s3) > 0 ? "+" : ""}
                  {(lapResults[0].s1 + lapResults[0].s2 + lapResults[0].s3).toFixed(3)}s
                </p>
                <p style={{ fontSize: 12, color: C.dim, fontFamily: C.fn }}>vs target for {lapDriver} at {lapCircuit}</p>
              </div>
            )}

            <p style={{ fontSize: 11, color: C.muted, fontFamily: C.fn, marginTop: 16 }}>
              {lapPhase === "idle" ? "Hit START then react to each sector prompt." :
               isWait ? "Wait for the sector to turn green…" :
               isGo ? "🟢 HIT THE BUTTON — sector is live!" :
               lapPhase === "done" ? "Hit NEW LAP to go again." : ""}
            </p>
          </GCard>

          {/* Best laps table */}
          {lapResults.length > 0 && (
            <GCard style={{ padding: 24 }} noHover>
              <p style={{ fontSize: 10, color: C.muted, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 16 }}>
                SESSION HISTORY
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {lapResults.map((r, i) => {
                  const totalDelta = r.s1 + r.s2 + r.s3;
                  return (
                    <div key={r.ts} style={{
                      display: "grid",
                      gridTemplateColumns: "28px 60px 60px 1fr 1fr 1fr 80px",
                      gap: 8, alignItems: "center",
                      padding: "9px 14px", borderRadius: 10,
                      background: i === 0 ? `${C.green}0a` : C.s1,
                      border: `1px solid ${i === 0 ? C.green + "33" : C.border}`,
                      animation: `cardIn .3s ease ${i * .04}s both`,
                    }}>
                      <span style={{ fontSize: 11, color: C.muted, fontFamily: C.disp }}>{i + 1}</span>
                      <span style={{ fontSize: 11, color: tc(DRIVERS.find(d => d.code === r.driver)?.team), fontFamily: C.disp, fontWeight: 700 }}>{r.driver}</span>
                      <span style={{ fontSize: 10, color: C.dim, fontFamily: C.fn }}>{r.circuit}</span>
                      {[r.s1, r.s2, r.s3].map((delta, si) => (
                        <span key={si} style={{ fontSize: 11, color: sectorColor(delta), fontFamily: C.mono, fontWeight: 700 }}>
                          S{si + 1} {delta > 0 ? "+" : ""}{delta.toFixed(3)}
                        </span>
                      ))}
                      <span style={{ fontSize: 13, fontWeight: 800, color: totalDelta < 0.3 ? C.green : totalDelta < 0.9 ? C.gold : C.red, fontFamily: C.disp, textAlign: "right" }}>
                        {totalDelta > 0 ? "+" : ""}{totalDelta.toFixed(3)}s
                      </span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 14, flexWrap: "wrap" }}>
                {[["PURPLE", "#cc44ff", "Personal best sector"],["GREEN", C.green, "Within 0.1s"],["YELLOW", C.gold, "0.1–0.3s off"],["RED", C.red, "0.3s+ off"]].map(([label, color, desc]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                    <span style={{ fontSize: 9, color: C.muted, fontFamily: C.fn }}>{label}: {desc}</span>
                  </div>
                ))}
              </div>
            </GCard>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROOT APP
───────────────────────────────────────────────────────────── */
const TABS = [
  { id: "oracle",    label: "🤖 AI Oracle"   },
  { id: "hub",       label: "🏎 Driver Hub"  },
  { id: "analytics", label: "📊 Analytics"   },
  { id: "games",     label: "🎮 Games"       },
  { id: "standings", label: "🏆 Standings"   },
  { id: "teams",     label: "🔧 Teams"       },
  { id: "models",    label: "🧠 ML Models"   },
];

export default function App({ user, onLogout }) {
  const [tab,         setTab]         = useState("oracle");
  const [selected,    setSelected]    = useState(["VER", "NOR", "LEC", "HAM", "SAI", "RUS"]);
  const [season,      setSeason]      = useState("All");
  const [loaded,      setLoaded]      = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [eggDRS,    setEggDRS]    = useState(false);
  const [eggSenna,  setEggSenna]  = useState(false);
  const [eggPit,    setEggPit]    = useState(false);
  const [logoTaps,  setLogoTaps]  = useState(0);
  const konamiRef = useRef(0);
  const typedRef  = useRef([]);

  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  useEffect(() => {
    const handler = (e) => {
      // Konami
      if (e.key === EGG_KONAMI[konamiRef.current]) {
        konamiRef.current++;
        if (konamiRef.current === EGG_KONAMI.length) { setEggDRS(true); konamiRef.current = 0; }
      } else konamiRef.current = 0;
      // SENNA
      typedRef.current = [...typedRef.current, e.key].slice(-5);
      if (typedRef.current.join("").toLowerCase() === "senna") { setEggSenna(true); typedRef.current = []; }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const pages = {
    oracle:    <AIOracle />,
    hub:       <DriverHub selected={selected} setSelected={setSelected} season={season} setSeason={setSeason} />,
    analytics: <AnalyticsPage season={season} setSeason={setSeason} />,
    games:     <GamesPage season={season} setSeason={setSeason} />,
    standings: <StandingsPage selected={selected} setSelected={setSelected} season={season} setSeason={setSeason} />,
    teams:     <TeamsPage season={season} setSeason={setSeason} />,
    models:    <ModelsPage />,
  };

  return (
    <>
      <GlobalStyles />
      <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>

        {eggDRS   && <DRSGate    onClose={() => setEggDRS(false)} />}
        {eggSenna && <SennaModal onClose={() => setEggSenna(false)} />}
        {eggPit   && <PitReaction onClose={() => setEggPit(false)} />}

        {/* ── HEADER ── */}
        <header style={{
          background: "rgba(5,5,9,.88)", backdropFilter: "blur(22px)",
          borderBottom: `1px solid ${C.border}`, padding: "0 26px",
          position: "sticky", top: 0, zIndex: 100,
        }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", gap: 16, height: 56 }}>
            {/* Logo — click 7× for pit game */}
            <button
              onClick={() => { const n = logoTaps + 1; setLogoTaps(n); if (n >= 7) { setEggPit(true); setLogoTaps(0); } }}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: 0 }}>
              <div style={{ position: "relative", width: 32, height: 32 }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `conic-gradient(${C.red},${C.gold},${C.red})`, animation: "spin 9s linear infinite", opacity: .6 }} />
                <div style={{ position: "absolute", inset: 2, borderRadius: "50%", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: C.red, fontFamily: C.disp }}>F1</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: ".16em", color: C.text, fontFamily: C.disp }}>INTELLIGENCE</div>
                <div style={{ fontSize: 7.5, color: C.muted, letterSpacing: ".1em", fontFamily: C.mono }}>STRATEGY ENGINE v4.0</div>
              </div>
            </button>

            {/* Nav */}
            <nav style={{ flex: 1, display: "flex", gap: 3, overflowX: "auto", scrollbarWidth: "none", marginLeft: 6 }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} className="tab-item" style={{
                  background: tab === t.id ? "rgba(232,0,45,.12)" : "transparent",
                  border: `1px solid ${tab === t.id ? "rgba(232,0,45,.32)" : "transparent"}`,
                  color: tab === t.id ? C.red : C.dim,
                  padding: "7px 15px", borderRadius: 9, cursor: "pointer",
                  fontSize: 11, fontFamily: C.mono, whiteSpace: "nowrap",
                  fontWeight: 500, letterSpacing: ".05em",
                }}>
                  {t.label}
                </button>
              ))}
            </nav>

            {/* Status + Profile */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
              <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 8, padding: "4px 10px", fontSize: 10, color: C.gold, fontFamily: C.mono }}>
                {season === "All" ? "2019–2025" : season}
              </div>
              <div style={{ background: C.s1, border: `1px solid ${C.border}`, borderRadius: 8, padding: "4px 10px", fontSize: 10, color: C.red, fontFamily: C.mono }}>
                {selected.length} drivers
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 7, height: 7, background: C.green, borderRadius: "50%", boxShadow: `0 0 8px ${C.green}`, animation: "pulse 2s ease infinite" }} />
                <span style={{ fontSize: 9, color: C.green, fontFamily: C.mono }}>LIVE</span>
              </div>

              {/* ── User Profile ── */}
              {user && (
                <div style={{ position: "relative", marginLeft: 4 }}>
                  <button
                    onClick={() => setProfileOpen(o => !o)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      background: profileOpen ? C.s2 : C.s1,
                      border: `1px solid ${profileOpen ? C.borderHi : C.border}`,
                      borderRadius: 10, padding: "5px 10px 5px 6px",
                      cursor: "pointer", transition: "all .15s",
                    }}>
                    {/* Avatar */}
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                      background: user.isGuest
                        ? `linear-gradient(135deg, ${C.muted}, #555)`
                        : `linear-gradient(135deg, ${C.red}, #a0001f)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 800, color: "#fff", fontFamily: C.disp,
                      boxShadow: user.isGuest ? "none" : `0 0 10px ${C.red}55`,
                    }}>
                      {user.isGuest ? "G" : user.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 11, color: C.text, fontFamily: C.mono, maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.isGuest ? "GUEST" : user.name.split(" ")[0].toUpperCase()}
                    </span>
                    <span style={{ fontSize: 9, color: C.muted, marginLeft: -2 }}>▾</span>
                  </button>

                  {/* Dropdown */}
                  {profileOpen && (
                    <>
                      {/* Backdrop */}
                      <div style={{ position: "fixed", inset: 0, zIndex: 198 }} onClick={() => setProfileOpen(false)} />
                      <div style={{
                        position: "absolute", right: 0, top: "calc(100% + 8px)",
                        background: C.card, border: `1px solid ${C.border}`,
                        borderRadius: 16, padding: "16px 0", width: 230,
                        boxShadow: "0 24px 60px rgba(0,0,0,.65)",
                        zIndex: 199, animation: "fadeUp .2s ease",
                      }}>
                        {/* User info */}
                        <div style={{ padding: "6px 18px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                            <div style={{
                              width: 40, height: 40, borderRadius: "50%",
                              background: user.isGuest
                                ? `linear-gradient(135deg, ${C.muted}, #555)`
                                : `linear-gradient(135deg, ${C.red}, #a0001f)`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: C.disp,
                              boxShadow: user.isGuest ? "none" : `0 0 16px ${C.red}44`,
                            }}>
                              {user.isGuest ? "G" : user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: C.fn }}>{user.name}</p>
                              <p style={{ fontSize: 10, color: C.dim, fontFamily: C.mono, marginTop: 2 }}>
                                {user.email || "Guest session"}
                              </p>
                            </div>
                          </div>
                          {user.isGuest && (
                            <div style={{
                              background: `${C.gold}10`, border: `1px solid ${C.gold}28`,
                              borderRadius: 8, padding: "7px 10px", fontSize: 10, color: C.gold, fontFamily: C.mono,
                            }}>
                              ⚡ Sign in to save your progress
                            </div>
                          )}
                          {user.isDemo && (
                            <div style={{
                              background: `${C.violet}10`, border: `1px solid ${C.violet}28`,
                              borderRadius: 8, padding: "7px 10px", fontSize: 10, color: C.violet, fontFamily: C.mono,
                            }}>
                              ◈ Demo account active
                            </div>
                          )}
                        </div>

                        <div style={{ height: 1, background: C.border, margin: "0 0 8px" }} />

                        {/* Menu items */}
                        {[
                          { icon: "🏎", label: "Driver Hub",  action: () => { setTab("hub"); setProfileOpen(false); } },
                          { icon: "🏆", label: "Standings",   action: () => { setTab("standings"); setProfileOpen(false); } },
                          { icon: "🎮", label: "Games",       action: () => { setTab("games"); setProfileOpen(false); } },
                        ].map(item => (
                          <button key={item.label} onClick={item.action} style={{
                            width: "100%", padding: "9px 18px", background: "none", border: "none",
                            display: "flex", alignItems: "center", gap: 10,
                            color: C.dim, fontSize: 12, fontFamily: C.fn, cursor: "pointer",
                            textAlign: "left", transition: "background .15s, color .15s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = C.s1; e.currentTarget.style.color = C.text; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.dim; }}>
                            <span style={{ fontSize: 14 }}>{item.icon}</span> {item.label}
                          </button>
                        ))}

                        <div style={{ height: 1, background: C.border, margin: "8px 0" }} />

                        <button onClick={() => { setProfileOpen(false); onLogout(); }} style={{
                          width: "100%", padding: "9px 18px", background: "none", border: "none",
                          display: "flex", alignItems: "center", gap: 10,
                          color: C.red, fontSize: 12, fontFamily: C.fn, cursor: "pointer",
                          textAlign: "left", transition: "background .15s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = `${C.red}0e`}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}>
                          <span style={{ fontSize: 14 }}>🚪</span> Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── CONTENT ── */}
        <main style={{ maxWidth: 1280, margin: "0 auto", padding: "34px 26px", opacity: loaded ? 1 : 0, transition: "opacity .4s ease" }}>
          {pages[tab]}
        </main>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: `1px solid ${C.border}`, padding: "18px 26px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <p style={{ fontSize: 11, color: C.muted }}>F1 Strategy Intelligence Engine — Data Science Portfolio · 2019–2025</p>
            <p style={{ fontSize: 10, color: C.muted, opacity: .5, marginTop: 3, fontFamily: C.mono }}>FastF1 · OpenF1 · Kaggle/Ergast · scikit-learn · Claude AI</p>
          </div>
          <p style={{ fontSize: 9, color: C.muted, opacity: .35, fontFamily: C.mono }}>
            🕹 ↑↑↓↓←→←→BA · type SENNA · click logo 7×
          </p>
        </footer>
      </div>
    </>
  );
}
