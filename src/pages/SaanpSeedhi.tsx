import React from 'react'

function Board() {
  const cells = []
  for (let row = 9; row >= 0; row--) {
    const rowCells = []
    for (let col = 0; col < 10; col++) {
      const base = row * 10
      const num = row % 2 === 0 ? base + col + 1 : base + (10 - col)
      rowCells.push(<div key={num} className="cell">{num}</div>)
    }
    cells.push(...rowCells)
  }
  return <div className="board">{cells}</div>
}

export default function SaanpSeedhi() {
  return (
    <div className="grid cols-2">
      <div className="card">
        <h2>Saanp Seedhi – Board (Veer Shergill)</h2>
        <p className="muted">Admin light: suave, platinum-board vibe. Placeholder board below.</p>
        <Board />
      </div>
      <div className="card">
        <h3>Config (Admin)</h3>
        <div className="grid cols-2">
          <label className="muted">Enable Q rounds <input type="checkbox" defaultChecked /></label>
          <label className="muted">Jackpot Mode <input type="checkbox" /></label>
          <label className="muted">Tickets per round <input type="number" defaultValue={100} /></label>
          <label className="muted">Host <select defaultValue="Motabhai"><option>Motabhai</option><option>Rani</option><option>Avi</option></select></label>
        </div>
        <button className="btn primary" style={{marginTop:12}}>Save</button>
      </div>
    </div>
  )
}
