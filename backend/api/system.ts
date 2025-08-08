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
const ENV = (process.env.NODE_ENV || 'development').toLowerCase()

// ── Config (runtime, non-secret; in-memory for now) ───────────────────────────
type RuntimeConfig = {
  env: string
  apiBase: string
  buildTime: string
  commit: string
  // editable fields (dev/staging only for now)
  pingIntervalMs: number
  enableDevTools: boolean
  theme: 'dark' | 'light'
}

const RUNTIME_CONFIG: RuntimeConfig = {
  env: ENV,
  apiBase: process.env.API_BASE || '/api',
  buildTime: getBuildTime(),
  commit: getCommit(),
  pingIntervalMs: 15000,
  enableDevTools: ENV !== 'production',
  theme: 'dark'
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
// expose for dev-only routes without messy imports
;(global as any).___recordHealth = recordHealth
;(global as any).___resetHealth = () => {
  healthHistory.splice(0, healthHistory.length)
  totalPings = 0
  okPings = 0
}

// helpers
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
      out.push({ from: downFrom, to, durationMs: new Date(to).getTime() - new Date(downFrom).getTime() })
      downFrom = null
    }
  }
  if (downFrom) {
    const to = new Date().toISOString()
    out.push({ from: downFrom, to, durationMs: new Date(to).getTime() - new Date(downFrom).getTime() })
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

// Dev-only simulate & reset
if (ENV !== 'production') {
  router.get('/health/down', (_req, res) => {
    ;(global as any).___recordHealth?.('down')
    res.json({ status: 'down', time: new Date().toISOString() })
  })
  router.post('/health/reset', (_req, res) => {
    ;(global as any).___resetHealth?.()
    res.json({ ok: true, time: new Date().toISOString() })
  })
}

// Info/Version
router.get('/info', (_req, res) =>
  res.json({
    app: 'FullHousey Admin',
    env: RUNTIME_CONFIG.env,
    time: new Date().toISOString(),
  })
)
router.get('/version', (_req, res) =>
  res.json({
    frontend: '0.1.0',
    backend: '0.1.0',
    commit: RUNTIME_CONFIG.commit,
  })
)

// Config (GET always, POST only non-prod)
router.get('/config', (_req, res) => res.json(RUNTIME_CONFIG))

router.post('/config', (req, res) => {
  if (ENV === 'production') {
    return res.status(403).json({ error: 'Config updates disabled in production' })
  }
  // basic parse
  const body: Partial<RuntimeConfig> = req.body || {}
  if (typeof body.pingIntervalMs === 'number' && body.pingIntervalMs >= 5000 && body.pingIntervalMs <= 60000) {
    RUNTIME_CONFIG.pingIntervalMs = Math.floor(body.pingIntervalMs)
  }
  if (typeof body.enableDevTools === 'boolean') {
    RUNTIME_CONFIG.enableDevTools = body.enableDevTools
  }
  if (body.theme === 'dark' || body.theme === 'light') {
    RUNTIME_CONFIG.theme = body.theme
  }
  // immutable fields echoed but not overwritten here:
  RUNTIME_CONFIG.env = ENV
  RUNTIME_CONFIG.apiBase = RUNTIME_CONFIG.apiBase
  RUNTIME_CONFIG.buildTime = RUNTIME_CONFIG.buildTime
  RUNTIME_CONFIG.commit = RUNTIME_CONFIG.commit

  res.json(RUNTIME_CONFIG)
})

export default router
