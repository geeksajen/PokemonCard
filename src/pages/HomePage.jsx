import React, { useState } from 'react';
import Lobby from '../components/Lobby';

function HomePage() {
  const [deckConfigs, setDeckConfigs] = useState({ p1: 'fire', p2: 'water', vsAI: true });

  const handleStartGame = (p1Theme, p2Theme, vsAI) => {
    setDeckConfigs({ p1: p1Theme, p2: p2Theme, vsAI });
    // Navigation will be handled by component
  };

  return (
    <div className="home-page">
      <Lobby onStartGame={handleStartGame} deckConfigs={deckConfigs} />
    </div>
  );
}

export default HomePage;
