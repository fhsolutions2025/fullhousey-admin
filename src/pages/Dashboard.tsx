import { Outlet, Link, useLocation } from 'react-router-dom'
import './styles.css'

export default function Layout() {
  const loc = useLocation()
  const nav = [
    { to: '/', label: 'Dashboard' },
    { to: '/agents', label: 'Agents' },
    { to: '/payments', label: 'Payments' },
    { to: '/settings', label: 'Settings' }
  ]
  return (
    <div>
      <nav className="nav">
        {nav.map(n => (
          <Link
            key={n.to}
            to={n.to}
            className={loc.pathname === n.to ? 'active' : ''}
          >
            {n.label}
          </Link>
        ))}
      </nav>
      <main className="wrap">
        <Outlet />
      </main>
    </div>
  )
}
