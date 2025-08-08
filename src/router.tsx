import { createBrowserRouter } from 'react-router-dom'
import Layout from './Layout'
import Dashboard from './pages/Dashboard'
import Agents from './pages/Agents'
import Payments from './pages/Payments'
import Settings from './pages/Settings'
import About from './pages/About'
import Login from './pages/Login'
import Guard from './components/Guard'

export const router = createBrowserRouter([
  // Public
  { path: '/login', element: <Login /> },

  // App shell
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },

      // Protected group
      {
        element: <Guard />,
        children: [
          { path: 'agents', element: <Agents /> },
          { path: 'payments', element: <Payments /> },
          { path: 'settings', element: <Settings /> }
        ]
      },

      // Public info page
      { path: 'about', element: <About /> }
    ]
  }
])
