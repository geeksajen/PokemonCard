import React from 'react';
import { CardTypes, EnergyTypes } from '../models/cards';

const getEnergyColor = (type) => {
  switch(type) {
    case EnergyTypes.FIRE: return 'linear-gradient(135deg, #f87171, #dc2626)';
    case EnergyTypes.WATER: return 'linear-gradient(135deg, #60a5fa, #2563eb)';
    case EnergyTypes.GRASS: return 'linear-gradient(135deg, #4ade80, #16a34a)';
    case EnergyTypes.ELECTRIC: return 'linear-gradient(135deg, #facc15, #ca8a04)';
    default: return 'linear-gradient(135deg, #9ca3af, #4b5563)';
  }
};

const Card = ({ card, onClick, isSelectable, isFaceDown }) => {
  if (isFaceDown) {
    return (
      <div 
        style={{
          width: 'var(--card-width)',
          height: 'var(--card-height)',
          borderRadius: 'var(--card-border-radius)',
          background: 'linear-gradient(135deg, #1e40af, #1e3a8a)',
          border: '4px solid #facc15',
          boxShadow: 'var(--card-shadow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#facc15',
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

  const bgStyle = card.type === CardTypes.ENERGY 
    ? getEnergyColor(card.energyType)
    : card.type === CardTypes.TRAINER
      ? 'linear-gradient(135deg, #14b8a6, #0f766e)' // Trainer cards: Teal/Cyan
      : card.stage === 1
        ? 'linear-gradient(135deg, #4f46e5, #a855f7, #eab308)' // Evolution cards: Premium Foil (Indigo/Purple/Gold)
        : 'linear-gradient(135deg, #334155, #0f172a)'; // Basic Pokemon

  return (
    <div 
      className={`glass-panel ${isSelectable ? 'animate-fade-in' : ''}`}
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
        boxShadow: card.stage === 1 
          ? (isSelectable ? '0 0 20px rgba(234, 179, 8, 0.6)' : 'inset 0 0 10px rgba(234, 179, 8, 0.4)') 
          : (isSelectable ? 'var(--card-shadow-hover)' : 'var(--card-shadow)'),
        border: card.stage === 1 ? '1px solid rgba(234, 179, 8, 0.5)' : 'none',
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
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <h4 style={{ fontSize: '0.8rem', margin: 0, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{card.name}</h4>
          {card.stage === 1 && (
            <span style={{ fontSize: '0.6rem', background: '#eab308', color: '#000', padding: '1px 4px', borderRadius: '4px', fontWeight: 'bold' }}>
              進化
            </span>
          )}
        </div>
        {card.type === CardTypes.POKEMON && (
          <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 'bold' }}>HP {card.currentHp}</span>
        )}
      </div>

      {card.type === CardTypes.POKEMON && (
        <>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, position: 'relative' }}>
            {card.image ? (
              <img src={card.image} alt={card.name} style={{ width: '100%', height: '80px', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }} />
            ) : (
              <div style={{ width: '80%', height: '60px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}></div>
            )}
          </div>
          
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '6px', zIndex: 1 }}>
            <div style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>{card.attack.name}</span>
              <span style={{ color: 'var(--color-danger)' }}>{card.attack.damage}</span>
            </div>
            <div style={{ fontSize: '0.6rem', marginTop: '4px', color: 'var(--color-text-muted)' }}>
              需要: {card.attack.cost.length} 能量
            </div>
          </div>

          {/* 附加的能量 */}
          {card.attachedEnergy && card.attachedEnergy.length > 0 && (
             <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', display: 'flex', zIndex: 2 }}>
               {card.attachedEnergy.map((energy, idx) => (
                 <div key={idx} style={{
                   width: '16px', height: '16px', borderRadius: '50%',
                   background: getEnergyColor(energy.energyType),
                   border: '1px solid white', marginLeft: '-6px',
                   boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                 }}></div>
               ))}
             </div>
          )}
        </>
      )}

      {card.type === CardTypes.ENERGY && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            ⚡
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;
