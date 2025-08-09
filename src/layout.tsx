import React from 'react'

export function Layout({
  current,
  onNavigate,
  children
}: {
  current: 'profile' | 'tezz' | 'saanp' | 'dashboard',
  onNavigate: (p: 'profile' | 'tezz' | 'saanp' | 'dashboard') => void,
  children: React.ReactNode
}) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <img src="/img/logo-placeholder.svg" alt="FullHousey" />
          <span>FullHousey Admin</span>
        </div>
        <nav className="nav">
          <button className={current==='profile' ? 'active' : ''} onClick={() => onNavigate('profile')}>Profile</button>
          <button className={current==='tezz' ? 'active' : ''} onClick={() => onNavigate('tezz')}>Tezz Home</button>
          <button className={current==='saanp' ? 'active' : ''} onClick={() => onNavigate('saanp')}>Saanp Seedhi</button>
          <button className={current==='dashboard' ? 'active' : ''} onClick={() => onNavigate('dashboard')}>Dashboard</button>
        </nav>
      </header>
      <main className="app-main">
        {children}
      </main>
    </div>
  )
}
