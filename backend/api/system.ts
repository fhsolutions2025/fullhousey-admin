import { Router } from 'express'
import { execSync } from 'node:child_process'

const router = Router()

// ── Build/Commit helpers ──────────────────────────────────────────────────────
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

// ── Health history (in-memory ring buffer) ────────────────────────────────────
type HealthRow = { time: string; status: 'ok' | 'down' }
type Outage = { from: string; to: string; durationMs: number }

const HISTORY_LIMIT = 100
const healthHistory: HealthRow[] = []
const STARTED_AT = new Date().toISOString()
let totalPings = 0
let okPings = 0

function recordHealth(status: HealthRow['status']) {
  const time = new Date().toISOString()
  healthHistory.push({ time, status })
  if (healthHistory.length > HISTORY_LIMIT) healthHistory.shift()
  totalPings++
  if (status === 'ok') okPings++
}
// expose for dev-only route without messy imports
;(global as any).___recordHealth = recordHealth

function uptimePct(rows: HealthRow[]) {
  if (!rows.length) return 0
  const ok = rows.filter(r => r.status === 'ok').length
  return Math.round((ok / rows.length) * 100)
}

function buildOutageLog(rows: HealthRow[]): Outage[] {
  const out: Outage[] = []
  let downFrom: string | null = null
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    if (r.status === 'down' && !downFrom) {
      downFrom = r.time
    } else if (r.status === 'ok' && downFrom) {
      const to = r.time
      out.push({
        from: downFrom,
        to,
        durationMs: new Date(to).getTime() - new Date(downFrom).getTime(),
      })
      downFrom = null
    }
  }
  if (downFrom) {
    const to = new Date().toISOString()
    out.push({
      from: downFrom,
      to,
      durationMs: new Date(to).getTime() - new Date(downFrom).getTime(),
    })
  }
  return out
}

// background self-tick (server alive = ok)
setInterval(() => recordHealth('ok'), 30_000)

// ── Routes ────────────────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  recordHealth('ok')
  res.json({ status: 'ok', time: new Date().toISOString() })
})

router.get('/health/history', (req, res) => {
  const limitRaw = String(req.query.limit ?? '')
  let limit = parseInt(limitRaw, 10)
  if (!Number.isFinite(limit)) limit = 50
  limit = Math.min(Math.max(limit, 1), HISTORY_LIMIT)

  const rows = healthHistory.slice(-limit)
  res.json({
    rows,
    total: healthHistory.length,
    startedAt: STARTED_AT,
    uptimeWindow: uptimePct(rows),
    uptimeSinceStart: totalPings ? Math.round((okPings / totalPings) * 100) : 0,
    outageLog: buildOutageLog(rows),
  })
})

// Dev-only: simulate a DOWN ping for demos
if ((process.env.NODE_ENV || 'development').toLowerCase() !== 'production') {
  router.get('/health/down', (_req, res) => {
    ;(global as any).___recordHealth?.('down')
    res.json({ status: 'down', time: new Date().toISOString() })
  })
}

router.get('/info', (_req, res) =>
  res.json({
    app: 'FullHousey Admin',
    env: process.env.NODE_ENV || 'development',
    time: new Date().toISOString(),
  })
)

router.get('/version', (_req, res) =>
  res.json({
    frontend: '0.1.0',
    backend: '0.1.0',
    commit: getCommit(),
  })
)

router.get('/config', (_req, res) =>
  res.json({
    env: process.env.NODE_ENV || 'development',
    apiBase: process.env.API_BASE || '/api',
    buildTime: getBuildTime(),
    commit: getCommit(),
  })
)

export default router
