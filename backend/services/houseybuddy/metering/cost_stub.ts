/* backend/services/houseybuddy/metering/cost_stub.ts
   Stub cost model. Replace with real pricing when we wire services. */

import type { HouseyJob } from "../../../store/jobs";

export function estimateCost(args: { timings: Record<string, number>, transcriptLength: number }) {
  // Naive estimates so CFO has a shape from day one:
  const whisperSeconds = Math.max(3, Math.round((args.timings.stt || 1000) / 1000)); // placeholder
  const openaiTokensEst = Math.round(args.transcriptLength / 4) + 2000 * 10; // transcript + 10 chapters
  const heygenCreditsEst = 1; // one avatar render (placeholder)
  // Fake USD math: $0.002 / 1K tokens, $0.006 / minute STT, $0.02 per avatar image
  const totalUsdEst = (openaiTokensEst / 1000) * 0.002 + (whisperSeconds / 60) * 0.006 + 0.02;

  return { openaiTokensEst, whisperSeconds, heygenCreditsEst, totalUsdEst: Number(totalUsdEst.toFixed(4)) };
}

export function collectCost(job: HouseyJob) {
  return {
    id: job.id,
    status: job.status,
    cost: job.cost ?? {},
    timings: job.timings ?? {},
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
  };
}
