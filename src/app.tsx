import React from 'react';
import Lobby from './screens/Lobby';
import Showroom from './screens/Showroom';

function App() {
  const [screen, setScreen] = React.useState<'lobby' | 'showroom'>('lobby');

  return (
    <div style={{ padding: '1rem' }}>
      <header style={{ marginBottom: '1rem' }}>
        <button onClick={() => setScreen('lobby')}>🏠 Lobby</button>
        <button onClick={() => setScreen('showroom')}>🎭 Showroom</button>
      </header>

      {screen === 'lobby' && <Lobby />}
      {screen === 'showroom' && <Showroom />}
    </div>
  );
}

export default App;
