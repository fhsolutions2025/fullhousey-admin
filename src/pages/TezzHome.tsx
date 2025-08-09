import React from 'react'

export default function TezzHome() {
  return (
    <div className="grid cols-3">
      <div className="card">
        <h2>Tezz – Player Home</h2>
        <p className="muted">Fast games, quick actions, and personalized picks.</p>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginTop:12}}>
          {Array.from({length:6}).map((_,i) => (
            <div className="card" key={i}>
              <div style={{height:100, borderRadius:10, background:'linear-gradient(135deg, rgba(96,165,250,0.2), rgba(167,139,250,0.15))'}}/>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8}}>
                <span>Tile {i+1}</span>
                <button className="btn">Play</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h3>Trending Shows</h3>
        <ul className="muted">
          <li>Rani’s Bingo Bash</li>
          <li>Gyan Yaan Bingo</li>
          <li>Super Saturday Spotlight</li>
        </ul>
      </div>
      <div className="card">
        <h3>Quick Actions</h3>
        <button className="btn primary" style={{width:'100%', marginTop:6}}>Buy Ticket</button>
        <button className="btn" style={{width:'100%', marginTop:6}}>View Wallet</button>
        <button className="btn" style={{width:'100%', marginTop:6}}>Invite Friends</button>
      </div>
    </div>
  )
}
