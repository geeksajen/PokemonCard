import React, { useEffect, useCallback } from 'react';
import { elementLabel, elementEmoji } from '../../utils/deckInsights';
import './lobby.css';

// 生涯戰績詳情：總覽數據 + 近期對戰歷史（對手、使用屬性、勝負、時間）。
const PlayerStatsModal = ({ stats, onClose }) => {
  const { wins, losses, games, history } = stats;
  const winRate = games > 0 ? Math.round((wins / games) * 100) : 0;

  const handleKeyDown = useCallback((e) => { if (e.key === 'Escape') onClose(); }, [onClose]);
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="stats-overlay" onClick={onClose}>
      <div className="stats-panel" onClick={(e) => e.stopPropagation()}>
        <div className="stats-panel-header">
          <span>📇 生涯戰績</span>
          <button onClick={onClose} className="stats-close">×</button>
        </div>

        <div className="stats-summary">
          <div className="stats-summary-item"><b>{games}</b><span>總場數</span></div>
          <div className="stats-summary-item win"><b>{wins}</b><span>勝場</span></div>
          <div className="stats-summary-item loss"><b>{losses}</b><span>敗場</span></div>
          <div className="stats-summary-item rate"><b>{winRate}%</b><span>勝率</span></div>
        </div>

        <div className="stats-history-title">近期對戰</div>
        <div className="stats-history">
          {history.length === 0 ? (
            <div className="stats-history-empty">尚無對戰紀錄，快去打一場吧！</div>
          ) : (
            history.map((h, i) => (
              <div key={i} className="stats-history-row">
                <span className={`stats-result ${h.result}`}>{h.result === 'win' ? '勝' : '敗'}</span>
                <span className="stats-history-deck">
                  {elementEmoji(h.element)} {elementLabel(h.element)}屬性
                </span>
                <span className="stats-history-opp">vs {h.opponent}</span>
                <span className="stats-history-date">
                  {new Date(h.at).toLocaleDateString('zh-TW')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsModal;
