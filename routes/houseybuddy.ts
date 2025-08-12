/* backend/routes/houseybuddy.ts */
import { Router } from "express";
import { z } from "zod";
import path from "path";
import fs from "fs/promises";
import fss from "fs";
import { saveUploadTemp } from "../utils/storage";
import {
  createJob,
  getJob,
  updateJob,
  JobStatus,
} from "../store/jobs";
import { runPipeline } from "../services/houseybuddy/pipeline";
import { collectCost } from "../services/houseybuddy/metering/cost_stub";

const router = Router();

const CreateSchema = z.object({
  nameHint: z.string().min(1).max(120).optional(),
});

// POST /create  → now ASYNC: returns immediately with RUNNING job
router.post("/create", async (req: any, res) => {
  try {
    const parsed = CreateSchema.safeParse(req.body ?? {});
    if (!req.files || !req.files.audio) {
      return res.status(400).json({ error: "audio file required (form field: audio)" });
    }
    const audioFile = Array.isArray(req.files.audio) ? req.files.audio[0] : req.files.audio;

    const tmpPath = await saveUploadTemp(audioFile);
    const job = await createJob({
      nameHint: parsed.success ? parsed.data.nameHint : undefined,
      audioPath: tmpPath,
    });

    // fire-and-forget: pipeline runs on next tick
    setImmediate(async () => {
      try {
        await runPipeline(job.id);
      } catch (e) {
        await updateJob(job.id, { status: JobStatus.FAILED, error: String((e as any)?.message || e) });
      }
    });

    return res.json({ id: job.id, status: JobStatus.RUNNING, profile: null });
  } catch (err: any) {
    console.error("[/create] error:", err);
    return res.status(500).json({ error: "failed to create houseybuddy" });
  }
});

// GET /:id/status  → job status + simple progress % if known
router.get("/:id/status", async (req, res) => {
  const job = await getJob(req.params.id);
  if (!job) return res.status(404).json({ error: "job not found" });
  const progress = job.progress ?? 0; // 0..100
  return res.json({ id: job.id, status: job.status, progress, startedAt: job.startedAt, finishedAt: job.finishedAt });
});

// GET /:id/profile  → final compiled profile JSON
router.get("/:id/profile", async (req, res) => {
  const job = await getJob(req.params.id);
  if (!job) return res.status(404).json({ error: "job not found" });
  if (job.status !== JobStatus.DONE) return res.status(409).json({ error: "not ready" });
  return res.json(job.result?.profile ?? {});
});

// GET /:id/avatar  → png stream for preview
router.get("/:id/avatar", async (req, res) => {
  const job = await getJob(req.params.id);
  if (!job || job.status !== JobStatus.DONE || !job.result?.profile?.avatar?.imagePath) {
    return res.status(404).json({ error: "avatar not found" });
  }
  const p = job.result.profile.avatar.imagePath as string;
  if (!fss.existsSync(p)) return res.status(404).json({ error: "avatar missing" });
  res.setHeader("Content-Type", "image/png");
  fss.createReadStream(p).pipe(res);
});

// GET /:id/cost  → cost/time estimates (stubs now; real later)
router.get("/:id/cost", async (req, res) => {
  const job = await getJob(req.params.id);
  if (!job) return res.status(404).json({ error: "job not found" });
  return res.json(collectCost(job));
});

// GET /readiness  → env key readiness
router.get("/readiness/check", async (_req, res) => {
  const keys = ["OPENAI_API_KEY", "HEYGEN_API_KEY", "ELEVENLABS_API_KEY", "DID_API_KEY"];
  const present = Object.fromEntries(keys.map(k => [k, !!process.env[k]]));
  const ready = !!process.env.OPENAI_API_KEY; // minimal requirement to start real pipeline
  return res.json({ ready, present });
});

// DELETE /:id  → soft delete + cleanup
router.delete("/:id", async (req, res) => {
  const job = await getJob(req.params.id);
  if (!job) return res.status(404).json({ error: "job not found" });

  await updateJob(job.id, { status: JobStatus.DELETED });
  if (job.audioPath) {
    try { await fs.unlink(job.audioPath); } catch {}
  }
  if (job.result?.assetsDir) {
    try { await fs.rm(job.result.assetsDir, { recursive: true, force: true }); } catch {}
  }
  return res.json({ ok: true });
});

export default router;
