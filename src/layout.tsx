import { Outlet, Link, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { api } from './lib/api'
import { ToasterProvider, useToaster } from './components/Toaster'
import './styles.css'

function TopNav() {
  const loc = useLocation()
  const [env, setEnv] = useState('dev')
  const [health, setHealth] = useState<'ok' | 'down' | 'checking'>('checking')
  const timer = useRef<number | null>(null)
  const { push } = useToaster()

  // Load env/config once
  useEffect(() => {
    api<any>('/api/config')
      .then(c => setEnv((c?.env ?? 'development').toLowerCase()))
      .catch(() => setEnv('unknown'))
  }, [])

  // Poll health
  useEffect(() => {
    const tick = async () => {
      try {
        const d = await api<any>('/api/health')
        setHealth(d?.status === 'ok' ? 'ok' : 'down')
      } catch (e) {
        setHealth('down')
      }
    }
    setHealth('checking')
    tick()
    timer.current = window.setInterval(tick, 15000)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [])

  const nav = [
    { to: '/', label: 'Dashboard' },
    { to: '/agents', label: 'Agents' },
    { to: '/payments', label: 'Payments' },
    { to: '/settings', label: 'Settings' }
  ]

  return (
    <nav className="nav">
      <div className="nav-left">
        {nav.map(n => (
          <Link
            key={n.to}
            to={n.to}
            className={loc.pathname === n.to ? 'active' : ''}
          >
            {n.label}
          </Link>
        ))}
      </div>
      <div className="nav-right">
        <span className={`badge env ${env}`}>{env}</span>
        <span className={`badge health ${health}`}>
          {health === 'checking' ? '…' : health}
        </span>
        <button className="mini" onClick={() => push('Refreshed status')}>
          ↻
        </button>
      </div>
    </nav>
  )
}

export default function Layout() {
  return (
    <ToasterProvider>
      <TopNav />
      <main className="wrap">
        <Outlet />
      </main>
    </ToasterProvider>
  )
}
