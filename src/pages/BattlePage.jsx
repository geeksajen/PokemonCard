import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GameArena from '../features/battle/GameArena';
import { activePack } from '../themes/active';
import { useStatsStore } from '../store';
import { cardRepository } from '../api/CardRepository';
import { getDominantEnergy } from '../utils/deckInsights';

function BattlePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const recordResult = useStatsStore((s) => s.recordResult);

  const fallbackThemes = activePack.starterDecks;
  const state = location.state || {};
  const p1Theme = state.p1Theme || fallbackThemes[0]?.id;
  const p2Theme = state.p2Theme || fallbackThemes[1]?.id || fallbackThemes[0]?.id;
  const vsAI = state.vsAI !== false;
  const weaknessEnabled = state.weaknessEnabled !== false; // 預設啟用

  const handleReturnLobby = () => {
    navigate('/');
  };

  // 結算時記錄生涯戰績（以人類玩家＝player1 視角；p1Theme 為字串＝starter 屬性，物件＝自訂牌組）
  const handleGameOver = ({ winner, winReason }) => {
    if (!vsAI) return; // 連線/熱座模式暫不記錄
    const p1Element = typeof p1Theme === 'string'
      ? p1Theme
      : getDominantEnergy(p1Theme.cardIds, cardRepository.getAllCards());
    recordResult({
      won: winner === 'player1',
      element: p1Element,
      opponent: '🤖 電腦',
      winReason,
    });
  };

  return (
    <div className="battle-page">
      <GameArena
        p1Theme={p1Theme}
        p2Theme={p2Theme}
        vsAI={vsAI}
        weaknessEnabled={weaknessEnabled}
        onReturnLobby={handleReturnLobby}
        onGameOver={handleGameOver}
      />
    </div>
  );
}

export default BattlePage;
