// server.cjs — FullHousey admin: static + minimal APIs (health, dashboard, account, tickets)
const path = require("path");
const express = require("express");

const app = express();
const distDir = path.join(__dirname, "dist");

// --- In-memory state (MVP; replace with CH/Mongo later) ---
let account = {
  userId: "demo",
  name: "FullHousey Player",
  email: "player@example.com",
  kycStatus: "pending", // pending | in_review | verified
  wallet: { balance: 1500, currency: "INR" },
  transactions: [
    { id: "t1", ts: new Date(Date.now() - 86400000).toISOString(), type: "credit", amount: 1000, note: "Signup bonus" },
    { id: "t2", ts: new Date(Date.now() - 43200000).toISOString(), type: "debit", amount: 500, note: "Tickets purchase" },
  ],
};

let tickets = [
  // purchase history
  { id: "p1", ts: new Date(Date.now() - 43200000).toISOString(), productId: "JALDI5", qty: 5, price: 100, total: 500, status: "confirmed" },
];

const PRODUCTS = [
  { id: "JALDI5", name: "Jaldi 5 Ticket", price: 20 },
  { id: "FULLHOUSY", name: "FullHousey Ticket", price: 50 },
  { id: "SAANP_SEEDHI", name: "Saanp Seedhi Entry", price: 100 },
];

// ---- Static (SPA) ----
app.use(express.static(distDir));
app.use(express.json({ limit: "512kb" }));

// ---- Health/Dashboard (as before) ----
app.get("/api/health", (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.get("/api/dashboard", (_req, res) => {
  const now = Date.now();
  const kpis = [
    { title: "GGR (24h)", value: 324500, delta: 3.2, series: [210,220,250,230,260,290,310,305,330,325] },
    { title: "FTDs (24h)", value: 184, delta: -1.9, series: [22,24,19,21,20,18,17,19,20,18] },
    { title: "ARPU (₹)", value: 475, delta: 1.4, series: [440,450,455,460,470,465,472,480,478,475] },
    { title: "Active Users", value: 2435, delta: 4.8, series: [1600,1700,1750,1800,1900,2100,2200,2300,2400,2435] },
  ];
  const health = Array.from({ length: 24 * 12 }).map((_, i) => {
    const ts = new Date(now - (24*60*60*1000) + i*5*60*1000).toISOString();
    const up = !(i >= 120 && i <= 126); // tiny outage mid-window
    return { ts, up };
  });
  const events = [
    { time: new Date().toISOString(), event: "deploy_ok", user: "system", source: "staging" },
    { time: new Date(now - 10*60*1000).toISOString(), event: "login", user: "u_12", source: "web" },
    { time: new Date(now - 20*60*1000).toISOString(), event: "ticket_purchase", user: "u_45", source: "web" },
  ];
  res.json({ kpis, health, events });
});

// ---- My Account APIs ----
app.get("/api/myaccount", (_req, res) => res.json(account));

app.post("/api/myaccount/update", (req, res) => {
  const { name, email } = req.body || {};
  if (typeof name === "string") account.name = name;
  if (typeof email === "string") account.email = email;
  res.json({ ok: true, account });
});

app.post("/api/myaccount/kyc-start", (_req, res) => {
  if (account.kycStatus === "pending") account.kycStatus = "in_review";
  res.json({ ok: true, kycStatus: account.kycStatus });
});

app.post("/api/wallet/add", (req, res) => {
  const amount = Number(req.body?.amount || 0);
  if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: "invalid_amount" });
  account.wallet.balance += amount;
  const tid = "t" + Math.random().toString(36).slice(2, 8);
  account.transactions.unshift({ id: tid, ts: new Date().toISOString(), type: "credit", amount, note: "Wallet top-up" });
  res.json({ ok: true, balance: account.wallet.balance });
});

// ---- Tickets APIs ----
app.get("/api/tickets/products", (_req, res) => res.json(PRODUCTS));
app.get("/api/tickets", (_req, res) => res.json({ tickets }));

app.post("/api/tickets/purchase", (req, res) => {
  const { productId, qty } = req.body || {};
  const product = PRODUCTS.find(p => p.id === productId);
  const quantity = Math.max(1, Number(qty || 1));
  if (!product) return res.status(400).json({ error: "invalid_product" });

  const total = product.price * quantity;
  if (account.wallet.balance < total) return res.status(400).json({ error: "insufficient_balance" });

  account.wallet.balance -= total;
  const pid = "p" + Math.random().toString(36).slice(2, 8);
  const record = { id: pid, ts: new Date().toISOString(), productId: product.id, qty: quantity, price: product.price, total, status: "confirmed" };
  tickets.unshift(record);

  const tid = "t" + Math.random().toString(36).slice(2, 8);
  account.transactions.unshift({ id: tid, ts: new Date().toISOString(), type: "debit", amount: total, note: `Tickets: ${product.name} x${quantity}` });

  res.json({ ok: true, purchase: record, balance: account.wallet.balance });
});

// ---- SPA fallback ----
app.get("*", (_req, res) => res.sendFile(path.join(distDir, "index.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`fullhousey-admin listening on ${PORT}`));
