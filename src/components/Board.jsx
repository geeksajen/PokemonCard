import React from 'react';
import Card from './Card';

const Board = ({ activePokemon, bench, isTopPlayer, onActiveClick, onBenchClick, onDropActive, onDropBench, damageTaken, onBenchPointerDragStart, registerZone, dragState, onInspect }) => {
  // 是否正在拖曳中
  const isDragging = dragState?.isDragging;
  const hoverZone = dragState?.hoverZone;

  return (
    <div style={{
      display: 'flex',
      flexDirection: isTopPlayer ? 'column-reverse' : 'column',
      gap: '20px',
      padding: '20px',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%'
    }}>
      {/* 戰鬥區 (Active Pokemon) */}
      <div 
        ref={!isTopPlayer && registerZone ? registerZone('my-active') : undefined}
        onClick={() => !activePokemon && onActiveClick && onActiveClick()}
        className={isDragging && !isTopPlayer && hoverZone === 'my-active' ? 'drop-zone-highlight' : ''}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 'var(--card-width)',
          height: 'var(--card-height)',
          border: '2px dashed rgba(255,255,255,0.2)',
          borderRadius: 'var(--card-border-radius)',
          position: 'relative',
          transform: 'scale(1.1)', // 戰鬥寶可夢是主角，放大 1.1 倍
          zIndex: 10,
          cursor: (!activePokemon && onActiveClick) ? 'pointer' : 'default',
          background: (!activePokemon && onActiveClick) ? 'rgba(255,255,255,0.05)' : 'transparent'
        }}
      >
        {activePokemon ? (
          <div
            className={damageTaken ? 'shake-anim' : ''}
            style={{ position: 'relative' }}
            onContextMenu={(e) => { e.preventDefault(); onInspect && onInspect(activePokemon); }}
          >
            {damageTaken && <div className="damage-text">-{damageTaken}</div>}
            <Card 
              card={activePokemon} 
              isSelectable={!!onActiveClick} 
              onClick={() => onActiveClick && onActiveClick(activePokemon)} 
            />
          </div>
        ) : (
          <span style={{ color: 'var(--color-text-muted)', pointerEvents: 'none' }}>戰鬥區</span>
        )}
      </div>

      {/* 備戰區 (Bench) */}
      <div style={{
        display: 'flex',
        gap: '0px',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.05)',
        padding: '15px', 
        borderRadius: '12px'
      }}>
        {/* 固定 3 個備戰位置 */}
        {[0, 1, 2].map((idx) => {
          const benchPokemon = bench[idx];
          const zoneId = `my-bench-${idx}`;
          const isHovered = isDragging && !isTopPlayer && hoverZone === zoneId;

          return (
            <div 
              key={idx}
              ref={!isTopPlayer && registerZone ? registerZone(zoneId) : undefined}
              onClick={() => !benchPokemon && onBenchClick && onBenchClick(null, idx)}
              className={isHovered ? 'drop-zone-highlight' : ''}
              style={{
                width: 'var(--card-width)',
                height: 'var(--card-height)',
                border: '2px dashed rgba(255,255,255,0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'scale(0.8)', // 備戰區為輔助，縮小至 80%
                transformOrigin: isTopPlayer ? 'bottom center' : 'top center',
                cursor: (!benchPokemon && onBenchClick) ? 'pointer' : 'default',
                background: (!benchPokemon && onBenchClick) ? 'rgba(255,255,255,0.05)' : 'transparent'
              }}
            >
              {benchPokemon ? (
                  <div 
                  className={onBenchPointerDragStart ? 'bench-card-draggable' : ''}
                  style={{ pointerEvents: onBenchClick ? 'auto' : 'none' }}
                  onPointerDown={(e) => {
                    if (onBenchPointerDragStart) {
                      onBenchPointerDragStart(idx, e);
                    }
                  }}
                  onContextMenu={(e) => { e.preventDefault(); onInspect && onInspect(benchPokemon); }}
                >
                  <Card 
                    card={benchPokemon} 
                    isSelectable={!!onBenchClick}
                    onClick={(e) => { e.stopPropagation(); onBenchClick && onBenchClick(benchPokemon, idx); }}
                  />
                </div>
              ) : (
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', pointerEvents: 'none' }}>備戰區</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Board;
