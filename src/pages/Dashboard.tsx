import { useEffect, useRef, useState } from 'react'
import StatCard from '../components/StatCard'

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
        const r = await fetch('/api/health')
        const d = await r.json()
        setHealth(`${d.status} • ${d.time}`)
        setLastUpdated(new Date().toLocaleTimeString())
      } catch {
        setHealth('backend not reachable')
      }
    }
    fetchHealth()
    timer.current = window.setInterval(fetchHealth, 15000) // 15s
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [])

  const getInfo = async () => {
    setLoadInfo({ loading: true, error: '' })
    try {
      const r = await fetch('/api/info')
      setInfo(await r.json())
    } catch {
      setLoadInfo({ loading: false, error: 'Failed to load /api/info' }); return
    }
    setLoadInfo({ loading: false, error: '' })
  }

  const getVersion = async () => {
    setLoadVer({ loading: true, error: '' })
    try {
      const r = await fetch('/api/version')
      setVersion(await r.json())
    } catch {
      setLoadVer({ loading: false, error: 'Failed to load /api/version' }); return
    }
    setLoadVer({ loading: false, error: '' })
  }

  useEffect(() => { getInfo(); getVersion() }, [])

  return (
    <>
      <h1>Dashboard</h1>
      <p style={{opacity:.8, marginTop:-8}}>Backend: {health} • Last updated: {lastUpdated}</p>

      <div className="grid">
        <StatCard
          title="Info"
          loading={loadInfo.loading}
          error={loadInfo.error}
          value={info ? JSON.stringify(info) : undefined}
          onRetry={getInfo}
        />
        <StatCard
          title="Version"
          loading={loadVer.loading}
          error={loadVer.error}
          value={version ? JSON.stringify(version) : undefined}
          onRetry={getVersion}
        />
      </div>
    </>
  )
}
