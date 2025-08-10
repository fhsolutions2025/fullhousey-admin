import React, { useEffect, useState } from "react";

type Cell = { n:number; freq:number; recent:number };

export default function Prism() {
  const [game, setGame] = useState("fullhousey");
  const [cells, setCells] = useState<Cell[]>([]);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    const d = await fetch(`/api/prism?game=${game}`).then(r=>r.json());
    setCells(d.freq || []);
  };

  useEffect(()=>{ load().catch(()=>setErr("Load failed")); }, [game]);

  return (
    <div className="card">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <h2>Prism — Number Hotness</h2>
        <select value={game} onChange={e=>setGame(e.target.value)}>
          <option value="fullhousey">FullHousey</option>
          <option value="tezz">Tezz</option>
        </select>
      </div>
      {err && <div className="muted" style={{color:"#ef4444"}}>{err}</div>}

      <div style={{display:"grid", gridTemplateColumns:"repeat(10,1fr)", gap:6, marginTop:12}}>
        {cells.map(c=>{
          const glow = Math.min(1, (c.freq/60) + c.recent);
          return (
            <div key={c.n}
              className="card"
              style={{textAlign:"center", padding:"10px 0", boxShadow:`0 0 ${6+glow*10}px rgba(255,215,0,${0.25+glow*0.25})`}}>
              <div style={{fontWeight:700}}>{c.n}</div>
              <div className="muted" style={{fontSize:12}}>f:{c.freq}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
