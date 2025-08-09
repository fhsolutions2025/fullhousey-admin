import React from 'react'

export function Layout({
  current,
  onNavigate,
  children
}: {
  current: 'profile' | 'tezz' | 'saanp' | 'dashboard' | 'account' | 'tickets',
  onNavigate: (p: 'profile' | 'tezz' | 'saanp' | 'dashboard' | 'account' | 'tickets') => void,
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
        <nav className="nav">
          <Btn id="profile" label="Profile" />
          <Btn id="tezz" label="Tezz Home" />
          <Btn id="saanp" label="Saanp Seedhi" />
          <Btn id="dashboard" label="Dashboard" />
          <Btn id="tickets" label="Tickets" />
          <Btn id="account" label="My Account" />
        </nav>
      </header>
      <main className="app-main">
        {children}
      </main>
    </div>
  )
}
