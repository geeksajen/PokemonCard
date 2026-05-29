# 2. 「可攻擊」的動態發光提示 (Attack Ready Glow) ✅ 已完成

> 實作摘要（2026-05-29）：
> - `GameArena.jsx`：以既有純函式 `canAttack(gameState, currentPlayerId)` 一次涵蓋「我方回合 + 本回合未攻擊 + 能量滿足招式需求」三項判定，準備階段/對手回合/結算後不觸發，算出布林 `attackReady` 傳給下方玩家 `<Board>`。
> - `Board.jsx`：新增 `attackReady` prop，出戰區有寶可夢且就緒時，外框套用 `.attack-ready-glow`，並在卡牌上方浮現會輕微上下擺動的 ⚔️ 角標。
> - `index.css`：新增 `@keyframes attack-ready-pulse`（金色 `--color-energy` 呼吸 `box-shadow`）與 `.attack-ready-badge`，顏色一律經 `color-mix` 引用 token，未寫死色值。

## 痛點分析
玩家在對戰中必須頻繁心算或點擊檢查「出戰寶可夢目前的能量是否足夠發動攻擊」。這對於新手來說增加了不必要的認知負擔，有時會因此錯失攻擊機會。

## 優化設計 (UI/UX)
1. **條件判定**：
   - 判斷該回合是否為我方回合。
   - 判斷本回合是否尚未進行攻擊。
   - 判斷出戰寶可夢身上填附的能量，是否已滿足該寶可夢招式的能量需求 (Cost)。
2. **視覺提示**：
   - 一旦滿足上述條件，為該出戰寶可夢的卡牌外框或底部加上一層「緩慢呼吸的發光動畫 (Pulsing Glow)」。
   - 可選：在卡面上方浮現一個小型的「⚔️ (攻擊就緒)」圖示。
   - 目的：利用強烈的視覺信號引導玩家，降低遊戲門檻。

## 實作建議
- 在 `canAttack` 規則函數的基礎上，於 `Board.jsx` 或 `Card.jsx` 中新增一個布林值 Prop (例如 `isAttackReady`)。
- 透過 CSS `@keyframes` 撰寫一個 `box-shadow` 的呼吸燈動畫綁定至該卡牌。
