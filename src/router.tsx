import { createBrowserRouter } from 'react-router-dom'
import Layout from './Layout'
import Dashboard from './pages/Dashboard'
import Agents from './pages/Agents'
import Payments from './pages/Payments'
import Settings from './pages/Settings'
import About from './pages/About'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'agents', element: <Agents /> },
      { path: 'payments', element: <Payments /> },
      { path: 'settings', element: <Settings /> },
      { path: 'about', element: <About /> }
    ]
  }
])
