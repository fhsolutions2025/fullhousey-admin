import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'

type J = Record<string, unknown>

export default function Dashboard() {
  const [health, setHealth] = useState('checking…')
  const [info, setInfo] = useState<J | null>(null)
  const [version, setVersion] = useState<J | null>(null)

  const [loadInfo, setLoadInfo] = useState({ loading: false, error: '' })
  const [loadVer, setLoadVer] = useState({ loading: false, error: '' })
  const [lastUpdated, setLastUpdated] = useState<string>('—')

  const timer = useRef<number | null>(null)

  // Health auto-poll
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const d = await api<any>('/api/health')
        setHealth(`${d.status} • ${d.time}`)
        setLastUpdated(new Date().toLocaleTimeString())
      } catch {
        setHealth('backend not reachable')
      }
    }
    fetchHealth()
    timer.current = window.setInterval(fetchHealth, 15000)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [])

  const getInfo = async () => {
    setLoadInfo({ loading: true, error: '' })
    try { setInfo(await api<J>('/api/info')) }
    catch { setLoadInfo({ loading: false, error: 'Failed to load /api/info' }); return }
    setLoadInfo({ loading: false, error: '' })
  }

  const getVersion = async () => {
    setLoadVer({ loading: true, error: '' })
    try { setVersion(await api<J>('/api/version')) }
    catch { setLoadVer({ loading: false, error: 'Failed to load /api/version' }); return }
    setLoadVer({ loading: false, error: '' })
  }

  useEffect(() => { getInfo(); getVersion() }, [])

  return (
    <>
      <h1>Dashboard</h1>
      <p style={{opacity:.8, marginTop:-8}}>Backend: {health} • Last updated: {lastUpdated}</p>

      <div className="grid">
        <Card title="Info" loading={loadInfo.loading} error={loadInfo.error} value={info} onRetry={getInfo} />
        <Card title="Version" loading={loadVer.loading} error={loadVer.error} value={version} onRetry={getVersion} />
      </div>
    </>
  )
}

function Card({ title, value, loading, error, onRetry }:{
  title:string; value:any; loading?:boolean; error?:string; onRetry?:()=>void
}) {
  return (
    <div className="card">
      <div className="card-top">
        <h3>{title}</h3>
        {onRetry && <button onClick={onRetry}>↻</button>}
      </div>
      {loading && <p>Loading…</p>}
      {!loading && error && <p style={{color:'#ff6b6b'}}>{error}</p>}
      {!loading && !error && <pre className="stat">{JSON.stringify(value, null, 2)}</pre>}
    </div>
  )
}
import { useToaster } from '../components/Toaster'

export default function Dashboard() {
  const { push } = useToaster()

  const getInfo = async () => {
    try {
      // ...fetch logic
    } catch {
      push('Failed to load /api/info')   // 👈 shows toast
    }
  }

  // rest of component...
}
