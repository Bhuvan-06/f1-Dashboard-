import { useState, useEffect } from "react";

/* ─── Design tokens (mirrored from app) ─── */
const C = {
  bg: "#050509", s0: "#08080f", s1: "#0d0d18", s2: "#121220",
  card: "#0e0e1c", border: "rgba(255,255,255,.07)", borderHi: "rgba(255,255,255,.13)",
  red: "#e8002d", gold: "#f0a030", cyan: "#00d4ff",
  green: "#34d399", violet: "#a78bfa",
  text: "#f0f0f6", dim: "#8890a8", muted: "#3d4158",
  fn: "'DM Sans', sans-serif", disp: "'Orbitron', monospace", mono: "'DM Mono', monospace",
};

/* ─── Inline keyframe styles ─── */
const AuthStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #050509; color: #f0f0f6; font-family: 'DM Sans', sans-serif; }

    @keyframes spin       { to { transform: rotate(360deg) } }
    @keyframes fadeUp     { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
    @keyframes fadeIn     { from { opacity:0 } to { opacity:1 } }
    @keyframes glow       { 0%,100%{box-shadow:0 0 18px #e8002d33} 50%{box-shadow:0 0 44px #e8002d88} }
    @keyframes pulse      { 0%,100%{opacity:1} 50%{opacity:.3} }
    @keyframes speedLine  { from { transform: translateX(-100%) skewX(-15deg); opacity:0 }
                            30%  { opacity:1 }
                            to   { transform: translateX(200vw) skewX(-15deg); opacity:0 } }
    @keyframes scanline   { from { transform:translateY(-100%) } to { transform:translateY(100vh) } }
    @keyframes slideIn    { from { opacity:0; transform:translateX(30px) } to { opacity:1; transform:translateX(0) } }
    @keyframes shake      { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }

    .auth-input {
      width: 100%; padding: 13px 16px; border-radius: 10px;
      background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.09);
      color: #f0f0f6; font-size: 14px; font-family: 'DM Sans', sans-serif;
      outline: none; transition: border-color .2s, box-shadow .2s;
    }
    .auth-input:focus {
      border-color: rgba(232,0,45,.55);
      box-shadow: 0 0 0 3px rgba(232,0,45,.1);
    }
    .auth-input::placeholder { color: #3d4158; }
    .auth-input.error { border-color: rgba(232,0,45,.7); animation: shake .35s ease; }

    .auth-btn-primary {
      width: 100%; padding: 14px; border-radius: 11px; border: none; cursor: pointer;
      background: linear-gradient(135deg, #e8002d, #c4001f);
      color: #fff; font-size: 14px; font-weight: 700;
      font-family: 'Orbitron', monospace; letter-spacing: .08em;
      transition: transform .15s, box-shadow .2s, opacity .2s;
      box-shadow: 0 4px 24px rgba(232,0,45,.35);
    }
    .auth-btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(232,0,45,.5);
    }
    .auth-btn-primary:active:not(:disabled) { transform: translateY(0) scale(.98); }
    .auth-btn-primary:disabled { opacity: .6; cursor: not-allowed; }

    .auth-btn-ghost {
      width: 100%; padding: 13px; border-radius: 11px; cursor: pointer;
      background: transparent; border: 1px solid rgba(255,255,255,.1);
      color: #8890a8; font-size: 13px; font-family: 'DM Sans', sans-serif;
      transition: border-color .2s, color .2s, background .2s;
    }
    .auth-btn-ghost:hover { border-color: rgba(255,255,255,.22); color: #f0f0f6; background: rgba(255,255,255,.04); }

    .feature-item {
      display: flex; align-items: center; gap: 12px; padding: 10px 0;
      animation: fadeUp .5s ease both;
    }

    @media (max-width: 860px) {
      .auth-left-panel { display: none !important; }
      .auth-right-panel { min-height: 100vh !important; }
    }
  `}</style>
);

/* ─── Animated speed lines background ─── */
const SpeedLines = () => {
  const lines = [
    { top: "12%",  delay: "0s",    dur: "2.8s", h: 2,   opacity: .25 },
    { top: "28%",  delay: ".4s",   dur: "3.1s", h: 1,   opacity: .15 },
    { top: "44%",  delay: ".8s",   dur: "2.5s", h: 3,   opacity: .3  },
    { top: "58%",  delay: "1.2s",  dur: "3.4s", h: 1.5, opacity: .2  },
    { top: "70%",  delay: "1.6s",  dur: "2.9s", h: 2,   opacity: .22 },
    { top: "82%",  delay: "0.2s",  dur: "3.2s", h: 1,   opacity: .12 },
    { top: "20%",  delay: "2.1s",  dur: "2.7s", h: 4,   opacity: .18 },
    { top: "66%",  delay: "1.9s",  dur: "3.0s", h: 2.5, opacity: .2  },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {lines.map((l, i) => (
        <div key={i} style={{
          position: "absolute",
          top: l.top, left: 0,
          width: "60%", height: l.h,
          background: `linear-gradient(90deg, transparent, rgba(232,0,45,${l.opacity}), transparent)`,
          animation: `speedLine ${l.dur} ease-in-out ${l.delay} infinite`,
        }} />
      ))}
      {/* Scanline overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(transparent 50%, rgba(0,0,0,.03) 50%)",
        backgroundSize: "100% 4px",
        pointerEvents: "none", opacity: .4,
      }} />
    </div>
  );
};

/* ─── Circuit SVG decoration ─── */
const CircuitDeco = () => (
  <svg viewBox="0 0 400 300" style={{ position: "absolute", bottom: 40, left: 0, width: "80%", opacity: .06, pointerEvents: "none" }}>
    <path d="M 20,220 C 20,160 80,120 140,120 L 200,120 C 240,120 260,90 260,60 L 260,40 C 260,20 280,10 300,20 L 360,60 C 380,72 385,100 370,120 L 340,160 C 320,180 330,210 350,220 L 380,230"
      fill="none" stroke="#e8002d" strokeWidth="2.5" strokeDasharray="8 4" />
    <circle cx="20" cy="220" r="6" fill="#e8002d" opacity=".8" />
    <circle cx="140" cy="120" r="4" fill="#f0a030" opacity=".6" />
    <circle cx="260" cy="60" r="4" fill="#34d399" opacity=".6" />
    <circle cx="380" cy="230" r="6" fill="#e8002d" opacity=".8" />
  </svg>
);

/* ─── Feature bullets for left panel ─── */
const FEATURES = [
  { icon: "🤖", text: "AI-powered race strategy analysis", color: C.violet },
  { icon: "📊", text: "Full 2019–2025 championship data",  color: C.cyan   },
  { icon: "🏎", text: "Driver & team performance models",  color: C.gold   },
  { icon: "⏱",  text: "Live sector timing simulator",      color: C.green  },
  { icon: "🏆", text: "Fantasy draft & predictions",       color: C.red    },
];

/* ─── Input field with label ─── */
const Field = ({ label, type = "text", value, onChange, placeholder, error, autoFocus }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={{ fontSize: 11, color: C.dim, fontFamily: C.mono, letterSpacing: ".08em" }}>
      {label}
    </label>
    <input
      className={`auth-input${error ? " error" : ""}`}
      type={type} value={value} onChange={onChange}
      placeholder={placeholder} autoFocus={autoFocus}
      autoComplete={type === "password" ? "current-password" : type === "email" ? "email" : "name"}
    />
    {error && <span style={{ fontSize: 11, color: C.red, fontFamily: C.fn }}>{error}</span>}
  </div>
);

/* ─── Divider ─── */
const Divider = ({ label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
    <div style={{ flex: 1, height: 1, background: C.border }} />
    <span style={{ fontSize: 11, color: C.muted, fontFamily: C.mono }}>{label}</span>
    <div style={{ flex: 1, height: 1, background: C.border }} />
  </div>
);

/* ═══════════════════════════════════════════════════
   MAIN AUTH PAGE
═══════════════════════════════════════════════════ */
export default function AuthPage({ onLogin }) {
  const [mode, setMode]           = useState("signin"); // "signin" | "signup"
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [globalErr, setGlobalErr] = useState("");
  const [mounted, setMounted]     = useState(false);
  const [showPass, setShowPass]   = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const switchMode = (m) => {
    setMode(m); setErrors({}); setGlobalErr("");
    setName(""); setEmail(""); setPassword(""); setConfirm("");
  };

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (mode === "signup" && !name.trim()) e.name = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "At least 6 characters";
    if (mode === "signup" && password !== confirm) e.confirm = "Passwords don't match";
    return e;
  };

  /* ── Load users from localStorage ── */
  const getUsers = () => {
    try { return JSON.parse(localStorage.getItem("f1_users") || "[]"); } catch { return []; }
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalErr("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    /* Simulate network delay */
    await new Promise(r => setTimeout(r, 820));

    const users = getUsers();

    if (mode === "signup") {
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        setGlobalErr("An account with this email already exists.");
        setErrors({ email: "Already registered" });
        setLoading(false);
        return;
      }
      const user = { id: Date.now(), name: name.trim(), email: email.trim().toLowerCase(), isGuest: false };
      localStorage.setItem("f1_users", JSON.stringify([...users, { ...user, password }]));
      onLogin(user);
    } else {
      const found = users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      /* Demo account always works */
      const isDemo = email.toLowerCase() === "demo@f1intel.com" && password === "f1demo";

      if (!found && !isDemo) {
        setGlobalErr("Incorrect email or password.");
        setErrors({ email: " ", password: " " });
        setLoading(false);
        return;
      }
      const user = found
        ? { id: found.id, name: found.name, email: found.email, isGuest: false }
        : { id: 0, name: "Demo Driver", email: "demo@f1intel.com", isGuest: false, isDemo: true };
      onLogin(user);
    }
    setLoading(false);
  };

  /* ── Guest login ── */
  const handleGuest = () => {
    onLogin({ id: -1, name: "Guest", email: null, isGuest: true });
  };

  return (
    <>
      <AuthStyles />
      <div style={{
        minHeight: "100vh", display: "flex",
        background: C.bg,
        opacity: mounted ? 1 : 0, transition: "opacity .4s ease",
      }}>

        {/* ══════ LEFT PANEL (desktop only) ══════ */}
        <div className="auth-left-panel" style={{
          width: "48%", minHeight: "100vh", position: "relative",
          background: `linear-gradient(145deg, #08080f 0%, #0d0d18 50%, #0a0010 100%)`,
          borderRight: `1px solid ${C.border}`,
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "60px 56px", overflow: "hidden",
        }}>
          <SpeedLines />
          <CircuitDeco />

          {/* Red accent bar */}
          <div style={{
            position: "absolute", left: 0, top: "18%", bottom: "18%",
            width: 3, background: `linear-gradient(180deg, transparent, ${C.red}, ${C.gold}, transparent)`,
            borderRadius: 2,
          }} />

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 52, position: "relative" }}>
            <div style={{ position: "relative", width: 48, height: 48 }}>
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: `conic-gradient(${C.red}, ${C.gold}, ${C.red})`,
                animation: "spin 9s linear infinite", opacity: .7,
              }} />
              <div style={{
                position: "absolute", inset: 3, borderRadius: "50%", background: C.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 900, color: C.red, fontFamily: C.disp,
              }}>F1</div>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: ".2em", color: C.text, fontFamily: C.disp }}>
                INTELLIGENCE
              </div>
              <div style={{ fontSize: 9, color: C.muted, letterSpacing: ".12em", fontFamily: C.mono, marginTop: 2 }}>
                STRATEGY ENGINE v4.0
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div style={{ position: "relative", marginBottom: 44 }}>
            <p style={{ fontSize: 34, fontWeight: 900, fontFamily: C.disp, lineHeight: 1.2, color: C.text, letterSpacing: ".04em" }}>
              RACE AT THE<br />
              <span style={{ color: C.red }}>SPEED</span> OF DATA.
            </p>
            <p style={{ fontSize: 14, color: C.dim, marginTop: 16, lineHeight: 1.7, maxWidth: 360 }}>
              The most comprehensive F1 analytics platform.
              AI-powered insights, real-time strategy models, and
              six years of championship data at your fingertips.
            </p>
          </div>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-item" style={{ animationDelay: `${.3 + i * .1}s` }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: `${f.color}15`, border: `1px solid ${f.color}28`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                }}>{f.icon}</div>
                <span style={{ fontSize: 13, color: C.dim, fontFamily: C.fn }}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Bottom badge */}
          <div style={{ marginTop: 52, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["FastF1 Data", "Claude AI", "React + Vite", "Recharts"].map(t => (
              <span key={t} style={{
                fontSize: 9, color: C.muted, fontFamily: C.mono, letterSpacing: ".08em",
                background: C.s1, border: `1px solid ${C.border}`,
                borderRadius: 6, padding: "4px 9px",
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* ══════ RIGHT PANEL (form) ══════ */}
        <div className="auth-right-panel" style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "40px 24px", position: "relative",
          background: C.bg,
        }}>
          {/* Mobile logo */}
          <div style={{ display: "none", marginBottom: 36, alignItems: "center", gap: 12 }} className="auth-mobile-logo">
            <div style={{ position: "relative", width: 36, height: 36 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `conic-gradient(${C.red},${C.gold},${C.red})`, animation: "spin 9s linear infinite", opacity: .7 }} />
              <div style={{ position: "absolute", inset: 2, borderRadius: "50%", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: C.red, fontFamily: C.disp }}>F1</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: ".2em", color: C.text, fontFamily: C.disp }}>INTELLIGENCE</div>
          </div>

          {/* Card */}
          <div style={{
            width: "100%", maxWidth: 420,
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 22, padding: "36px 32px",
            boxShadow: "0 32px 80px rgba(0,0,0,.55)",
            animation: "slideIn .5s ease",
          }}>

            {/* Mode toggle */}
            <div style={{ display: "flex", background: C.s1, borderRadius: 12, padding: 4, marginBottom: 30 }}>
              {[["signin", "Sign In"], ["signup", "Create Account"]].map(([v, lbl]) => (
                <button key={v} onClick={() => switchMode(v)} style={{
                  flex: 1, padding: "9px 0", borderRadius: 9, border: "none", cursor: "pointer",
                  background: mode === v ? C.card : "transparent",
                  color: mode === v ? C.text : C.dim,
                  fontSize: 12, fontFamily: C.mono, fontWeight: 600, letterSpacing: ".05em",
                  boxShadow: mode === v ? "0 2px 10px rgba(0,0,0,.3)" : "none",
                  transition: "all .2s",
                }}>{lbl}</button>
              ))}
            </div>

            {/* Heading */}
            <div style={{ marginBottom: 26 }}>
              <h1 style={{ fontSize: 20, fontWeight: 900, fontFamily: C.disp, color: C.text, letterSpacing: ".06em" }}>
                {mode === "signin" ? "WELCOME BACK" : "JOIN THE GRID"}
              </h1>
              <p style={{ fontSize: 12, color: C.dim, marginTop: 6 }}>
                {mode === "signin"
                  ? "Sign in to your F1 Intelligence account"
                  : "Create your account to access all features"}
              </p>
            </div>

            {/* Global error */}
            {globalErr && (
              <div style={{
                background: `${C.red}12`, border: `1px solid ${C.red}33`,
                borderRadius: 10, padding: "11px 14px", marginBottom: 18,
                fontSize: 12, color: C.red, fontFamily: C.fn,
                animation: "fadeUp .25s ease",
              }}>⚠ {globalErr}</div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {mode === "signup" && (
                <Field label="FULL NAME" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Lewis Hamilton" error={errors.name} autoFocus={mode === "signup"} />
              )}

              <Field label="EMAIL ADDRESS" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="driver@team.com" error={errors.email}
                autoFocus={mode === "signin"} />

              {/* Password with show/hide toggle */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, color: C.dim, fontFamily: C.mono, letterSpacing: ".08em" }}>PASSWORD</label>
                <div style={{ position: "relative" }}>
                  <input
                    className={`auth-input${errors.password ? " error" : ""}`}
                    type={showPass ? "text" : "password"}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" autoComplete="current-password"
                    style={{ paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: C.muted, fontSize: 13, fontFamily: C.mono, padding: "4px",
                  }}>
                    {showPass ? "HIDE" : "SHOW"}
                  </button>
                </div>
                {errors.password && <span style={{ fontSize: 11, color: C.red }}>{errors.password}</span>}
              </div>

              {mode === "signup" && (
                <Field label="CONFIRM PASSWORD" type={showPass ? "text" : "password"}
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••" error={errors.confirm} />
              )}

              <button type="submit" className="auth-btn-primary" disabled={loading} style={{ marginTop: 4 }}>
                {loading
                  ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin .65s linear infinite" }} />
                      {mode === "signin" ? "SIGNING IN…" : "CREATING…"}
                    </span>
                  : mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"
                }
              </button>
            </form>

            <Divider label="OR" />

            <button className="auth-btn-ghost" onClick={handleGuest}>
              👤 Continue as Guest
            </button>

            {/* Demo hint */}
            {mode === "signin" && (
              <div style={{
                marginTop: 18, padding: "12px 14px", borderRadius: 10,
                background: `${C.violet}0d`, border: `1px solid ${C.violet}22`,
                cursor: "pointer",
              }} onClick={() => { setEmail("demo@f1intel.com"); setPassword("f1demo"); }}>
                <p style={{ fontSize: 10, color: C.violet, fontFamily: C.mono, letterSpacing: ".1em", marginBottom: 4 }}>
                  ◈ DEMO ACCOUNT — click to fill
                </p>
                <p style={{ fontSize: 11, color: C.dim }}>
                  Email: <span style={{ color: C.text, fontFamily: C.mono }}>demo@f1intel.com</span>
                  &nbsp;·&nbsp;
                  Pass: <span style={{ color: C.text, fontFamily: C.mono }}>f1demo</span>
                </p>
              </div>
            )}
          </div>

          {/* Footer note */}
          <p style={{ marginTop: 24, fontSize: 10, color: C.muted, fontFamily: C.mono, textAlign: "center", opacity: .6 }}>
            Data stored locally · No external servers · 100% private
          </p>
        </div>
      </div>
    </>
  );
}
