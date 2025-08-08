const BASE = (import.meta as any).env?.VITE_API_URL || ''

function withAuth(init?: RequestInit): RequestInit {
  const token = localStorage.getItem('fh_token')
  const headers = new Headers(init?.headers || {})
  if (token) headers.set('Authorization', `Bearer ${token}`)
  // If there's a body and no content-type set, default to JSON
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return { ...init, headers }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const url = BASE ? `${BASE}${path}` : path
  const res = await fetch(url, withAuth(init))
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json() as Promise<T>
}
