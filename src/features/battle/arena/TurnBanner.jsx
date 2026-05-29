import React from 'react';

// 「你的回合」霸氣過場橫幅（自動播放、自動消失）。
// 由 useGameEngine 在「對手回合 → 我方回合」切換、抽牌之前觸發，
// 動畫節奏：自左急速滑入 → 急停停留 → 向右加速滑出（總時長約 1.1s，由父層計時卸載）。
// 全螢幕覆蓋以攔截點擊，避免玩家在抽牌前搶先操作造成狀態競態。
const TurnBanner = ({ label = '你的回合' }) => (
  <div className="turn-banner-overlay">
    <div className="turn-banner">
      <span className="turn-banner-text">{label}</span>
    </div>
  </div>
);

export default TurnBanner;
