import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import { useToaster } from '../components/Toaster'

type J = Record<string, unknown>

export default function Dashboard() {
  const { push } = useToaster()
  const [health, setHealth] = useState('checking…')
  const [info, setInfo] = useState<J | null>(null)
  const [version, setVersion] = useState<J | null>(null)

  const [loadInfo, setLoadInfo] = useState({ loading: false })
  const [loadVer, setLoadVer] = useState({ loading: false })
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
        push('Health check failed')
      }
    }
    fetchHealth()
    timer.current = window.setInterval(fetchHealth, 15000)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [push])

  const getInfo = async () => {
    setLoadInfo({ loading: true })
    try { setInfo(await api<J>('/api/info')) }
    catch { push('Failed to load /api/info') }
    finally { setLoadInfo({ loading: false }) }
  }

  const getVersion = async () => {
    setLoadVer({ loading: true })
    try { setVersion(await api<J>('/api/version')) }
    catch { push('Failed to load /api/version') }
    finally { setLoadVer({ loading: false }) }
  }

  useEffect(() => { getInfo(); getVersion() }, [])

  return (
    <>
      <h1>Dashboard</h1>
      <p style={{opacity:.8, marginTop:-8}}>Backend: {health} • Last updated: {lastUpdated}</p>

      <div className="grid">
        <Card title="Info" loading={loadInfo.loading} value={info} onRetry={getInfo} />
        <Card title="Version" loading={loadVer.loading} value={version} onRetry={getVersion} />
      </div>
    </>
  )
}

function Card({ title, value, loading, onRetry }:{
  title:string; value:any; loading?:boolean; onRetry?:()=>void
}) {
  return (
    <div className="card">
      <div className="card-top">
        <h3>{title}</h3>
        {onRetry && <button onClick={onRetry}>↻</button>}
      </div>
      {loading && <p>Loading…</p>}
      {!loading && <pre className="stat">{JSON.stringify(value, null, 2)}</pre>}
    </div>
  )
}
