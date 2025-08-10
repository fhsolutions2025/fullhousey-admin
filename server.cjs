// server.cjs — FullHousey Admin APIs (in-memory MVP)
// Dashboards: Cockpit + CC + CTO + Content + PAAM + CRM + CMS + Marketing + Ops + CRO
// News Reader: AI insight + comments + recommend
// NEW: Marketing "Bonus Builder"; Content "Show Builder" + "Content Calendar"
const path = require("path");
const express = require("express");
const app = express();
const distDir = path.join(__dirname, "dist");
app.use(express.static(distDir));
app.use(express.json({ limit: "1mb" }));

const now = Date.now();

// ---------- Core demo state ----------
let account = { userId:"demo", name:"FullHousey Player", email:"player@example.com", kycStatus:"pending",
  wallet:{ balance:1500, currency:"INR" },
  transactions:[
    { id:"t1", ts:new Date(now-86400000).toISOString(), type:"credit", amount:1000, note:"Signup bonus" },
    { id:"t2", ts:new Date(now-43200000).toISOString(), type:"debit", amount:500, note:"Tickets purchase" },
  ],
};
const PRODUCTS = [
  { id:"JALDI5", name:"Jaldi 5 Ticket", price:20 },
  { id:"FULLHOUSY", name:"FullHousey Ticket", price:50 },
  { id:"SAANP_SEEDHI", name:"Saanp Seedhi Entry", price:100 },
];
let tickets = [
  { id:"p1", ts:new Date(now-43200000).toISOString(), productId:"JALDI5", qty:5, price:100, total:500, status:"confirmed" },
];

// ---------- CC ----------
let ccTickets = [
  { id:"C001", created:new Date(now-6*3600e3).toISOString(), user:"u_17", topic:"Payment stuck", priority:"P1", status:"open",        owner:"Asha",  slaMins:60,  waitedMins:40, csat:null },
  { id:"C002", created:new Date(now-18*3600e3).toISOString(), user:"u_55", topic:"Login issue",  priority:"P2", status:"in_progress", owner:"Imran", slaMins:180, waitedMins:120, csat:null },
  { id:"C003", created:new Date(now-2*3600e3).toISOString(),  user:"u_12", topic:"KYC docs",     priority:"P3", status:"open",        owner:"Rina",  slaMins:360, waitedMins:40, csat:null },
  { id:"C004", created:new Date(now-30*3600e3).toISOString(), user:"u_88", topic:"Refund query", priority:"P2", status:"resolved",    owner:"Asha",  slaMins:180, waitedMins:70, csat:5 },
];
let ccAgents = [
  { name:"Asha", open:3, inProgress:2, resolved24h:14, breaches24h:0 },
  { name:"Imran", open:1, inProgress:4, resolved24h:10, breaches24h:1 },
  { name:"Rina",  open:2, inProgress:1, resolved24h:8,  breaches24h:0 },
];
let ccCsat = { last100:4.4, last24h:4.6 };

// ---------- CTO ----------
let ctoUptimeSeries = Array.from({ length: 24*12 }).map((_, i) => {
  const ts = new Date(now - 24*3600e3 + i*5*60e3).toISOString();
  const up = !(i>=110 && i<=116);
  return { ts, up };
});
let ctoIncidents = [
  { id:"INC-231", sev:"SEV2", opened:new Date(now-3*3600e3).toISOString(),  status:"open",       summary:"Elevated 5xx on /api/tickets" },
  { id:"INC-229", sev:"SEV3", opened:new Date(now-26*3600e3).toISOString(), status:"monitoring", summary:"Slow queries - CH MV lag" },
];
let ctoDeploys24h = 7, ctoErrorRate = 0.34;
let ctoBugs = [
  { id:"BUG-101", sev:"S1", title:"Purchase double-charge edge case", status:"open",        owner:"Rahul" },
  { id:"BUG-118", sev:"S2", title:"Safari layout shift in profile",   status:"in_progress", owner:"Neha"  },
  { id:"BUG-122", sev:"S3", title:"Minor typo in banner copy",        status:"open",        owner:"Sam"   },
];

// ---------- Content (existing) ----------
let contentItems = [
  { id:"CNT-501", type:"banner",    title:"Tezz Weekend Blast",     status:"draft",     owner:"Avi",    channel:"in_app", scheduledAt:null },
  { id:"CNT-502", type:"thumbnail", title:"Rani’s Bingo Bash",      status:"review",    owner:"Anjali", channel:"web",    scheduledAt:null },
  { id:"CNT-503", type:"copy",      title:"Welcome sequence v2",    status:"approved",  owner:"Dhruv",  channel:"email",  scheduledAt:null },
  { id:"CNT-504", type:"banner",    title:"Independence Day Offer", status:"scheduled", owner:"Rani",   channel:"in_app", scheduledAt:new Date(now+6*3600e3).toISOString() },
];

// ---------- NEW: Content Show Builder + Calendar ----------
let contentShows = [
  { id:"SHOW-1001", name:"Tezz Daily 8PM", gameType:"tezz", startAt:new Date(now+4*3600e3).toISOString(), durationMin:30, ticketPrice:50, prizePool:50000, host:"Avi", status:"scheduled", bannerAsset:"/img/show-tezz.png" },
];
let contentCalendar = [
  { id:"CAL-1001", title:"Weekend Banner Blast", channel:"in_app", when:new Date(now+36*3600e3).toISOString(), owner:"Rani", status:"scheduled" },
];

// ---------- PAAM ----------
let paamSeries = { spend:[95,110,120,130,125,140,150,160,155,165], installs:[240,260,275,290,300,310,305,320,315,310], revenue:[210,220,250,230,260,290,310,305,330,325] };
let paamFunnel = { impressions:920000, clicks:18000, landings:9500, signups:3100, kyc:1200, first_purchase:180 };
let paamCampaigns = [
  { id:"META_IN_01", channel:"meta",   spend:40000, clicks:6000, installs:1000, reg:380, ftd:55, revenue:90000 },
  { id:"GOOG_IN_01", channel:"google", spend:32000, clicks:5200, installs:900,  reg:330, ftd:48, revenue:74000 },
  { id:"AFF_NET",    channel:"aff",    spend:18000, clicks:2800, installs:600,  reg:240, ftd:32, revenue:42000 },
];
let paamCohorts = [
  { cohort:"2025-07-13", users:820, d1:28, d7:11, d30:3 },
  { cohort:"2025-07-20", users:910, d1:30, d7:12, d30:4 },
  { cohort:"2025-07-27", users:980, d1:31, d7:13, d30:4 },
  { cohort:"2025-08-03", users:1020, d1:32, d7:14, d30:0 },
];

// ---------- CRM ----------
let crmSegments = [
  { id:"SEG-HVAL", name:"High Value (L90 GGR>₹5k)", size:820,  channel:"push"  },
  { id:"SEG-CHRN", name:"Churn-Risk (7d inactive)",  size:1320, channel:"email" },
  { id:"SEG-FTD",  name:"New FTD (L3 days)",         size:210,  channel:"push"  },
];
let crmJourneys = [
  { id:"JRNY-FTD",   name:"FTD Nudge",   status:"running", channel:"push",  convRate:4.2, sends24h:8000, clicks24h:1200 },
  { id:"JRNY-CHURN", name:"Winback 7d",  status:"paused",  channel:"email", convRate:2.1, sends24h:4500, clicks24h:420  },
  { id:"JRNY-VIP",   name:"VIP Delight", status:"running", channel:"push",  convRate:6.8, sends24h:1200, clicks24h:220  },
];
let crmRates = { open:28.5, click:5.9, unsub:0.4 };

// ---------- CMS / Marketing / Ops / CRO ----------
let cmsPages = [
  { id:"PG-1001", slug:"/home",       title:"Homepage",      status:"published", author:"Avi",    seoTitle:"FullHousey - Home", seoDesc:"Play, win, enjoy", updatedAt:new Date(now-20*60e3).toISOString() },
  { id:"PG-1002", slug:"/tezz",       title:"Tezz Landing",  status:"draft",     author:"Anjali", seoTitle:"Tezz - Fast Play",  seoDesc:"Fast wins",        updatedAt:new Date(now-2*3600e3).toISOString() },
  { id:"PG-1003", slug:"/promotions", title:"Promotions",    status:"review",    author:"Dhruv",  seoTitle:"Promos & Offers",    seoDesc:"Grab offers",      updatedAt:new Date(now-6*3600e3).toISOString() },
];
let mmExperiments = [
  { id:"EXP-AB-01", name:"Hero CTA copy",    status:"running", metric:"CTR", control:4.1, variant:5.2 },
  { id:"EXP-AB-02", name:"Banner theme",     status:"paused",  metric:"CTR", control:3.2, variant:3.3 },
  { id:"EXP-AB-03", name:"Tezz tile layout", status:"running", metric:"CVR", control:2.1, variant:2.8 },
];
// NEW: Marketing Bonus Builder
let mmBonuses = [
  { id:"BON-1001", name:"FTD 50 Bonus", type:"cash", trigger:"first_purchase", budget:500000, start:new Date(now).toISOString(), end:new Date(now+14*86400e3).toISOString(), status:"active" },
];
let mmCalendar = [
  { id:"CAL-901", title:"Independence Day Offer", channel:"in_app",   when:new Date(now+6*3600e3).toISOString() },
  { id:"CAL-902", title:"Weekend META burst",     channel:"meta_ads", when:new Date(now+36*3600e3).toISOString() },
];

let opsSummary = { concurrentPlayers:742, queueCC: ccTickets.filter(t=>t.status!=="resolved").length, paymentSuccessRate:98.2, avgLatencyMs:142, activeShows:6 };
let opsPayments = [
  { provider:"Razorpay", success:1840, failed:22, refund:6 },
  { provider:"Paytm",    success:920,  failed:18, refund:9 },
  { provider:"Stripe",   success:310,  failed:3,  refund:1 },
];

let croFunnel = { landings:9500, signups:3100, kyc:1200, first_purchase:180 };
let croExperiments = [
  { id:"CRO-01", name:"Signup form length", status:"running", goal:"Signup CVR", control:28.1, variant:31.4 },
  { id:"CRO-02", name:"KYC prompt timing",  status:"paused",  goal:"KYC CVR",    control:38.6, variant:39.1 },
];

// ---------- Dept News (AI + comments + recommendations) ----------
const news = {
  all: [
    { id:"N-001", ts:new Date(now-2*3600e3).toISOString(),  source:"BizWire",   title:"Gaming sees festive surge in India", url:"#"},
    { id:"N-002", ts:new Date(now-6*3600e3).toISOString(),  source:"TechDaily", title:"ClickHouse cloud adds new tier",     url:"#"},
  ],
  cc:[{ id:"N-CC1", ts:new Date(now-3*3600e3).toISOString(),  source:"SupportOps", title:"CSAT benchmarks rise 0.8pt in Q3", url:"#"}],
  cto:[{ id:"N-CTO1", ts:new Date(now-1*3600e3).toISOString(), source:"SRE Weekly", title:"Incident postmortems: best practices", url:"#"}],
  content:[{ id:"N-CNT1", ts:new Date(now-5*3600e3).toISOString(), source:"AdWeek", title:"Festive banners outperform carousels", url:"#"}],
  paam:[{ id:"N-PA1", ts:new Date(now-4*3600e3).toISOString(),  source:"UA Today", title:"META CPI trends in India", url:"#"}],
  crm:[{ id:"N-CR1", ts:new Date(now-7*3600e3).toISOString(),  source:"EmailGeek", title:"Inbox changes impacting open rates", url:"#"}],
  ops:[{ id:"N-OP1", ts:new Date(now-2.5*3600e3).toISOString(),source:"FinOps", title:"Payment success: UPI vs cards", url:"#"}],
  cro:[{ id:"N-CRO1", ts:new Date(now-90*60e3).toISOString(),  source:"GrowthLab", title:"Shorter forms boost CVR 8–12%", url:"#"}],
  cms:[{ id:"N-CMS1", ts:new Date(now-8*3600e3).toISOString(), source:"SEO Today", title:"Core Web Vitals update rolling out", url:"#"}],
  mm:[{ id:"N-MM1", ts:new Date(now-3.5*3600e3).toISOString(), source:"MarTech", title:"AB test pitfalls during sales", url:"#"}],
};
const newsComments = {}; // id -> comments[]
const newsRecs = { all:[], cc:[], cto:[], content:[], paam:[], crm:[], ops:[], cro:[], cms:[], mm:[] };
const agentCache = {};
const synthAgent = (item) => {
  const base = item.title || "Update";
  const summary = `Summary: ${base}. Probable impact on growth/ops. Action: review relevance & plan next steps.`;
  const tags = Array.from(new Set(base.toLowerCase().split(/\W+/).filter(w=>w.length>3))).slice(0,4);
  return { summary, tags: tags.length? tags : ["update"] };
};
const ensureAgent = (id, item) => (agentCache[id] ||= synthAgent(item));

// ---------- Helpers ----------
function uptimePct(series){
  let upMs=0;
  for(let i=1;i<series.length;i++){ const dt=new Date(series[i].ts)-new Date(series[i-1].ts); if(series[i-1].up) upMs+=dt; }
  const totalMs=new Date(series.at(-1).ts)-new Date(series[0].ts);
  return totalMs>0? (upMs/totalMs)*100 : 0;
}

// ---------- APIs ----------
// Health
app.get("/api/health", (_req,res)=>res.json({ ok:true, ts:new Date().toISOString() }));

// Dashboard (ops/generic)
app.get("/api/dashboard", (_req,res)=>res.json({
  kpis:[
    { title:"GGR (24h)", value:324500, delta:3.2, series:[210,220,250,230,260,290,310,305,330,325] },
    { title:"FTDs (24h)", value:184, delta:-1.9, series:[22,24,19,21,20,18,17,19,20,18] },
    { title:"ARPU (₹)", value:475, delta:1.4, series:[440,450,455,460,470,465,472,480,478,475] },
    { title:"Active Users", value:2435, delta:4.8, series:[1600,1700,1750,1800,1900,2100,2200,2300,2400,2435] },
  ],
  health: ctoUptimeSeries,
  events:[
    { time:new Date().toISOString(), event:"deploy_ok", user:"system", source:"staging" },
    { time:new Date(now-10*60e3).toISOString(), event:"login", user:"u_12", source:"web" },
    { time:new Date(now-20*60e3).toISOString(), event:"ticket_purchase", user:"u_45", source:"web" },
  ],
}));

// Account / Wallet / Tickets
app.get("/api/myaccount",(_req,res)=>res.json(account));
app.post("/api/myaccount/update",(req,res)=>{ const {name,email}=req.body||{}; if(typeof name==="string") account.name=name; if(typeof email==="string") account.email=email; res.json({ok:true,account}); });
app.post("/api/myaccount/kyc-start",(_req,res)=>{ if(account.kycStatus==="pending") account.kycStatus="in_review"; res.json({ok:true,kycStatus:account.kycStatus}); });
app.post("/api/wallet/add",(req,res)=>{ const amount=Number(req.body?.amount||0); if(!Number.isFinite(amount)||amount<=0) return res.status(400).json({error:"invalid_amount"}); account.wallet.balance+=amount;
  const tid="t"+Math.random().toString(36).slice(2,8); account.transactions.unshift({id:tid,ts:new Date().toISOString(),type:"credit",amount,note:"Wallet top-up"}); res.json({ok:true,balance:account.wallet.balance}); });
app.get("/api/tickets/products",(_req,res)=>res.json(PRODUCTS));
app.get("/api/tickets",(_req,res)=>res.json({ tickets }));
app.post("/api/tickets/purchase",(req,res)=>{
  const {productId,qty}=req.body||{}; const p=PRODUCTS.find(x=>x.id===productId); const q=Math.max(1,Number(qty||1));
  if(!p) return res.status(400).json({error:"invalid_product"}); const total=p.price*q; if(account.wallet.balance<total) return res.status(400).json({error:"insufficient_balance"});
  account.wallet.balance-=total; const pid="p"+Math.random().toString(36).slice(2,8);
  const rec={id:pid,ts:new Date().toISOString(),productId:p.id,qty:q,price:p.price,total,status:"confirmed"}; tickets.unshift(rec);
  const tid="t"+Math.random().toString(36).slice(2,8); account.transactions.unshift({id:tid,ts:new Date().toISOString(),type:"debit",amount:total,note:`Tickets: ${p.name} x${q}`});
  res.json({ok:true,purchase:rec,balance:account.wallet.balance});
});

// CC
app.get("/api/cc/summary",(_req,res)=>{
  const open=ccTickets.filter(t=>t.status==="open").length;
  const inProgress=ccTickets.filter(t=>t.status==="in_progress").length;
  const resolved24h=ccTickets.filter(t=>t.status==="resolved" && Date.now()-new Date(t.created).getTime()<24*3600e3).length;
  const breaches=ccTickets.filter(t=>t.waitedMins>t.slaMins && t.status!=="resolved").length;
  res.json({ kpis:[
    { title:"Open", value:open, delta:0, series:[open] },
    { title:"In Progress", value:inProgress, delta:0, series:[inProgress] },
    { title:"Resolved (24h)", value:resolved24h, delta:0, series:[resolved24h] },
    { title:"SLA Breaches", value:breaches, delta:0, series:[breaches] },
    { title:"CSAT (last 100)", value:ccCsat.last100, delta:0, series:[ccCsat.last100] },
  ], agents:ccAgents });
});
app.get("/api/cc/tickets",(_req,res)=>res.json({ tickets: ccTickets }));
app.post("/api/cc/tickets/:id/status",(req,res)=>{ const t=ccTickets.find(x=>x.id===req.params.id); if(!t) return res.status(404).json({error:"not_found"}); const {status,owner}=req.body||{}; if(status) t.status=status; if(owner) t.owner=owner; if(status==="resolved") t.csat=5; res.json({ok:true,ticket:t}); });

// CTO
app.get("/api/cto/summary",(_req,res)=>{
  const uptime = uptimePct(ctoUptimeSeries);
  const sev1=ctoBugs.filter(b=>b.sev==="S1"&&b.status!=="closed").length;
  const sev2=ctoBugs.filter(b=>b.sev==="S2"&&b.status!=="closed").length;
  const sev3=ctoBugs.filter(b=>b.sev==="S3"&&b.status!=="closed").length;
  res.json({ kpis:[
    { title:"Deploys (24h)", value:ctoDeploys24h, delta:0, series:[ctoDeploys24h] },
    { title:"Error Rate (%)", value:ctoErrorRate, delta:0, series:[ctoErrorRate] },
    { title:"Uptime (24h %)", value:Number(uptime.toFixed(2)), delta:0, series:[] },
    { title:"Open S1/S2/S3", value:Number(`${sev1}${sev2}${sev3}`), delta:0, series:[sev1,sev2,sev3] },
  ], incidents:ctoIncidents, bugs:ctoBugs, uptimeSeries:ctoUptimeSeries });
});
app.post("/api/cto/incidents/:id/resolve",(req,res)=>{ const it=ctoIncidents.find(x=>x.id===req.params.id); if(!it) return res.status(404).json({error:"not_found"}); it.status="resolved"; res.json({ok:true,incident:it}); });
app.post("/api/cto/bugs/:id/status",(req,res)=>{ const b=ctoBugs.find(x=>x.id===req.params.id); if(!b) return res.status(404).json({error:"not_found"}); const {status,owner}=req.body||{}; if(status) b.status=status; if(owner) b.owner=owner; res.json({ok:true,bug:b}); });

// Content HoD (summary)
app.get("/api/content/summary",(_req,res)=>{ const counts=contentItems.reduce((a,it)=>{a[it.status]=(a[it.status]||0)+1; return a;},{}); res.json({
  kpis:[
    { title:"Draft", value:counts["draft"]||0, delta:0, series:[] },
    { title:"In Review", value:counts["review"]||0, delta:0, series:[] },
    { title:"Approved", value:counts["approved"]||0, delta:0, series:[] },
    { title:"Scheduled", value:counts["scheduled"]||0, delta:0, series:[] },
  ],
  items:contentItems
});});
app.post("/api/content/items/:id/approve",(req,res)=>{ const it=contentItems.find(x=>x.id===req.params.id); if(!it) return res.status(404).json({error:"not_found"}); it.status="approved"; res.json({ok:true,item:it}); });
app.post("/api/content/items/:id/schedule",(req,res)=>{ const it=contentItems.find(x=>x.id===req.params.id); if(!it) return res.status(404).json({error:"not_found"}); const when=req.body?.when?new Date(req.body.when).toISOString():new Date(Date.now()+2*3600e3).toISOString(); it.status="scheduled"; it.scheduledAt=when; res.json({ok:true,item:it}); });

// NEW: Content Show Builder
app.get("/api/content/shows",(_req,res)=>res.json({ shows: contentShows }));
app.post("/api/content/shows",(req,res)=>{
  const { name, gameType, startAt, durationMin, ticketPrice, prizePool, host, bannerAsset } = req.body || {};
  if(!name || !gameType || !startAt) return res.status(400).json({ error:"missing_fields" });
  const id = "SHOW-" + Math.floor(1000 + Math.random()*9000);
  const show = { id, name, gameType, startAt:new Date(startAt).toISOString(), durationMin:Number(durationMin||30), ticketPrice:Number(ticketPrice||0), prizePool:Number(prizePool||0), host: host||"—", status:"scheduled", bannerAsset: bannerAsset||"" };
  contentShows.unshift(show);
  res.json({ ok:true, show });
});
app.post("/api/content/shows/:id/status",(req,res)=>{
  const s = contentShows.find(x=>x.id===req.params.id);
  if(!s) return res.status(404).json({ error:"not_found" });
  const { status } = req.body || {};
  if(status) s.status = status;
  res.json({ ok:true, show:s });
});

// NEW: Content Calendar
app.get("/api/content/calendar",(_req,res)=>res.json({ entries: contentCalendar }));
app.post("/api/content/calendar",(req,res)=>{
  const { title, channel, when, owner } = req.body || {};
  if(!title || !channel || !when) return res.status(400).json({ error:"missing_fields" });
  const id = "CAL-" + Math.floor(1000 + Math.random()*9000);
  const entry = { id, title, channel, when:new Date(when).toISOString(), owner: owner||"—", status:"scheduled" };
  contentCalendar.unshift(entry);
  res.json({ ok:true, entry });
});

// PAAM
app.get("/api/paam/summary",(_req,res)=>{
  const spend=paamSeries.spend.at(-1)*1000, installs=paamSeries.installs.at(-1), revenue=paamSeries.revenue.at(-1)*1000;
  const cpi=installs?spend/installs:0, cac=paamFunnel.first_purchase?spend/paamFunnel.first_purchase:0;
  const regRate=paamFunnel.installs?(paamFunnel.signups/paamFunnel.installs)*100:0, payerRate=paamFunnel.signups?(paamFunnel.first_purchase/paamFunnel.signups)*100:0;
  const arpu=installs?revenue/installs:0;
  res.json({ kpis:[
    { title:"Ad Spend (₹)", value:Math.round(spend), delta:0, series:paamSeries.spend },
    { title:"Installs", value:Math.round(installs), delta:0, series:paamSeries.installs },
    { title:"CPI (₹)", value:Number(cpi.toFixed(2)), delta:0, series:[] },
    { title:"CAC (₹)", value:Number(cac.toFixed(2)), delta:0, series:[] },
    { title:"Reg Rate (%)", value:Number(regRate.toFixed(1)), delta:0, series:[] },
    { title:"Payer %", value:Number(payerRate.toFixed(1)), delta:0, series:[] },
    { title:"ARPU (₹)", value:Number(arpu.toFixed(2)), delta:0, series:paamSeries.revenue },
    { title:"Revenue (₹)", value:Math.round(revenue), delta:0, series:paamSeries.revenue },
  ], funnel: paamFunnel });
});
app.get("/api/paam/campaigns",(_req,res)=>res.json({ campaigns: paamCampaigns }));
app.get("/api/paam/cohorts",(_req,res)=>res.json({ cohorts: paamCohorts }));

// CRM
app.get("/api/crm/summary",(_req,res)=>{
  const leads=crmSegments.reduce((n,s)=>n+s.size,0), active=crmJourneys.filter(j=>j.status==="running").length, sends=crmJourneys.reduce((n,j)=>n+(j.sends24h||0),0);
  res.json({ kpis:[
    { title:"Leads", value:leads, delta:0, series:[] },
    { title:"Active Journeys", value:active, delta:0, series:[] },
    { title:"Sends (24h)", value:sends, delta:0, series:[] },
    { title:"Open %", value:crmRates.open, delta:0, series:[] },
    { title:"Click %", value:crmRates.click, delta:0, series:[] },
    { title:"Unsub %", value:crmRates.unsub, delta:0, series:[] },
  ]});
});
app.get("/api/crm/segments",(_req,res)=>res.json({ segments: crmSegments }));
app.get("/api/crm/journeys",(_req,res)=>res.json({ journeys: crmJourneys }));
app.post("/api/crm/journeys/:id/toggle",(req,res)=>{ const j=crmJourneys.find(x=>x.id===req.params.id); if(!j) return res.status(404).json({error:"not_found"}); j.status=j.status==="running"?"paused":"running"; res.json({ok:true,journey:j}); });

// CMS
app.get("/api/cms/pages",(_req,res)=>res.json({ pages: cmsPages }));
app.post("/api/cms/pages",(req,res)=>{ const { slug,title,author,seoTitle,seoDesc }=req.body||{}; if(!slug||!title) return res.status(400).json({error:"missing_fields"});
  const id="PG-"+Math.floor(1000+Math.random()*9000); const page={ id, slug, title, status:"draft", author:author||"unknown", seoTitle:seoTitle||title, seoDesc:seoDesc||"", updatedAt:new Date().toISOString() };
  cmsPages.unshift(page); res.json({ ok:true, page });
});
app.post("/api/cms/pages/:id/publish",(req,res)=>{ const p=cmsPages.find(x=>x.id===req.params.id); if(!p) return res.status(404).json({error:"not_found"}); p.status=p.status==="published"?"draft":"published"; p.updatedAt=new Date().toISOString(); res.json({ok:true,page:p}); });

// Marketing Manager
app.get("/api/mm/summary",(_req,res)=>{
  const spend=paamSeries.spend.at(-1)*1000, rev=paamSeries.revenue.at(-1)*1000, roi=spend?(rev/spend-1)*100:0;
  const ctr=(paamFunnel.clicks/paamFunnel.impressions)*100, cvr=(paamFunnel.signups/paamFunnel.landings)*100;
  res.json({ kpis:[
    { title:"Spend (₹)", value:Math.round(spend), delta:0, series:paamSeries.spend },
    { title:"Revenue (₹)", value:Math.round(rev),  delta:0, series:paamSeries.revenue },
    { title:"ROI %", value:Number(roi.toFixed(1)), delta:0, series:[] },
    { title:"CTR %", value:Number(ctr.toFixed(2)), delta:0, series:[] },
    { title:"CVR %", value:Number(cvr.toFixed(2)), delta:0, series:[] },
  ], experiments:mmExperiments, calendar:mmCalendar });
});
app.post("/api/mm/experiments/:id/toggle",(req,res)=>{ const e=mmExperiments.find(x=>x.id===req.params.id); if(!e) return res.status(404).json({error:"not_found"}); e.status=e.status==="running"?"paused":"running"; res.json({ok:true,experiment:e}); });

// NEW: Marketing Bonus Builder
app.get("/api/mm/bonuses",(_req,res)=>res.json({ bonuses: mmBonuses }));
app.post("/api/mm/bonuses",(req,res)=>{
  const { name, type, trigger, budget, start, end } = req.body || {};
  if(!name || !type || !trigger || !start || !end) return res.status(400).json({ error:"missing_fields" });
  const id = "BON-" + Math.floor(1000 + Math.random()*9000);
  const b = { id, name, type, trigger, budget:Number(budget||0), start:new Date(start).toISOString(), end:new Date(end).toISOString(), status:"active" };
  mmBonuses.unshift(b); res.json({ ok:true, bonus:b });
});
app.post("/api/mm/bonuses/:id/toggle",(req,res)=>{
  const b = mmBonuses.find(x=>x.id===req.params.id);
  if(!b) return res.status(404).json({ error:"not_found" });
  b.status = b.status === "active" ? "paused" : "active";
  res.json({ ok:true, bonus:b });
});

// Ops
app.get("/api/ops/summary",(_req,res)=>res.json({ ...opsSummary }));
app.get("/api/ops/payments",(_req,res)=>res.json({ rows: opsPayments }));
app.get("/api/ops/queues",(_req,res)=>res.json({ ccOpen: ccTickets.filter(t=>t.status!=="resolved").length, ccTickets }));

// CRO
app.get("/api/cro/summary",(_req,res)=>{
  const l2s=croFunnel.landings?(croFunnel.signups/croFunnel.landings)*100:0;
  const s2k=croFunnel.signups?(croFunnel.kyc/croFunnel.signups)*100:0;
  const k2p=croFunnel.kyc?(croFunnel.first_purchase/croFunnel.kyc)*100:0;
  res.json({ kpis:[
    { title:"Landing → Signup %", value:Number(l2s.toFixed(1)), delta:0, series:[] },
    { title:"Signup → KYC %",     value:Number(s2k.toFixed(1)), delta:0, series:[] },
    { title:"KYC → FTD %",        value:Number(k2p.toFixed(1)), delta:0, series:[] },
  ], experiments: croExperiments, funnel: croFunnel });
});
app.post("/api/cro/experiments/:id/toggle",(req,res)=>{ const e=croExperiments.find(x=>x.id===req.params.id); if(!e) return res.status(404).json({error:"not_found"}); e.status=e.status==="running"?"paused":"running"; res.json({ok:true,experiment:e}); });

// Cockpit (exec + per-role)
app.get("/api/cockpit/summary",(_req,res)=>{
  const spend=paamSeries.spend.at(-1)*1000, rev=paamSeries.revenue.at(-1)*1000, roiPct=spend?(rev/spend-1)*100:0;
  res.json({ kpis:[
    { title:"GGR (24h)", value:324500, delta:0, series:[] },
    { title:"Active Users", value:2435, delta:0, series:[] },
    { title:"Uptime %", value:Number(uptimePct(ctoUptimeSeries).toFixed(2)), delta:0, series:[] },
    { title:"CC Open", value:ccTickets.filter(t=>t.status!=="resolved").length, delta:0, series:[] },
    { title:"Deploys (24h)", value:ctoDeploys24h, delta:0, series:[] },
    { title:"ROI %", value:Number(roiPct.toFixed(1)), delta:0, series:[] },
    { title:"Open S1", value:ctoBugs.filter(b=>b.sev==="S1"&&b.status!=="closed").length, delta:0, series:[] },
  ], notes:{ nextContent: contentItems.find(c=>c.status==="scheduled")?.title || null }});
});
app.get("/api/cockpit/:role", (req,res)=>{
  const r=String(req.params.role||"").toLowerCase(); let kpis=[];
  if(r==="cc"){ const open=ccTickets.filter(t=>t.status!=="resolved").length; const breaches=ccTickets.filter(t=>t.waitedMins>t.slaMins && t.status!=="resolved").length;
    kpis=[{title:"Open Tickets",value:open,delta:0,series:[]},{title:"SLA Breaches",value:breaches,delta:0,series:[]},{title:"CSAT (L100)",value:ccCsat.last100,delta:0,series:[]},{title:"Agents Active",value:ccAgents.length,delta:0,series:[]}];
  } else if(r==="cto"){ kpis=[{title:"Uptime (24h %)",value:Number(uptimePct(ctoUptimeSeries).toFixed(2)),delta:0,series:[]},{title:"Deploys (24h)",value:ctoDeploys24h,delta:0,series:[]},{title:"Error Rate (%)",value:ctoErrorRate,delta:0,series:[]},{title:"Open Incidents",value:ctoIncidents.filter(i=>i.status!=="resolved").length,delta:0,series:[]}]}
  else if(r==="content"){ const counts=contentItems.reduce((a,it)=>{a[it.status]=(a[it.status]||0)+1; return a;},{}); kpis=[{title:"Draft",value:counts["draft"]||0,delta:0,series:[]},{title:"In Review",value:counts["review"]||0,delta:0,series:[]},{title:"Approved",value:counts["approved"]||0,delta:0,series:[]},{title:"Scheduled",value:counts["scheduled"]||0,delta:0,series:[]}]; }
  else if(r==="paam"){ const spend=paamSeries.spend.at(-1)*1000, rev=paamSeries.revenue.at(-1)*1000, roi=spend?(rev/spend-1)*100:0; kpis=[{title:"Spend (₹)",value:Math.round(spend),delta:0,series:[]},{title:"Revenue (₹)",value:Math.round(rev),delta:0,series:[]},{title:"Installs",value:paamSeries.installs.at(-1),delta:0,series:[]},{title:"ROI %",value:Number(roi.toFixed(1)),delta:0,series:[]}]; }
  else if(r==="crm"){ kpis=[{title:"Leads",value:crmSegments.reduce((n,s)=>n+s.size,0),delta:0,series:[]},{title:"Active Journeys",value:crmJourneys.filter(j=>j.status==="running").length,delta:0,series:[]},{title:"Open %",value:crmRates.open,delta:0,series:[]},{title:"Click %",value:crmRates.click,delta:0,series:[]}]; }
  else if(r==="ops"){ kpis=[{title:"Concurrent Players",value:opsSummary.concurrentPlayers,delta:0,series:[]},{title:"CC Queue",value:opsSummary.queueCC,delta:0,series:[]},{title:"Pay Success %",value:opsSummary.paymentSuccessRate,delta:0,series:[]},{title:"API Latency (ms)",value:opsSummary.avgLatencyMs,delta:0,series:[]}]; }
  else if(r==="cro"){ const l2s=croFunnel.landings?(croFunnel.signups/croFunnel.landings)*100:0; const s2k=croFunnel.signups?(croFunnel.kyc/croFunnel.signups)*100:0; const k2p=croFunnel.kyc?(croFunnel.first_purchase/croFunnel.kyc)*100:0;
    kpis=[{title:"Landing → Signup %",value:Number(l2s.toFixed(1)),delta:0,series:[]},{title:"Signup → KYC %",value:Number(s2k.toFixed(1)),delta:0,series:[]},{title:"KYC → FTD %",value:Number(k2p.toFixed(1)),delta:0,series:[]},{title:"Active CRO Tests",value:croExperiments.filter(e=>e.status==="running").length,delta:0,series:[]}]; }
  else if(r==="cms"){ kpis=[{title:"Pages",value:cmsPages.length,delta:0,series:[]},{title:"Published",value:cmsPages.filter(p=>p.status==="published").length,delta:0,series:[]},{title:"Draft",value:cmsPages.filter(p=>p.status==="draft").length,delta:0,series:[]},{title:"Review",value:cmsPages.filter(p=>p.status==="review").length,delta:0,series:[]}]; }
  else if(r==="mm"){ const spend=paamSeries.spend.at(-1)*1000, rev=paamSeries.revenue.at(-1)*1000, roi=spend?(rev/spend-1)*100:0; kpis=[{title:"Spend (₹)",value:Math.round(spend),delta:0,series:[]},{title:"Revenue (₹)",value:Math.round(rev),delta:0,series:[]},{title:"Active Experiments",value:mmExperiments.filter(e=>e.status==="running").length,delta:0,series:[]},{title:"Active Bonuses",value:mmBonuses.filter(b=>b.status==="active").length,delta:0,series:[]}]; }
  else return res.status(400).json({ error:"unknown_role" });
  res.json({ kpis });
});

// News (AI + comments + recs)
app.get("/api/news", (req,res) => { const dept=String(req.query.dept||"all").toLowerCase(); res.json({ dept, items: news[dept] || news.all }); });
app.get("/api/news/:id/agent", (req,res) => { const id=req.params.id; const item=Object.values(news).flat().find(n=>n.id===id); if(!item) return res.status(404).json({error:"not_found"}); res.json({ id, ...ensureAgent(id,item) }); });
app.get("/api/news/:id/comments", (req,res)=>res.json({ id:req.params.id, comments: newsComments[req.params.id] || [] }));
app.post("/api/news/:id/comments", (req,res)=>{ const id=req.params.id; const { user="you", text="" }=req.body||{}; if(!text.trim()) return res.status(400).json({error:"empty_comment"}); const c={ id:"c_"+Math.random().toString(36).slice(2,8), user, ts:new Date().toISOString(), text:String(text).slice(0,2000)}; newsComments[id]=[c, ...(newsComments[id]||[])]; res.json({ ok:true, comment:c }); });
app.post("/api/news/:id/recommend", (req,res)=>{ const { dept="all", by="you", note="" }=req.body||{}; const id=req.params.id; const item=Object.values(news).flat().find(n=>n.id===id); if(!item) return res.status(404).json({error:"not_found"}); const rec={ id:"r_"+Math.random().toString(36).slice(2,8), newsId:id, by, note:String(note||"").slice(0,500), ts:new Date().toISOString() }; newsRecs[dept]=[rec, ...(newsRecs[dept]||[])]; res.json({ ok:true, recommendation:rec }); });
app.get("/api/news/recommendations", (req,res)=>{ const dept=String(req.query.dept||"all").toLowerCase(); const recs=(newsRecs[dept]||[]).slice(0,20).map(r=>({ ...r, item: Object.values(news).flat().find(n=>n.id===r.newsId) })); res.json({ dept, recs }); });

// SPA
app.get("*", (_req,res)=>res.sendFile(path.join(distDir,"index.html")));
const PORT = process.env.PORT || 3000;
app.listen(PORT,"0.0.0.0",()=>console.log(`fullhousey-admin listening on ${PORT}`));
