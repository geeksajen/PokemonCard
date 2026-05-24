import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GameArena from '../features/battle/GameArena';

function BattlePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const p1Theme = state.p1Theme || 'fire';
  const p2Theme = state.p2Theme || 'water';
  const vsAI = state.vsAI !== false;

  const handleReturnLobby = () => {
    navigate('/');
  };

  return (
    <div className="battle-page">
      <GameArena
        p1Theme={p1Theme}
        p2Theme={p2Theme}
        vsAI={vsAI}
        onReturnLobby={handleReturnLobby}
      />
    </div>
  );
}

export default BattlePage;
