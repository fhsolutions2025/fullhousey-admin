/* backend/server.ts */
import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import path from "path";
import houseyBuddyRouter from "./routes/houseybuddy";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(process.cwd(), "tmp"),
    createParentPath: true,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  })
);

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

// HouseyBuddy v0.1
app.use("/api/houseybuddy", houseyBuddyRouter);

// Static (optional)
app.use("/public", express.static(path.join(process.cwd(), "public")));

app.listen(PORT, () => {
  console.log(`[server] listening on :${PORT}`);
});
