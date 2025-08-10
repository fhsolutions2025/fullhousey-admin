import React, { useEffect, useMemo, useState } from "react";

type KPI = { title: string; value: number; delta: number; series: number[] };
type EventRow = { time: string; event: string; user: string; source: string };
type UpPoint = { ts: string; up: boolean };

export default function Dashboard() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [health, setHealth] = useState<UpPoint[]>([]);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setErr("");
      const d = await fetch("/api/dashboard").then(r => r.json());
      setKpis(d.kpis || []);
      setEvents(d.events || []);
      setHealth(d.health || []);
    } catch {
      setErr("Load failed");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const uptimePct = useMemo(() => {
    if (!health.length) return "0.00";
    let upMs = 0;
    for (let i = 1; i < health.length; i++) {
      const dt =
        new Date(health[i].ts).getTime() - new Date(health[i - 1].ts).getTime();
      if (health[i - 1].up) upMs += dt;
    }
    const total =
      new Date(health[health.length - 1].ts).getTime() -
      new Date(health[0].ts).getTime();
    return total ? ((upMs / total) * 100).toFixed(2) : "0.00";
  }, [health]);

  return (
    <div className="grid cols-2">
      <div className="card" style={{ gridColumn: "1 / -1" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>Ops Dashboard</h2>
          <button className="btn" onClick={load}>
            ↻ Refresh
          </button>
        </div>
        {err && <div className="muted" style={{ color: "#ef4444" }}>{err}</div>}

        <div className="grid cols-4" style={{ marginTop: 12 }}>
          {kpis.map((k) => (
            <div className="card" key={k.title}>
              <div className="muted" style={{ fontSize: 12 }}>
                {k.title}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{k.value}</div>
            </div>
          ))}
          <div className="card">
            <div className="muted" style={{ fontSize: 12 }}>
              Uptime (24h)
            </div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{uptimePct}%</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ gridColumn: "1 / -1" }}>
        <h3>Recent Events</h3>
        <ul className="muted" style={{ marginTop: 8 }}>
          {events.map((e, i) => (
            <li key={i}>
              <strong>{e.event}</strong> · {e.user} · {e.source} ·{" "}
              {new Date(e.time).toLocaleString()}
            </li>
          ))}
          {!events.length && <li className="muted">No events.</li>}
        </ul>
      </div>
    </div>
  );
}
