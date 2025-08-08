import express from 'express'
import cors from 'cors'

import agentsApi from './api/agents.js'
import paymentsApi from './api/payments.js'
import systemApi from './api/system.js'
import authApi from './api/auth.js'

const app = express()
app.use(cors())
app.use(express.json())

// Auth first (login/logout)
app.use('/api/auth', authApi)

// Business APIs
app.use('/api/agents', agentsApi)
app.use('/api/payments', paymentsApi)

// System/meta (health, info, version, config, dev tools)
app.use('/api', systemApi)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`)
})
