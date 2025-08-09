// server.cjs — FullHousey admin: static + minimal API
const path = require("path");
const express = require("express");

const app = express();
const distDir = path.join(__dirname, "dist");

// ---- Static (SPA) ----
app.use(express.static(distDir));
app.use(express.json({ limit: "512kb" }));

// ---- Minimal APIs (no DB; safe to keep in prod behind CF) ----
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.get("/api/dashboard", (_req, res) => {
  // Fallback data for UI; replace with ClickHouse soon
  const now = Date.now();
  const kpis = [
    { title: "GGR (24h)", value: 324500, delta: 3.2, series: [210,220,250,230,260,290,310,305,330,325] },
    { title: "FTDs (24h)", value: 184, delta: -1.9, series: [22,24,19,21,20,18,17,19,20,18] },
    { title: "ARPU (₹)", value: 475, delta: 1.4, series: [440,450,455,460,470,465,472,480,478,475] },
    { title: "Active Users", value: 2435, delta: 4.8, series: [1600,1700,1750,1800,1900,2100,2200,2300,2400,2435] },
  ];
  const health = Array.from({ length: 24 * 12 }).map((_, i) => {
    const ts = new Date(now - (24*60*60*1000) + i*5*60*1000).toISOString();
    const up = !(i >= 120 && i <= 126); // tiny outage mid-window
    return { ts, up };
  });
  const events = [
    { time: new Date().toISOString(), event: "deploy_ok", user: "system", source: "staging" },
    { time: new Date(now - 10*60*1000).toISOString(), event: "login", user: "u_12", source: "web" },
    { time: new Date(now - 20*60*1000).toISOString(), event: "ticket_purchase", user: "u_45", source: "web" },
  ];
  res.json({ kpis, health, events });
});

// ---- SPA fallback ----
app.get("*", (_req, res) => res.sendFile(path.join(distDir, "index.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`fullhousey-admin listening on ${PORT}`);
});
