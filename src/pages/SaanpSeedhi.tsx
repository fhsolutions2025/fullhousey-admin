import React, { useEffect, useState } from "react";

type Show = { id:string; name:string; gameType:string; startAt:string; durationMin:number; ticketPrice:number; prizePool:number; host:string; status:string; bannerAsset?:string };

export default function SaanpSeedhi() {
  const [shows, setShows] = useState<Show[]>([]);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    const sh = await fetch("/api/content/shows").then(r=>r.json());
    setShows((sh.shows||[]).filter((s:Show)=>s.gameType==="saanp"));
  };

  useEffect(()=>{ load().catch(()=>setErr("Load failed")); }, []);

  return (
    <div className="grid cols-2">
      <div className="card" style={{gridColumn:"1 / -1"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h2>Saanp Seedhi — Schedule</h2>
          <div style={{display:"flex", gap:8}}>
            <button className="btn" onClick={()=> (window as any).NAV?.("tickets")}>Buy Tickets</button>
            <button className="btn" onClick={load}>↻ Refresh</button>
          </div>
        </div>
        {err && <div className="muted" style={{color:"#ef4444"}}>{err}</div>}
      </div>

      <div className="card" style={{gridColumn:"1 / -1"}}>
        <h3>Upcoming Shows</h3>
        <ul className="muted" style={{marginTop:8}}>
          {shows.map(s=>(
            <li key={s.id}>
              <strong>{s.name}</strong> · {new Date(s.startAt).toLocaleString()} · ₹{s.ticketPrice} · Prize ₹{s.prizePool.toLocaleString("en-IN")}
            </li>
          ))}
          {!shows.length && <li className="muted">No scheduled Saanp Seedhi shows.</li>}
        </ul>
      </div>
    </div>
  );
}
