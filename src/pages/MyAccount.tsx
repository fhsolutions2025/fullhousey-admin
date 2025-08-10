import React, { useEffect, useState } from "react";

type Wallet = { balance:number; currency:string };
type Txn = { id:string; ts:string; type:"credit"|"debit"; amount:number; note:string };
type Account = { userId:string; name:string; email:string; kycStatus:"pending"|"in_review"|"approved"; wallet:Wallet; transactions:Txn[] };
type Purchase = { id:string; ts:string; productId:string; qty:number; price:number; total:number; status:string };

export default function MyAccount() {
  const [acc, setAcc] = useState<Account | null>(null);
  const [amount, setAmount] = useState("500");
  const [form, setForm] = useState<{name:string; email:string}>({ name:"", email:"" });
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    const a = await fetch("/api/myaccount").then(r=>r.json());
    setAcc(a); setForm({ name:a.name, email:a.email });
    const t = await fetch("/api/tickets").then(r=>r.json());
    setPurchases(t.tickets || []);
  };

  useEffect(()=>{ load().catch(()=>setErr("Load failed")); }, []);

  const topUp = async () => {
    setMsg(""); setErr("");
    const res = await fetch("/api/wallet/add", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ amount: Number(amount||0) }) });
    const d = await res.json();
    if(!res.ok){ setErr(d.error||"Top-up failed"); return; }
    setMsg(`Added ₹${amount}. New balance ₹${d.balance}`); await load();
  };

  const save = async () => {
    const res = await fetch("/api/myaccount/update", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(form) });
    if(!res.ok){ setErr("Update failed"); return; }
    await load();
  };

  const startKyc = async () => {
    const res = await fetch("/api/myaccount/kyc-start", { method:"POST" });
    if(!res.ok){ setErr("KYC start failed"); return; }
    await load();
  };

  return (
    <div className="grid cols-2">
      <div className="card" style={{gridColumn:"1 / -1"}}>
        <h2>My Account</h2>
        {err && <div className="muted" style={{color:"#ef4444"}}>{err}</div>}
        {msg && <div className="muted" style={{color:"#10b981"}}>{msg}</div>}
      </div>

      <div className="card">
        <h3>Profile</h3>
        {acc ? (
          <div style={{display:"grid", gap:8}}>
            <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
            <input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
            <div className="muted">KYC: <strong>{acc.kycStatus}</strong></div>
            <div style={{display:"flex", gap:8}}>
              <button className="btn primary" onClick={save}>Save</button>
              {acc.kycStatus==="pending" && <button className="btn" onClick={startKyc}>Start KYC</button>}
            </div>
          </div>
        ) : <div className="muted">Loading...</div>}
      </div>

      <div className="card">
        <h3>Wallet</h3>
        <div className="card">
          <div className="muted" style={{fontSize:12}}>Balance</div>
          <div style={{fontSize:28,fontWeight:700}}>₹ {acc?.wallet.balance ?? 0}</div>
        </div>
        <div style={{display:"flex", gap:8, marginTop:8}}>
          <input placeholder="Amount ₹" value={amount} onChange={e=>setAmount(e.target.value)} />
          <button className="btn" onClick={topUp}>Add Money</button>
          <button className="btn" onClick={()=> (window as any).NAV?.("deposit")}>Deposit Page</button>
        </div>
      </div>

      <div className="card" style={{gridColumn:"1 / -1"}}>
        <h3>Transactions</h3>
        <ul className="muted" style={{marginTop:8}}>
          {acc?.transactions.map(x=>(
            <li key={x.id}>
              <strong>{x.type.toUpperCase()}</strong> · ₹{x.amount} · {x.note} · {new Date(x.ts).toLocaleString()}
            </li>
          ))}
          {!acc?.transactions?.length && <li className="muted">No transactions.</li>}
        </ul>
      </div>

      <div className="card" style={{gridColumn:"1 / -1"}}>
        <h3>My Tickets</h3>
        <div className="table-wrap" style={{marginTop:8}}>
          <table className="tbl" style={{width:"100%"}}>
            <thead><tr><th>ID</th><th>When</th><th>Product</th><th>Qty</th><th>Total (₹)</th><th>Status</th></tr></thead>
            <tbody>
              {purchases.map(p=>(
                <tr key={p.id}>
                  <td>{p.id}</td><td>{new Date(p.ts).toLocaleString()}</td><td>{p.productId}</td>
                  <td>{p.qty}</td><td>{p.total}</td><td>{p.status}</td>
                </tr>
              ))}
              {!purchases.length && <tr><td colSpan={6} className="muted">No purchases yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
