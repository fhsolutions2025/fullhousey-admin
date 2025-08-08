import { Router } from 'express'
const router = Router()

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
    commit: process.env.GIT_COMMIT || 'local-dev'
  })
)

// expose simple flags for FE (prep for deploy)
router.get('/config', (_req, res) =>
  res.json({
    env: process.env.NODE_ENV || 'development',
    apiBase: process.env.API_BASE || '/api',
    buildTime: process.env.BUILD_TIME || new Date().toISOString()
  })
)

export default router
