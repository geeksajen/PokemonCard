import React, { useEffect, useState } from 'react';

const TurnTransition = ({ isPlayer1Turn, onContinue, vsAI }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 觸發 CSS 動畫
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const title = vsAI 
    ? (isPlayer1Turn ? 'YOUR TURN' : 'OPPONENT TURN')
    : (isPlayer1Turn ? 'PLAYER 1 TURN' : 'PLAYER 2 TURN');

  const bannerColor = isPlayer1Turn ? 'rgba(59, 130, 246, 0.9)' : 'rgba(239, 68, 68, 0.9)';
  const shadowColor = isPlayer1Turn ? 'rgba(59, 130, 246, 0.5)' : 'rgba(239, 68, 68, 0.5)';

  return (
    <div 
      className="turn-transition-overlay" 
      onClick={onContinue} 
      style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: mounted ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0)', 
        backdropFilter: mounted ? 'blur(4px)' : 'blur(0px)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        overflow: 'hidden'
      }}
    >
      {/* 橫幅背景色塊 */}
      <div style={{
        position: 'absolute',
        width: '120%', 
        height: '220px', 
        background: bannerColor,
        transform: `skewY(-5deg) translateX(${mounted ? '0' : '-100%'})`,
        transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        boxShadow: `0 0 50px ${shadowColor}, inset 0 0 20px rgba(255,255,255,0.2)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* 發光文字 */}
        <h1 style={{ 
          fontSize: '7rem', margin: 0, color: '#fff', 
          textShadow: `4px 4px 0 #000, 0 0 30px ${shadowColor}, 0 0 60px rgba(255,255,255,0.8)`,
          fontStyle: 'italic', letterSpacing: '8px',
          fontWeight: 900,
          transform: `skewY(5deg) scale(${mounted ? 1 : 0.8})`,
          transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s',
          whiteSpace: 'nowrap'
        }}>
          {title}
        </h1>
      </div>

      <p style={{ 
        position: 'absolute', bottom: '20%',
        fontSize: '1.5rem', color: 'rgba(255,255,255,0.9)', 
        fontWeight: 'bold',
        animation: 'pulse 1.5s infinite',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.3s ease 0.4s',
        textShadow: '0 2px 4px rgba(0,0,0,0.8)'
      }}>
        (點擊畫面任意處繼續)
      </p>
    </div>
  );
};

export default TurnTransition;
