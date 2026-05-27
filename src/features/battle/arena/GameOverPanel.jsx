import React from 'react';

// 結算原因文案（以「勝方視角」描述）。winReason 為引擎層的中立 enum。
const REASON_TEXT = {
  prizes:    '成功拿取了所有獎賞卡！',
  bench_out: '對手備戰區已無寶可夢可上場！',
  deck_out:  '對手牌組耗盡，無法抽牌！',
};

const GameOverPanel = ({ winner, winReason, vsAI = false, onRematch, onReview, onShowLog }) => {
  const humanWon = winner === 'player1';
  const title = vsAI
    ? (humanWon ? '🏆 你獲勝了！' : '😢 電腦獲勝…')
    : `🏆 玩家 ${humanWon ? '1' : '2'} 獲得勝利！`;
  const titleColor = vsAI && !humanWon ? 'var(--color-danger)' : 'var(--color-energy)';

  return (
    <div className="game-over-backdrop">
      <div className="game-over-panel">
        <h1 style={{ fontSize: '2.2rem', margin: 0, color: titleColor, textAlign: 'center' }}>
          {title}
        </h1>
        <p style={{ fontSize: '1.05rem', margin: '4px 0 8px', color: 'var(--theme-text-main)', textAlign: 'center' }}>
          {REASON_TEXT[winReason] ?? '對戰結束。'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <button className="game-over-btn game-over-btn-primary" onClick={onRematch}>
            🎮 再來一局
          </button>
          <button className="game-over-btn" onClick={onReview}>
            👁️ 檢視最終盤面
          </button>
          <button className="game-over-btn" onClick={onShowLog}>
            📜 查看對戰紀錄
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverPanel;
