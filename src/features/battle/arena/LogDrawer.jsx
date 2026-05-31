import React from 'react';

// 紀錄來源 → 顏色類別與標籤。系統（擲硬幣/擊倒/牌庫耗盡）獨立為黃字，
// 不再誤歸入「玩家 2」。vsAI 時改用「你 / 🤖 電腦」更貼近單人語境。
const sourceMeta = (player, vsAI) => {
  if (player === 'player1') return { cls: 'log-player1', label: vsAI ? '你' : '玩家 1' };
  if (player === 'player2') return { cls: 'log-player2', label: vsAI ? '🤖 電腦' : '玩家 2' };
  return { cls: 'log-system', label: '系統' };
};

const LogDrawer = ({ open, logs, onClose, vsAI = false }) => (
  <div className={`log-drawer ${open ? 'open' : ''}`}>
    <div className="log-header">
      📓 對戰紀錄
      <button onClick={onClose} style={{ background: 'transparent', color: 'var(--theme-text-main)', fontSize: '1.5rem', padding: '0 5px' }}>×</button>
    </div>
    <div className="log-content">
      {logs && logs.length > 0 ? (
        [...logs].reverse().map((log, idx) => {
          const time = new Date(log.time).toLocaleTimeString('zh-TW', { hour12: false });
          const { cls, label } = sourceMeta(log.player, vsAI);
          return (
            <div key={idx} className="log-entry">
              <span className={cls}>{label}</span>
              {' '}{log.action}
              <span className="log-time">{time}</span>
            </div>
          );
        })
      ) : (
        <div style={{ color: 'var(--theme-text-muted)', textAlign: 'center', marginTop: '20px' }}>尚未有任何紀錄</div>
      )}
    </div>
  </div>
);

export default LogDrawer;
