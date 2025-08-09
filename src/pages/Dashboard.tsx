import React, { useEffect, useMemo, useState } from "react";

/** =========================
 * Types
 * ========================= */
type KPI = {
  title: string;
  value: number;
  delta: number;          // % vs prior period
  series: number[];       // for sparkline
};

type HealthRow = {
  ts: string;             // ISO timestamp
  up: boolean;            // service healthy?
};

type Outage = {
  from: string;           // ISO
  to: string;             // ISO
  durationMs: number;
};

type EventRow = {
  time: string;           // ISO
  event: string;
  user?: string;
  source?: string;
};

type DashboardData = {
  kpis: KPI[];
  health: HealthRow[];    // chronological (oldest → newest)
  events: EventRow[];
};

/** =========================
 * Helpers
 * ========================= */
function fmtNumber(n: number) {
  if (Number.isNaN(n)) return "—";
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return n.toLocaleString();
}

function fmtPercent(p: number) {
  const sign = p > 0 ? "+" : p < 0 ? "−" : "";
  return `${sign}${Math.abs(p).toFixed(1)}%`;
}

function fmtDuration(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rs = s % 60;
  if (m > 0) return `${m}m ${rs}s`;
  return `${rs}s`;
}

function computeUptime(rows: HealthRow[]) {
  if (!rows.length) return 0;
  let upMs = 0;
  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1];
    const curr = rows[i];
    const dt = new Date(curr.ts).getTime() - new Date(prev.ts).getTime();
    if (prev.up) upMs += dt;
  }
  const totalMs =
    new Date(rows[rows.length - 1].ts).getTime() - new Date(rows[0].ts).getTime();
  return totalMs > 0 ? (upMs / totalMs) * 100 : 0;
}

function computeOutages(rows: HealthRow[]): Outage[] {
  const out: Outage[] = [];
  if (!rows.length) return out;
  let downStart: string | null = null;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r.up && downStart == null) {
      downStart = r.ts;
    }
    if (r.up && downStart != null) {
      const to = r.ts;
      out.push({
        from: downStart,
        to,
        durationMs: new Date(to).getTime() - new Date(downStart).getTime(),
      });
      downStart = null;
    }
  }
  // if still down at the end, close against the last timestamp
  if (downStart != null) {
    const last = rows[rows.length - 1].ts;
    out.push({
      from: downStart,
      to: last,
      durationMs: new Date(last).getTime() - new Date(downStart).getTime(),
    });
  }
  // latest first
  return out.sort((a, b) => new Date(b.to).getTime() - new Date(a.to).getTime());
}

/** =========================
 * Sparkline (SVG, no deps)
 * ========================= */
function Sparkline({ series, width = 220, height = 60 }: { series: number[]; width?: number; height?: number }) {
  const path = useMemo(() => {
    if (!series.length) return "";
    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min || 1;
    const step = width / (series.length - 1 || 1);
    return series
      .map((v, i) => {
        const x = i * step;
        const y = height - ((v - min) / range) * height;
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
  }, [series, width, height]);

  const last = series.at(-1) ?? 0;
  const first = series[0] ?? 0;
  const up = last >= first;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <path d={path} fill="none" stroke={up ? "currentColor" : "currentColor"} strokeOpacity={up ? 0.95 : 0.6} strokeWidth="2" />
    </svg>
  );
}

/** =========================
 * Stat Card
 * ========================= */
function StatCard({ kpi }: { kpi: KPI }) {
  const up = kpi.delta >= 0;
  return (
    <div className="card" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}>
      <div>
        <div className="muted" style={{ fontSize: 12 }}>{kpi.title}</div>
        <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{fmtNumber(kpi.value)}</div>
        <div style={{ fontSize: 12, marginTop: 4, color: up ? "#10b981" : "#ef4444" }}>
          {fmtPercent(kpi.delta)} vs prev
        </div>
      </div>
      <div style={{ opacity: 0.9 }}>
        <Sparkline series={kpi.series} />
      </div>
    </div>
  );
}

/** =========================
 * Outages Table
 * ========================= */
function OutagesTable({ outages }: { outages: Outage[] }) {
  if (!outages.length) return <p className="muted" style={{ opacity: 0.8 }}>No outages in this window.</p>;
  const top = outages.slice(0, 5);
  return (
    <div className="table-wrap" style={{ marginTop: 12 }}>
      <table className="tbl" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>From</th>
            <th>To</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {top.map((o, i) => (
            <tr key={i}>
              <td>{new Date(o.from).toLocaleString()}</td>
              <td>{new Date(o.to).toLocaleString()}</td>
              <td>{fmtDuration(o.durationMs)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** =========================
 * Data (fetch with fallback)
 * ========================= */
const FALLBACK: DashboardData = {
  kpis: [
    { title: "GGR (24h)", value: 324500, delta: 3.2, series: [210, 220, 250, 230, 260, 290, 310, 305, 330, 325] },
    { title: "FTDs (24h)", value: 184, delta: -1.9, series: [22, 24, 19, 21, 20, 18, 17, 19, 20, 18] },
    { title: "ARPU (₹)", value: 475, delta: 1.4, series: [440, 450, 455, 460, 470, 465, 472, 480, 478, 475] },
    { title: "Active Users", value: 2435, delta: 4.8, series: [1600, 1700, 1750, 1800, 1900, 2100, 2200, 2300, 2400, 2435] },
  ],
  health: Array.from({ length: 24 * 12 }).map((_, i) => {
    // 5-min granularity for last 24h
    const d = new Date(Date.now() - (24 * 60 * 60 * 1000) + i * 5 * 60 * 1000);
    // simulate a tiny outage in the middle
    const up = !(i >= 120 && i <= 126);
    return { ts: d.toISOString(), up };
  }),
  events: [
    { time: new Date().toISOString(), event: "deploy_ok", user: "system", source: "staging" },
    { time: new Date(Date.now() - 600000).toISOString(), event: "login", user: "u_12", source: "web" },
    { time: new Date(Date.now() - 1200000).toISOString(), event: "ticket_purchase", user: "u_45", source: "web" },
  ],
};

async function fetchDashboard(): Promise<DashboardData> {
  try {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch("/api/dashboard", { signal: ctrl.signal });
    clearTimeout(id);
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as DashboardData;
    // basic shape check
    if (!data?.kpis || !data?.health || !data?.events) throw new Error("bad shape");
    return data;
  } catch {
    return FALLBACK;
  }
}

/** =========================
 * Dashboard Page
 * ========================= */
export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchDashboard().then((d) => mounted && setData(d));
    return () => {
      mounted = false;
    };
  }, []);

  const uptime = useMemo(() => (data ? computeUptime(data.health) : 0), [data]);
  const outages = useMemo(() => (data ? computeOutages(data.health) : []), [data]);

  if (!data) {
    return (
      <div className="grid cols-2">
        <div className="card"><div className="muted">Loading dashboard…</div></div>
      </div>
    );
  }

  return (
    <div className="grid cols-2">
      {/* KPI Row */}
      <div className="card" style={{ gridColumn: "1 / -1" }}>
        <div className="grid cols-4">
          {data.kpis.map((k) => (
            <StatCard key={k.title} kpi={k} />
          ))}
        </div>
      </div>

      {/* Health */}
      <div className="card">
        <h2>Platform Health (24h)</h2>
        <div className="muted" style={{ marginTop: 4 }}>
          Uptime: <strong style={{ color: "#10b981" }}>{uptime.toFixed(2)}%</strong>
        </div>
        <div style={{ marginTop: 12 }}>
          <Sparkline series={data.health.map((h) => (h.up ? 1 : 0))} width={460} height={60} />
        </div>
        <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>
          Green = up, dips = outages.
        </div>
      </div>

      {/* Outages Table */}
      <div className="card">
        <h3>Recent Outages</h3>
        <OutagesTable outages={outages} />
      </div>

      {/* Events */}
      <div className="card" style={{ gridColumn: "1 / -1" }}>
        <h3>Recent Events</h3>
        <div className="table-wrap" style={{ marginTop: 12 }}>
          <table className="tbl" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Time</th>
                <th style={{ textAlign: "left" }}>Event</th>
                <th style={{ textAlign: "left" }}>User</th>
                <th style={{ textAlign: "left" }}>Source</th>
              </tr>
            </thead>
            <tbody>
              {data.events.slice(0, 20).map((e, i) => (
                <tr key={i}>
                  <td>{new Date(e.time).toLocaleString()}</td>
                  <td>{e.event}</td>
                  <td>{e.user ?? "—"}</td>
                  <td>{e.source ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted" style={{ marginTop: 6, fontSize: 12 }}>
          This will auto-read from ClickHouse once `/api/dashboard` is live; until then it shows fallback data.
        </p>
      </div>
    </div>
  );
}
