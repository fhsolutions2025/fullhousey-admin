import React from 'react';
import Lobby from './screens/Lobby';
import Showroom from './screens/Showroom';
import ProfileSelect from './screens/ProfileSelect';
import Results from './screens/Results';
import TicketView from './screens/TicketView';

type Screen = 'lobby' | 'showroom' | 'profile' | 'results' | 'ticket';

function App() {
  const [screen, setScreen] = React.useState<Screen>('lobby');

  return (
    <div style={{ padding: '1rem' }}>
      <header style={{ marginBottom: '1rem' }}>
        <button onClick={() => setScreen('lobby')}>🏠 Lobby</button>
        <button onClick={() => setScreen('showroom')}>🎭 Showroom</button>
        <button onClick={() => setScreen('profile')}>🧑 Profile</button>
        <button onClick={() => setScreen('ticket')}>🎫 Ticket</button>
        <button onClick={() => setScreen('results')}>🏁 Results</button>
      </header>

      {screen === 'lobby' && <Lobby />}
      {screen === 'showroom' && <Showroom />}
      {screen === 'profile' && <ProfileSelect />}
      {screen === 'ticket' && <TicketView />}
      {screen === 'results' && <Results />}
    </div>
  );
}

export default App;
