/* FullHousey Admin – static SPA server (Express, no extra deps) */
const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;
const dist = path.resolve(__dirname, "dist");

/* ---------- Security / basics ---------- */
app.disable("x-powered-by");
app.set("trust proxy", true);

app.use((req, res, next) => {
  res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Permissions-Policy", "geolocation=(), camera=(), microphone=()");
  next();
});

/* ---------- Static asset caching ---------- */
const serve = (sub, maxAge = "1d", immutable = true) =>
  express.static(path.join(dist, sub), { maxAge, immutable, index: false, fallthrough: true });

app.use("/assets", serve("assets", "30d"));           // Vite build assets
app.use("/img",    serve("img", "30d"));               // images (banners, avatars, logo)
app.use("/og",     serve("og", "30d"));                // OG images
app.use("/seo",    serve("seo", "1d", false));         // meta.json etc.
app.use("/reports",serve("reports", "5m", false));     // daily snapshots (fast-changing)
app.use("/agent-config", serve("agent-config", "5m", false));

/* ---------- Health & robots ---------- */
app.get("/healthz", (_, res) => res.type("text").send("ok"));
app.get("/robots.txt", (_, res, next) => {
  // allow overriding by dist/robots.txt; fall back to a safe default
  res.sendFile(path.join(dist, "robots.txt"), (err) => {
    if (err) res.type("text").send(`User-agent: *\nDisallow: /\n`);
  });
});

/* ---------- SPA fallback ---------- */
app.use(express.static(dist, { maxAge: "1h", index: "index.html" }));
app.get("*", (_, res) => res.sendFile(path.join(dist, "index.html")));

/* ---------- Boot ---------- */
app.listen(port, () => {
  console.log(`FullHousey Admin · http://localhost:${port}  (serving ${dist})`);
});
