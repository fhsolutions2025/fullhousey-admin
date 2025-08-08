import { useEffect, useState } from 'react'

type Summary = {
  totalDeposits: number; totalPayouts: number; ngr: number;
  rtpMargin: number; floatBufferDays: number;
  abnormalRTPAlerts: number; volatilityAlerts: number;
}
type TrendRow = { date: string; payouts: number; deposits: number; rtp: number; volatility: number }
type DrillRow = { region: string; rtp: number; payouts: number; abnormal: boolean }

export default function Payments() {
  const [sum, setSum] = useState<Summary | null>(null)
  const [trends, setTrends] = useState<TrendRow[]>([])
  const [drill, setDrill] = useState<DrillRow[]>([])
  const [err, setErr] = useState<string | null>(null)

  const load = async () => {
    setErr(null)
    try {
      const [s, t, d] = await Promise.all([
        fetch('/api/payments/summary').then(r => r.json()),
        fetch('/api/payments/trends').then(r => r.json()),
        fetch('/api/payments/drill').then(r => r.json())
      ])
      setSum(s); setTrends(t.rows ?? t); setDrill(d.rows ?? d)
    } catch {
      setErr('Failed to load payments data')
    }
  }

  useEffect(() => { load() }, [])

  return (
    <>
      <h1>Payments</h1>
      {err && <p style={{color:'#ff6b6b'}}>{err}</p>}
      <div className="toolbar">
        <button onClick={load}>Refresh</button>
      </div>

      {/* Sugar */}
      <section className="card">
        <h2>Sugar — Summary</h2>
        {!sum ? <p>Loading…</p> : (
          <div className="grid">
            <Metric label="Total Deposits" value={currency(sum.totalDeposits)} />
            <Metric label="Total Payouts" value={currency(sum.totalPayouts)} />
            <Metric label="NGR" value={currency(sum.ngr)} />
            <Metric label="RTP Margin" value={(sum.rtpMargin*100).toFixed(1) + '%'} />
            <Metric label="Float Buffer" value={`${sum.floatBufferDays} days`} />
            <Metric label="Alerts" value={`${sum.abnormalRTPAlerts + sum.volatilityAlerts}`} />
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
