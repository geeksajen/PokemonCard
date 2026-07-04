import React from 'react';
import { CardTypes, EnergyTypes, getCardRarity, getAttacks } from '../../models/cards';

const getEnergyColor = (type) => {
  switch (type) {
    case EnergyTypes.FIRE:     return 'var(--palette-element-1)';
    case EnergyTypes.WATER:    return 'var(--palette-element-2)';
    case EnergyTypes.GRASS:    return 'var(--palette-element-3)';
    case EnergyTypes.ELECTRIC: return 'var(--palette-element-4)';
    case EnergyTypes.PSYCHIC:  return 'var(--palette-element-5)';
    case EnergyTypes.FIGHTING: return 'var(--palette-element-6)';
    case EnergyTypes.NORMAL:   return 'var(--palette-element-neutral)';
    default:                   return 'var(--palette-element-neutral)';
  }
};

const Card = ({ card, onClick, isSelectable, isFaceDown, isEvolving = false, onField = false }) => {
  if (isFaceDown) {
    return (
      <div 
        style={{
          width: 'var(--card-width)',
          height: 'var(--card-height)',
          borderRadius: 'var(--card-border-radius)',
          background: 'var(--palette-card-back)',
          border: '4px solid var(--palette-card-back-accent)',
          boxShadow: 'var(--card-shadow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--palette-card-back-accent)',
          fontWeight: 'bold',
          fontSize: '1.0rem',
          userSelect: 'none'
        }}
      >
        PKCard
      </div>
    );
  }

  if (!card) return <div style={{ width: 'var(--card-width)', height: 'var(--card-height)' }}></div>;

  const rarity  = getCardRarity(card);
  const bgStyle = rarity.background ?? getEnergyColor(card.energyType);

  // 疊牌陰影：場上已進化的寶可夢（stage≥1）以位移的卡片輪廓陰影模擬「底下墊著退化型」，
  // 層數依進化階級（stage1 一層、stage2 兩層）。顏色一律走 token，box-shadow 會跟著卡片圓角。
  const stackLayer = (o) =>
    `${o}px ${o}px 0 0 var(--palette-card-stack), ${o}px ${o}px 0 1px var(--palette-card-stack-edge)`;
  const stage = onField && card.type === CardTypes.POKEMON ? (card.stage || 0) : 0;
  const stackShadow = stage >= 2 ? `${stackLayer(5)}, ${stackLayer(10)}` : stage >= 1 ? stackLayer(5) : '';
  const baseShadow = isSelectable ? rarity.cardShadow.selected : rarity.cardShadow.normal;
  const boxShadow = stackShadow ? `${stackShadow}, ${baseShadow}` : baseShadow;

  return (
    <div
      className={`glass-panel card-shine-host ${isEvolving ? 'evolve-flash' : ''} ${isSelectable ? 'animate-fade-in' : ''}`}
      onClick={isSelectable ? () => onClick(card) : undefined}
      style={{
        width: 'var(--card-width)',
        height: 'var(--card-height)',
        background: bgStyle,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: '8px',
        cursor: isSelectable ? 'pointer' : 'default',
        transform: isSelectable ? 'translateY(0)' : 'none',
        transition: 'all 0.2s ease',
        boxShadow,
        border: rarity.border,
      }}
      onMouseEnter={(e) => {
        if(isSelectable) e.currentTarget.style.transform = 'translateY(-5px)';
      }}
      onMouseLeave={(e) => {
        if(isSelectable) e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {card.type === CardTypes.POKEMON && (
        <div style={{
          position: 'absolute', top: '-10px', right: '-10px', width: '50px', height: '50px',
          background: getEnergyColor(card.energyType), filter: 'blur(20px)', opacity: 0.5
        }}></div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1, width: '100%', gap: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0, flex: 1 }}>
          <h4 style={{ fontSize: '0.8rem', margin: 0, textShadow: '0 1px 2px rgba(0,0,0,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.name}</h4>
          {rarity.badge && (
            <span style={{
              fontSize: '0.6rem', padding: '1px 3px', borderRadius: '4px',
              fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0,
              background: rarity.badge.background,
              color: rarity.badge.color,
              textShadow: rarity.badge.textShadow,
            }}>
              {rarity.badge.label}
            </span>
          )}
          {/* EX 角標：prizeYield > 1 的高風險高報酬寶可夢（被擊倒時對手多拿獎賞卡） */}
          {card.prizeYield > 1 && (
            <span style={{
              fontSize: '0.6rem', padding: '1px 3px', borderRadius: '4px',
              fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0,
              background: 'var(--color-energy)', color: '#000',
            }}>
              EX
            </span>
          )}
        </div>
        {card.type === CardTypes.POKEMON && (
          <span style={{ fontSize: '0.7rem', color: 'var(--color-danger)', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0 }}>HP {card.currentHp}</span>
        )}
      </div>

      {/* 特殊狀態徽章（僅場上）：中毒 / 睡眠 / 麻痺 */}
      {onField && card.type === CardTypes.POKEMON && (card.poisoned || card.specialCondition) && (
        <div style={{ position: 'absolute', top: '26px', left: '4px', display: 'flex', flexDirection: 'column', gap: '3px', zIndex: 3 }}>
          {card.poisoned && (
            <span title="中毒" style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--palette-status-poison)', border: '1px solid var(--theme-glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>☠️</span>
          )}
          {card.specialCondition === 'asleep' && (
            <span title="睡眠" style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--palette-status-sleep)', border: '1px solid var(--theme-glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>💤</span>
          )}
          {card.specialCondition === 'paralyzed' && (
            <span title="麻痺" style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--palette-status-paralysis)', border: '1px solid var(--theme-glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>⚡</span>
          )}
        </div>
      )}

      {card.type === CardTypes.POKEMON && (
        <>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, position: 'relative' }}>
            {card.image ? (
              <img src={card.image} alt={card.name} style={{ width: '100%', height: '80px', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }} />
            ) : (
              <div style={{ width: '80%', height: '60px', background: 'var(--theme-panel-light)', borderRadius: '8px' }}></div>
            )}
          </div>
          
          <div style={{ background: 'var(--theme-panel-dark)', padding: '6px', borderRadius: '6px', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {getAttacks(card).map((atk, i) => (
              <div key={i} style={{ fontSize: '0.72rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{atk.name}</span>
                <span style={{ flexShrink: 0, display: 'flex', gap: '4px', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.55rem', color: 'var(--color-text-muted)' }}>{atk.cost?.length ?? 0}能量</span>
                  <span style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>{atk.damage}</span>
                </span>
              </div>
            ))}
          </div>

          {/* 弱點 / 抵抗力（欄位不存在則整列不顯示） */}
          {(card.weakness || card.resistance) && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '0.55rem', zIndex: 1, alignItems: 'center' }}>
              {card.weakness && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  弱
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: getEnergyColor(card.weakness.type), border: '1px solid var(--theme-glass-border)' }} />
                  {card.weakness.value}
                </span>
              )}
              {card.resistance && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  抵
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: getEnergyColor(card.resistance.type), border: '1px solid var(--theme-glass-border)' }} />
                  {card.resistance.value}
                </span>
              )}
            </div>
          )}

          {/* 附加的能量 */}
          {card.attachedEnergy && card.attachedEnergy.length > 0 && (
             <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', display: 'flex', zIndex: 2 }}>
               {card.attachedEnergy.map((energy, idx) => (
                 <div key={idx} style={{
                   width: '16px', height: '16px', borderRadius: '50%',
                   background: getEnergyColor(energy.energyType),
                   border: '1px solid var(--theme-glass-border)', marginLeft: '-6px',
                   boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                   fontSize: '0.5rem', fontWeight: 'bold', color: '#fff',
                 }}>{(energy.provides ?? 1) > 1 ? `×${energy.provides}` : ''}</div>
               ))}
             </div>
          )}
        </>
      )}

      {card.type === CardTypes.ENERGY && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', zIndex: 1 }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'var(--theme-panel-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', textShadow: 'var(--theme-shadow)'
          }}>
            ⚡
          </div>
          {(card.provides ?? 1) > 1 && (
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-energy)' }}>
              ×{card.provides}
            </span>
          )}
        </div>
      )}

      {(card.type === CardTypes.ITEM || card.type === CardTypes.TRAINER) && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', zIndex: 1, textAlign: 'center', padding: '0 4px' }}>
          <div style={{ fontSize: '1.8rem', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
            {card.type === CardTypes.ITEM ? '🎒' : '👤'}
          </div>
          <p style={{ fontSize: '0.6rem', margin: 0, lineHeight: 1.35, color: 'var(--theme-text-main)' }}>
            {card.description}
          </p>
        </div>
      )}

      {/* 閃卡反光層：懸停時掃光；高稀有度（rarity.foil）走彩虹雷射，其餘為素白 */}
      <div className={`card-shine ${rarity.foil ? 'card-shine-holo' : ''}`} />

      {/* 進化高光：剛完成進化時的瞬間白色閃光 */}
      {isEvolving && <div className="evolve-flash-overlay" />}
    </div>
  );
};

export default Card;
