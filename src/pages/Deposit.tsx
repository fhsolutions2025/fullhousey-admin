import React, { useEffect, useState } from "react";

type Prov = { id:string; name:string; methods:string[]; feePct:number };
type Bonus = { amount:number; rate:number; bonus:number; cap:number; tenure:string };
type Util = { id:string; name:string; providers:string[] };

export default function Deposit() {
  const [providers, setProviders] = useState<Prov[]>([]);
  const [sel, setSel] = useState<string>("");
  const [amount, setAmount] = useState<string>("1000");
  const [streak, setStreak] = useState<number>(0);
  const [preview, setPreview] = useState<Bonus | null>(null);
  const [utils, setUtils] = useState<Util[]>([]);
  const [utilSel, setUtilSel] = useState<{ utilId:string; provider:string; amount:string }>({ utilId:"", provider:"", amount:"199" });
  const [msg, setMsg] = useState("");

  useEffect(()=> {
    fetch("/api/deposit/providers").then(r=>r.json()).then(d=>{ setProviders(d.providers||[]); setSel(d.providers?.[0]?.id||""); });
    fetch("/api/utilities").then(r=>r.json()).then(d=>setUtils(d.catalog||[]));
  }, []);

  const build = async () => {
    const d = await fetch("/api/bonus/preview", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ amount: Number(amount||0), streak }) }).then(r=>r.json());
    setPreview(d);
  };
  const applyBonus = async () => {
    const d = await fetch("/api/bonus/apply", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ amount: Number(amount||0), streak }) }).then(r=>r.json());
    setMsg(`Bonus credited ₹${d.credit}. New balance ₹${d.balance}`);
  };
  const makeIntent = async () => {
    const res = await fetch("/api/deposit/intent", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ providerId: sel, amount: Number(amount||0) }) });
    const d = await res.json();
    setMsg(d.ok ? `Intent ${d.intentId} created (₹${d.amount})` : "Intent failed");
  };

  const createUtilIntent = async () => {
    const res = await fetch("/api/utilities/intent", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ ...utilSel, amount: Number(utilSel.amount||0) }) });
    const d = await res.json();
    setMsg(d.ok ? `Utility intent ${d.utilIntent} for ₹${d.amount}` : "Utility failed");
  };

  return (
    <div className="grid cols-2">
      <div className="card" style={{gridColumn:"1 / -1"}}>
        <h2>Deposit</h2>
        <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
          <select value={sel} onChange={e=>setSel(e.target.value)}>
            {providers.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input placeholder="Amount ₹" value={amount} onChange={e=>setAmount(e.target.value)} />
          <button className="btn primary" onClick={makeIntent}>Create Deposit Intent</button>
          {msg && <div className="muted" style={{color:"#10b981"}}>{msg}</div>}
        </div>
      </div>

      <div className="card">
        <h3>Build Your Bonus</h3>
        <div style={{display:"flex", gap:8}}>
          <input placeholder="Amount ₹" value={amount} onChange={e=>setAmount(e.target.value)} />
          <input placeholder="Streak days" value={streak} onChange={e=>setStreak(Number(e.target.value||0))} />
          <button className="btn" onClick={build}>Preview</button>
        </div>
        {preview && (
          <div className="card" style={{marginTop:8}}>
            <div>Rate: {preview.rate}%</div>
            <div>Bonus: ₹{preview.bonus} (cap ₹{preview.cap})</div>
            <button className="btn primary" onClick={applyBonus}>Apply Bonus</button>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Utility Payments</h3>
        <div style={{display:"grid", gap:8}}>
          <select value={utilSel.utilId} onChange={e=>setUtilSel(v=>({...v, utilId:e.target.value, provider:""}))}>
            <option value="">Pick utility</option>
            {utils.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <select value={utilSel.provider} onChange={e=>setUtilSel(v=>({...v, provider:e.target.value}))}>
            <option value="">Provider</option>
            {utils.find(u=>u.id===utilSel.utilId)?.providers.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
          <input placeholder="Amount ₹" value={utilSel.amount} onChange={e=>setUtilSel(v=>({...v, amount:e.target.value}))}/>
          <button className="btn" onClick={createUtilIntent}>Create Utility Intent</button>
        </div>
      </div>
    </div>
  );
}
