import React, { useEffect, useState } from "react";

type Product = { id: string; name: string; price: number };
type Purchase = { id: string; ts: string; productId: string; qty: number; price: number; total: number; status: string };

export default function Tickets() {
  const [products, setProducts] = useState<Product[]>([]);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      const prods = await fetch("/api/tickets/products").then(r => r.json());
      setProducts(prods);
      const hist = await fetch("/api/tickets").then(r => r.json());
      setPurchases(hist.tickets || []);
      // fetch current balance from account
      const acc = await fetch("/api/myaccount").then(r => r.json());
      setBalance(acc?.wallet?.balance ?? null);
    })();
  }, []);

  const buy = async (productId: string) => {
    setError("");
    const q = Math.max(1, Number(qty[productId] || 1));
    const res = await fetch("/api/tickets/purchase", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, qty: q })
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "purchase_failed");
      return;
    }
    setPurchases(prev => [data.purchase, ...prev]);
    setBalance(data.balance);
    setQty({ ...qty, [productId]: 1 });
  };

  return (
    <div className="grid cols-2">
      <div className="card">
        <h2>Buy Tickets</h2>
        {balance != null && <div className="muted" style={{ marginTop: 6 }}>Wallet: ₹ {balance.toLocaleString("en-IN")}</div>}
        <div className="grid cols-3" style={{ marginTop: 12 }}>
          {products.map(p => (
            <div className="card" key={p.id}>
              <div style={{ fontWeight: 700 }}>{p.name}</div>
              <div className="muted">₹ {p.price}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                <input
                  type="number"
                  min={1}
                  value={qty[p.id] ?? 1}
                  onChange={(e) => setQty({ ...qty, [p.id]: Number(e.target.value) })}
                  style={{ width: 80 }}
                />
                <button className="btn primary" onClick={() => buy(p.id)}>Buy</button>
              </div>
            </div>
          ))}
        </div>
        {error && <div className="muted" style={{ color: "#ef4444", marginTop: 8 }}>{error}</div>}
      </div>

      <div className="card">
        <h3>Recent Purchases</h3>
        <div className="table-wrap" style={{ marginTop: 12 }}>
          <table className="tbl" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th>Time</th><th>Product</th><th>Qty</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {purchases.slice(0, 10).map(p => (
                <tr key={p.id}>
                  <td>{new Date(p.ts).toLocaleString()}</td>
                  <td>{p.productId}</td>
                  <td>{p.qty}</td>
                  <td>₹ {p.total.toLocaleString("en-IN")}</td>
                  <td>{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
