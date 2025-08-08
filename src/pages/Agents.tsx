import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { useToaster } from '../components/Toaster'

type AgentRow = {
  id: string
  name: string
  principal: string
  status: 'online' | 'idle' | 'error'
  costPerHour: number
  roi: number
}
type ApiResp = { rows: AgentRow[]; count: number; time: string }
type SortKey = 'name' | 'principal' | 'status' | 'costPerHour' | 'roi'
type SortDir = 'asc' | 'desc'

export default function Agents() {
  const { push } = useToaster()
  const [rows, setRows] = useState<AgentRow[]>([])
  const [q, setQ] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [loading, setLoading] = useState(false)

  const fetchAgents = async () => {
    setLoading(true)
    try {
      const d = await api<ApiResp>('/api/agents')
      setRows(d.rows)
    } catch {
      push('Failed to load agents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAgents() }, [])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    let out = rows
    if (needle) {
      out = out.filter(r =>
        [r.id, r.name, r.principal, r.status].some(v => String(v).toLowerCase().includes(needle))
      )
    }
    out = [...out].sort((a, b) => {
      const va = a[sortKey] as any; const vb = b[sortKey] as any
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return out
  }, [rows, q, sortKey, sortDir])

  const header = (key: SortKey, label: string) => (
    <th onClick={() => {
      if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
      else { setSortKey(key); setSortDir('asc') }
    }}>
      {label}{' '}
      <span style={{ opacity: .6 }}>{sortKey === key ? (sortDir === 'asc' ? '▲' : '▼') : ''}</span>
    </th>
  )

  return (
    <>
      <h1>Agents</h1>
      <div className="toolbar">
        <input placeholder="Search agents…" value={q} onChange={e => setQ(e.target.value)} />
        <button onClick={fetchAgents}>Refresh</button>
      </div>

      {loading && <p>Loading…</p>}

      {!loading && (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                {header('name','Name')}
                {header('principal','Principal')}
                {header('status','Status')}
                {header('costPerHour','Cost/hr')}
                {header('roi','ROI')}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.principal}</td>
                  <td><Badge status={r.status} /></td>
                  <td>₹{r.costPerHour.toFixed(0)}</td>
                  <td>{Math.round(r.roi*100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <p style={{opacity:.7}}>No matching agents.</p>}
        </div>
      )}
    </>
  )
}

function Badge({ status }: { status: AgentRow['status'] }) {
  const color =
    status === 'online' ? '#2ecc71' :
    status === 'idle' ? '#f1c40f' : '#e74c3c'
  return (
    <span style={{
      background: '#182233',
      border: '1px solid #2a3a52',
      borderLeft: `6px solid ${color}`,
      padding: '4px 8px',
      borderRadius: 6
    }}>
      {status}
    </span>
  )
}
