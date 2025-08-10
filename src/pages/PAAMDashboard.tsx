import React, { useEffect, useState } from "react";

type KPI = { title: string; value: number; delta: number; series: number[] };
type Funnel = { impressions: number; clicks: number; landings: number; signups: number; kyc: number; first_purchase: number };
type Campaign = { id: string; channel: string; spend: number; clicks: number; installs: number; reg: number; ftd: number; revenue: number };
type Cohort = { cohort: string; users: number; d1: number; d7: number; d30: number };

export default function PAAMDashboard() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    const s = await fetch("/api/paam/summary").then(r => r.json());
    setKpis(s.kpis || []); setFunnel(s.funnel || null);
    const ca = await fetch("/api/paam/campaigns").then(r => r.json());
    setCampaigns(ca.campaigns || []);
    const co = await fetch("/api/paam/cohorts").then(r => r.json());
    setCohorts(co.cohorts || []);
  };

  useEffect(() => { load().catch(()=>setErr("Load failed")); }, []);

  const pct = (num: number, den: number) => den ? ((num/den)*100).toFixed(1) : "0.0";

  return (
    <div className="grid cols-2">
      <div className="card" style={{ gridColumn: "1 / -1" }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h2>PAAM — Performance & Acquisition</h2>
          <button className="btn" onClick={load}>↻ Refresh</button>
        </div>
        {err && <div className="muted" style={{ color:"#ef4444" }}>{err}</div>}
        <div className="grid cols-4" style={{ marginTop: 12 }}>
          {kpis.map(k => (
            <div className="card" key={k.title}>
              <div className="muted" style={{ fontSize: 12 }}>{k.title}</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{k.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Funnel</h3>
        {funnel ? (
          <ul className="muted" style={{marginTop:8}}>
            <li>Impressions: {funnel.impressions.toLocaleString("en-IN")}</li>
            <li>Clicks: {funnel.clicks.toLocaleString("en-IN")} ({pct(funnel.clicks, funnel.impressions)}% CTR)</li>
            <li>Landings: {funnel.landings.toLocaleString("en-IN")} ({pct(funnel.landings, funnel.clicks)}%)</li>
            <li>Signups: {funnel.signups.toLocaleString("en-IN")} ({pct(funnel.signups, funnel.landings)}%)</li>
            <li>KYC: {funnel.kyc.toLocaleString("en-IN")} ({pct(funnel.kyc, funnel.signups)}%)</li>
            <li>First Purchase: {funnel.first_purchase.toLocaleString("en-IN")} ({pct(funnel.first_purchase, funnel.kyc)}%)</li>
          </ul>
        ) : <div className="muted">No data.</div>}
      </div>

      <div className="card">
        <h3>Campaigns</h3>
        <div className="table-wrap" style={{marginTop:8}}>
          <table className="tbl" style={{width:"100%", borderCollapse:"collapse"}}>
            <thead>
              <tr><th>ID</th><th>Channel</th><th>Spend (₹)</th><th>Clicks</th><th>Installs</th><th>Reg</th><th>FTD</th><th>Revenue (₹)</th></tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td><td>{c.channel}</td>
                  <td>{c.spend.toLocaleString("en-IN")}</td>
                  <td>{c.clicks.toLocaleString("en-IN")}</td>
                  <td>{c.installs.toLocaleString("en-IN")}</td>
                  <td>{c.reg.toLocaleString("en-IN")}</td>
                  <td>{c.ftd.toLocaleString("en-IN")}</td>
                  <td>{c.revenue.toLocaleString("en-IN")}</td>
                </tr>
              ))}
              {!campaigns.length && <tr><td colSpan={8} className="muted">No campaigns.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ gridColumn: "1 / -1" }}>
        <h3>Cohorts</h3>
        <div className="table-wrap" style={{marginTop:8}}>
          <table className="tbl" style={{width:"100%"}}>
            <thead><tr><th>Cohort</th><th>Users</th><th>D1%</th><th>D7%</th><th>D30%</th></tr></thead>
            <tbody>
              {cohorts.map(c => (
                <tr key={c.cohort}>
                  <td>{c.cohort}</td>
                  <td>{c.users.toLocaleString("en-IN")}</td>
                  <td>{c.d1}</td><td>{c.d7}</td><td>{c.d30}</td>
                </tr>
              ))}
              {!cohorts.length && <tr><td colSpan={5} className="muted">No cohorts yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
