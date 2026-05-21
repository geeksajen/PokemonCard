import React from 'react';
import Card from './Card';

const Hand = ({ hand, onCardClick, isCurrentPlayer, onDragStart }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      padding: '20px',
      justifyContent: 'center',
      minHeight: '260px'
    }}>
      {hand.map((card, index) => (
        <div key={card.instanceId} style={{
          transform: `translateY(${Math.abs(index - hand.length / 2) * 5}px) rotate(${(index - hand.length / 2) * 2}deg)`,
          transition: 'all 0.3s ease',
        }}
          draggable={isCurrentPlayer}
          onDragStart={(e) => onDragStart && onDragStart(e, card)}
        >
          <Card 
            card={card} 
            isFaceDown={!isCurrentPlayer} 
            isSelectable={isCurrentPlayer}
            onClick={isCurrentPlayer ? onCardClick : undefined}
          />
        </div>
      ))}
      {hand.length === 0 && (
        <div style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
          手牌為空
        </div>
      )}
    </div>
  );
};

export default Hand;
