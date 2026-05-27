import React from 'react';
import Card from './Card';

const EMPTY_VALID_ZONES = new Set();

const Board = ({ activePokemon, bench, isTopPlayer, onActiveClick, onBenchClick, onDropActive, onDropBench, damageTaken, onBenchPointerDragStart, registerZone, dragState, onInspect, pendingAction, validZones = EMPTY_VALID_ZONES, faceDown = false }) => {
  // 拖曳 / pending 狀態
  const isDragging = dragState?.isDragging;
  const hoverZone = dragState?.hoverZone;
  const dragSource = dragState?.source;

  // 合法落點：由 GameArena 透過 rules.getValidTargets 算好後傳入（僅下方玩家有值）
  const isValidZone = (zoneId) => validZones.has(zoneId);

  // pending action（老大指令 / 離洞繩）目標判定
  const isDangerTarget = (pokemon, isBench) =>
    pendingAction?.type === 'select_opponent_bench' && isTopPlayer && isBench && pokemon;
  const isActionTarget = (pokemon, isBench) =>
    pendingAction?.type === 'select_my_bench' && !isTopPlayer && isBench && pokemon;

  // 判斷是否應該因為焦點模式而變暗
  const shouldDim = (pokemon, isBench, zoneId) => {
    // 優先權 1：有 Pending Action 聚焦
    if (pendingAction) {
      if (pendingAction.type === 'select_opponent_bench') return !(isTopPlayer && isBench && pokemon);
      if (pendingAction.type === 'select_my_bench') return !(!isTopPlayer && isBench && pokemon);
    }
    // 優先權 2：正在拖曳聚焦
    if (isDragging) {
      if (isTopPlayer) return true;                                     // 對手側一律變暗
      if (dragSource?.type === 'hand') return !isValidZone(zoneId);     // 手牌：非合法落點才變暗
      if (dragSource?.type === 'bench') return !(!isBench && !pokemon); // 推派：只亮戰鬥區空位
      return true;
    }
    return false;
  };

  const getZoneClass = (pokemon, isBench, zoneId) => {
    const classes = [];
    if (isDragging && !isTopPlayer && hoverZone === zoneId) classes.push('drop-zone-highlight');
    if (!isTopPlayer && pokemon && isValidZone(zoneId)) classes.push('highlight-valid-target');
    if (isDangerTarget(pokemon, isBench)) classes.push('highlight-danger-target');
    if (isActionTarget(pokemon, isBench)) classes.push('highlight-action-target');
    if (shouldDim(pokemon, isBench, zoneId)) classes.push('dimmed-target');
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
          border: '2px dashed var(--theme-glass-border)',
          borderRadius: 'var(--card-border-radius)',
          position: 'relative',
          transform: 'scale(1.1)', // 戰鬥寶可夢是主角，放大 1.1 倍
          zIndex: 10,
          cursor: (!activePokemon && onActiveClick) ? 'pointer' : 'default',
          background: (!activePokemon && onActiveClick) ? 'var(--theme-panel-light)' : 'transparent'
        }}
      >
        {activePokemon ? (
          <div
            className={damageTaken ? 'shake-anim' : ''}
            style={{ position: 'relative' }}
            onContextMenu={(e) => { e.preventDefault(); if (!faceDown) onInspect && onInspect(activePokemon); }}
          >
            {damageTaken && <div className="damage-text">-{damageTaken}</div>}
            <Card
              card={activePokemon}
              isFaceDown={faceDown}
              isSelectable={!faceDown && !!onActiveClick}
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
        background: 'var(--theme-panel-light)',
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
                border: '2px dashed var(--theme-glass-border)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'scale(0.8)', // 備戰區為輔助，縮小至 80%
                transformOrigin: isTopPlayer ? 'bottom center' : 'top center',
                cursor: (!benchPokemon && onBenchClick) ? 'pointer' : 'default',
                background: (!benchPokemon && onBenchClick) ? 'var(--theme-panel-light)' : 'transparent'
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
                  onContextMenu={(e) => { e.preventDefault(); if (!faceDown) onInspect && onInspect(benchPokemon); }}
                >
                  <Card
                    card={benchPokemon}
                    isFaceDown={faceDown}
                    isSelectable={!faceDown && !!onBenchClick}
                    onClick={() => onBenchClick && onBenchClick(benchPokemon, idx)}
                  />
                </div>
              ) : (
                <span style={{ color: 'var(--theme-text-muted)', fontSize: '0.8rem', opacity: 0.5, pointerEvents: 'none' }}>備戰區</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Board;
