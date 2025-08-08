import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useToaster } from '../components/Toaster'

type Summary = {
  totalDeposits: number; totalPayouts: number; ngr: number;
  rtpMargin: number; floatBufferDays: number;
  abnormalRTPAlerts: number; volatilityAlerts: number;
}
type TrendRow = { date: string; payouts: number; deposits: number; rtp: number; volatility: number }
type DrillRow = { region: string; rtp: number; payouts: number; abnormal: boolean }

export default function Payments() {
  const { push } = useToaster()
  const [sum, setSum] = useState<Summary | null>(null)
  const [trends, setTrends] = useState<TrendRow[]>([])
  const [drill, setDrill] = useState<DrillRow[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [s, t, d] = await Promise.all([
        api<Summary>('/api/payments/summary'),
        api<{ days: string[]; rows: TrendRow[] }>('/api/payments/trends'),
        api<{ rows: DrillRow[] }>('/api/payments/drill')
      ])
      setSum(s); setTrends(t.rows ?? []); setDrill(d.rows ?? [])
    } catch {
      push('Failed to load payments data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <>
      <h1>Payments</h1>
      <div className="toolbar">
        <button onClick={load}>Refresh</button>
      </div>

      {/* Sugar */}
      <section className="card">
        <h2>Sugar — Summary</h2>
        {loading && !sum ? <p>Loading…</p> : (
          <div className="grid">
            <Metric label="Total Deposits" value={currency(sum?.totalDeposits ?? 0)} />
            <Metric label="Total Payouts" value={currency(sum?.totalPayouts ?? 0)} />
            <Metric label="NGR" value={currency(sum?.ngr ?? 0)} />
            <Metric label="RTP Margin" value={sum ? (sum.rtpMargin*100).toFixed(1) + '%' : '—'} />
            <Metric label="Float Buffer" value={sum ? `${sum.floatBufferDays} days` : '—'} />
            <Metric label="Alerts" value={sum ? `${sum.abnormalRTPAlerts + sum.volatilityAlerts}` : '—'} />
          </div>
        )}
      </section>

      {/* Milk */}
      <section className="card" style={{marginTop:16}}>
        <h2>Milk — Trends (7d)</h2>
        {!trends.length ? <p>Loading…</p> : (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr><th>Date</th><th>Deposits</th><th>Payouts</th><th>RTP</th><th>Volatility</th></tr>
              </thead>
              <tbody>
                {trends.map(r=>(
                  <tr key={r.date}>
                    <td>{r.date}</td>
                    <td>{currency(r.deposits)}</td>
                    <td>{currency(r.payouts)}</td>
                    <td>{Math.round(r.rtp*100)}%</td>
                    <td>{(r.volatility*100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Pancakes */}
      <section className="card" style={{marginTop:16}}>
        <h2>Pancakes — Regional Drill</h2>
        {!drill.length ? <p>Loading…</p> : (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Region</th><th>RTP</th><th>Payouts</th><th>Flag</th></tr></thead>
              <tbody>
                {drill.map(r=>(
                  <tr key={r.region}>
                    <td>{r.region}</td>
                    <td>{Math.round(r.rtp*100)}%</td>
                    <td>{currency(r.payouts)}</td>
                    <td>{r.abnormal ? '⚠️' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
    </div>
  )
}

const currency = (n: number) => `₹${n.toLocaleString('en-IN')}`
