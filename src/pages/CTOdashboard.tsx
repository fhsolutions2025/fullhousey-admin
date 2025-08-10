import React, { useEffect, useState } from "react";

type KPI = { title: string; value: number; delta: number; series: number[] };
type Incident = { id: string; sev: string; opened: string; status: string; summary: string };
type Bug = { id: string; sev: string; title: string; status: string; owner: string };
type UpPoint = { ts: string; up: boolean };

export default function CTODashboard() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [uptime, setUptime] = useState<UpPoint[]>([]);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    const s = await fetch("/api/cto/summary").then(r => r.json());
    setKpis(s.kpis || []); setIncidents(s.incidents || []); setBugs(s.bugs || []); setUptime(s.uptimeSeries || []);
  };

  useEffect(() => { load().catch(()=>setErr("Load failed")); }, []);

  const resolveIncident = async (id: string) => {
    const res = await fetch(`/api/cto/incidents/${id}/resolve`, { method:"POST" });
    if(!res.ok){ setErr("Resolve failed"); return; }
    const d = await res.json();
    setIncidents(prev => prev.map(x => x.id === id ? d.incident : x));
  };

  const cycleStatus = (s: string) => s === "open" ? "in_progress" : s === "in_progress" ? "closed" : "open";

  const updateBug = async (b: Bug) => {
    const next = cycleStatus(b.status);
    const res = await fetch(`/api/cto/bugs/${b.id}/status`, {
      method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ status: next })
    });
    if(!res.ok){ setErr("Update failed"); return; }
    const d = await res.json();
    setBugs(prev => prev.map(x => x.id === b.id ? d.bug : x));
  };

  const uptimePct = React.useMemo(()=>{
    if(!uptime.length) return "0.00";
    let upMs = 0;
    for(let i=1;i<uptime.length;i++){
      const dt = new Date(uptime[i].ts).getTime() - new Date(uptime[i-1].ts).getTime();
      if(uptime[i-1].up) upMs += dt;
    }
    const total = new Date(uptime[uptime.length-1].ts).getTime() - new Date(uptime[0].ts).getTime();
    return total ? ((upMs/total)*100).toFixed(2) : "0.00";
  }, [uptime]);

  return (
    <div className="grid cols-2">
      <div className="card" style={{ gridColumn:"1 / -1" }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h2>CTO — Platform Health</h2>
          <button className="btn" onClick={load}>↻ Refresh</button>
        </div>
        {err && <div className="muted" style={{ color:"#ef4444" }}>{err}</div>}
        <div className="grid cols-4" style={{ marginTop:12 }}>
          {kpis.map(k => (
            <div className="card" key={k.title}>
              <div className="muted" style={{ fontSize:12 }}>{k.title}</div>
              <div style={{ fontSize:28, fontWeight:700 }}>{k.value}</div>
            </div>
          ))}
          <div className="card">
            <div className="muted" style={{ fontSize:12 }}>Computed Uptime (24h)</div>
            <div style={{ fontSize:28, fontWeight:700 }}>{uptimePct}%</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Incidents</h3>
        <div className="table-wrap" style={{marginTop:8}}>
          <table className="tbl" style={{width:"100%"}}>
            <thead><tr><th>ID</th><th>Sev</th><th>Opened</th><th>Status</th><th>Summary</th><th>Action</th></tr></thead>
            <tbody>
              {incidents.map(i => (
                <tr key={i.id}>
                  <td>{i.id}</td><td>{i.sev}</td>
                  <td>{new Date(i.opened).toLocaleString()}</td>
                  <td>{i.status}</td>
                  <td>{i.summary}</td>
                  <td><button className="btn primary" onClick={()=>resolveIncident(i.id)} disabled={i.status==="resolved"}>Resolve</button></td>
                </tr>
              ))}
              {!incidents.length && <tr><td colSpan={6} className="muted">No incidents.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Bugs</h3>
        <div className="table-wrap" style={{marginTop:8}}>
          <table className="tbl" style={{width:"100%"}}>
            <thead><tr><th>ID</th><th>Sev</th><th>Title</th><th>Owner</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {bugs.map(b => (
                <tr key={b.id}>
                  <td>{b.id}</td><td>{b.sev}</td><td>{b.title}</td><td>{b.owner}</td><td>{b.status}</td>
                  <td><button className="btn" onClick={()=>updateBug(b)}>Cycle Status</button></td>
                </tr>
              ))}
              {!bugs.length && <tr><td colSpan={6} className="muted">No bugs.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
