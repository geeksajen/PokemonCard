import React, { useState } from 'react';
import Card from './Card';
import { sfxHover } from '../utils/sounds';

const Hand = ({ hand, onCardClick, isCurrentPlayer, onDragStart, onDragEnd }) => {
  const [draggedCardId, setDraggedCardId] = useState(null);

  const handleDragStart = (e, card) => {
    if (onDragStart) onDragStart(e, card);
    // 延遲隱藏原卡片，讓瀏覽器有時間先截取卡片的「幽靈拖曳殘影」
    setTimeout(() => setDraggedCardId(card.instanceId), 0);
  };

  const handleDragEnd = (e, card) => {
    if (onDragEnd) onDragEnd(e, card);
    setDraggedCardId(null);
  };

  return (
    <div style={{
      display: 'flex',
      gap: '-10px', // 適度重疊
      padding: '20px',
      justifyContent: 'center',
      minHeight: '180px'
    }}>
      {hand.map((card, index) => (
        <div key={card.instanceId}
          className={isCurrentPlayer ? 'hand-card' : ''}
          style={{
            transform: `translateY(${Math.abs(index - hand.length / 2) * 5}px) rotate(${(index - hand.length / 2) * 2}deg)`,
            transformOrigin: 'bottom center',
            transition: 'all 0.3s ease',
            margin: '0 -10px', // Overlap effect
            opacity: draggedCardId === card.instanceId ? 0 : 1, // 拖拉時隱藏原本的卡片
            pointerEvents: draggedCardId === card.instanceId ? 'none' : 'auto'
          }}
          draggable={isCurrentPlayer}
          onDragStart={(e) => handleDragStart(e, card)}
          onDragEnd={(e) => handleDragEnd(e, card)}
          onMouseEnter={() => isCurrentPlayer && !draggedCardId && sfxHover()}
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
