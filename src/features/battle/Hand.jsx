import React from 'react';
import Card from './Card';
import { sfxHover } from '../../utils/sounds';

const Hand = ({ hand, onCardClick, isCurrentPlayer, onPointerDragStart, dragState, drawnCardAnim, onInspect }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '-10px', // 適度重疊
      padding: '20px',
      justifyContent: 'center',
      minHeight: '180px'
    }}>
      {hand.map((card, index) => {
        const isBeingDragged = dragState?.isDragging && dragState.card?.instanceId === card.instanceId;
        return (
          <div key={card.instanceId}
            className={`${isCurrentPlayer ? 'hand-card hand-card-draggable' : ''} ${drawnCardAnim?.cardId === card.instanceId ? (isCurrentPlayer ? 'anim-draw-bottom' : 'anim-draw-top') : ''}`}
            style={{
              transform: `translateY(${Math.abs(index - hand.length / 2) * 5}px) rotate(${(index - hand.length / 2) * 2}deg)`,
              transformOrigin: 'bottom center',
              transition: 'all 0.3s ease',
              margin: '0 -10px', // Overlap effect
              opacity: isBeingDragged ? 0 : 1, // 拖曳時隱藏原本的卡片
              pointerEvents: isBeingDragged ? 'none' : 'auto'
            }}
            onPointerDown={(e) => {
              if (isCurrentPlayer && onPointerDragStart) {
                onPointerDragStart(card, e);
              }
            }}
            onMouseEnter={() => isCurrentPlayer && !(dragState?.isDragging) && sfxHover()}
            onContextMenu={(e) => {
              e.preventDefault();
              if (!isBeingDragged && onInspect) onInspect(card);
            }}
          >
            <Card 
              card={card} 
              isFaceDown={!isCurrentPlayer} 
              isSelectable={isCurrentPlayer}
              onClick={isCurrentPlayer ? onCardClick : undefined}
            />
          </div>
        );
      })}
      {hand.length === 0 && (
        <div style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
          手牌為空
        </div>
      )}
    </div>
  );
};

export default Hand;
