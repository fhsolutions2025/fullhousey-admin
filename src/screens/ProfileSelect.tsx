import React from 'react';

const profiles = [
  { key: 'gamesey', label: '🎮 Gamesey', desc: 'Win with wits, not just luck.' },
  { key: 'mainacts', label: '🎭 Main Acts', desc: 'Every round’s a performance!' },
  { key: 'bigwins', label: '💰 BIG Wins', desc: 'Big risk. Bigger rewards.' },
  { key: 'relaxed', label: '🌴 Relaxed', desc: 'Play easy, win breezy!' }
];

const ProfileSelect: React.FC = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Select Your FullHousey Profile</h2>
      <div style={{ marginTop: '1rem' }}>
        {profiles.map((p) => (
          <div key={p.key} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
            <h3>{p.label}</h3>
            <p>{p.desc}</p>
            <button>Select</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileSelect;
