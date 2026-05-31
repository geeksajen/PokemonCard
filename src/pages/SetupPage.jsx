import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCardStore } from '../store';
import { activePack } from '../themes/active';
import { cardRepository } from '../api/CardRepository';
import { getDominantEnergy, elementColorVar, elementEmoji } from '../utils/deckInsights';
import { sfxBattleStart } from '../utils/sounds';
import DeckBoxCarousel from '../features/lobby/DeckBoxCarousel';
import '../features/lobby/lobby.css';

const themes = activePack.starterDecks;

function SetupPage() {
  const navigate = useNavigate();
  const { decks, setSelectedDeck } = useCardStore();
  const allCards = useMemo(() => cardRepository.getAllCards(), []);
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

  // 牌盒輪播選項：依牌組主要能量屬性上色與配圖示（starter 的 id 即屬性 key）
  const deckBoxOptions = useMemo(() => allThemes.map((t) => {
    const element = t.isCustom ? getDominantEnergy(t.deck.cardIds, allCards) : t.id;
    return { id: t.id, name: t.name, boxColor: elementColorVar(element), emoji: elementEmoji(element) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [decks, allCards]);

  // 選 P1 牌組時同步更新大廳「目前選定牌組」（自訂牌組才有 deckId 可供王牌看板讀取）
  const handleSelectP1 = (id) => {
    setP1Theme(id);
    const t = allThemes.find((x) => x.id === id);
    setSelectedDeck(t?.isCustom ? t.deck.deckId : null);
  };

  // P1 牌組主要屬性（驅動出戰按鈕的屬性光環）
  const p1Element = useMemo(() => {
    const t = allThemes.find((x) => x.id === p1Theme);
    if (!t) return 'normal';
    return (t.isCustom ? getDominantEnergy(t.deck.cardIds, allCards) : t.id) || 'normal';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p1Theme, decks, allCards]);

  const p1Color = allThemes.find(t => t.id === p1Theme)?.color || themes[0].color;
  const p2Color = allThemes.find(t => t.id === p2Theme)?.color || themes[1].color;

  const handleStart = () => {
    sfxBattleStart(); // 爆發性點擊回饋音
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
          <DeckBoxCarousel options={deckBoxOptions} selectedId={p1Theme} onSelect={handleSelectP1} />
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
          <DeckBoxCarousel options={deckBoxOptions} selectedId={p2Theme} onSelect={setP2Theme} />
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
          className={`battle-btn battle-btn-${p1Element}`}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="battle-particle"
              style={{ left: `${12 + i * 14}%`, animationDelay: `${i * 0.32}s` }}
            />
          ))}
          <span className="battle-btn-label">確認出戰 ⚔️</span>
        </button>
      </div>
    </div>
  );
}

export default SetupPage;
