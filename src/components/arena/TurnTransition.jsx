import React from 'react';

const TurnTransition = ({ isPlayer1Turn, onContinue }) => (
  <div className="turn-transition-overlay" onClick={onContinue} style={{ cursor: 'pointer' }}>
    <h1 style={{ fontSize: '4rem', marginBottom: '20px', color: isPlayer1Turn ? '#60a5fa' : '#f87171' }}>
      換 {isPlayer1Turn ? '玩家 1' : '玩家 2'} 的回合了！
    </h1>
    <p style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.7)', animation: 'pulse 2s infinite' }}>
      (點擊畫面任意處繼續)
    </p>
  </div>
);

export default TurnTransition;
