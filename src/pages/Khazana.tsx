import React, { useEffect, useState } from "react";

export default function DiceMind() {
  const [k, setK] = useState(6);
  const [picks, setPicks] = useState<number[]>([]);
  const [why, setWhy] = useState("");

  const roll = async () => {
    const d = await fetch(`/api/dice/suggest?count=${k}`).then(r=>r.json());
    setPicks(d.picks||[]); setWhy(d.rationale||"");
  };

  useEffect(()=>{ roll(); }, [k]);

  return (
    <div className="card">
      <h2>Dice Mind</h2>
      <div style={{display:"flex", gap:8, alignItems:"center"}}>
        <div className="muted">How many?</div>
        <input value={k} onChange={e=>setK(Number(e.target.value||6))}/>
        <button className="btn" onClick={roll}>Roll</button>
      </div>
      <div style={{display:"flex", gap:6, flexWrap:"wrap", marginTop:10}}>
        {picks.map(n=><div key={n} className="card" style={{padding:"8px 10px"}}>{n}</div>)}
      </div>
      <div className="muted" style={{marginTop:6}}>{why}</div>
    </div>
  );
}
