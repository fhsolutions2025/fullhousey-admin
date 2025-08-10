import React, { useEffect, useMemo, useState } from "react";

type Product = { id:string; name:string; price:number };
type Purchase = { ok:boolean; purchase?: any; balance?: number; error?: string };

const MAX_PICK = 15;

export default function Tickets() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sel, setSel] = useState<string>("FULLHOUSY");
  const [qty, setQty] = useState<number>(1);
  const [picks, setPicks] = useState<number[]>([]);
  const [ai, setAi] = useState<number[]>([]);
  const [hot, setHot] = useState<number[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(()=> {
    fetch("/api/tickets/products").then(r=>r.json()).then(setProducts);
    refreshAI();
    refreshPrism();
  }, []);

  const price = useMemo(()=> (products.find(p=>p.id===sel)?.price||0) * qty, [products, sel, qty]);

  const toggle = (n:number) => {
    setPicks(prev => prev.includes(n) ? prev.filter(x=>x!==n) : prev.length<MAX_PICK ? [...prev, n] : prev);
  };
  const refreshAI = async () => {
    const d = await fetch("/api/ai/numbers?game=fullhousey&count=6").then(r=>r.json());
    setAi(d.picks || []);
  };
  const refreshPrism = async () => {
    const d = await fetch("/api/prism?game=fullhousey").then(r=>r.json());
    const top = (d.freq || []).sort((a:any,b:any)=>(b.freq + b.recent*50) - (a.freq + a.recent*50)).slice(0,9).map((x:any)=>x.n);
    setHot(top);
  };
  const clear = () => setPicks([]);

  const buy = async () => {
    setMsg("");
    const res = await fetch("/api/tickets/purchase", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ productId: sel, qty, numbers: picks }) });
    const d: Purchase = await res.json();
    if (!d.ok) { setMsg(d.error || "Purchase failed"); return; }
    setMsg(`Purchased: ${d.purchase.id} · Balance ₹${d.balance}`);
    setPicks([]);
  };

  return (
    <div className="grid cols-2">
      <div className="card" style={{gridColumn:"1 / -1"}}>
        <h2>Tickets</h2>
        <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
          <select value={sel} onChange={e=>setSel(e.target.value)}>
            {products.map(p=><option key={p.id} value={p.id}>{p.name} — ₹{p.price}</option>)}
          </select>
          <input value={qty} onChange={e=>setQty(Number(e.target.value||1))} />
          <div className="card"><div className="muted" style={{fontSize:12}}>Total</div><div style={{fontSize:22, fontWeight:700}}>₹ {price}</div></div>
          <button className="btn primary" onClick={buy}>Buy</button>
          <button className="btn" onClick={clear}>Clear</button>
          {msg && <div className="muted" style={{color:"#10b981"}}>{msg}</div>}
        </div>
      </div>

      {/* Number Helper + Glow hot numbers */}
      <div className="card">
        <h3>Number Helper</h3>
        <div className="muted" style={{fontSize:12}}>AI picks & hot numbers from Prism</div>
        <div style={{display:"flex", gap:6, flexWrap:"wrap", marginTop:8}}>
          {ai.map(n=>(
            <button key={"ai"+n} className="btn" onClick={()=>toggle(n)}>{n}</button>
          ))}
          <button className="btn" onClick={refreshAI}>↻ AI</button>
        </div>
        <div style={{display:"flex", gap:6, flexWrap:"wrap", marginTop:8}}>
          {hot.map(n=>(
            <button key={"hot"+n} className="btn" onClick={()=>toggle(n)} style={{boxShadow:"0 0 10px rgba(255,215,0,0.6)"}}>{n}</button>
          ))}
          <button className="btn" onClick={refreshPrism}>↻ Prism</button>
        </div>
      </div>

      {/* AI Numpad */}
      <div className="card">
        <h3>AI Numpad</h3>
        <div style={{display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:8}}>
          {Array.from({length:25}, (_,i)=>i+1).map(n=>(
            <button key={n} className={picks.includes(n)?"btn primary":"btn"} onClick={()=>toggle(n)}>{n}</button>
          ))}
        </div>
        <div className="muted" style={{marginTop:6, fontSize:12}}>Tap to add/remove (max {MAX_PICK})</div>
      </div>

      {/* Ticket Stack (selected numbers) */}
      <div className="card" style={{gridColumn:"1 / -1"}}>
        <h3>Ticket Stack</h3>
        <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
          {picks.map(n=>(
            <div key={n} className="card" style={{padding:"8px 10px", boxShadow:"0 0 12px rgba(56,189,248,0.5)"}}>{n}</div>
          ))}
          {!picks.length && <div className="muted">No numbers selected.</div>}
        </div>
      </div>
    </div>
  );
}
