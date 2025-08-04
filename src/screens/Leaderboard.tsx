import React from 'react';

const Leaderboard: React.FC = () => {
  const leaders = [
    { name: 'RiyaRocks', score: 1050 },
    { name: 'ShatirSingh', score: 980 },
    { name: 'AviExpress', score: 930 }
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🏆 Leaderboard</h2>
      <ul>
        {leaders.map((l, i) => (
          <li key={i}>
            #{i + 1} {l.name} – {l.score} pts
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
