import { useEffect, useState } from 'react'

export default function App() {
  const [status, setStatus] = useState('checking…')

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setStatus(`${d.status} • ${d.time}`))
      .catch(() => setStatus('backend not reachable'))
  }, [])

  return (
    <div className="wrap">
      <h1>FullHousey Admin</h1>
      <p>Backend: {status}</p>
    </div>
  )
}
