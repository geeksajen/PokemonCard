import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store';

const STARS_COUNT = 90;

const ACE_POKEMON = {
  fire:     { name: '噴火龍', image: '/images/charizard.png',  glow: 'rgba(239, 68, 68, 0.45)' },
  water:    { name: '水箭龜', image: '/images/blastoise.png',  glow: 'rgba(59, 130, 246, 0.45)' },
  grass:    { name: '妙蛙花', image: '/images/venusaur.png',   glow: 'rgba(34, 197, 94, 0.45)' },
  electric: { name: '雷丘',   image: '/images/raichu.png',     glow: 'rgba(234, 179, 8, 0.45)' },
};

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
        borderRadius: '50%', background: 'white',
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

  const ace = ACE_POKEMON.fire;

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
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden',
      position: 'relative', background: '#060918',
      fontFamily: "'Inter', system-ui, sans-serif", color: 'white',
    }}>
      {/* ── Starfield ── */}
      <StarField stars={stars} />

      {/* Nebula ambient glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(ellipse at 72% 48%, rgba(59,82,200,0.14) 0%, transparent 58%)',
        pointerEvents: 'none',
      }} />

      {/* ── Top status bar ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        display: 'flex', alignItems: 'center',
        padding: '14px 28px',
        background: 'linear-gradient(180deg, rgba(6,9,24,0.92) 0%, transparent 100%)',
      }}>
        {/* Player card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem',
            border: '2px solid rgba(59,130,246,0.55)',
            boxShadow: '0 0 14px rgba(59,130,246,0.4)',
          }}>
            🎴
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '0.01em' }}>
              {currentUser?.username || '玩家'}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '3px' }}>
              <span style={{
                fontSize: '0.72rem', padding: '2px 7px', borderRadius: '4px',
                background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(59,130,246,0.4)',
                color: '#60a5fa', fontWeight: 600,
              }}>
                Lv. 1
              </span>
              <span style={{ fontSize: '0.78rem', color: '#fbbf24', alignSelf: 'center' }}>
                💰 1,000
              </span>
            </div>
          </div>
        </div>

        {/* Game title (centred) */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{
            fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.12em',
            background: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 100%)',
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
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '14px',
                cursor: item.active ? 'pointer' : 'default',
                opacity: item.active ? 1 : 0.42,
                transition: 'background 0.2s, border-color 0.2s',
                backdropFilter: 'blur(10px)',
                color: 'white', textDecoration: 'none',
                minWidth: '170px',
              }}
              onMouseEnter={e => {
                if (item.active) {
                  e.currentTarget.style.background     = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.borderColor    = 'rgba(255,255,255,0.2)';
                }
              }}
              onMouseLeave={e => {
                if (item.active) {
                  e.currentTarget.style.background     = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor    = 'rgba(255,255,255,0.09)';
                }
              }}
            >
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.label}</div>
                <div style={{ fontSize: '0.7rem', color: item.active ? '#64748b' : '#475569', marginTop: '1px' }}>
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
        right: '18%', top: '50%', transform: 'translateY(-52%)',
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

        {/* Floating image */}
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

        {/* Frosted name badge */}
        <div style={{
          marginTop: '14px', padding: '8px 28px',
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.14)',
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
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
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
        <div style={{ fontSize: '0.78rem', color: '#475569', letterSpacing: '0.05em' }}>
          點擊開始對戰
        </div>
      </div>
    </div>
  );
}

export default HomePage;
