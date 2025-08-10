import React, { useEffect, useState } from "react";

type KPI = { title: string; value: number; delta: number; series: number[] };
type Segment = { id:string; name:string; size:number; channel:string };
type Journey = { id:string; name:string; status:"running"|"paused"; channel:string; convRate:number; sends24h:number; clicks24h:number };

export default function CRMDashboard() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    const s = await fetch("/api/crm/summary").then(r=>r.json());
    setKpis(s.kpis||[]);
    const seg = await fetch("/api/crm/segments").then(r=>r.json());
    setSegments(seg.segments||[]);
    const j = await fetch("/api/crm/journeys").then(r=>r.json());
    setJourneys(j.journeys||[]);
  };

  useEffect(()=>{ load().catch(()=>setErr("Load failed")); }, []);

  const toggle = async (id:string) => {
    const res = await fetch(`/api/crm/journeys/${id}/toggle`, { method:"POST" });
    if(!res.ok){ setErr("Toggle failed"); return; }
    const d = await res.json();
    setJourneys(prev => prev.map(x => x.id===id ? d.journey : x));
  };

  return (
    <div className="grid cols-2">
      <div className="card" style={{gridColumn:"1 / -1"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h2>CRM — Segments & Journeys</h2>
          <button className="btn" onClick={load}>↻ Refresh</button>
        </div>
        {err && <div className="muted" style={{color:"#ef4444"}}>{err}</div>}
        <div className="grid cols-4" style={{marginTop:12}}>
          {kpis.map(k=>(
            <div className="card" key={k.title}>
              <div className="muted" style={{fontSize:12}}>{k.title}</div>
              <div style={{fontSize:28,fontWeight:700}}>{k.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Segments</h3>
        <div className="table-wrap" style={{marginTop:8}}>
          <table className="tbl" style={{width:"100%"}}>
            <thead><tr><th>ID</th><th>Name</th><th>Size</th><th>Channel</th></tr></thead>
            <tbody>
              {segments.map(s=>(
                <tr key={s.id}>
                  <td>{s.id}</td><td>{s.name}</td><td>{s.size.toLocaleString("en-IN")}</td><td>{s.channel}</td>
                </tr>
              ))}
              {!segments.length && <tr><td colSpan={4} className="muted">No segments.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Journeys</h3>
        <div className="table-wrap" style={{marginTop:8}}>
          <table className="tbl" style={{width:"100%"}}>
            <thead><tr><th>ID</th><th>Name</th><th>Status</th><th>Channel</th><th>Conv%</th><th>Sends(24h)</th><th>Clicks(24h)</th><th>Action</th></tr></thead>
            <tbody>
              {journeys.map(j=>(
                <tr key={j.id}>
                  <td>{j.id}</td><td>{j.name}</td><td>{j.status}</td><td>{j.channel}</td>
                  <td>{j.convRate}</td><td>{j.sends24h}</td><td>{j.clicks24h}</td>
                  <td><button className="btn primary" onClick={()=>toggle(j.id)}>{j.status==="running"?"Pause":"Run"}</button></td>
                </tr>
              ))}
              {!journeys.length && <tr><td colSpan={8} className="muted">No journeys.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
