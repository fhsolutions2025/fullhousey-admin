export type AppConfig = { env: string; apiBase: string; buildTime: string }

export async function fetchConfig(): Promise<AppConfig> {
  const res = await fetch('/api/config')
  if (!res.ok) throw new Error('Failed to load config')
  return res.json()
}
