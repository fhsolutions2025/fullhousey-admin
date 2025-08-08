import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { api } from './lib/api'
import { ToasterProvider, useToaster } from './components/Toaster'
import { hasToken, clearToken } from './lib/auth'
import './styles.css'

function TopNav() {
  const loc = useLocation()
  const nav = [
    { to: '/', label: 'Dashboard' },
    { to: '/agents', label: 'Agents' },
    { to: '/payments', label: 'Payments' },
    { to: '/settings', label: 'Settings' },
    { to: '/about', label: 'About' }
  ]

  const [env, setEnv] = useState('dev')
  const [health, setHealth] = useState<'ok' | 'down' | 'checking'>('checking')
  const timer = useRef<number | null>(null)
  const { push } = useToaster()
  const navTo = useNavigate()

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
      } catch {
        setHealth('down')
      }
    }
    setHealth('checking')
    tick()
    timer.current = window.setInterval(tick, 15000)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [])

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

        {hasToken()
          ? (
              <button
                className="mini"
                onClick={() => { clearToken(); push('Logged out'); navTo('/login', { replace: true }) }}
              >
                Logout
              </button>
            )
          : <Link to="/login" className="badge">Login</Link>}
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
