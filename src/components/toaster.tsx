import { createContext, useContext, useMemo, useState } from 'react'

type Toast = { id: number; text: string }
type Ctx = { push: (text: string) => void }

const ToastCtx = createContext<Ctx | null>(null)

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  const push = (text: string) => {
    const id = Date.now() + Math.random()
    setItems(prev => [...prev, { id, text }])
    setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), 3500)
  }
  const value = useMemo(() => ({ push }), [])
  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="toasts">
        {items.map(t => <div key={t.id} className="toast">{t.text}</div>)}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToaster() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToaster must be used within ToasterProvider')
  return ctx
}
