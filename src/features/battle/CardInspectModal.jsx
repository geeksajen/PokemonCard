import React, { useEffect, useCallback } from 'react';
import { CardTypes, EnergyTypes, getCardRarity } from '../../models/cards';

/* ---- 能量屬性色票（綁定 --palette-element-* tokens）---- */
const energyGradient = (type) => {
  const map = {
    [EnergyTypes.FIRE]:     'var(--palette-element-1)',
    [EnergyTypes.WATER]:    'var(--palette-element-2)',
    [EnergyTypes.GRASS]:    'var(--palette-element-3)',
    [EnergyTypes.ELECTRIC]: 'var(--palette-element-4)',
    [EnergyTypes.PSYCHIC]:  'var(--palette-element-5)',
    [EnergyTypes.FIGHTING]: 'var(--palette-element-6)',
    [EnergyTypes.NORMAL]:   'var(--palette-element-neutral)',
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
    border: '2px solid var(--theme-glass-border)',
    boxShadow: `var(--theme-shadow), inset 0 1px 2px rgba(255,255,255,0.3)`,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: `${size * 0.5}px`, flexShrink: 0,
  }} />
);

/* ---- HP 條 ---- */
const HpBar = ({ current, max }) => {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const color = pct > 50
    ? 'var(--color-success)'
    : pct > 25
      ? 'var(--color-energy)'
      : 'var(--color-danger)';
  return (
    <div style={{ width: '100%', height: '10px', background: 'var(--theme-panel-dark)', borderRadius: '5px', overflow: 'hidden' }}>
      <div style={{
        width: `${pct}%`, height: '100%',
        background: color,
        borderRadius: '5px',
        transition: 'width 0.4s ease',
        boxShadow: `0 0 8px ${color}`,
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
        ? 'var(--palette-class-trainer)'
        : 'var(--palette-class-item)';

  const rarity = getCardRarity(card);

  return (
    <div
      className="card-inspect-overlay"
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'var(--theme-panel-dark)',
        backdropFilter: 'var(--theme-blur)', WebkitBackdropFilter: 'var(--theme-blur)',
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
          boxShadow: rarity.inspectShadow,
        }}>
          <div style={{
            background: 'var(--theme-panel-dark)',
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
                    background: rarity.stageBadge?.gradient, color: '#000',
                    textShadow: rarity.stageBadge?.textShadow ?? 'none',
                  }}>
                    {rarity.stageBadge?.label}
                  </span>
                )}
              </div>
              {isPokemon && (
                <span style={{ fontSize: '1.1rem', color: 'var(--color-danger)', fontWeight: 800, textShadow: '0 0 10px var(--palette-player2-glow)' }}>
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
                  background: 'var(--theme-panel-light)', border: '1px solid var(--theme-glass-border)',
                }}>
                  {energyLabel(card.energyType)}
                </span>
              )}
              {isTrainerOrItem && (
                <span style={{
                  fontSize: '0.75rem', padding: '3px 10px', borderRadius: '12px',
                  background: 'var(--theme-panel-light)', border: '1px solid var(--theme-glass-border)',
                }}>
                  {card.type === CardTypes.TRAINER ? '👤 支援者' : '🎒 物品'}
                </span>
              )}
              {isEnergy && (
                <span style={{
                  fontSize: '0.75rem', padding: '3px 10px', borderRadius: '12px',
                  background: 'var(--theme-panel-light)', border: '1px solid var(--theme-glass-border)',
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
                <div style={{ width: '80%', height: '120px', background: 'var(--theme-panel-light)', borderRadius: '12px' }} />
              )}
            </div>

            {/* ---- 寶可夢技能區 ---- */}
            {isPokemon && card.attack && (
              <div style={{
                background: 'var(--theme-panel-base)', borderRadius: '12px', padding: '14px',
                border: '1px solid var(--theme-glass-border)', position: 'relative', zIndex: 1,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{card.attack.name}</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-danger)', textShadow: '0 0 8px var(--palette-player2-glow)' }}>
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

            {/* ---- 弱點 / 抵抗力（欄位不存在則不顯示）---- */}
            {isPokemon && (card.weakness || card.resistance) && (
              <div style={{ display: 'flex', gap: '20px', marginTop: '12px', position: 'relative', zIndex: 1 }}>
                {card.weakness && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>弱點</span>
                    <EnergyOrb type={card.weakness.type} size={20} />
                    <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>{card.weakness.value}</span>
                  </div>
                )}
                {card.resistance && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>抵抗力</span>
                    <EnergyOrb type={card.resistance.type} size={20} />
                    <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>{card.resistance.value}</span>
                  </div>
                )}
              </div>
            )}

            {/* ---- 訓練家 / 物品 效果描述 ---- */}
            {isTrainerOrItem && card.description && (
              <div style={{
                background: 'var(--theme-panel-base)', borderRadius: '12px', padding: '14px',
                border: '1px solid var(--theme-glass-border)', position: 'relative', zIndex: 1,
              }}>
                <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: 1.5, color: 'var(--theme-text-main)' }}>
                  {card.description}
                </p>
              </div>
            )}

            {/* ---- 附加能量 ---- */}
            {isPokemon && card.attachedEnergy && card.attachedEnergy.length > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px',
                padding: '8px 12px', background: 'var(--theme-panel-base)', borderRadius: '8px',
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
                進化自：<span style={{ color: 'var(--theme-text-main)' }}>{card.evolvesFrom}</span>
              </div>
            )}
          </div>
        </div>

        {/* ---- 關閉提示 ---- */}
        <div style={{
          fontSize: '0.8rem', color: 'var(--theme-text-muted)',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <kbd style={{
            padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem',
            background: 'var(--theme-panel-light)', border: '1px solid var(--theme-glass-border)',
          }}>ESC</kbd>
          或點擊空白處關閉
        </div>
      </div>
    </div>
  );
};

export default CardInspectModal;
