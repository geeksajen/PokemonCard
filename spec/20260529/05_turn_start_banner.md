# 5. 「你的回合」霸氣過場 (Turn Start Banner) ✅ 已完成

> 實作摘要（2026-05-29）：
> - 痛點最明顯處在單人模式：AI 自動行動結束後直接換手、毫無儀式感。故於 `useGameEngine.js` 將 `proceedToDraw` 拆為 `runDraw` + 橫幅閘門——當控制權「切回人類（vsAI 且 currentPlayer 變回 player1）」時，先播放橫幅 + 音效，`TURN_BANNER_MS`(1.1s) 後才抽牌。雙人熱座沿用既有 `TurnTransition` 換手過場，不重複觸發。
> - `TurnBanner.jsx`（新檔）：自動播放、自動卸載的全螢幕橫幅，覆蓋層 `pointer-events:auto` 攔截點擊，避免玩家在抽牌前搶先操作造成狀態競態。
> - `index.css`：`@keyframes turn-banner-slide` 自左急速滑入→急停停留→向右加速滑出；橫幅色用 `--palette-player1` token，文字反向 skew 保持正立。
> - `sounds.js`：新增 `sfxTurnStart`（金屬擦聲＋上揚雙音的「鏘」一聲）。
> - `GameArena.jsx`：以 `turnBanner` 狀態渲染 `<TurnBanner>`（key 綁 id 以每回合重播動畫）。

## 痛點分析
當目前遊戲回合交替時，如果只依賴畫面上微小的 UI 變化或是安靜地換手，遊戲節奏感會顯得平淡，且玩家有時會沒注意到已經輪到自己。

## 優化設計 (UI/UX)
1. **全螢幕橫幅動畫 (Splash Banner)**：
   - 每次從對手回合切換到「玩家回合」開始，並在抽牌動作之前，於螢幕正中央橫向劃過一條大膽的視覺橫幅。
   - 文字顯示「YOUR TURN」或「你的回合」。
2. **節奏與音效**：
   - 橫幅需帶有極具速度感的進場與退場動畫（例如從左滑入、急停 0.8 秒、然後向右加速滑出）。
   - 搭配清脆的一聲專屬音效（例如拔劍聲或重擊聲）。
   - 目的：營造遊戲的儀式感與緊湊感，明確切割雙方的回合，喚醒玩家注意力。

## 實作建議
- 在 `GameArena.jsx` 中利用 `showTurnTransition` 的狀態來渲染這個橫幅元件 `<TurnBanner />`。
- 控制好動畫時間，確保不會過度拖慢遊戲節奏（建議總時長控制在 1 秒至 1.5 秒內）。
