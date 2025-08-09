import React from 'react'

export default function Numpad({ onPress }: { onPress?: (v:string)=>void }) {
  const keys = ['1','2','3','4','5','6','7','8','9','CLR','0','OK']
  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(3,60px)', gap:8}}>
      {keys.map(k => (
        <button key={k} className="btn" onClick={()=>onPress?.(k)}>{k}</button>
      ))}
    </div>
  )
}
