import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useToaster } from '../components/Toaster'

type Config = {
  env: string
  apiBase: string
  buildTime: string
  commit: string
  pingIntervalMs: number
  enableDevTools: boolean
  theme: 'dark' | 'light'
}

export default function Settings() {
  const { push } = useToaster()
  const [cfg, setCfg] = useState<Config | null>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setCfg(await api<Config>('/api/config'))
    } catch {
      push('Failed to load config')
    }
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    if (!cfg) return
    setSaving(true)
    try {
      const next = await api<Config>('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pingIntervalMs: cfg.pingIntervalMs,
          enableDevTools: cfg.enableDevTools,
          theme: cfg.theme
        })
      })
      setCfg(next)
      push('Config saved')
    } catch (e: any) {
      push('Save failed (editing disabled in production?)')
    } finally {
      setSaving(false)
    }
  }

  if (!cfg) return <div><h1>Settings</h1><p>Loading…</p></div>

  const prod = cfg.env === 'production'

  return (
    <>
      <h1>Settings</h1>
      <section className="card">
        <h2>Environment</h2>
        <pre className="stat">{JSON.stringify({
          env: cfg.env, apiBase: cfg.apiBase, buildTime: cfg.buildTime, commit: cfg.commit
        }, null, 2)}</pre>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2>Runtime Config</h2>

        {prod && <p style={{color:'#ffb347'}}>Editing is disabled in production.</p>}

        <div className="grid">
          <div className="metric">
            <div className="metric-label">Ping Interval (ms)</div>
            <input
              type="number"
              min={5000}
              max={60000}
              step={1000}
              value={cfg.pingIntervalMs}
              onChange={e => setCfg({ ...cfg, pingIntervalMs: Number(e.target.value) })}
              disabled={prod}
            />
          </div>

          <div className="metric">
            <div className="metric-label">Enable Dev Tools</div>
            <label style={{display:'inline-flex', gap:8, alignItems:'center'}}>
              <input
                type="checkbox"
                checked={cfg.enableDevTools}
                onChange={e => setCfg({ ...cfg, enableDevTools: e.target.checked })}
                disabled={prod}
              />
              <span>{cfg.enableDevTools ? 'On' : 'Off'}</span>
            </label>
          </div>

          <div className="metric">
            <div className="metric-label">Theme</div>
            <select
              value={cfg.theme}
              onChange={e => setCfg({ ...cfg, theme: e.target.value as Config['theme'] })}
              disabled={prod}
            >
              <option value="dark">dark</option>
              <option value="light">light</option>
            </select>
          </div>
        </div>

        <div style={{marginTop:12}}>
          <button className="mini" onClick={save} disabled={prod || saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button className="mini" style={{marginLeft:8}} onClick={load}>
            Reload
          </button>
        </div>
      </section>
    </>
  )
}
