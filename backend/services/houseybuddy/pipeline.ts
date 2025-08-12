/* backend/services/houseybuddy/pipeline.ts */
import path from "path";
import fs from "fs/promises";
import { JobStatus, getJob, updateJob } from "../../store/jobs";
import { sttNameAndTranscript } from "./stt/whisper_stub";
import { extractVoiceTraits } from "./voice/extract_stub";
import { generateLifeStoryChunks } from "./scriptdoctor/generate_stub";
import { renderAvatar } from "./visualizer/render_stub";
import { buildRuntime } from "./runtime/host_stub";
import { estimateCost } from "./metering/cost_stub";

function t() { return Date.now(); }

export async function runPipeline(jobId: string) {
  const job = await getJob(jobId);
  if (!job) throw new Error("job not found");

  await updateJob(jobId, { status: JobStatus.RUNNING, startedAt: Date.now(), progress: 1, timings: {} });
  const timings: any = {};

  try {
    const assetsDir = path.join(process.cwd(), "data", "houseybuddy", jobId);
    await fs.mkdir(assetsDir, { recursive: true });

    // 1) STT
    let ts = t();
    const { name, transcript } = await sttNameAndTranscript(job.audioPath!, job.nameHint);
    timings.stt = t() - ts;
    await updateJob(jobId, { progress: 20, timings });

    // 2) Voice features
    ts = t();
    const voiceTraits = await extractVoiceTraits(job.audioPath!, transcript);
    timings.voice = t() - ts;
    await updateJob(jobId, { progress: 35, timings });

    // 3) ScriptDoctor
    ts = t();
    const lifeStory = await generateLifeStoryChunks({ name, voiceTraits, outDir: assetsDir });
    timings.scriptDoctor = t() - ts;
    await updateJob(jobId, { progress: 70, timings });

    // 4) Avatar render
    ts = t();
    const avatar = await renderAvatar({ name, lifeStory, outDir: assetsDir });
    timings.avatar = t() - ts;
    await updateJob(jobId, { progress: 85, timings });

    // 5) Runtime config
    ts = t();
    const runtime = await buildRuntime({ name, voiceTraits });
    timings.runtime = t() - ts;

    const profile = { id: jobId, name, voiceTraits, lifeStory, avatar, runtime };
    const cost = estimateCost({ timings, transcriptLength: transcript.length });

    await updateJob(jobId, {
      status: JobStatus.DONE,
      finishedAt: Date.now(),
      result: { profile, assetsDir },
      progress: 100,
      timings,
      cost,
    });
  } catch (err: any) {
    console.error("[pipeline] failed:", err);
    await updateJob(jobId, { status: JobStatus.FAILED, error: String(err?.message || err) });
  }
}
