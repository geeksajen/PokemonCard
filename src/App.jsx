import React, { useState } from 'react';
import GameArena from './components/GameArena';
import Lobby from './components/Lobby';

function App() {
  const [appState, setAppState] = useState('lobby'); // 'lobby' | 'playing'
  const [deckConfigs, setDeckConfigs] = useState({ p1: 'fire', p2: 'water' });

  const handleStartGame = (p1Theme, p2Theme) => {
    setDeckConfigs({ p1: p1Theme, p2: p2Theme });
    setAppState('playing');
  };

  return (
    <div className="app-container">
      {appState === 'lobby' ? (
        <Lobby onStartGame={handleStartGame} />
      ) : (
        <GameArena 
          p1Theme={deckConfigs.p1} 
          p2Theme={deckConfigs.p2} 
          onReturnLobby={() => setAppState('lobby')} 
        />
      )}
    </div>
  );
}

export default App;
