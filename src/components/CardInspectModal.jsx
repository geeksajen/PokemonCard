import React, { useEffect, useCallback } from 'react';
import { CardTypes, EnergyTypes } from '../models/cards';

/* ---- 能量屬性色票（複用 Card.jsx 的配色）---- */
const energyGradient = (type) => {
  const map = {
    [EnergyTypes.FIRE]:     'linear-gradient(135deg, #f87171, #dc2626)',
    [EnergyTypes.WATER]:    'linear-gradient(135deg, #60a5fa, #2563eb)',
    [EnergyTypes.GRASS]:    'linear-gradient(135deg, #4ade80, #16a34a)',
    [EnergyTypes.ELECTRIC]: 'linear-gradient(135deg, #facc15, #ca8a04)',
    [EnergyTypes.PSYCHIC]:  'linear-gradient(135deg, #c084fc, #9333ea)',
    [EnergyTypes.FIGHTING]: 'linear-gradient(135deg, #fb923c, #c2410c)',
    [EnergyTypes.NORMAL]:   'linear-gradient(135deg, #9ca3af, #4b5563)',
  };
  return map[type] || map[EnergyTypes.NORMAL];
};

const energyLabel = (type) => {
  const map = {
    [EnergyTypes.FIRE]: '🔥 火', [EnergyTypes.WATER]: '💧 水',
    [EnergyTypes.GRASS]: '🌿 草', [EnergyTypes.ELECTRIC]: '⚡ 雷',
    [EnergyTypes.PSYCHIC]: '🔮 超能', [EnergyTypes.FIGHTING]: '👊 格鬥',
    [EnergyTypes.NORMAL]: '⭐ 無色',
  };
  return map[type] || '⭐ 無色';
};

const energyEmoji = (type) => {
  const map = {
    [EnergyTypes.FIRE]: '🔥', [EnergyTypes.WATER]: '💧',
    [EnergyTypes.GRASS]: '🌿', [EnergyTypes.ELECTRIC]: '⚡',
    [EnergyTypes.PSYCHIC]: '🔮', [EnergyTypes.FIGHTING]: '👊',
    [EnergyTypes.NORMAL]: '⭐',
  };
  return map[type] || '⭐';
};

/* ---- 能量圓球小元件 ---- */
const EnergyOrb = ({ type, size = 22 }) => (
  <div style={{
    width: `${size}px`, height: `${size}px`, borderRadius: '50%',
    background: energyGradient(type),
    border: '2px solid rgba(255,255,255,0.6)',
    boxShadow: `0 2px 8px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.3)`,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: `${size * 0.5}px`, flexShrink: 0,
  }} />
);

/* ---- HP 條 ---- */
const HpBar = ({ current, max }) => {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const color = pct > 50 ? '#22c55e' : pct > 25 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ width: '100%', height: '10px', background: 'rgba(0,0,0,0.4)', borderRadius: '5px', overflow: 'hidden' }}>
      <div style={{
        width: `${pct}%`, height: '100%',
        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
        borderRadius: '5px',
        transition: 'width 0.4s ease',
        boxShadow: `0 0 8px ${color}88`,
      }} />
    </div>
  );
};

/* ============================================================
   CardInspectModal — 沉浸式卡牌檢視器
   ============================================================ */
const CardInspectModal = ({ card, onClose }) => {
  // ESC 關閉
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!card) return null;

  const isPokemon = card.type === CardTypes.POKEMON;
  const isEnergy = card.type === CardTypes.ENERGY;
  const isTrainerOrItem = card.type === CardTypes.TRAINER || card.type === CardTypes.ITEM;

  // 卡牌邊框色
  const accentColor = isPokemon
    ? energyGradient(card.energyType)
    : isEnergy
      ? energyGradient(card.energyType)
      : card.type === CardTypes.TRAINER
        ? 'linear-gradient(135deg, #14b8a6, #0f766e)'
        : 'linear-gradient(135deg, #f59e0b, #b45309)';

  // Stage 標籤
  const stageLabel = card.stage === 2 ? '二階進化' : card.stage === 1 ? '一階進化' : '基礎';
  const stageGradient = card.stage === 2
    ? 'linear-gradient(90deg, #38bdf8, #fcd34d)'
    : card.stage === 1
      ? 'linear-gradient(90deg, #a855f7, #eab308)'
      : 'linear-gradient(90deg, #64748b, #94a3b8)';

  return (
    <div
      className="card-inspect-overlay"
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(2, 6, 23, 0.75)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      <div
        className="card-inspect-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
          maxWidth: '380px', width: '90vw',
          cursor: 'default',
        }}
      >
        {/* ---- 卡牌大圖 ---- */}
        <div className="card-inspect-card-frame" style={{
          background: accentColor,
          borderRadius: '16px',
          padding: '4px',
          boxShadow: card.stage === 2
            ? '0 0 40px rgba(56, 189, 248, 0.6), 0 0 80px rgba(251, 191, 36, 0.3), 0 20px 60px rgba(0,0,0,0.5)'
            : card.stage === 1
              ? '0 0 30px rgba(234, 179, 8, 0.5), 0 20px 60px rgba(0,0,0,0.5)'
              : '0 20px 60px rgba(0,0,0,0.6)',
        }}>
          <div style={{
            background: 'linear-gradient(180deg, rgba(15,23,42,0.85), rgba(30,41,59,0.95))',
            borderRadius: '13px',
            padding: '20px',
            width: '320px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* 屬性光暈 */}
            {isPokemon && (
              <div style={{
                position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px',
                background: energyGradient(card.energyType), filter: 'blur(50px)', opacity: 0.35,
              }} />
            )}

            {/* 標題列 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {card.name}
                </h2>
                {isPokemon && (
                  <span style={{
                    fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 700,
                    background: stageGradient, color: '#000',
                    textShadow: card.stage === 2 ? '0 0 3px rgba(255,255,255,0.6)' : 'none',
                  }}>
                    {stageLabel}
                  </span>
                )}
              </div>
              {isPokemon && (
                <span style={{ fontSize: '1.1rem', color: '#ef4444', fontWeight: 800, textShadow: '0 0 10px rgba(239,68,68,0.5)' }}>
                  HP {card.currentHp}/{card.maxHp || card.hp}
                </span>
              )}
            </div>

            {/* HP 條 */}
            {isPokemon && <HpBar current={card.currentHp} max={card.maxHp || card.hp} />}

            {/* 屬性類別標籤 */}
            <div style={{ display: 'flex', gap: '8px', margin: '10px 0', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
              {isPokemon && (
                <span style={{
                  fontSize: '0.75rem', padding: '3px 10px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                }}>
                  {energyLabel(card.energyType)}
                </span>
              )}
              {isTrainerOrItem && (
                <span style={{
                  fontSize: '0.75rem', padding: '3px 10px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                }}>
                  {card.type === CardTypes.TRAINER ? '👤 支援者' : '🎒 物品'}
                </span>
              )}
              {isEnergy && (
                <span style={{
                  fontSize: '0.75rem', padding: '3px 10px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                }}>
                  {energyLabel(card.energyType)} 能量
                </span>
              )}
            </div>

            {/* 大圖 */}
            <div style={{
              width: '100%', height: '180px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '8px 0', position: 'relative', zIndex: 1,
            }}>
              {card.image ? (
                <img src={card.image} alt={card.name} style={{
                  maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.6))',
                }} />
              ) : isEnergy ? (
                <div style={{
                  width: '100px', height: '100px', borderRadius: '50%',
                  background: energyGradient(card.energyType),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '3rem',
                  boxShadow: '0 0 30px rgba(255,255,255,0.2)',
                }}>
                  {energyEmoji(card.energyType)}
                </div>
              ) : isTrainerOrItem ? (
                <div style={{ fontSize: '5rem', textShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                  {card.type === CardTypes.ITEM ? '🎒' : '👤'}
                </div>
              ) : (
                <div style={{ width: '80%', height: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }} />
              )}
            </div>

            {/* ---- 寶可夢技能區 ---- */}
            {isPokemon && card.attack && (
              <div style={{
                background: 'rgba(0,0,0,0.35)', borderRadius: '12px', padding: '14px',
                border: '1px solid rgba(255,255,255,0.08)', position: 'relative', zIndex: 1,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{card.attack.name}</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ef4444', textShadow: '0 0 8px rgba(239,68,68,0.4)' }}>
                    {card.attack.damage}
                  </span>
                </div>
                {/* 能量費用 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>費用：</span>
                  {card.attack.cost.map((costType, i) => (
                    <EnergyOrb key={i} type={costType} size={20} />
                  ))}
                </div>
                {/* 技能描述（如有） */}
                {card.attack.description && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '6px 0 0', lineHeight: 1.4 }}>
                    {card.attack.description}
                  </p>
                )}
              </div>
            )}

            {/* ---- 訓練家 / 物品 效果描述 ---- */}
            {isTrainerOrItem && card.description && (
              <div style={{
                background: 'rgba(0,0,0,0.35)', borderRadius: '12px', padding: '14px',
                border: '1px solid rgba(255,255,255,0.08)', position: 'relative', zIndex: 1,
              }}>
                <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: 1.5, color: 'rgba(255,255,255,0.9)' }}>
                  {card.description}
                </p>
              </div>
            )}

            {/* ---- 附加能量 ---- */}
            {isPokemon && card.attachedEnergy && card.attachedEnergy.length > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px',
                padding: '8px 12px', background: 'rgba(0,0,0,0.25)', borderRadius: '8px',
                position: 'relative', zIndex: 1,
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>已附加能量：</span>
                {card.attachedEnergy.map((energy, i) => (
                  <EnergyOrb key={i} type={energy.energyType} size={20} />
                ))}
              </div>
            )}

            {/* ---- 進化來源 ---- */}
            {isPokemon && card.evolvesFrom && (
              <div style={{
                marginTop: '10px', fontSize: '0.75rem', color: 'var(--color-text-muted)',
                position: 'relative', zIndex: 1,
              }}>
                進化自：<span style={{ color: 'var(--color-text)' }}>{card.evolvesFrom}</span>
              </div>
            )}
          </div>
        </div>

        {/* ---- 關閉提示 ---- */}
        <div style={{
          fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <kbd style={{
            padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem',
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          }}>ESC</kbd>
          或點擊空白處關閉
        </div>
      </div>
    </div>
  );
};

export default CardInspectModal;
