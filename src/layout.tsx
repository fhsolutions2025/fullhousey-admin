import React from 'react'

export function Layout({
  current,
  onNavigate,
  children
}: {
  current: 'profile' | 'tezz' | 'saanp' | 'dashboard' | 'tickets' | 'account' | 'cc' | 'cto' | 'content',
  onNavigate: (p: 'profile' | 'tezz' | 'saanp' | 'dashboard' | 'tickets' | 'account' | 'cc' | 'cto' | 'content') => void,
  children: React.ReactNode
}) {
  const Btn = ({ id, label }: { id: typeof current; label: string }) => (
    <button className={current===id ? 'active' : ''} onClick={() => onNavigate(id)}>{label}</button>
  )
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <img src="/img/logo-placeholder.svg" alt="FullHousey" />
          <span>FullHousey Admin</span>
        </div>
        <nav className="nav" style={{ flexWrap:'wrap' }}>
          <Btn id="profile" label="Profile" />
          <Btn id="tezz" label="Tezz" />
          <Btn id="saanp" label="Saanp" />
          <Btn id="dashboard" label="Ops Dash" />
          <Btn id="tickets" label="Tickets" />
          <Btn id="account" label="My Account" />
          <Btn id="cc" label="CC" />
          <Btn id="cto" label="CTO" />
          <Btn id="content" label="Content HoD" />
        </nav>
      </header>
      <main className="app-main">
        {children}
      </main>
    </div>
  )
}
