// server.cjs - serves the built SPA on Railway's $PORT
const path = require("path");
const express = require("express");

const app = express();
const distDir = path.join(__dirname, "dist");

app.use(express.static(distDir));
app.get("*", (_, res) => res.sendFile(path.join(distDir, "index.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`fullhousey-admin listening on ${PORT}`);
});
