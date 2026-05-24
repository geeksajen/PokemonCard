import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GameArena from '../features/battle/GameArena';
import { activePack } from '../themes/active';

function BattlePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const fallbackThemes = activePack.starterDecks;
  const state = location.state || {};
  const p1Theme = state.p1Theme || fallbackThemes[0]?.id;
  const p2Theme = state.p2Theme || fallbackThemes[1]?.id || fallbackThemes[0]?.id;
  const vsAI = state.vsAI !== false;
  const weaknessEnabled = state.weaknessEnabled !== false; // 預設啟用

  const handleReturnLobby = () => {
    navigate('/');
  };

  return (
    <div className="battle-page">
      <GameArena
        p1Theme={p1Theme}
        p2Theme={p2Theme}
        vsAI={vsAI}
        weaknessEnabled={weaknessEnabled}
        onReturnLobby={handleReturnLobby}
      />
    </div>
  );
}

export default BattlePage;
