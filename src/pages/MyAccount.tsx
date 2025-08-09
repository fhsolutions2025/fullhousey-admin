import React, { useEffect, useState } from "react";

type Txn = { id: string; ts: string; type: "credit" | "debit"; amount: number; note: string };
type Account = {
  userId: string;
  name: string;
  email: string;
  kycStatus: "pending" | "in_review" | "verified";
  wallet: { balance: number; currency: string };
  transactions: Txn[];
};

export default function MyAccount() {
  const [acc, setAcc] = useState<Account | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topup, setTopup] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    fetch("/api/myaccount").then(r => r.json()).then((a: Account) => {
      setAcc(a);
      setName(a.name);
      setEmail(a.email);
    });
  }, []);

  const saveProfile = async () => {
    setBusy(true); setMsg("");
    const res = await fetch("/api/myaccount/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email }) });
    const data = await res.json();
    if (res.ok) { setAcc(data.account); setMsg("Profile updated"); } else { setMsg(data.error || "Update failed"); }
    setBusy(false);
  };

  const startKyc = async () => {
    setBusy(true); setMsg("");
    const res = await fetch("/api/myaccount/kyc-start", { method: "POST" });
    const data = await res.json();
    if (res.ok && acc) setAcc({ ...acc, kycStatus: data.kycStatus });
    setBusy(false);
  };

  const addFunds = async () => {
    setBusy(true); setMsg("");
    const amt = Number(topup);
    const res = await fetch("/api/wallet/add", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: amt }) });
    const data = await res.json();
    if (res.ok && acc) setAcc({ ...acc, wallet: { ...acc.wallet, balance: data.balance }, transactions: acc.transactions });
    else setMsg(data.error || "Top-up failed");
    setBusy(false);
    setTopup(0);
  };

  if (!acc) return <div className="card"><div className="muted">Loading account…</div></div>;

  return (
    <div className="grid cols-2">
      <div className="card">
        <h2>My Account</h2>
        <div className="muted">User ID: {acc.userId}</div>
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          <label>Name <input value={name} onChange={e => setName(e.target.value)} /></label>
          <label>Email <input value={email} onChange={e => setEmail(e.target.value)} /></label>
          <button className="btn primary" disabled={busy} onClick={saveProfile}>Save</button>
          {msg && <div className="muted">{msg}</div>}
        </div>
      </div>

      <div className="card">
        <h3>Wallet</h3>
        <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>
          ₹ {acc.wallet.balance.toLocaleString("en-IN")}
        </div>
        <div className="muted" style={{ marginTop: 6 }}>Currency: {acc.wallet.currency}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
          <input type="number" min={1} placeholder="Amount" value={topup || ""} onChange={e => setTopup(Number(e.target.value))} />
          <button className="btn" disabled={busy || !topup} onClick={addFunds}>Add Funds</button>
        </div>
      </div>

      <div className="card">
        <h3>KYC</h3>
        <div className="muted">Status: <strong>{acc.kycStatus}</strong></div>
        {acc.kycStatus === "pending" && <button className="btn primary" style={{ marginTop: 8 }} disabled={busy} onClick={startKyc}>Start KYC</button>}
        {acc.kycStatus === "in_review" && <div className="muted" style={{ marginTop: 8 }}>In review — you’ll be notified on verification.</div>}
        {acc.kycStatus === "verified" && <div className="muted" style={{ marginTop: 8, color: "#10b981" }}>Verified ✓</div>}
      </div>

      <div className="card">
        <h3>Recent Transactions</h3>
        <div className="table-wrap" style={{ marginTop: 12 }}>
          <table className="tbl" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th>Time</th><th>Type</th><th>Amount</th><th>Note</th></tr></thead>
            <tbody>
              {acc.transactions.slice(0, 10).map(tx => (
                <tr key={tx.id}>
                  <td>{new Date(tx.ts).toLocaleString()}</td>
                  <td>{tx.type}</td>
                  <td>{tx.type === "debit" ? "−" : "+"}₹ {tx.amount.toLocaleString("en-IN")}</td>
                  <td>{tx.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
