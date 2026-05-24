import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCardStore } from '../store';

const themes = [
  { id: 'fire',     name: '🔥 烈焰突擊', color: 'rgba(239, 68, 68, 0.8)' },
  { id: 'water',    name: '💧 水花四濺', color: 'rgba(59, 130, 246, 0.8)' },
  { id: 'grass',    name: '🌿 藤蔓生長', color: 'rgba(34, 197, 94, 0.8)' },
  { id: 'electric', name: '⚡ 十萬伏特', color: 'rgba(234, 179, 8, 0.8)' },
];

function DeckList({ themes, selected, onSelect }) {
  return (
    <div style={{
      maxHeight: '360px', overflowY: 'auto', width: '100%', maxWidth: '280px',
      display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '6px',
    }}>
      {themes.map(t => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          style={{
            padding: '14px 18px', fontSize: '1.05rem',
            border: `2px solid ${selected === t.id ? t.color : 'rgba(255,255,255,0.15)'}`,
            background: selected === t.id ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
            color: 'white', borderRadius: '12px', cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: selected === t.id ? `0 0 15px ${t.color}` : 'none',
            textAlign: 'left',
          }}
        >
          {t.name}
        </button>
      ))}
    </div>
  );
}

function SetupPage() {
  const navigate = useNavigate();
  const { decks } = useCardStore();
  const [p1Theme, setP1Theme] = useState('fire');
  const [p2Theme, setP2Theme] = useState('water');
  const [vsAI, setVsAI]       = useState(true);

  const customThemes = decks.map(d => ({
    id: `custom_${d.deckId}`,
    name: `🛠️ ${d.deckName}`,
    color: 'rgba(139, 92, 246, 0.8)',
    isCustom: true,
    deck: d,
  }));
  const allThemes = [...themes, ...customThemes];

  const p1Color = allThemes.find(t => t.id === p1Theme)?.color || themes[0].color;
  const p2Color = allThemes.find(t => t.id === p2Theme)?.color || themes[1].color;

  const handleStart = () => {
    const finalP1 = p1Theme.startsWith('custom_')
      ? customThemes.find(t => t.id === p1Theme).deck
      : p1Theme;
    const finalP2 = p2Theme.startsWith('custom_')
      ? customThemes.find(t => t.id === p2Theme).deck
      : p2Theme;
    navigate('/battle', { state: { p1Theme: finalP1, p2Theme: finalP2, vsAI } });
  };

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden',
      position: 'relative', background: '#060918',
      display: 'flex', flexDirection: 'column',
      color: 'white', fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Split colour background */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: `linear-gradient(90deg, ${p1Color} 0%, rgba(6,9,24,0.95) 50%, ${p2Color} 100%)`,
        opacity: 0.25, transition: 'background 0.5s ease', pointerEvents: 'none',
      }} />

      {/* Header bar */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '14px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(6,9,24,0.7)', backdropFilter: 'blur(12px)',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
            color: 'white', borderRadius: '8px', padding: '8px 16px',
            cursor: 'pointer', fontSize: '0.9rem',
          }}
        >
          ← 返回大廳
        </button>

        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{
            fontSize: '1.3rem', fontWeight: 800, letterSpacing: '0.1em',
            background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            對戰設定
          </span>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[{ id: true, label: '🤖 電腦' }, { id: false, label: '👥 雙人' }].map(m => (
            <button
              key={String(m.id)}
              onClick={() => setVsAI(m.id)}
              style={{
                padding: '8px 20px', fontSize: '0.9rem',
                border: `2px solid ${vsAI === m.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)'}`,
                background: vsAI === m.id ? 'rgba(59,130,246,0.2)' : 'transparent',
                color: 'white', borderRadius: '30px', cursor: 'pointer',
                boxShadow: vsAI === m.id ? '0 0 12px rgba(59,130,246,0.5)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content: P1 | VS | P2 */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', zIndex: 5 }}>
        {/* Player 1 */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '2rem',
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>
            玩家 1
          </h2>
          <DeckList themes={allThemes} selected={p1Theme} onSelect={setP1Theme} />
        </div>

        {/* VS divider */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          width: '120px', gap: '16px',
        }}>
          <div style={{
            width: '2px', height: '80px',
            background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.25))',
          }} />
          <div style={{
            fontSize: '3.5rem', fontWeight: 900, fontStyle: 'italic',
            background: 'linear-gradient(180deg, #f8fafc 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))',
          }}>
            VS
          </div>
          <div style={{
            width: '2px', height: '80px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.25), transparent)',
          }} />
        </div>

        {/* Player 2 / AI */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '2rem',
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>
            {vsAI ? '🤖 電腦' : '玩家 2'}
          </h2>
          <DeckList themes={allThemes} selected={p2Theme} onSelect={setP2Theme} />
        </div>
      </div>

      {/* Confirm footer */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', justifyContent: 'center', padding: '20px 24px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(6,9,24,0.7)', backdropFilter: 'blur(12px)',
      }}>
        <button
          onClick={handleStart}
          style={{
            padding: '18px 80px', fontSize: '1.5rem', fontWeight: 800,
            letterSpacing: '0.08em',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            color: 'white', border: 'none', borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: '0 0 30px rgba(59,130,246,0.5)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 0 50px rgba(59,130,246,0.8)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(59,130,246,0.5)';
          }}
        >
          確認出戰 ⚔️
        </button>
      </div>
    </div>
  );
}

export default SetupPage;
