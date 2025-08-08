import agentsApi from './api/agents.js'

// after app.use(express.json())
app.use('/api/agents', agentsApi)
