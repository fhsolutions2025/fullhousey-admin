import React, { useEffect, useState } from "react";

type Show = {
  id:string; name:string; gameType:string; startAt:string; durationMin:number;
  ticketPrice:number; prizePool:number; host:string; status:string; bannerAsset?:string
};
type Account = {
  userId:string; name:string; wallet:{ balance:number; currency:string };
};

export default function TezzProfile() {
  const [acct, setAcct] = useState<Account | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    try {
      const a = await fetch("/api/myaccount").then(r=>r.json());
      setAcct({ userId:a.userId, name:a.name, wallet:a.wallet });
      const sh = await fetch("/api/content/shows").then(r=>r.json());
      setShows((sh.shows||[]).filter((s:Show)=>s.gameType==="tezz"));
    } catch {
      setErr("Load failed");
    }
  };

  useEffect(()=>{ load(); }, []);

  return (
    <div className="grid cols-2">
      <div className="card" style={{ gridColumn:"1 / -1" }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h2>Tezz — Player Profile</h2>
          <button className="btn" onClick={load}>↻ Refresh</button>
        </div>
        {err && <div className="muted" style={{color:"#ef4444"}}>{err}</div>}
      </div>

      <div className="card">
        <h3>My Wallet</h3>
        <div className="card">
          <div className="muted" style={{fontSize:12}}>Balance</div>
          <div style={{fontSize:28, fontWeight:700}}>
            ₹ {acct?.wallet.balance?.toLocaleString("en-IN") ?? 0}
          </div>
        </div>
        <div style={{display:"flex", gap:8, marginTop:8, flexWrap:"wrap"}}>
          <button className="btn" onClick={()=> (window as any).NAV?.("deposit")}>Add Money</button>
          <button className="btn" onClick={()=> (window as any).NAV?.("tickets")}>Buy Tickets</button>
          <button className="btn" onClick={()=> (window as any).NAV?.("account")}>My Account</button>
        </div>
      </div>

      <div className="card">
        <h3>Upcoming Tezz Shows</h3>
        <ul className="muted" style={{marginTop:8}}>
          {shows.map(s=>(
            <li key={s.id} style={{marginBottom:6}}>
              <strong>{s.name}</strong> · {new Date(s.startAt).toLocaleString()}
              {" · "}₹{s.ticketPrice} · Prize ₹{s.prizePool.toLocaleString("en-IN")}
              {"  "}
              <button className="btn" style={{marginLeft:8}} onClick={()=> (window as any).NAV?.("tickets")}>
                Buy
              </button>
            </li>
          ))}
          {!shows.length && <li className="muted">No scheduled Tezz shows.</li>}
        </ul>
      </div>
    </div>
  );
}
