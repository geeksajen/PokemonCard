import React from 'react';

const LogDrawer = ({ open, logs, onClose }) => (
  <div className={`log-drawer ${open ? 'open' : ''}`}>
    <div className="log-header">
      對戰紀錄
      <button onClick={onClose} style={{ background: 'transparent', color: 'white', fontSize: '1.5rem', padding: '0 5px' }}>×</button>
    </div>
    <div className="log-content">
      {logs && logs.length > 0 ? (
        [...logs].reverse().map((log, idx) => {
          const time = new Date(log.time).toLocaleTimeString('zh-TW', { hour12: false });
          return (
            <div key={idx} className="log-entry">
              <span className={log.player === 'player1' ? 'log-player1' : 'log-player2'}>
                {log.player === 'player1' ? '玩家 1' : '玩家 2'}
              </span>
              {' '}{log.action}
              <span className="log-time">{time}</span>
            </div>
          );
        })
      ) : (
        <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: '20px' }}>尚未有任何紀錄</div>
      )}
    </div>
  </div>
);

export default LogDrawer;
