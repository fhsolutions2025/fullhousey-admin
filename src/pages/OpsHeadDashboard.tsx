import React, { useEffect, useState } from "react";

type Summary = { concurrentPlayers:number; queueCC:number; paymentSuccessRate:number; avgLatencyMs:number; activeShows:number };
type PayRow = { provider:string; success:number; failed:number; refund:number };
type Ticket = { id:string; created:string; user:string; topic:string; priority:string; status:string; owner:string; slaMins:number; waitedMins:number; csat:number|null };

export default function OpsHeadDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [payments, setPayments] = useState<PayRow[]>([]);
  const [queue, setQueue] = useState<{ ccOpen:number; ccTickets: Ticket[] } | null>(null);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    const s = await fetch("/api/ops/summary").then(r=>r.json());
    setSummary(s);
    const p = await fetch("/api/ops/payments").then(r=>r.json());
    setPayments(p.rows || []);
    const q = await fetch("/api/ops/queues").then(r=>r.json());
    setQueue(q);
  };

  useEffect(()=>{ load().catch(()=>setErr("Load failed")); }, []);

  return (
    <div className="grid cols-2">
      <div className="card" style={{ gridColumn:"1 / -1" }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h2>Ops Head — Live Ops</h2>
          <button className="btn" onClick={load}>↻ Refresh</button>
        </div>
        {err && <div className="muted" style={{ color:"#ef4444" }}>{err}</div>}
        {summary ? (
          <div className="grid cols-5" style={{ marginTop:12 }}>
            <div className="card"><div className="muted" style={{fontSize:12}}>Concurrent Players</div><div style={{fontSize:28,fontWeight:700}}>{summary.concurrentPlayers}</div></div>
            <div className="card"><div className="muted" style={{fontSize:12}}>CC Queue</div><div style={{fontSize:28,fontWeight:700}}>{summary.queueCC}</div></div>
            <div className="card"><div className="muted" style={{fontSize:12}}>Payment Success %</div><div style={{fontSize:28,fontWeight:700}}>{summary.paymentSuccessRate}</div></div>
            <div className="card"><div className="muted" style={{fontSize:12}}>API Latency (ms)</div><div style={{fontSize:28,fontWeight:700}}>{summary.avgLatencyMs}</div></div>
            <div className="card"><div className="muted" style={{fontSize:12}}>Active Shows</div><div style={{fontSize:28,fontWeight:700}}>{summary.activeShows}</div></div>
          </div>
        ) : <div className="muted">No data.</div>}
      </div>

      <div className="card">
        <h3>Payments</h3>
        <div className="table-wrap" style={{marginTop:8}}>
          <table className="tbl" style={{width:"100%"}}>
            <thead><tr><th>Provider</th><th>Success</th><th>Failed</th><th>Refund</th></tr></thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.provider}>
                  <td>{p.provider}</td>
                  <td>{p.success.toLocaleString("en-IN")}</td>
                  <td>{p.failed.toLocaleString("en-IN")}</td>
                  <td>{p.refund.toLocaleString("en-IN")}</td>
                </tr>
              ))}
              {!payments.length && <tr><td colSpan={4} className="muted">No rows.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>CC Queue</h3>
        {queue ? (
          <>
            <div className="muted" style={{marginBottom:8}}>Open: {queue.ccOpen}</div>
            <div className="table-wrap">
              <table className="tbl" style={{width:"100%"}}>
                <thead><tr><th>ID</th><th>Priority</th><th>Status</th><th>Owner</th><th>Wait (m)</th><th>SLA (m)</th></tr></thead>
                <tbody>
                  {queue.ccTickets.filter(t=>t.status!=="resolved").map(t=>(
                    <tr key={t.id}>
                      <td>{t.id}</td><td>{t.priority}</td><td>{t.status}</td><td>{t.owner}</td>
                      <td>{t.waitedMins}</td><td>{t.slaMins}</td>
                    </tr>
                  ))}
                  {!queue.ccTickets.filter(t=>t.status!=="resolved").length && <tr><td colSpan={6} className="muted">No open tickets.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        ) : <div className="muted">No data.</div>}
      </div>
    </div>
  );
}
