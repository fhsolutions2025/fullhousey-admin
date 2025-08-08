import { Router } from 'express'
import { execSync } from 'node:child_process'

const router = Router()

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

router.get('/health', (_req, res) =>
  res.json({ status: 'ok', time: new Date().toISOString() })
)

router.get('/info', (_req, res) =>
  res.json({
    app: 'FullHousey Admin',
    env: process.env.NODE_ENV || 'development',
    time: new Date().toISOString()
  })
)

router.get('/version', (_req, res) =>
  res.json({
    frontend: '0.1.0',
    backend: '0.1.0',
    commit: getCommit()
  })
)

router.get('/config', (_req, res) =>
  res.json({
    env: process.env.NODE_ENV || 'development',
    apiBase: process.env.API_BASE || '/api',
    buildTime: getBuildTime(),
    commit: getCommit()
  })
)

export default router
