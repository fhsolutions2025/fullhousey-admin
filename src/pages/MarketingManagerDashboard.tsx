import React, { useEffect, useState } from "react";

type KPI = { title: string; value: number; delta: number; series: number[] };
type Experiment = { id: string; name: string; status: "running"|"paused"; metric: string; control: number; variant: number };
type CalItem = { id: string; title: string; channel: string; when: string };
type Bonus = { id: string; name: string; type: string; trigger: string; budget: number; start: string; end: string; status: "active"|"paused" };

export default function MarketingManagerDashboard() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [calendar, setCalendar] = useState<CalItem[]>([]);
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [err, setErr] = useState("");

  const [form, setForm] = useState<{name:string;type:string;trigger:string;budget:string;start:string;end:string}>({
    name:"", type:"cash", trigger:"first_purchase", budget:"0", start:"", end:""
  });

  const load = async () => {
    setErr("");
    const d = await fetch("/api/mm/summary").then(r => r.json());
    setKpis(d.kpis || []); setExperiments(d.experiments || []); setCalendar(d.calendar || []);
    const b = await fetch("/api/mm/bonuses").then(r=>r.json());
    setBonuses(b.bonuses || []);
  };

  useEffect(() => { load().catch(()=>setErr("Load failed")); }, []);

  const toggleExp = async (id: string) => {
    setErr("");
    const res = await fetch(`/api/mm/experiments/${id}/toggle`, { method: "POST" });
    if (!res.ok) { setErr("Toggle failed"); return; }
    const d = await res.json();
    setExperiments(prev => prev.map(x => x.id === id ? d.experiment : x));
  };

  const createBonus = async () => {
    setErr("");
    const res = await fetch("/api/mm/bonuses", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ ...form, budget: Number(form.budget||0) })
    });
    if(!res.ok){ setErr("Create bonus failed"); return; }
    setForm({ name:"", type:"cash", trigger:"first_purchase", budget:"0", start:"", end:"" });
    await load();
  };

  const toggleBonus = async (id: string) => {
    const res = await fetch(`/api/mm/bonuses/${id}/toggle`, { method:"POST" });
    if(!res.ok){ setErr("Toggle bonus failed"); return; }
    const d = await res.json();
    setBonuses(prev => prev.map(b => b.id === id ? d.bonus : b));
  };

  return (
    <div className="grid cols-2">
      <div className="card" style={{ gridColumn:"1 / -1" }}>
        <h2>Marketing Manager — Performance</h2>
        <div className="grid cols-4" style={{ marginTop:12 }}>
          {kpis.map(k => (
            <div className="card" key={k.title}>
              <div className="muted" style={{ fontSize:12 }}>{k.title}</div>
              <div style={{ fontSize:28, fontWeight:700 }}>{k.value}</div>
            </div>
          ))}
        </div>
        {err && <div className="muted" style={{ color:"#ef4444", marginTop:8 }}>{err}</div>}
      </div>

      <div className="card">
        <h3>A/B Experiments</h3>
        <div className="table-wrap" style={{ marginTop:12 }}>
          <table className="tbl" style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr><th>ID</th><th>Name</th><th>Status</th><th>Metric</th><th>Control</th><th>Variant</th><th>Action</th></tr></thead>
            <tbody>
              {experiments.map(e => (
                <tr key={e.id}>
                  <td>{e.id}</td><td>{e.name}</td><td>{e.status}</td><td>{e.metric}</td>
                  <td>{e.control}</td><td>{e.variant}</td>
                  <td><button className="btn primary" onClick={() => toggleExp(e.id)}>{e.status === "running" ? "Pause" : "Run"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Calendar</h3>
        <ul className="muted" style={{ marginTop:8 }}>
          {calendar.map(c => <li key={c.id}><strong>{c.title}</strong> — {c.channel} — {new Date(c.when).toLocaleString()}</li>)}
        </ul>
      </div>

      <div className="card" style={{ gridColumn:"1 / -1" }}>
        <h3>Bonus Builder</h3>
        <div className="table-wrap" style={{ marginTop:12 }}>
          <table className="tbl" style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Trigger</th><th>Budget</th><th>Start</th><th>End</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {bonuses.map(b => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.name}</td>
                  <td>{b.type}</td>
                  <td>{b.trigger}</td>
                  <td>₹ {b.budget.toLocaleString("en-IN")}</td>
                  <td>{new Date(b.start).toLocaleString()}</td>
                  <td>{new Date(b.end).toLocaleString()}</td>
                  <td>{b.status}</td>
                  <td><button className="btn" onClick={()=>toggleBonus(b.id)}>{b.status==="active"?"Pause":"Activate"}</button></td>
                </tr>
              ))}
              {!bonuses.length && <tr><td colSpan={9} className="muted">No bonuses yet.</td></tr>}
            </tbody>
          </table>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap:8, marginTop:12 }}>
          <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
          <select value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
            <option value="cash">Cash</option>
            <option value="ticket">Ticket</option>
            <option value="coupon">Coupon</option>
          </select>
          <select value={form.trigger} onChange={e=>setForm({...form, trigger:e.target.value})}>
            <option value="first_purchase">First Purchase</option>
            <option value="kyc_complete">KYC Complete</option>
            <option value="reactivation">Reactivation</option>
          </select>
          <input placeholder="Budget (₹)" value={form.budget} onChange={e=>setForm({...form, budget:e.target.value})} />
          <input placeholder="Start (YYYY-MM-DD HH:mm)" value={form.start} onChange={e=>setForm({...form, start:e.target.value})} />
          <input placeholder="End (YYYY-MM-DD HH:mm)" value={form.end} onChange={e=>setForm({...form, end:e.target.value})} />
        </div>
        <div style={{ marginTop:8 }}>
          <button className="btn primary" onClick={createBonus}>Create Bonus</button>
        </div>
      </div>
    </div>
  );
}
