import React, { useEffect, useState } from 'react';

// 準備階段結束後：翻牌 + 擲硬幣決定先攻的過場動畫。
// 硬幣結果由規則層 (resolveSetup) 決定後傳入，此處僅負責呈現並在結束時呼叫 onDone。
const CoinFlipScreen = ({ firstPlayer, firstPlayerLabel, onDone }) => {
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const revealTimer = setTimeout(() => setShowResult(true), 1500);
    const doneTimer = setTimeout(() => onDone && onDone(), 3300);
    return () => {
      clearTimeout(revealTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  const accent = firstPlayer === 'player1' ? 'var(--palette-player1)' : 'var(--palette-player2)';
  const glow = firstPlayer === 'player1' ? 'var(--palette-player1-glow)' : 'var(--palette-player2-glow)';

  return (
    <div
      onClick={onDone}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9999, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '40px',
        background: 'var(--theme-panel-dark)', backdropFilter: 'blur(4px)',
        cursor: 'pointer', perspective: '800px',
      }}
    >
      <div
        className="coin-flip-spin"
        style={{
          width: '140px', height: '140px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '4rem',
          background: 'var(--palette-element-4)',
          border: '6px solid var(--palette-card-back-accent)',
          boxShadow: '0 0 40px var(--palette-element-4), inset 0 0 20px rgba(0,0,0,0.3)',
        }}
      >
        🪙
      </div>

      {showResult ? (
        <div className="coin-result-in" style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: '4rem', margin: 0, color: accent,
            textShadow: `3px 3px 0 #000, 0 0 30px ${glow}`,
            fontStyle: 'italic', fontWeight: 900, letterSpacing: '4px',
          }}>
            {firstPlayerLabel} 先攻！
          </h1>
          <p style={{
            marginTop: '16px', fontSize: '1.2rem', color: 'var(--theme-text-main)',
            opacity: 0.85, animation: 'pulse 1.5s infinite',
          }}>
            （點擊畫面任意處開始）
          </p>
        </div>
      ) : (
        <h2 style={{
          fontSize: '2rem', color: 'var(--theme-text-main)',
          textShadow: '0 2px 4px rgba(0,0,0,0.8)', letterSpacing: '2px',
        }}>
          擲硬幣決定先攻…
        </h2>
      )}
    </div>
  );
};

export default CoinFlipScreen;
