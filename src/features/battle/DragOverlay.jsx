import React from 'react';
import Card from './Card';

/**
 * 拖曳浮層元件
 * 固定在視窗最上層，跟隨滑鼠移動，並根據速度向量產生 3D 傾斜視差效果。
 * 直接使用 <Card> 元件渲染，保留所有 Stage 2 白金光暈等視覺特效。
 */
const DragOverlay = ({ dragState }) => {
  if (!dragState.isDragging || !dragState.card) return null;

  const { card, x, y, velocityX, velocityY, hoverZone } = dragState;

  // 根據移動速度計算 3D 傾斜角度（最大 ±15°）
  const maxTilt = 15;
  const tiltY = Math.max(-maxTilt, Math.min(maxTilt, velocityX * 0.8));  // 水平移動 → 繞 Y 軸旋轉
  const tiltX = Math.max(-maxTilt, Math.min(maxTilt, -velocityY * 0.8)); // 垂直移動 → 繞 X 軸旋轉

  const isOverValidZone = hoverZone !== null;

  return (
    <div
      className="drag-overlay"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
        perspective: '800px',
      }}
    >
      <div
        className="drag-card-lifted"
        style={{
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          transform: `
            translate(-50%, -50%)
            scale(${isOverValidZone ? 1.2 : 1.15})
            rotateX(${tiltX}deg)
            rotateY(${tiltY}deg)
          `,
          transition: 'scale 0.15s ease-out',
          filter: isOverValidZone
            ? 'drop-shadow(0 25px 35px rgba(59, 130, 246, 0.5))'
            : 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.6))',
          willChange: 'transform, left, top',
        }}
      >
        <Card card={card} isSelectable={false} />
      </div>
    </div>
  );
};

export default DragOverlay;
