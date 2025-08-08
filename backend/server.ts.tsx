// --- add below your existing /api/health route ---

app.get('/api/info', (_req, res) => {
  res.json({
    app: 'FullHousey Admin',
    env: process.env.NODE_ENV || 'development',
    time: new Date().toISOString()
  })
})

app.get('/api/version', (_req, res) => {
  res.json({
    frontend: '0.1.0',
    backend: '0.1.0',
    commit: process.env.GIT_COMMIT || 'local-dev'
  })
})
