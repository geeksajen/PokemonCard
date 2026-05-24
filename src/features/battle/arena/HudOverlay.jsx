import React from 'react';

// 四角 HUD：左上對手資訊、右上設定/紀錄、左下玩家資訊、右下動作按鈕
const HudOverlay = ({
  topLabel,
  bottomLabel,
  turnText,
  actionsEnabled = true,
  topPlayer,
  bottomPlayer,
  hasAttackedThisTurn,
  onOpenLog,
  onOpenSettings,
  onAttack,
  onRetreat,
  retreatDisabled,
  onEndTurn,
}) => (
  <>
    {/* 左上：對手資訊 */}
    <div className="hud-panel hud-top-left" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div>
          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>對手</div>
          <div style={{ fontWeight: 'bold' }}>{topLabel}</div>
        </div>
        <div style={{ borderLeft: '1px solid var(--theme-glass-border)', paddingLeft: '15px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>剩餘獎賞卡</div>
          <div style={{ color: 'var(--color-danger)', fontWeight: 'bold', fontSize: '1.2rem' }}>{topPlayer.prizes}</div>
        </div>
        <div style={{ borderLeft: '1px solid var(--theme-glass-border)', paddingLeft: '15px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>牌庫</div>
          <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>{topPlayer.deck.length}</div>
        </div>
      </div>
    </div>

    {/* 右上：設定與紀錄 */}
    <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '15px', zIndex: 50 }}>
      <div className="hud-panel" style={{ position: 'static', padding: '10px', cursor: 'pointer' }} onClick={onOpenLog}>
        <span style={{ fontSize: '1.5rem' }}>📜</span>
      </div>
      <div className="hud-panel" style={{ position: 'static', padding: '10px', cursor: 'pointer' }} onClick={onOpenSettings}>
        <span style={{ fontSize: '1.5rem' }}>⚙️</span>
      </div>
    </div>

    {/* 左下：玩家資訊 */}
    <div className="hud-panel hud-bottom-left" style={{ boxShadow: '0 0 20px var(--palette-player1-glow)' }}>
      <div>
        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{turnText}</div>
        <div style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{bottomLabel}</div>
      </div>
      <div style={{ borderLeft: '1px solid var(--theme-glass-border)', paddingLeft: '15px' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>剩餘獎賞卡</div>
        <div style={{ color: 'var(--color-danger)', fontWeight: 'bold', fontSize: '1.2rem' }}>{bottomPlayer.prizes}</div>
      </div>
      <div style={{ borderLeft: '1px solid var(--theme-glass-border)', paddingLeft: '15px' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>牌庫</div>
        <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>{bottomPlayer.deck.length}</div>
      </div>
    </div>

    {/* 右下：動作區 */}
    <div className="hud-panel hud-bottom-right">
      <button
        onClick={onAttack}
        disabled={hasAttackedThisTurn || !actionsEnabled}
        style={{
          background: (hasAttackedThisTurn || !actionsEnabled) ? 'var(--color-bg-panel)' : 'var(--color-danger)',
          padding: '10px 20px', fontSize: '1.1rem',
        }}
      >
        發動攻擊
      </button>
      <button
        onClick={onRetreat}
        disabled={retreatDisabled}
        style={{
          background: retreatDisabled ? 'var(--color-bg-panel)' : 'var(--color-energy)',
          padding: '10px 20px', fontSize: '1.1rem',
        }}
      >
        撤退
      </button>
      <button onClick={onEndTurn} disabled={!actionsEnabled} style={{ padding: '10px 20px', fontSize: '1.1rem' }}>結束回合</button>
    </div>
  </>
);

export default HudOverlay;
