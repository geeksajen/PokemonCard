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
        // 扇形排列：以「正中央」為基準（centerIndex = (n-1)/2，對稱），
        // 兩側卡牌依距離給予漸增的旋轉角與下沉量，形成手持卡牌的弧線。
        const centerIndex = (hand.length - 1) / 2;
        const offset = index - centerIndex;
        const fanRotate = offset * 4; // 每張遞增 4 度
        const fanLift = Math.abs(offset) ** 1.4 * 6; // 兩側愈外側下沉愈多，構成弧形
        return (
          <div key={card.instanceId}
            className={`${isCurrentPlayer ? 'hand-card hand-card-draggable' : ''} ${drawnCardAnim?.cardId === card.instanceId ? (isCurrentPlayer ? 'anim-draw-bottom' : 'anim-draw-top') : ''}`}
            style={{
              transform: `translateY(${fanLift}px) rotate(${fanRotate}deg)`,
              transformOrigin: 'bottom center',
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
