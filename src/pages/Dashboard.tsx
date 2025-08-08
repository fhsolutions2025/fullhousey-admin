import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../lib/api'
import { useToaster } from '../components/Toaster'

type J = Record<string, unknown>
type HealthRow = { time: string; status: 'ok' | 'down' }
type HistoryResp = { rows: HealthRow[]; total: number; uptime: number }

export default function Dashboard() {
  const { push } = useToaster()
  const [health, setHealth] = useState('checking…')
  const [info, setInfo] = useState<J | null>(null)
  const [version, setVersion] = useState<J | null>(null)

  const [hist, setHist] = useState<HistoryResp | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('—')

  const timer = useRef<number | null>(null)

  // Health auto-poll
  useEffect(() => {
    const tick = async () => {
      try {
        const d = await api<any>('/api/health')
        setHealth(`${d.status} • ${d.time}`)
        setLastUpdated(new Date().toLocaleTimeString())
      } catch {
        setHealth('backend not reachable')
        push('Health check failed')
      }
      try {
        const h = await api<HistoryResp>('/api/health/history')
        setHist(h)
      } catch {
        // non-fatal
      }
    }
    tick()
    timer.current = window.setInterval(tick, 15000)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [push])

  // Info + Version (once)
  useEffect(() => {
    api<J>('/api/info').then(setInfo).catch(() => push('Failed to load /api/info'))
    api<J>('/api/version').then(setVersion).catch(() => push('Failed to load /api/version'))
  }, [push])

  return (
    <>
      <h1>Dashboard</h1>
      <p style={{opacity:.8, marginTop:-8}}>Backend: {health} • Last updated: {lastUpdated}</p>

      <div className="grid">
        <Card title="Info" value={info} />
        <Card title="Version" value={version} />
      </div>

      <section className="card" style={{marginTop:16}}>
        <div className="card-top">
          <h3>Health — Last {hist?.rows.length ?? 0} pings</h3>
          <span className="badge">{hist ? `Uptime ${hist.uptime}%` : '—'}</span>
        </div>
        {!hist ? <p>Loading…</p> : <Sparkline rows={hist.rows} />}
      </section>
    </>
  )
}

function Card({ title, value }:{ title:string; value:any }) {
  return (
    <div className="card">
      <div className="card-top"><h3>{title}</h3></div>
      <pre className="stat">{JSON.stringify(value, null, 2)}</pre>
    </div>
  )
}

// ─── Sparkline (inline SVG, no libs) ──────────────────────────────────────────
function Sparkline({ rows }: { rows: HealthRow[] }) {
  const width = 560
  const height = 64
  const pad = 6

  const points = useMemo(() => {
    if (!rows.length) return ''
    const n = rows.length
    const step = (width - pad*2) / Math.max(1, n - 1)
    const y = (v: number) => pad + (1 - v) * (height - pad*2) // v=1 → top, v=0 → bottom
    // map ok=1, down=0
    const vals = rows.map(r => (r.status === 'ok' ? 1 : 0))
    return vals.map((v, i) => `${pad + i*step},${y(v)}`).join(' ')
  }, [rows])

  const lastOk = rows.at(-1)?.status === 'ok'
  const okCount = rows.filter(r => r.status === 'ok').length
  const pct = rows.length ? Math.round((okCount/rows.length)*100) : 0

  return (
    <div className="sparkline">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="health sparkline">
        <polyline
          points={points}
          fill="none"
          stroke={lastOk ? '#2ecc71' : '#e74c3c'}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* baseline */}
        <line x1={pad} y1={height-pad} x2={width-pad} y2={height-pad} stroke="#2a3a52" strokeWidth="1" />
        {/* ok line (top) */}
        <line x1={pad} y1={pad} x2={width-pad} y2={pad} stroke="#203047" strokeWidth="1" />
      </svg>
      <div className="spark-meta">
        <span className="badge">OK {okCount}/{rows.length}</span>
        <span className="badge">Window uptime {pct}%</span>
      </div>
    </div>
  )
}
