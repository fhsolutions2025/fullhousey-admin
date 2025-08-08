import { Router } from 'express'
import { execSync } from 'node:child_process'

const router = Router()

// ─── Build/Commit helpers ─────────────────────────────────────────────────────
function getCommit(): string {
  try {
    return process.env.GIT_COMMIT || execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'local-dev'
  }
}
function getBuildTime(): string {
  return process.env.BUILD_TIME || new Date().toISOString()
}

// ─── Health history (in-memory ring buffer) ───────────────────────────────────
type HealthRow = { time: string; status: 'ok' | 'down' }
const HISTORY_LIMIT = 100
const healthHistory: HealthRow[] = []

function recordHealth(status: HealthRow['status']) {
  healthHistory.push({ time: new Date().toISOString(), status })
  if (healthHistory.length > HISTORY_LIMIT) healthHistory.shift()
}

function uptimePct(rows: HealthRow[]) {
  if (!rows.length) return 0
  const ok = rows.filter(r => r.status === 'ok').length
  return Math.round((ok / rows.length) * 100)
}

// background self-tick (server alive = ok). Still also recorded on /health hits.
setInterval(() => recordHealth('ok'), 30_000)

// ─── Routes ───────────────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  recordHealth('ok')
  res.json({ status: 'ok', time: new Date().toISOString() })
})

router.get('/health/history', (_req, res) => {
  const rows = healthHistory.slice(-50) // last 50 for FE
  res.json({
    rows,
    total: healthHistory.length,
    uptime: uptimePct(healthHistory)
  })
})

router.get('/info', (_req, res) =>
  res.json({
    app: 'Fu
