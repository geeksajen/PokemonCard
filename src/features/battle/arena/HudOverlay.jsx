import React, { useState } from 'react';
import { EnergyTypes } from '../../../models/cards';

// 能量費用小圓點的屬性色（全部走 palette tokens）
const ENERGY_DOT_COLOR = {
  [EnergyTypes.FIRE]:     'var(--palette-element-1)',
  [EnergyTypes.WATER]:    'var(--palette-element-2)',
  [EnergyTypes.GRASS]:    'var(--palette-element-3)',
  [EnergyTypes.ELECTRIC]: 'var(--palette-element-4)',
  [EnergyTypes.PSYCHIC]:  'var(--palette-element-5)',
  [EnergyTypes.FIGHTING]: 'var(--palette-element-6)',
  [EnergyTypes.NORMAL]:   'var(--palette-element-neutral)',
};

// 招式選單（多招式寶可夢點「發動攻擊」時，自按鈕上方展開）
const AttackMenu = ({ attackOptions, onPick, onClose }) => (
  <>
    {/* 透明背板：點選單以外處關閉 */}
    <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={onClose} />
    <div
      style={{
        position: 'absolute', bottom: 'calc(100% + 10px)', right: 0, zIndex: 95,
        minWidth: '280px', padding: '8px', borderRadius: '12px',
        background: 'var(--theme-panel-dark)', border: '1px solid var(--theme-glass-border)',
        boxShadow: 'var(--theme-shadow)', display: 'flex', flexDirection: 'column', gap: '6px',
      }}
    >
      {attackOptions.map(({ attack, index, usable, error }) => (
        <button
          key={index}
          disabled={!usable}
          onClick={() => { onPick(index); onClose(); }}
          title={usable ? '' : (error || '')}
          style={{
            display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left',
            padding: '8px 12px', borderRadius: '8px',
            background: usable ? 'var(--theme-panel-light)' : 'var(--color-bg-panel)',
            opacity: usable ? 1 : 0.5,
            cursor: usable ? 'pointer' : 'not-allowed',
          }}
        >
          <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>{attack.name}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'flex', gap: '3px' }}>
                {(attack.cost || []).map((c, i) => (
                  <span key={i} style={{
                    width: '12px', height: '12px', borderRadius: '50%',
                    background: ENERGY_DOT_COLOR[c] || ENERGY_DOT_COLOR[EnergyTypes.NORMAL],
                    border: '1px solid var(--theme-glass-border)',
                  }} />
                ))}
              </span>
              <span style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>{attack.damage}</span>
            </span>
          </span>
          {attack.description && (
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{attack.description}</span>
          )}
        </button>
      ))}
    </div>
  </>
);

// 四角 HUD：左上對手資訊、右上設定/紀錄、左下玩家資訊、右下動作按鈕
const HudOverlay = ({
  topLabel,
  bottomLabel,
  turnText,
  actionsEnabled = true,
  topPlayer,
  bottomPlayer,
  hasAttackedThisTurn,
  attackOptions = [],
  onOpenLog,
  onOpenSettings,
  onAttack,
  onRetreat,
  retreatDisabled,
  onEndTurn,
  setupMode = false,
  onReady,
  readyDisabled,
}) => {
  // 招式選單開關（純 UI）：多招式時點攻擊鍵展開；單招直接發動
  const [showAttackMenu, setShowAttackMenu] = useState(false);
  const attackDisabled = hasAttackedThisTurn || !actionsEnabled;
  const handleAttackButton = () => {
    if (attackOptions.length > 1) {
      setShowAttackMenu((v) => !v);
    } else {
      onAttack(0);
    }
  };
  return (
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

    {/* 右下：動作區（準備階段只顯示「準備好了」） */}
    <div className="hud-panel hud-bottom-right">
      {setupMode ? (
        <button
          onClick={onReady}
          disabled={readyDisabled}
          style={{
            background: readyDisabled ? 'var(--color-bg-panel)' : 'var(--color-primary)',
            padding: '12px 28px', fontSize: '1.2rem', fontWeight: 'bold',
          }}
        >
          ✅ 準備好了
        </button>
      ) : (
        <>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {showAttackMenu && !attackDisabled && (
              <AttackMenu
                attackOptions={attackOptions}
                onPick={onAttack}
                onClose={() => setShowAttackMenu(false)}
              />
            )}
            <button
              onClick={handleAttackButton}
              disabled={attackDisabled}
              style={{
                background: attackDisabled ? 'var(--color-bg-panel)' : 'var(--color-danger)',
                padding: '10px 20px', fontSize: '1.1rem',
              }}
            >
              發動攻擊{attackOptions.length > 1 ? ' ▾' : ''}
            </button>
          </div>
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
        </>
      )}
    </div>
  </>
  );
};

export default HudOverlay;
