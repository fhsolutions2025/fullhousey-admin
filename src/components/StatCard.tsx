type Props = {
  title: string
  value?: string
  loading?: boolean
  error?: string
  onRetry?: () => void
}

export default function StatCard({ title, value, loading, error, onRetry }: Props) {
  return (
    <div className="card">
      <div className="card-top">
        <h3>{title}</h3>
        {onRetry && <button onClick={onRetry}>↻</button>}
      </div>
      {loading && <p>Loading…</p>}
      {!loading && error && <p style={{color:'#ff6b6b'}}>{error}</p>}
      {!loading && !error && <p className="stat">{value ?? '—'}</p>}
    </div>
  )
}
