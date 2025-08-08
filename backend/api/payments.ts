import { Router } from 'express'
const router = Router()

// --- mock data ---
const today = new Date()
const days = Array.from({ length: 7 }).map((_, i) => {
  const d = new Date(today); d.setDate(d.getDate() - (6 - i))
  return d.toISOString().slice(0, 10)
})

const trends = days.map((d, i) => ({
  date: d,
  payouts: 50000 + i * 2500,
  deposits: 70000 + i * 3000,
  rtp: 0.93 + (i - 3) * 0.002, // 92–96%
  volatility: 0.18 + (i % 3) * 0.02
}))

const summary = {
  totalDeposits: 520000,
  totalPayouts: 465000,
  ngr: 520000 - 465000,
  rtpMargin: 1 - 465000 / 520000,     // ≈ 10.6%
  floatBufferDays: 14,
  abnormalRTPAlerts: 2,
  volatilityAlerts: 1,
}

const pancakes = [
  { region: 'IN-West', rtp: 0.96, payouts: 120000, abnormal: true },
  { region: 'IN-North', rtp: 0.92, payouts: 90000, abnormal: false },
  { region: 'IN-South', rtp: 0.95, payouts: 110000, abnormal: true },
  { region: 'IN-East',  rtp: 0.91, payouts: 80000, abnormal: false }
]

// --- routes ---
router.get('/summary', (_req, res) => res.json({ ...summary, time: new Date().toISOString() }))
router.get('/trends',  (_req, res) => res.json({ days, rows: trends }))
router.get('/drill',   (_re_
