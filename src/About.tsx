import { useEffect, useState } from 'react'
import { api } from '../lib/api'

type Config = { env: string; apiBase: string; buildTime: string; commit: string }
type Version = { frontend: string; backend: string; commit: string }

export default function About() {
  const [cfg, setCfg] = useState<Config | null>(null)
  const [ver, setVer] = useState<Version | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const [c, v] = await Promise.all([
          api<Config>('/api/config'),
          api<Version>('/api/version')
        ])
        setCfg(c); setVer(v)
      } catch {
        setErr('Failed to load build info')
      }
    }
    run()
  }, [])

  return (
    <>
      <h1>About</h1>
      {err && <p style={{color:'#ff6b6b'}}>{err}</p>}
      <div className="grid">
        <div className="card">
          <h3>Environment</h3>
          <pre className="stat">{JSON.stringify(cfg, null, 2)}</pre>
        </div>
        <div className="card">
          <h3>Version</h3>
          <pre className="stat">{JSON.stringify(ver, null, 2)}</pre>
        </div>
      </div>
    </>
  )
}
