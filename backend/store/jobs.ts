/* backend/store/jobs.ts */
import { randomUUID } from "crypto";

export enum JobStatus {
  CREATED = "CREATED",
  RUNNING = "RUNNING",
  DONE = "DONE",
  FAILED = "FAILED",
  DELETED = "DELETED",
}

export type HouseyProfile = {
  id: string;
  name: string;
  voiceTraits: {
    pitch: number;
    pace: number;
    brightness: number;
    accentHint?: string;
    sentimentBaseline: "calm" | "warm" | "energetic" | "serious";
  };
  lifeStory: {
    index: string[];
    chunksDir: string;
    approxWordCount: number;
  };
  avatar: {
    imagePath: string;
    style: "photoreal" | "stylized";
  };
  runtime: {
    regionLayer: Record<string, any>;
    memoryPolicy: "permanent" | "per-show-sandbox";
    guardrails: string[];
  };
};

export type HouseyJob = {
  id: string;
  status: JobStatus;
  audioPath?: string;
  nameHint?: string;

  createdAt: number;
  startedAt?: number;
  finishedAt?: number;

  // progress is a rough % updated by pipeline
  progress?: number;

  // step timings (ms)
  timings?: {
    stt?: number;
    voice?: number;
    scriptDoctor?: number;
    avatar?: number;
    runtime?: number;
  };

  // cost/time estimate (filled by metering)
  cost?: {
    openaiTokensEst?: number;
    whisperSeconds?: number;
    heygenCreditsEst?: number;
    totalUsdEst?: number;
  };

  result?: {
    profile: HouseyProfile;
    assetsDir: string;
  };

  error?: string;
};

// in-memory store for v0.1/2
const JOBS = new Map<string, HouseyJob>();

export async function createJob(init: { audioPath: string; nameHint?: string; }): Promise<HouseyJob> {
  const id = randomUUID();
  const now = Date.now();
  const job: HouseyJob = { id, status: JobStatus.CREATED, audioPath: init.audioPath, nameHint: init.nameHint, createdAt: now, progress: 0 };
  JOBS.set(id, job);
  return job;
}

export async function getJob(id: string): Promise<HouseyJob | undefined> {
  return JOBS.get(id);
}

export async function updateJob(id: string, patch: Partial<HouseyJob>): Promise<HouseyJob | undefined> {
  const current = JOBS.get(id);
  if (!current) return undefined;
  const next: HouseyJob = { ...current, ...patch };
  JOBS.set(id, next);
  return next;
}
