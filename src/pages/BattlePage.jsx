import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import GameArena from '../features/battle/GameArena';

function BattlePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const p1Theme = searchParams.get('p1') || 'fire';
  const p2Theme = searchParams.get('p2') || 'water';
  const vsAI = searchParams.get('vsAI') !== 'false';

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
