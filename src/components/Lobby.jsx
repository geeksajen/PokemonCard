import React, { useState } from 'react';

const themes = [
  { id: 'fire', name: '🔥 烈焰突擊', color: 'rgba(239, 68, 68, 0.8)' },
  { id: 'water', name: '💧 水花四濺', color: 'rgba(59, 130, 246, 0.8)' },
  { id: 'grass', name: '🌿 藤蔓生長', color: 'rgba(34, 197, 94, 0.8)' },
  { id: 'electric', name: '⚡ 十萬伏特', color: 'rgba(234, 179, 8, 0.8)' }
];

const Lobby = ({ onStartGame }) => {
  const [p1Theme, setP1Theme] = useState('fire');
  const [p2Theme, setP2Theme] = useState('water');
  const [vsAI, setVsAI] = useState(true);

  const p1Color = themes.find(t => t.id === p1Theme).color;
  const p2Color = themes.find(t => t.id === p2Theme).color;

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden',
      color: 'white',
      fontFamily: "'Noto Sans TC', sans-serif"
    }}>
      {/* Background with split gradient */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: `linear-gradient(90deg, ${p1Color} 0%, #1a1a2e 50%, ${p2Color} 100%)`,
        opacity: 0.3,
        transition: 'background 0.5s ease',
        zIndex: -1
      }} />

      <div style={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 10
      }}>
        <h1 style={{ fontSize: '4rem', margin: 0, textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>PKCard TCG</h1>
        <p style={{ fontSize: '1.5rem', opacity: 0.8, marginTop: '10px' }}>選擇您的主題牌組</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
          {[
            { id: true, label: '🤖 對戰電腦' },
            { id: false, label: '👥 雙人對戰' },
          ].map((m) => (
            <button
              key={String(m.id)}
              onClick={() => setVsAI(m.id)}
              style={{
                padding: '10px 24px',
                fontSize: '1.1rem',
                border: `2px solid ${vsAI === m.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)'}`,
                background: vsAI === m.id ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: 'white',
                borderRadius: '30px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: vsAI === m.id ? '0 0 15px var(--color-primary)' : 'none',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Player 1 Selection */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>玩家 1</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '300px' }}>
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => setP1Theme(t.id)}
              style={{
                padding: '15px 20px',
                fontSize: '1.2rem',
                border: `2px solid ${p1Theme === t.id ? t.color : 'rgba(255,255,255,0.2)'}`,
                background: p1Theme === t.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: 'white',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: p1Theme === t.id ? `0 0 15px ${t.color}` : 'none'
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* VS separator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100px' }}>
        <div style={{ fontSize: '3rem', fontWeight: 'bold', fontStyle: 'italic', textShadow: '0 0 20px rgba(255,255,255,0.8)' }}>VS</div>
      </div>

      {/* Player 2 Selection */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>{vsAI ? '🤖 電腦' : '玩家 2'}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '300px' }}>
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => setP2Theme(t.id)}
              style={{
                padding: '15px 20px',
                fontSize: '1.2rem',
                border: `2px solid ${p2Theme === t.id ? t.color : 'rgba(255,255,255,0.2)'}`,
                background: p2Theme === t.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: 'white',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: p2Theme === t.id ? `0 0 15px ${t.color}` : 'none'
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
      }}>
        <button
          onClick={() => onStartGame(p1Theme, p2Theme, vsAI)}
          style={{
            padding: '20px 60px',
            fontSize: '2rem',
            fontWeight: 'bold',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: '0 0 30px var(--color-primary)',
            transition: 'transform 0.2s'
          }}
          onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.target.style.transform = 'scale(1)'}
        >
          開始對戰
        </button>
      </div>

    </div>
  );
};

export default Lobby;
