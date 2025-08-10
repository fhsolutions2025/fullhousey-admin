import React from "react";

export default function ProfileSelect() {
  const go = (p: any, ctx?: any) => (window as any).NAV?.(p, ctx);

  return (
    <div className="card">
      <h2>Select Profile</h2>
      <div className="grid cols-3" style={{marginTop:12}}>
        <div className="card">
          <h3>Operations</h3>
          <button className="btn primary" onClick={()=>go("dashboard")}>Open Ops</button>
        </div>
        <div className="card">
          <h3>CTO</h3>
          <button className="btn" onClick={()=>go("cto")}>Open CTO</button>
        </div>
        <div className="card">
          <h3>Customer Care</h3>
          <button className="btn" onClick={()=>go("cc")}>Open CC</button>
        </div>
        <div className="card">
          <h3>Marketing</h3>
          <button className="btn" onClick={()=>go("mm")}>Open Marketing</button>
        </div>
        <div className="card">
          <h3>CRM</h3>
          <button className="btn" onClick={()=>go("crm")}>Open CRM</button>
        </div>
        <div className="card">
          <h3>Content</h3>
          <button className="btn" onClick={()=>go("content")}>Open Content</button>
        </div>
        <div className="card">
          <h3>CMS</h3>
          <button className="btn" onClick={()=>go("cms")}>Open CMS</button>
        </div>
        <div className="card">
          <h3>CRO</h3>
          <button className="btn" onClick={()=>go("cro")}>Open CRO</button>
        </div>
        <div className="card">
          <h3>PAAM</h3>
          <button className="btn" onClick={()=>go("paam")}>Open PAAM</button>
        </div>
      </div>

      <h3 style={{marginTop:16}}>Player Views</h3>
      <div className="grid cols-3" style={{marginTop:8}}>
        <div className="card">
          <h4>Tezz</h4>
          <button className="btn" onClick={()=>go("tezz")}>Open Tezz</button>
        </div>
        <div className="card">
          <h4>Saanp Seedhi</h4>
          <button className="btn" onClick={()=>go("saanp")}>Open Saanp</button>
        </div>
        <div className="card">
          <h4>Tickets & Wallet</h4>
          <div style={{display:"flex", gap:8, marginTop:6}}>
            <button className="btn" onClick={()=>go("tickets")}>Tickets</button>
            <button className="btn" onClick={()=>go("deposit")}>Deposit</button>
            <button className="btn" onClick={()=>go("account")}>My Account</button>
          </div>
        </div>
      </div>
    </div>
  );
}
