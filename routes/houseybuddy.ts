/* backend/routes/houseybuddy.ts */
import { Router } from "express";
import { z } from "zod";
import path from "path";
import fs from "fs/promises";
import { saveUploadTemp } from "../utils/storage";
import {
  createJob,
  getJob,
  updateJob,
  JobStatus,
  type HouseyJob,
} from "../store/jobs";
import { runPipeline } from "../services/houseybuddy/pipeline";

const router = Router();

const CreateSchema = z.object({
  // Optional explicit name text; if omitted, STT will derive name from audio
  nameHint: z.string().min(1).max(120).optional(),
});

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

    // fire and forget (no background promises here—just immediate pipeline run)
    // We run synchronously until stubs complete (keeps behavior predictable).
    await runPipeline(job.id);

    const final = await getJob(job.id);
    return res.json({ id: job.id, status: final?.status, profile: final?.result?.profile ?? null });
  } catch (err: any) {
    console.error("[/create] error:", err);
    return res.status(500).json({ error: "failed to create houseybuddy" });
  }
});

router.get("/:id/status", async (req, res) => {
  const job = await getJob(req.params.id);
  if (!job) return res.status(404).json({ error: "job not found" });
  return res.json({ id: job.id, status: job.status });
});

router.get("/:id/profile", async (req, res) => {
  const job = await getJob(req.params.id);
  if (!job) return res.status(404).json({ error: "job not found" });
  if (job.status !== JobStatus.DONE) return res.status(409).json({ error: "not ready" });

  // Return the compiled profile (life story index + avatar + runtime config)
  return res.json(job.result?.profile ?? {});
});

router.delete("/:id", async (req, res) => {
  const job = await getJob(req.params.id);
  if (!job) return res.status(404).json({ error: "job not found" });

  // Soft delete: mark removed and nuke temp files
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
