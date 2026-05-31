import React, { useEffect, useCallback } from 'react';
import Card from '../Card';

// 棄牌堆檢視器：全螢幕半透明 Modal，以畫廊 (Grid) 排列展示某玩家棄牌堆的所有卡牌，
// 滿足深度玩家「算牌」的戰術需求。右鍵單張卡可叫出沉浸式檢視器（onInspect）。
// 卡牌以「由新到舊」排列（最近棄掉的在前），方便回顧最新的擊倒/消耗。
const DiscardViewerModal = ({ title, cards = [], onClose, onInspect }) => {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const ordered = [...cards].reverse();

  return (
    <div className="discard-viewer-overlay" onClick={onClose}>
      <div className="discard-viewer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="discard-viewer-header">
          <span>{title}（{cards.length} 張）</span>
          <button
            onClick={onClose}
            style={{ background: 'transparent', color: 'var(--theme-text-main)', fontSize: '1.6rem', padding: '0 8px', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {ordered.length > 0 ? (
          <div className="discard-viewer-grid">
            {ordered.map((card) => (
              <div
                key={card.instanceId}
                onContextMenu={(e) => { e.preventDefault(); onInspect && onInspect(card); }}
              >
                <Card card={card} />
              </div>
            ))}
          </div>
        ) : (
          <div className="discard-viewer-empty">棄牌區是空的</div>
        )}

        <div className="discard-viewer-hint">右鍵單張卡可放大檢視 · 點擊空白處或按 ESC 關閉</div>
      </div>
    </div>
  );
};

export default DiscardViewerModal;
