import { hasToken } from '../lib/auth'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export default function Guard() {
  const loc = useLocation()
  if (!hasToken()) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  }
  return <Outlet />
}
