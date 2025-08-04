import React from 'react';
import Lobby from './screens/Lobby';
import Showroom from './screens/Showroom';
import ProfileSelect from './screens/ProfileSelect';
import Results from './screens/Results';
import TicketView from './screens/TicketView';
import PrizeClaim from './screens/PrizeClaim';
import Settings from './screens/Settings';
import Leaderboard from './screens/Leaderboard';

type Screen =
  | 'lobby'
  | 'showroom'
  | 'profile'
  | 'ticket'
  | 'results'
  | 'prize'
  | 'settings'
  | 'leaderboard';

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
        <button onClick={() => setScreen('prize')}>🎉 Prize</button>
        <button onClick={() => setScreen('settings')}>⚙️ Settings</button>
        <button onClick={() => setScreen('leaderboard')}>🏆 Leaderboard</button>
      </header>

      {screen === 'lobby' && <Lobby />}
      {screen === 'showroom' && <Showroom />}
      {screen === 'profile' && <ProfileSelect />}
      {screen === 'ticket' && <TicketView />}
      {screen === 'results' && <Results />}
      {screen === 'prize' && <PrizeClaim />}
      {screen === 'settings' && <Settings />}
      {screen === 'leaderboard' && <Leaderboard />}
    </div>
  );
}

export default App;
