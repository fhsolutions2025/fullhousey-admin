import React, { useEffect, useState } from "react";

type Tier = { name: string; pct: number; amount?: number };
type Config = { game: string; pool: number; tiers: Tier[]; remainder?: number };

export default function PrizeConfigurator() {
  const [game, setGame] = useState("fullhousey");
  const [pool, setPool] = useState<number>(100000);
  const [tiers, setTiers] = useState<Tier[]>([
    { name:"Full House", pct:55 },
    { name:"Line 1", pct:15 },
    { name:"Line 2", pct:15 },
    { name:"Corners", pct:10 },
    { name:"Star", pct:5 }
  ]);
  const [preview, setPreview] = useState<Config| null>(null);
  const [err, setErr] = useState("");

  const load = async () => {
    const d = await fetch(`/api/prize/config?game=${game}`).then(r=>r.json());
    setPool(d.config.pool); setTiers(d.config.tiers);
  };

  useEffect(()=>{ load().catch(()=>setErr("Load failed")); }, [game]);

  const addTier = () => setTiers([...tiers, { name:"New Tier", pct:0 }]);
  const updateTier = (i:number, k:keyof Tier, v:any) => {
    const next = [...tiers]; (next[i] as any)[k] = k==="pct" ? Number(v) : v; setTiers(next);
  };
  const removeTier = (i:number) => setTiers(tiers.filter((_,x)=>x!==i));

  const doPreview = async () => {
    setErr("");
    const res = await fetch("/api/prize/preview",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ game, pool, tiers }) });
    if(!res.ok) { setErr("Preview failed"); return; }
    const d = await res.json(); setPreview(d);
  };
  const save = async () => {
    setErr("");
    const res = await fetch("/api/prize/config",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ game, pool, tiers }) });
    if(!res.ok) { setErr("Save failed"); return; }
    await doPreview();
  };

  const pctSum = tiers.reduce((n,t)=>n+(Number(t.pct)||0),0);

  return (
    <div className="card">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <h2>Prize Configurator</h2>
        <select value={game} onChange={e=>setGame(e.target.value)}>
          <option value="fullhousey">FullHousey</option>
          <option value="tezz">Tezz</option>
        </select>
      </div>

      <div className="grid cols-3" style={{marginTop:12}}>
        <div className="card">
          <div className="muted" style={{fontSize:12}}>Prize Pool (₹)</div>
          <input value={pool} onChange={e=>setPool(Number(e.target.value||0))}/>
        </div>
        <div className="card">
          <div className="muted" style={{fontSize:12}}>% Allocated</div>
          <div style={{fontSize:28, fontWeight:700}}>{pctSum}%</div>
        </div>
        <div className="card">
          <button className="btn" onClick={addTier}>Add Tier</button>
        </div>
      </div>

      <div className="table-wrap" style={{marginTop:12}}>
        <table className="tbl" style={{width:"100%"}}>
          <thead><tr><th>#</th><th>Name</th><th>%</th><th>Action</th></tr></thead>
          <tbody>
            {tiers.map((t,i)=>(
              <tr key={i}>
                <td>{i+1}</td>
                <td><input value={t.name} onChange={e=>updateTier(i,"name",e.target.value)}/></td>
                <td><input value={t.pct} onChange={e=>updateTier(i,"pct",e.target.value)} /></td>
                <td><button className="btn" onClick={()=>removeTier(i)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{display:"flex", gap:8, marginTop:12}}>
        <button className="btn" onClick={doPreview}>Preview</button>
        <button className="btn primary" onClick={save}>Save</button>
        {err && <div className="muted" style={{color:"#ef4444"}}>{err}</div>}
      </div>

      {preview && (
        <div className="card" style={{marginTop:12}}>
          <h3>Preview — Pool ₹{preview.pool.toLocaleString("en-IN")} {preview.remainder ? `(remainder ₹${preview.remainder})` : ""}</h3>
          <ul>
            {preview.tiers.map((t,i)=>(
              <li key={i}><strong>{t.name}</strong>: {t.pct}% → ₹{t.amount?.toLocaleString("en-IN")}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
