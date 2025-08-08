import { Router } from 'express'

const router = Router()

type AgentRow = {
  id: string
  name: string
  principal: string
  status: 'online' | 'idle' | 'error'
  costPerHour: number
  roi: number
}

const agents: AgentRow[] = [
  { id: 'RON', name: 'RonBot', principal: 'Marketing', status: 'online', costPerHour: 42, roi: 0.71 },
  { id: 'SCO', name: 'Scopi', principal: 'Affiliates', status: 'idle', costPerHour: 38, roi: 0.63 },
  { id: 'RSE', name: 'RiskEye', principal: 'Risk', status: 'online', costPerHour: 50, roi: 0.82 },
  { id: 'NAT', name: 'Natasha', principal: 'Content', status: 'online', costPerHour: 44, roi: 0.69 },
  { id: 'IMP', name: 'Impact AI', principal: 'Finance', status: 'idle', costPerHour: 55, roi: 0.58 }
]

router.get('/', (_req, res) => {
  res.json({ rows: agents, count: agents.length, time: new Date().toISOString() })
})

export default router
