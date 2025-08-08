import express from 'express'
import cors from 'cors'
import agentsApi from './api/agents.js'
import paymentsApi from './api/payments.js'
import systemApi from './api/system.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/agents', agentsApi)
app.use('/api/payments', paymentsApi)
app.use('/api', systemApi) // health, info, version, config

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`)
})
