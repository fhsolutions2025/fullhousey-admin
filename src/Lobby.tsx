// screen ready


import React from 'react';

const Lobby: React.FC = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>🎉 Welcome to FullHousey!</h1>
      <p>Choose your show, join a game, or explore what's trending.</p>
      <button style={{ marginTop: '1rem' }}>Enter Showroom</button>
    </div>
  );
};

export default Lobby;
