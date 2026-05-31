import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, useCardStore, useStatsStore } from '../store';
import { activePack } from '../themes/active';
import { cardRepository } from '../api/CardRepository';
import { getAceCard, getDominantEnergy, elementLabel, elementEmoji } from '../utils/deckInsights';
import PlayerStatsModal from '../features/lobby/PlayerStatsModal';

const STARS_COUNT = 90;

const NAV_ITEMS = [
  { icon: '🛠️', label: '卡牌工坊', sub: 'Collection / Studio', to: '/studio', active: true },
  { icon: '🎁', label: '商店',     sub: '即將開放',              to: null,      active: false },
  { icon: '📜', label: '任務',     sub: '即將開放',              to: null,      active: false },
];

function StarField({ stars }) {
  return stars.map(s => (
    <div
      key={s.id}
      style={{
        position: 'absolute',
        left: `${s.x}%`, top: `${s.y}%`,
        width: `${s.size}px`, height: `${s.size}px`,
        borderRadius: '50%', background: 'var(--page-lobby-starfield-color)',
        opacity: s.opacity,
        animation: `twinkle ${s.dur}s ease-in-out infinite alternate`,
        animationDelay: `${s.delay}s`,
        pointerEvents: 'none',
      }}
    />
  ));
}

function HomePage() {
  const navigate  = useNavigate();
  const { currentUser } = useAuthStore();
  const { decks, selectedDeckId } = useCardStore();
  const stats = useStatsStore();
  const { wins, games, elementCounts } = stats;
  const [showStats, setShowStats] = useState(false);

  const winRate = games > 0 ? Math.round((wins / games) * 100) : 0;
  const favElement = useMemo(() => {
    let top = null, max = 0;
    for (const [k, n] of Object.entries(elementCounts)) if (n > max) { max = n; top = k; }
    return top;
  }, [elementCounts]);

  // 滑鼠視差偏移（讓王牌看板有立體感）
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const handleParallax = (e) => {
    setParallax({
      x: (e.clientX / window.innerWidth - 0.5) * 30,
      y: (e.clientY / window.innerHeight - 0.5) * 20,
    });
  };

  // 動態王牌：掃描「目前選定牌組」(或第一個自訂牌組) 取出最具代表性的寶可夢；
  // 無自訂牌組或無立繪時，回退到主題包預設王牌。
  const allCards = useMemo(() => cardRepository.getAllCards(), []);
  const packAce = activePack.aceShowcase[activePack.defaultAceKey];
  const ace = useMemo(() => {
    const deck = decks.find((d) => d.deckId === selectedDeckId) || decks[0];
    if (!deck) return packAce;
    const aceCard = getAceCard(deck.cardIds, allCards);
    if (!aceCard || !aceCard.image) return packAce;
    const domEl = getDominantEnergy(deck.cardIds, allCards);
    const glow = activePack.aceShowcase[domEl]?.glow || 'var(--palette-player1-glow)';
    return { name: aceCard.name, image: aceCard.image, glow };
  }, [decks, selectedDeckId, allCards, packAce]);

  const stars = useMemo(() =>
    Array.from({ length: STARS_COUNT }, (_, i) => ({
      id: i,
      x:       Math.random() * 100,
      y:       Math.random() * 100,
      size:    Math.random() * 2 + 0.8,
      opacity: Math.random() * 0.5 + 0.2,
      dur:     Math.random() * 2 + 1.5,
      delay:   Math.random() * 3,
    })),
  []);

  return (
    <div
      onMouseMove={handleParallax}
      style={{
        width: '100vw', height: '100vh', overflow: 'hidden',
        position: 'relative', background: 'var(--page-lobby-bg)',
        fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--theme-text-main)',
      }}
    >
      {/* ── Starfield ── */}
      <StarField stars={stars} />

      {/* Nebula ambient glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(ellipse at 72% 48%, var(--page-lobby-nebula) 0%, transparent 58%)',
        pointerEvents: 'none',
      }} />

      {/* ── Top status bar ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        display: 'flex', alignItems: 'center',
        padding: '14px 28px',
        background: 'linear-gradient(180deg, var(--page-lobby-bg) 0%, transparent 100%)',
      }}>
        {/* Player card（點擊展開生涯戰績） */}
        <div
          onClick={() => setShowStats(true)}
          title="查看生涯戰績"
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            cursor: 'pointer', padding: '6px 12px 6px 6px', borderRadius: '14px',
            border: '1px solid var(--theme-glass-border)',
            background: 'var(--theme-panel-light)', backdropFilter: 'var(--theme-blur)',
          }}
        >
          <div style={{
            width: '46px', height: '46px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--palette-player1) 0%, var(--palette-class-stage1-mid) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem',
            border: '2px solid var(--palette-player1-glow)',
            boxShadow: '0 0 14px var(--palette-player1-glow)',
          }}>
            🎴
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '0.01em' }}>
                {currentUser?.username || '玩家'}
              </span>
              {favElement && (
                <span style={{
                  fontSize: '0.72rem', padding: '2px 8px', borderRadius: '10px',
                  background: 'color-mix(in srgb, var(--color-energy) 22%, transparent)',
                  border: '1px solid var(--color-energy)', color: 'var(--color-energy)', fontWeight: 700,
                }}>
                  {elementEmoji(favElement)} {elementLabel(favElement)}屬性訓練家
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '3px', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>🏆 {wins} 勝</span>
              <span style={{ color: 'var(--theme-text-muted)' }}>勝率 {winRate}%</span>
              <span style={{ color: 'var(--theme-text-muted)' }}>{games} 場</span>
            </div>
          </div>
        </div>

        {/* Game title (centred) */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{
            fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.12em',
            background: 'linear-gradient(90deg, var(--color-primary-hover) 0%, var(--palette-class-stage1-mid) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            PKCard TCG
          </span>
        </div>

        {/* Right spacer (mirrors player card width) */}
        <div style={{ width: '200px' }} />
      </div>

      {/* ── Left sidebar ── */}
      <div style={{
        position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
        zIndex: 20,
        display: 'flex', flexDirection: 'column', gap: '10px',
        padding: '28px 18px',
      }}>
        {NAV_ITEMS.map(item => {
          const inner = (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 22px',
                background: 'var(--theme-panel-light)',
                border: '1px solid var(--theme-glass-border)',
                borderRadius: '14px',
                cursor: item.active ? 'pointer' : 'default',
                opacity: item.active ? 1 : 0.42,
                transition: 'background 0.2s, border-color 0.2s',
                backdropFilter: 'var(--theme-blur)',
                color: 'var(--theme-text-main)', textDecoration: 'none',
                minWidth: '170px',
              }}
              onMouseEnter={e => {
                if (item.active) {
                  e.currentTarget.style.background  = 'var(--theme-panel-base)';
                }
              }}
              onMouseLeave={e => {
                if (item.active) {
                  e.currentTarget.style.background  = 'var(--theme-panel-light)';
                }
              }}
            >
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--theme-text-muted)', opacity: item.active ? 1 : 0.7, marginTop: '1px' }}>
                  {item.sub}
                </div>
              </div>
            </div>
          );

          return item.to
            ? <Link key={item.label} to={item.to} style={{ textDecoration: 'none' }}>{inner}</Link>
            : <div key={item.label}>{inner}</div>;
        })}
      </div>

      {/* ── Ace Pokémon showcase (centre-right) ── */}
      <div style={{
        position: 'absolute',
        right: '18%', top: '50%',
        transform: `translate(${parallax.x}px, calc(-52% + ${parallax.y}px))`,
        transition: 'transform 0.25s ease-out',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        zIndex: 10, pointerEvents: 'none',
      }}>
        {/* Radial floor glow */}
        <div style={{
          position: 'absolute', bottom: '-10px',
          width: '320px', height: '60px',
          background: ace.glow,
          borderRadius: '50%', filter: 'blur(28px)',
        }} />

        {/* Floating image (gracefully handles packs that haven't shipped art) */}
        {ace.image ? (
          <img
            src={ace.image}
            alt={ace.name}
            style={{
              width: '320px', height: '320px',
              objectFit: 'contain',
              imageRendering: 'pixelated',
              animation: 'floatPokemon 3s ease-in-out infinite alternate',
              filter: `drop-shadow(0 24px 48px ${ace.glow})`,
            }}
          />
        ) : (
          <div
            style={{
              width: '320px', height: '320px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '8rem',
              animation: 'floatPokemon 3s ease-in-out infinite alternate',
              filter: `drop-shadow(0 24px 48px ${ace.glow})`,
            }}
          >
            🃏
          </div>
        )}

        {/* Frosted name badge */}
        <div style={{
          marginTop: '14px', padding: '8px 28px',
          background: 'var(--theme-panel-light)',
          backdropFilter: 'var(--theme-blur)',
          border: '1px solid var(--theme-glass-border)',
          borderRadius: '30px',
          fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.06em',
          textShadow: '0 0 14px rgba(255,255,255,0.35)',
        }}>
          {ace.name}
        </div>
      </div>

      {/* ── PLAY button (bottom-right) ── */}
      <div style={{
        position: 'absolute', bottom: '60px', right: '60px',
        zIndex: 20,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
      }}>
        <button
          onClick={() => navigate('/setup')}
          style={{
            padding: '22px 68px', fontSize: '2rem', fontWeight: 900,
            letterSpacing: '0.18em',
            background: 'linear-gradient(135deg, var(--palette-player1) 0%, var(--palette-class-stage1-mid) 100%)',
            color: 'white', border: 'none', borderRadius: '60px',
            cursor: 'pointer',
            animation: 'playPulse 2s ease-in-out infinite',
            transition: 'transform 0.15s',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          PLAY ▶
        </button>
        <div style={{ fontSize: '0.78rem', color: 'var(--theme-text-muted)', letterSpacing: '0.05em' }}>
          點擊開始對戰
        </div>
      </div>

      {showStats && <PlayerStatsModal stats={stats} onClose={() => setShowStats(false)} />}
    </div>
  );
}

export default HomePage;
