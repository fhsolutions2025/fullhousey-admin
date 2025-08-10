import React, { useState } from 'react'
import { Layout } from './Layout'
import ProfileSelect from './pages/ProfileSelect'
import TezzHome from './pages/TezzHome'
import SaanpSeedhi from './pages/SaanpSeedhi'
import Dashboard from './pages/Dashboard'
import MyAccount from './pages/MyAccount'
import Tickets from './pages/Tickets'
import CCDashboard from './pages/CCDashboard'
import CTODashboard from './pages/CTODashboard'
import ContentHoDDashboard from './pages/ContentHoDDashboard'

type PageKey =
  | 'profile' | 'tezz' | 'saanp' | 'dashboard'
  | 'tickets' | 'account'
  | 'cc' | 'cto' | 'content'

export default function App() {
  const [page, setPage] = useState<PageKey>('profile')

  return (
    <Layout current={page} onNavigate={setPage}>
      {page === 'profile' && <ProfileSelect />}
      {page === 'tezz' && <TezzHome />}
      {page === 'saanp' && <SaanpSeedhi />}
      {page === 'dashboard' && <Dashboard />}
      {page === 'tickets' && <Tickets />}
      {page === 'account' && <MyAccount />}
      {page === 'cc' && <CCDashboard />}
      {page === 'cto' && <CTODashboard />}
      {page === 'content' && <ContentHoDDashboard />}
    </Layout>
  )
}
