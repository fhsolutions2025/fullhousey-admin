import React, { useEffect, useState } from "react";

type KPI = { title: string; value: number; delta: number; series: number[] };

export default function Cockpit() {
  const [main, setMain] = useState<{ kpis: KPI[]; notes?: { nextContent?: string|null } } | null>(null);
  const [role, setRole] = useState<"cc"|"cto"|"content"|"paam"|"crm"|"ops"|"cro"|"cms"|"mm">("ops");
  const [roleKpis, setRoleKpis] = useState<KPI[]>([]);
  const [err, setErr] = useState("");

  const loadMain = async () => {
    setErr("");
    const d = await fetch("/api/cockpit/summary").then(r=>r.json());
    setMain(d);
  };
  const loadRole = async (r = role) => {
    setErr("");
    const d = await fetch(`/api/cockpit/${r}`).then(r=>r.json());
    setRoleKpis(d.kpis||[]);
  };

  useEffect(()=>{ loadMain().catch(()=>setErr("Load failed")); }, []);
  useEffect(()=>{ loadRole(role).catch(()=>setErr("Role load failed")); }, [role]);

  const openDeptNews = () => (window as any).NAV?.("news", { dept: role });

  return (
    <div className="grid cols-2">
      <div className="card" style={{gridColumn:"1 / -1"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h2>Cockpit — Company Overview</h2>
          <div style={{display:"flex", gap:8}}>
            <button className="btn" onClick={loadMain}>↻ Refresh</button>
            <button className="btn" onClick={openDeptNews}>Dept News</button>
          </div>
        </div>
        {err && <div className="muted" style={{color:"#ef4444"}}>{err}</div>}
        <div className="grid cols-4" style={{marginTop:12}}>
          {main?.kpis.map(k=>(
            <div className="card" key={k.title}>
              <div className="muted" style={{fontSize:12}}>{k.title}</div>
              <div style={{fontSize:28,fontWeight:700}}>{k.value}</div>
            </div>
          ))}
        </div>
        {main?.notes?.nextContent && (
          <div className="muted" style={{marginTop:8}}>Next scheduled content: <strong>{main.notes.nextContent}</strong></div>
        )}
      </div>

      <div className="card">
        <h3>Role Snapshot</h3>
        <div style={{display:"flex", gap:8, flexWrap:"wrap", marginTop:6}}>
          <select value={role} onChange={e=>setRole(e.target.value as any)}>
            <option value="ops">Ops</option>
            <option value="cto">CTO</option>
            <option value="cc">Customer Care</option>
            <option value="paam">PAAM</option>
            <option value="mm">Marketing</option>
            <option value="crm">CRM</option>
            <option value="content">Content</option>
            <option value="cms">CMS</option>
            <option value="cro">CRO</option>
          </select>
          <button className="btn" onClick={()=>loadRole()}>↻</button>
          <button className="btn primary" onClick={()=> (window as any).NAV?.(role === "ops" ? "dashboard" : (role as any))}>
            Open {role.toUpperCase()} Dashboard
          </button>
        </div>
        <div className="grid cols-2" style={{marginTop:12}}>
          {roleKpis.map(k=>(
            <div className="card" key={k.title}>
              <div className="muted" style={{fontSize:12}}>{k.title}</div>
              <div style={{fontSize:24,fontWeight:700}}>{k.value}</div>
            </div>
          ))}
          {!roleKpis.length && <div className="muted">No KPIs.</div>}
        </div>
      </div>

      <div className="card">
        <h3>Quick Links</h3>
        <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
          <button className="btn" onClick={()=> (window as any).NAV?.("tickets")}>Tickets</button>
          <button className="btn" onClick={()=> (window as any).NAV?.("deposit")}>Deposit</button>
          <button className="btn" onClick={()=> (window as any).NAV?.("prize")}>Prize</button>
          <button className="btn" onClick={()=> (window as any).NAV?.("prism")}>Prism</button>
          <button className="btn" onClick={()=> (window as any).NAV?.("khazana")}>Khazana</button>
          <button className="btn" onClick={()=> (window as any).NAV?.("dice")}>Dice Mind</button>
        </div>
      </div>
    </div>
  );
}
