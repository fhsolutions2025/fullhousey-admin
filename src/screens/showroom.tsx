import React from 'react';

const Showroom: React.FC = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>🎭 FullHousey Showroom</h2>
      <p>Browse available live shows, avatar hosts, and featured games.</p>

      <div style={{ marginTop: '2rem' }}>
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
          <h3>Rani's Bingo Bonanza</h3>
          <p>Starts in: 10 minutes</p>
          <button>Join Now</button>
        </div>

        <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <h3>Avi’s Kala Karavan</h3>
          <p>Explore art-inspired gameplay and mellow vibes.</p>
          <button>Enter</button>
        </div>
      </div>
    </div>
  );
};

export default Showroom;
