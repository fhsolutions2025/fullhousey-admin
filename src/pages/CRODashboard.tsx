import React, { useEffect, useState } from "react";

type KPI = { title: string; value: number; delta: number; series: number[] };
type Exp = { id: string; name: string; status: "running" | "paused"; goal: string; control: number; variant: number };
type Funnel = { landings: number; signups: number; kyc: number; first_purchase: number };

export default function CRODashboard() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [experiments, setExperiments] = useState<Exp[]>([]);
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    const s = await fetch("/api/cro/summary").then(r => r.json());
    setKpis(s.kpis || []); setExperiments(s.experiments || []); setFunnel(s.funnel || null);
  };

  useEffect(() => { load().catch(()=>setErr("Load failed")); }, []);

  const toggle = async (id: string) => {
    const res = await fetch(`/api/cro/experiments/${id}/toggle`, { method: "POST" });
    if (!res.ok) { setErr("Toggle failed"); return; }
    const d = await res.json();
    setExperiments(prev => prev.map(x => x.id === id ? d.experiment : x));
  };

  return (
    <div className="grid cols-2">
      <div className="card" style={{ gridColumn: "1 / -1" }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h2>CRO — Conversion</h2>
          <button className="btn" onClick={load}>↻ Refresh</button>
        </div>
        {err && <div className="muted" style={{ color:"#ef4444" }}>{err}</div>}
        <div className="grid cols-4" style={{ marginTop: 12 }}>
          {kpis.map(k => (
            <div className="card" key={k.title}>
              <div className="muted" style={{ fontSize: 12 }}>{k.title}</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{k.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Funnel Snapshot</h3>
        {funnel ? (
          <ul className="muted" style={{marginTop:8}}>
            <li>Landings: {funnel.landings.toLocaleString("en-IN")}</li>
            <li>Signups: {funnel.signups.toLocaleString("en-IN")}</li>
            <li>KYC: {funnel.kyc.toLocaleString("en-IN")}</li>
            <li>First Purchase: {funnel.first_purchase.toLocaleString("en-IN")}</li>
          </ul>
        ) : <div className="muted">No data.</div>}
      </div>

      <div className="card">
        <h3>Experiments</h3>
        <div className="table-wrap" style={{marginTop:8}}>
          <table className="tbl" style={{width:"100%"}}>
            <thead><tr><th>ID</th><th>Name</th><th>Status</th><th>Goal</th><th>Control</th><th>Variant</th><th>Action</th></tr></thead>
            <tbody>
              {experiments.map(e => (
                <tr key={e.id}>
                  <td>{e.id}</td><td>{e.name}</td><td>{e.status}</td><td>{e.goal}</td>
                  <td>{e.control}</td><td>{e.variant}</td>
                  <td><button className="btn primary" onClick={()=>toggle(e.id)}>{e.status==="running"?"Pause":"Run"}</button></td>
                </tr>
              ))}
              {!experiments.length && <tr><td colSpan={7} className="muted">No experiments.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
