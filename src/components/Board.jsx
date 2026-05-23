import React from 'react';
import Card from './Card';
import { CardTypes } from '../models/cards';

const Board = ({ activePokemon, bench, isTopPlayer, onActiveClick, onBenchClick, onDropActive, onDropBench, damageTaken, onBenchPointerDragStart, registerZone, dragState, onInspect, pendingAction }) => {
  // 是否正在拖曳中
  const isDragging = dragState?.isDragging;
  const hoverZone = dragState?.hoverZone;
  const draggedCard = dragState?.card;

  // 判斷特定卡牌是否為合法的智慧目標 (被拖曳的卡)
  const isSmartTarget = (pokemon) => {
    if (!isDragging || isTopPlayer || !pokemon || !draggedCard) return false;
    // 能量卡：所有我方寶可夢
    if (draggedCard.type === CardTypes.ENERGY) return true;
    // 進化卡：符合 evolvesFrom 的我方寶可夢
    if (draggedCard.type === CardTypes.POKEMON && draggedCard.evolvesFrom === pokemon.name) return true;
    return false;
  };

  // 判斷特定空位是否為合法的放置目標
  const isEmptyTarget = () => {
    if (!isDragging || isTopPlayer || !draggedCard) return false;
    // 基礎寶可夢可放空位
    if (draggedCard.type === CardTypes.POKEMON && !draggedCard.evolvesFrom) return true;
    return false;
  };

  // 判斷是否應該因為焦點模式而變暗
  const shouldDim = (pokemon, isBench) => {
    // 優先權 1：有 Pending Action
    if (pendingAction) {
      if (pendingAction.type === 'select_opponent_bench') {
        // 老大：對手備戰區是目標，其他變暗
        if (isTopPlayer && isBench && pokemon) return false;
        return true;
      }
      if (pendingAction.type === 'select_my_bench') {
        // 逃脫繩：我方備戰區是目標，其他變暗
        if (!isTopPlayer && isBench && pokemon) return false;
        return true;
      }
    }
    // 優先權 2：正在拖曳
    if (isDragging) {
      if (isTopPlayer) return true; // 拖曳時，對手的全域變暗
      // 手牌拖曳：如果是可放置的目標，不要變暗
      if (draggedCard && pokemon && isSmartTarget(pokemon)) return false;
      if (draggedCard && !pokemon && isEmptyTarget()) return false;
      // 場上拖曳推派：
      if (!draggedCard && dragState?.source?.type === 'bench' && !isBench && !pokemon) return false; // 推派到戰鬥區空位
      return true; // 其餘變暗
    }
    return false;
  };

  // 判斷 pending action 目標
  const isDangerTarget = (pokemon, isBench) => {
    return pendingAction?.type === 'select_opponent_bench' && isTopPlayer && isBench && pokemon;
  };
  const isActionTarget = (pokemon, isBench) => {
    return pendingAction?.type === 'select_my_bench' && !isTopPlayer && isBench && pokemon;
  };

  const getZoneClass = (pokemon, isBench, zoneId) => {
    const classes = [];
    if (isDragging && !isTopPlayer && hoverZone === zoneId) classes.push('drop-zone-highlight');
    if (pokemon && isSmartTarget(pokemon)) classes.push('highlight-valid-target');
    if (isDangerTarget(pokemon, isBench)) classes.push('highlight-danger-target');
    if (isActionTarget(pokemon, isBench)) classes.push('highlight-action-target');
    if (shouldDim(pokemon, isBench)) classes.push('dimmed-target');
    return classes.join(' ');
  };

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
        className={getZoneClass(activePokemon, false, 'my-active')}
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
              className={getZoneClass(benchPokemon, true, zoneId)}
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
