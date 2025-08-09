import React from 'react'

const cards = [
  { key: 'Relaxed', tagline: 'Play easy, win breezy!', img: '/img/profile-relaxed.svg' },
  { key: 'Main Acts', tagline: 'Every round’s a performance!', img: '/img/profile-mainacts.svg' },
  { key: 'Gamesey', tagline: 'Win with wits, not just luck.', img: '/img/profile-gamesey.svg' },
  { key: 'BIG Wins', tagline: 'Big risk. Bigger rewards.', img: '/img/profile-bigwins.svg' },
]

export default function ProfileSelect() {
  return (
    <div className="grid cols-2">
      <div className="hero">
        <div>
          <h2>Select your profile</h2>
          <p className="muted">These profiles adapt tone, offers, and shows.</p>
        </div>
        <img src="/img/hero-placeholder.svg" alt="Hero" style={{width:160}} />
      </div>
      <div className="card">
        <div className="grid cols-2">
          {cards.map(c => (
            <div className="card" key={c.key}>
              <img src={c.img} alt={c.key} style={{width:'100%', height:120, objectFit:'cover', borderRadius:10}} />
              <h3>{c.key}</h3>
              <p className="muted" style={{marginTop:4}}>{c.tagline}</p>
              <button className="btn primary" style={{marginTop:8}}>Choose</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
