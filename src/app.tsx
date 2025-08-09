import React, { useState } from 'react'
import { Layout } from './Layout'
import ProfileSelect from './pages/ProfileSelect'
import TezzHome from './pages/TezzHome'
import SaanpSeedhi from './pages/SaanpSeedhi'
import Dashboard from './pages/Dashboard'

type PageKey = 'profile' | 'tezz' | 'saanp' | 'dashboard'

export default function App() {
  const [page, setPage] = useState<PageKey>('profile')

  return (
    <Layout current={page} onNavigate={setPage}>
      {page === 'profile' && <ProfileSelect />}
      {page === 'tezz' && <TezzHome />}
      {page === 'saanp' && <SaanpSeedhi />}
      {page === 'dashboard' && <Dashboard />}
    </Layout>
  )
}
