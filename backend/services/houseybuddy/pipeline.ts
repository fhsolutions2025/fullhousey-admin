/* backend/services/houseybuddy/pipeline.ts */
import path from "path";
import fs from "fs/promises";
import { JobStatus, getJob, updateJob } from "../../store/jobs";
import { sttNameAndTranscript } from "./stt/whisper_stub";
import { extractVoiceTraits } from "./voice/extract_stub";
import { generateLifeStoryChunks } from "./scriptdoctor/generate_stub";
import { renderAvatar } from "./visualizer/render_stub";
import { buildRuntime } from "./runtime/host_stub";

export async function runPipeline(jobId: string) {
  const job = await getJob(jobId);
  if (!job) throw new Error("job not found");
  await updateJob(jobId, { status: JobStatus.RUNNING });

  try {
    const assetsDir = path.join(process.cwd(), "data", "houseybuddy", jobId);
    await fs.mkdir(assetsDir, { recursive: true });

    // 1) STT (derive name if absent) + raw transcript
    const { name, transcript } = await sttNameAndTranscript(job.audioPath!, job.nameHint);

    // 2) Voice features
    const voiceTraits = await extractVoiceTraits(job.audioPath!, transcript);

    // 3) ScriptDoctor (100k words, chunked)
    const lifeStory = await generateLifeStoryChunks({ name, voiceTraits, outDir: assetsDir });

    // 4) Avatar render (tool-agnostic stub)
    const avatar = await renderAvatar({ name, lifeStory, outDir: assetsDir });

    // 5) Runtime config (region layer + memory + guardrails)
    const runtime = await buildRuntime({ name, voiceTraits });

    const profile = {
      id: jobId,
      name,
      voiceTraits,
      lifeStory,
      avatar,
      runtime,
    };

    await updateJob(jobId, { status: JobStatus.DONE, result: { profile, assetsDir } });
  } catch (err: any) {
    console.error("[pipeline] failed:", err);
    await updateJob(jobId, { status: JobStatus.FAILED, error: String(err?.message || err) });
  }
}
