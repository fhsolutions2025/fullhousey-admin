import { useState } from 'react'
import { api } from '../lib/api'
import { saveToken } from '../lib/auth'
import { useToaster } from '../components/Toaster'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { push } = useToaster()
  const nav = useNavigate()
  const [email, setEmail] = useState('admin@fullhousey.local')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await api<{ token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })
      saveToken(data.token)
      push('Logged in')
      nav('/')
    } catch {
      push('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wrap" style={{maxWidth:420}}>
      <h1>Login</h1>
      <form className="card" onSubmit={onSubmit} style={{display:'grid', gap:12}}>
        <label>
          <div className="metric-label">Email</div>
          <input value={email} onChange={e=>setEmail(e.target.value)} />
        </label>
        <label>
          <div className="metric-label">Password</div>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        </label>
        <button className="mini" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  )
}
