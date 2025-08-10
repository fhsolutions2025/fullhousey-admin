import React, { useEffect, useState } from "react";

type KPI = { title:string; value:number; delta:number; series:number[] };
type Agent = { name:string; open:number; inProgress:number; resolved24h:number; breaches24h:number };
type Ticket = { id:string; created:string; user:string; topic:string; priority:string; status:string; owner:string; slaMins:number; waitedMins:number; csat:number|null };

export default function CCDashboard() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    const s = await fetch("/api/cc/summary").then(r=>r.json());
    setKpis(s.kpis||[]); setAgents(s.agents||[]);
    const t = await fetch("/api/cc/tickets").then(r=>r.json());
    setTickets(t.tickets||[]);
  };

  useEffect(()=>{ load().catch(()=>setErr("Load failed")); }, []);

  const cycle = (s:string) => s==="open"?"in_progress":s==="in_progress"?"resolved":"open";

  const updateStatus = async (id:string, curr:string) => {
    const res = await fetch(`/api/cc/tickets/${id}/status`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ status: cycle(curr) })});
    if(!res.ok){ setErr("Update failed"); return; }
    const d = await res.json();
    setTickets(prev => prev.map(t => t.id===id ? d.ticket : t));
  };

  return (
    <div className="grid cols-2">
      <div className="card" style={{gridColumn:"1 / -1"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h2>Customer Care — SLA & Queue</h2>
          <button className="btn" onClick={load}>↻ Refresh</button>
        </div>
        {err && <div className="muted" style={{color:"#ef4444"}}>{err}</div>}
        <div className="grid cols-5" style={{marginTop:12}}>
          {kpis.map(k=>(
            <div className="card" key={k.title}>
              <div className="muted" style={{fontSize:12}}>{k.title}</div>
              <div style={{fontSize:28,fontWeight:700}}>{k.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Agents</h3>
        <div className="table-wrap" style={{marginTop:8}}>
          <table className="tbl" style={{width:"100%"}}>
            <thead><tr><th>Name</th><th>Open</th><th>In-Progress</th><th>Resolved(24h)</th><th>Breaches(24h)</th></tr></thead>
            <tbody>
              {agents.map(a=>(
                <tr key={a.name}>
                  <td>{a.name}</td><td>{a.open}</td><td>{a.inProgress}</td><td>{a.resolved24h}</td><td>{a.breaches24h}</td>
                </tr>
              ))}
              {!agents.length && <tr><td colSpan={5} className="muted">No agents.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Tickets</h3>
        <div className="table-wrap" style={{marginTop:8}}>
          <table className="tbl" style={{width:"100%"}}>
            <thead><tr><th>ID</th><th>User</th><th>Topic</th><th>Priority</th><th>Status</th><th>Owner</th><th>Wait</th><th>SLA</th><th>Action</th></tr></thead>
            <tbody>
              {tickets.map(t=>(
                <tr key={t.id}>
                  <td>{t.id}</td><td>{t.user}</td><td>{t.topic}</td><td>{t.priority}</td>
                  <td>{t.status}</td><td>{t.owner}</td><td>{t.waitedMins}</td><td>{t.slaMins}</td>
                  <td><button className="btn" onClick={()=>updateStatus(t.id, t.status)}>Next</button></td>
                </tr>
              ))}
              {!tickets.length && <tr><td colSpan={9} className="muted">No tickets.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
