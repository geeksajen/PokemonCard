import React from 'react';

const WinnerScreen = ({ winner, onReturnLobby }) => (
  <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    <h1 style={{ fontSize: '3rem', color: 'var(--color-primary)' }}>
      {winner === 'player1' ? '玩家 1' : '玩家 2'} 獲勝！
    </h1>
    <button onClick={onReturnLobby} style={{ marginTop: '2rem', padding: '1rem 2rem', fontSize: '1.2rem' }}>
      返回大廳
    </button>
  </div>
);

export default WinnerScreen;
