import React, { useEffect, useState } from "react";

type KPI = { title: string; value: number; delta: number; series: number[] };
type Item = { id: string; type: string; title: string; status: string; owner: string; channel: string; scheduledAt?: string|null };
type Show = { id:string; name:string; gameType:string; startAt:string; durationMin:number; ticketPrice:number; prizePool:number; host:string; status:string; bannerAsset?:string };
type CalEntry = { id:string; title:string; channel:string; when:string; owner:string; status:string };

export default function ContentHoDDashboard() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [calendar, setCalendar] = useState<CalEntry[]>([]);
  const [err, setErr] = useState("");

  const [showForm, setShowForm] = useState<{name:string; gameType:string; startAt:string; durationMin:string; ticketPrice:string; prizePool:string; host:string; bannerAsset:string}>({
    name:"", gameType:"tezz", startAt:"", durationMin:"30", ticketPrice:"50", prizePool:"50000", host:"", bannerAsset:""
  });
  const [calForm, setCalForm] = useState<{title:string; channel:string; when:string; owner:string}>({
    title:"", channel:"in_app", when:"", owner:""
  });

  const load = async () => {
    setErr("");
    const s = await fetch("/api/content/summary").then(r=>r.json());
    setKpis(s.kpis||[]); setItems(s.items||[]);
    const sh = await fetch("/api/content/shows").then(r=>r.json());
    setShows(sh.shows||[]);
    const cal = await fetch("/api/content/calendar").then(r=>r.json());
    setCalendar(cal.entries||[]);
  };

  useEffect(() => { load().catch(()=>setErr("Load failed")); }, []);

  const scheduleItem = async (id: string) => {
    const res = await fetch(`/api/content/items/${id}/schedule`, { method:"POST" });
    if(!res.ok){ setErr("Schedule failed"); return; }
    await load();
  };

  const createShow = async () => {
    const payload = {
      ...showForm,
      durationMin: Number(showForm.durationMin||0),
      ticketPrice: Number(showForm.ticketPrice||0),
      prizePool: Number(showForm.prizePool||0),
    };
    const res = await fetch("/api/content/shows", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
    if(!res.ok){ setErr("Create show failed"); return; }
    setShowForm({ name:"", gameType:"tezz", startAt:"", durationMin:"30", ticketPrice:"50", prizePool:"50000", host:"", bannerAsset:"" });
    await load();
  };

  const createCalendar = async () => {
    const res = await fetch("/api/content/calendar", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(calForm) });
    if(!res.ok){ setErr("Create calendar item failed"); return; }
    setCalForm({ title:"", channel:"in_app", when:"", owner:"" });
    await load();
  };

  return (
    <div className="grid cols-2">
      <div className="card" style={{ gridColumn:"1 / -1" }}>
        <h2>Content HoD — Assets & Scheduling</h2>
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
        <h3>Library</h3>
        <div className="table-wrap" style={{ marginTop:12 }}>
          <table className="tbl" style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr><th>ID</th><th>Type</th><th>Title</th><th>Status</th><th>Owner</th><th>Channel</th><th>Scheduled</th><th>Action</th></tr></thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id}>
                  <td>{i.id}</td><td>{i.type}</td><td>{i.title}</td><td>{i.status}</td><td>{i.owner}</td><td>{i.channel}</td>
                  <td>{i.scheduledAt ? new Date(i.scheduledAt).toLocaleString() : "—"}</td>
                  <td><button className="btn" onClick={()=>scheduleItem(i.id)}>Schedule +2h</button></td>
                </tr>
              ))}
              {!items.length && <tr><td colSpan={8} className="muted">No items.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Content Calendar</h3>
        <ul className="muted" style={{ marginTop:8 }}>
          {calendar.map(c => <li key={c.id}><strong>{c.title}</strong> — {c.channel} — {new Date(c.when).toLocaleString()} — {c.status}</li>)}
          {!calendar.length && <li className="muted">Empty.</li>}
        </ul>
        <div style={{ display:"grid", gap:8, marginTop:8 }}>
          <input placeholder="Title" value={calForm.title} onChange={e=>setCalForm({...calForm, title:e.target.value})} />
          <select value={calForm.channel} onChange={e=>setCalForm({...calForm, channel:e.target.value})}>
            <option value="in_app">In-app</option>
            <option value="web">Web</option>
            <option value="email">Email</option>
            <option value="push">Push</option>
          </select>
          <input placeholder="When (YYYY-MM-DD HH:mm)" value={calForm.when} onChange={e=>setCalForm({...calForm, when:e.target.value})} />
          <input placeholder="Owner" value={calForm.owner} onChange={e=>setCalForm({...calForm, owner:e.target.value})} />
          <button className="btn primary" onClick={createCalendar}>Add to Calendar</button>
        </div>
      </div>

      <div className="card" style={{ gridColumn:"1 / -1" }}>
        <h3>Show Builder</h3>
        <div className="table-wrap" style={{ marginTop:12 }}>
          <table className="tbl" style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr><th>ID</th><th>Name</th><th>Game</th><th>Start</th><th>Dur</th><th>Ticket ₹</th><th>Prize ₹</th><th>Host</th><th>Status</th></tr></thead>
            <tbody>
              {shows.map(s => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.name}</td>
                  <td>{s.gameType}</td>
                  <td>{new Date(s.startAt).toLocaleString()}</td>
                  <td>{s.durationMin}m</td>
                  <td>{s.ticketPrice}</td>
                  <td>{s.prizePool.toLocaleString("en-IN")}</td>
                  <td>{s.host}</td>
                  <td>{s.status}</td>
                </tr>
              ))}
              {!shows.length && <tr><td colSpan={9} className="muted">No shows yet.</td></tr>}
            </tbody>
          </table>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap:8, marginTop:12 }}>
          <input placeholder="Name" value={showForm.name} onChange={e=>setShowForm({...showForm, name:e.target.value})} />
          <select value={showForm.gameType} onChange={e=>setShowForm({...showForm, gameType:e.target.value})}>
            <option value="tezz">Tezz</option>
            <option value="saanp">Saanp Seedhi</option>
            <option value="fullhouse">FullHouse</option>
          </select>
          <input placeholder="Start (YYYY-MM-DD HH:mm)" value={showForm.startAt} onChange={e=>setShowForm({...showForm, startAt:e.target.value})} />
          <input placeholder="Duration (min)" value={showForm.durationMin} onChange={e=>setShowForm({...showForm, durationMin:e.target.value})} />
          <input placeholder="Ticket Price (₹)" value={showForm.ticketPrice} onChange={e=>setShowForm({...showForm, ticketPrice:e.target.value})} />
          <input placeholder="Prize Pool (₹)" value={showForm.prizePool} onChange={e=>setShowForm({...showForm, prizePool:e.target.value})} />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:8, marginTop:8 }}>
          <input placeholder="Host" value={showForm.host} onChange={e=>setShowForm({...showForm, host:e.target.value})} />
          <input placeholder="Banner Asset (/img/...)" value={showForm.bannerAsset} onChange={e=>setShowForm({...showForm, bannerAsset:e.target.value})} />
        </div>
        <div style={{ marginTop:8 }}>
          <button className="btn primary" onClick={createShow}>Create Show</button>
        </div>
      </div>
    </div>
  );
}
