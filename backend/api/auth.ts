import { Router } from 'express'
const router = Router()

// Extremely simple demo auth.
// In production: replace with real user store + hashed passwords + JWT signing.
const DEMO_USER = { email: 'admin@fullhousey.local', password: 'admin123' }

// issue a short-lived demo token (no crypto; dev only)
function makeToken(email: string) {
  return Buffer.from(JSON.stringify({ email, iat: Date.now() })).toString('base64')
}

router.post('/login', (req, res) => {
  const { email, password } = req.body || {}
  // allow any credentials in dev if want: uncomment next line
  // if ((process.env.NODE_ENV || 'development') !== 'production') return res.json({ token: makeToken(email || 'dev') })

  if (email === DEMO_USER.email && password === DEMO_USER.password) {
    return res.json({ token: makeToken(email) })
  }
  return res.status(401).json({ error: 'Invalid credentials' })
})

router.post('/logout', (_req, res) => {
  return res.json({ ok: true })
})

export default router
