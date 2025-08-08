import { useEffect, useState } from 'react'
import './styles.css'

type J = Record<string, unknown>

export default function App() {
  const [health, setHealth] = useState('checking…')
  const [info, setInfo] = useState<J | null>(null)
  const [version, setVersion] = useState<J | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setHealth(`${d.status} • ${d.time}`))
      .catch(() => setHealth('backend not reachable'))
  }, [])

  const loadInfo = async () => {
    setErr(null); setInfo(null)
    try { setInfo(await (await fetch('/api/info')).json()) }
    catch (e) { setErr('Failed to load /api/info') }
  }

  const loadVersion = async () => {
    setErr(null); setVersion(null)
    try { setVersion(await (await fetch('/api/version')).json()) }
    catch (e) { setErr('Failed to load /api/version') }
  }

  return (
    <div className="wrap">
      <h1>FullHousey Admin</h1>
      <p>Backend: {health}</p>

      <div className="card">
        <h2>Diagnostics</h2>
        <button onClick={loadInfo}>Get /api/info</button>
        <button onClick={loadVersion} style={{ marginLeft: 12 }}>Get /api/version</button>

        {err && <p style={{ color: '#ff6b6b' }}>{err}</p>}

        {info && (
          <>
            <h3>Info</h3>
            <pre>{JSON.stringify(info, null, 2)}</pre>
          </>
        )}

        {version && (
          <>
            <h3>Version</h3>
            <pre>{JSON.stringify(version, null, 2)}</pre>
          </>
        )}
      </div>
    </div>
  )
}
