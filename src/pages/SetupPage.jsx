import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCardStore } from '../store';
import { activePack } from '../themes/active';

const themes = activePack.starterDecks;

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
            border: `2px solid ${selected === t.id ? t.color : 'var(--theme-glass-border)'}`,
            background: selected === t.id ? 'var(--theme-panel-base)' : 'var(--theme-panel-light)',
            color: 'var(--theme-text-main)', borderRadius: '12px', cursor: 'pointer',
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
  const [p1Theme, setP1Theme] = useState(themes[0]?.id ?? '');
  const [p2Theme, setP2Theme] = useState(themes[1]?.id ?? themes[0]?.id ?? '');
  const [weaknessEnabled, setWeaknessEnabled] = useState(true); // 屬性相剋，預設啟用
  const vsAI = true; // 雙人熱座模式暫時關閉（未來改為連線對戰）

  const customThemes = decks.map(d => ({
    id: `custom_${d.deckId}`,
    name: `🛠️ ${d.deckName}`,
    color: activePack.customDeckColor,
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
    navigate('/battle', { state: { p1Theme: finalP1, p2Theme: finalP2, vsAI, weaknessEnabled } });
  };

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden',
      position: 'relative', background: 'var(--page-setup-bg)',
      display: 'flex', flexDirection: 'column',
      color: 'var(--theme-text-main)', fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Split colour background — driven by selected deck colours */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: `linear-gradient(90deg, ${p1Color} 0%, transparent 50%, ${p2Color} 100%)`,
        opacity: 0.25, transition: 'background 0.5s ease', pointerEvents: 'none',
      }} />

      {/* Header bar */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '14px 24px',
        borderBottom: '1px solid var(--page-setup-divider)',
        background: 'var(--page-setup-overlay)', backdropFilter: 'var(--theme-blur)',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'var(--theme-panel-light)', border: '1px solid var(--theme-glass-border)',
            color: 'var(--theme-text-main)', borderRadius: '8px', padding: '8px 16px',
            cursor: 'pointer', fontSize: '0.9rem',
          }}
        >
          ← 返回大廳
        </button>

        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{
            fontSize: '1.3rem', fontWeight: 800, letterSpacing: '0.1em',
            background: 'linear-gradient(90deg, var(--color-primary-hover), var(--palette-class-stage1-mid))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            對戰設定
          </span>
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
            background: 'linear-gradient(180deg, transparent, var(--theme-glass-border))',
          }} />
          <div style={{
            fontSize: '3.5rem', fontWeight: 900, fontStyle: 'italic',
            background: 'linear-gradient(180deg, var(--theme-text-main) 0%, var(--theme-text-muted) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 20px var(--theme-glass-border))',
          }}>
            VS
          </div>
          <div style={{
            width: '2px', height: '80px',
            background: 'linear-gradient(180deg, var(--theme-glass-border), transparent)',
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
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
        padding: '20px 24px',
        borderTop: '1px solid var(--page-setup-divider)',
        background: 'var(--page-setup-overlay)', backdropFilter: 'var(--theme-blur)',
      }}>
        {/* 對戰選項：屬性相剋開關 */}
        <button
          onClick={() => setWeaknessEnabled(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 18px', borderRadius: '24px', cursor: 'pointer',
            fontSize: '0.95rem', fontWeight: 600,
            color: 'var(--theme-text-main)',
            background: 'var(--theme-panel-light)',
            border: `2px solid ${weaknessEnabled ? 'var(--palette-player1)' : 'var(--theme-glass-border)'}`,
            boxShadow: weaknessEnabled ? '0 0 12px var(--palette-player1-glow)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <span style={{
            width: '36px', height: '20px', borderRadius: '10px', flexShrink: 0,
            background: weaknessEnabled ? 'var(--palette-player1)' : 'var(--theme-panel-dark)',
            position: 'relative', transition: 'background 0.2s',
          }}>
            <span style={{
              position: 'absolute', top: '2px', left: weaknessEnabled ? '18px' : '2px',
              width: '16px', height: '16px', borderRadius: '50%', background: 'white',
              transition: 'left 0.2s',
            }} />
          </span>
          ⚔️ 啟用弱點與抵抗力 {weaknessEnabled ? '（開）' : '（關）'}
        </button>

        <button
          onClick={handleStart}
          style={{
            padding: '18px 80px', fontSize: '1.5rem', fontWeight: 800,
            letterSpacing: '0.08em',
            background: 'linear-gradient(135deg, var(--palette-player1) 0%, var(--palette-class-stage1-mid) 100%)',
            color: 'white', border: 'none', borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: '0 0 30px var(--palette-player1-glow)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 0 50px var(--palette-player1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 0 30px var(--palette-player1-glow)';
          }}
        >
          確認出戰 ⚔️
        </button>
      </div>
    </div>
  );
}

export default SetupPage;
