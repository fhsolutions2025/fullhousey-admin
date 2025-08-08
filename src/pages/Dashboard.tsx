import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../lib/api'
import { useToaster } from '../components/Toaster'

type J = Record<string, unknown>
type HealthRow = { time: string; status: 'ok' | 'down' }
type Outage = { from: string; to: string; durationMs: number }
type HistoryResp = {
  rows: HealthRow[]
  total: number
  startedAt: string
  uptimeWindow: number
  uptimeSinceStart: number
  outageLog: Outage[]
}

export default function Dashboard() {
  const { push } = useToaster()
  const [health, setHealth] = useState('checking…')
  const [info, setInfo] = useState<J | null>(null)
  const [version, setVersion] = useState<J | null>(null)

  const [hist, setHist] = useState<HistoryResp | null>(null)
  const [limit, setLimit] = useState<number>(50)
  const [lastUpdated, setLastUpdated] = useState<string>('—')
  const [isDev, setIsDev] = useState<boolean>(false)

  const timer = useRef<number | null>(null)

  const fetchHealth = async (withHistory = true) => {
    try {
      const d = await api<any>('/api/health')
      setHealth(`${d.status} • ${d.time}`)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch {
      setHealth('backend not reachable')
      push('Health check failed')
    }
    if (withHistory) {
      try {
        const h = await api<HistoryResp>(`/api/health/history?limit=${limit}`)
        setHist(h)
      } catch { /* non-fatal */ }
    }
  }

  // Health auto-poll
  useEffect(() => {
    fetchHealth(true)
    timer.current = window.setInterval(() => fetchHealth(true), 15000)
    return () => { if (timer.current) clearInterval(timer.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit])

  // Info + Version (once) and config (for dev flag)
  useEffect(() => {
    api<J>('/api/info').then(setInfo).catch(() => push('Failed to load /api/info'))
    api<J>('/api/version').then(setVersion).catch(() => push('Failed to load /api/version'))
    api<any>('/api/config').then(c => setIsDev(String(c?.env || 'development').toLowerCase() !== 'production'))
      .catch(() => setIsDev(false))
  }, [push])

  const simulateDown = async () => {
    try {
      await api('/api/health/down')
      push('Simulated DOWN ping recorded')
      fetchHealth(true)
    } catch {
      push('Simulate down not available in this env')
    }
  }

  const resetHistory = async () => {
    try {
      await api('/api/health/reset', { method: 'POST' })
      push('Health history reset')
      fetchHealth(true)
    } catch {
      push('Reset not available in this env')
    }
  }

  return (
    <>
      <h1>Dashboard</h1>
      <p style={{opacity:.8, marginTop:-8}}>Backend: {health} • Last updated: {lastUpdated}</p>

      <div className="grid">
        <Card title="Info" value={info} />
        <Card title="Version" value={version} />
      </div>

      <section className="card" style={{marginTop:16}}>
        <div className="card-top" style={{gap:12}}>
          <h3>Health — Last {hist?.rows.length ?? 0} pings</h3>
          <div style={{display:'flex', gap:8, alignItems:'center', marginLeft:'auto'}}>
            <label style={{opacity:.8, fontSize:12}}>Window:</label>
            <select value={limit} onChange={e => setLimit(Number(e.target.value))}>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            {hist && <>
              <span className="badge">Window {hist.uptimeWindow}%</span>
              <span className="badge">Since start {hist.uptimeSinceStart}%</span>
            </>}
            {isDev && <>
              <button className="mini" onClick={simulateDown} title="Dev-only">Simulate Down</button>
              <button className="mini" onClick={resetHistory} title="Dev-only">Reset</button>
            </>}
          </div>
        </div>

        {!hist ? <p>Loading…</p> : <>
          <Sparkline rows={hist.rows} />
          <OutagesTable outages={hist.outageLog} />
          <p style={{opacity:.7, marginTop:8}}>Started at: {hist.startedAt}</p>
        </>}
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

function Sparkline({ rows }: { rows: HealthRow[] }) {
  const width = 560, height = 64, pad = 6
  const points = useMemo(() => {
    if (!rows.length) return ''
    const n = rows.length
    const step = (width - pad*2) / Math.max(1, n - 1)
    const y = (v: number) => pad + (1 - v) * (height - pad*2)
    const vals = rows.map(r => (r.status === 'ok' ? 1 : 0))
    return vals.map((v, i) => `${pad + i*step},${y(v)}`).join(' ')
  }, [rows])
  const lastOk = rows.at(-1)?.status === 'ok'
  return (
    <div className="sparkline">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="health sparkline">
        <polyline points={points} fill="none" stroke={lastOk ? '#2ecc71' : '#e74c3c'} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <line x1={pad} y1={height-pad} x2={width-pad} y2={height-pad} stroke="#2a3a52" strokeWidth="1" />
        <line x1={pad} y1={pad} x2={width-pad} y2={pad} stroke="#203047" strokeWidth="1" />
      </svg>
    </div>
  )
}

function OutagesTable({ outages }: { outages: Outage[] }) {
  if (!outages.length) return <p style={{opacity:.7}}>No outages in this window.</p>
  const top = outages.slice(-5)
  return (
    <div className="table-wrap" style={{marginTop:12}}>
      <table className="tbl">
        <thead><tr><th>From</th><th>To</th><th>Duration</th></tr></thead>
        <tbody>
          {top.map((o, i) => (
            <tr key={i}>
              <td>{o.from}</td>
              <td>{o.to}</td>
              <td>{fmtDuration(o.durationMs)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function fmtDuration(ms: number) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const rS = s % 60
  if (m > 0) return `${m}m ${rS}s`
  return `${s}s`
}
