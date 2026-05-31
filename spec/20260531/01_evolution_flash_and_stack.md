# 1. 進化專屬特效與「疊牌」視覺 (Evolution Flash & Stack) ✅ 已完成

> 實作摘要（2026-05-31）— 嚴格遵守既有分層架構：
> - **純規則層 `rules.js`**：`playPokemon` 進化分支（含神奇糖果跳級）回傳 `{ ok, state, didEvolve:true, evolvedInstanceId }` metadata，比照 `applyAttackDamage` 回傳動畫資訊的既有慣例——「是否為進化」由唯一真相的規則層判定，引擎不重複推導。
> - **編排層 `useGameEngine.js`**：新增 `evolvedCardId` 動畫狀態與 `flashEvolution(result)` helper；人類出牌（`applyResult`）與 AI 出牌兩條路徑共用，成功進化即播放 `sfxEvolve` 並短暫設置 `evolvedCardId`（`EVOLVE_FLASH_MS` 800ms 後清除）。
> - **音效 `sounds.js`**：新增 `sfxEvolve`（上行琶音＋高亮泛音的蛻變感）。
> - **呈現層**：`GameArena → Board → Card` 逐層傳遞 `evolvedCardId`；`Board` 對戰鬥區/備戰區的 Card 傳入 `isEvolving`（instanceId 相符）與 `onField`。
>   - 進化高光：`Card` 容器套 `.evolve-flash`（`filter:brightness` 暴衝）＋覆蓋一層白色 wash overlay（opacity 閃滅）。
>   - 疊牌視覺：`onField` 且 `card.stage≥1` 的寶可夢，用位移且跟隨卡片圓角的 `box-shadow` 卡片輪廓陰影（stage1 一層、stage2 兩層）模擬底下墊著退化型；顏色全走新增的 `--palette-card-stack(-edge)` token（深/淺主題各有覆寫）。手牌中的進化卡（無 `onField`）不顯示疊影。
> - 全程未在 JSX 寫死色值（box-shadow 字串只含 token），未變更遊戲規則與資料模型，換主題/熱座/單人皆相容。

## 痛點分析
目前寶可夢在進化時，視覺上僅是卡牌圖面的瞬間替換，缺乏「進化」這項重大遊戲機制的史詩感與成就感。同時，若沒有明確標示，玩家容易忘記該寶可夢底下是否墊有退化型卡牌。

## 優化設計 (UI/UX)
1. **進化高光特效 (Evolution Flash)**：
   - 當判斷打出的卡牌屬於進化牌（覆蓋於場上基礎寶可夢之上）時，瞬間在該卡牌上觸發強烈的白色閃光特效。
   - 利用 CSS `filter: brightness(200%)` 與 `opacity` 的變化，模擬出經典寶可夢遊戲中進化的「發光」瞬間。
   - 配合專屬的進化音效提升震撼感。
2. **疊牌視覺 (Stack Indicator)**：
   - 進化完成後，在該卡牌的左上角或底部邊緣，利用 CSS `box-shadow` 或是加上一個位移的背景 `div`，模擬出「底下有卡牌墊著」的疊影效果。
   - 目的：讓玩家一眼就能直覺辨識出這是一隻已經進化過的寶可夢。

## 實作建議
- 在 `useGameEngine.js` 的 `playCardOnPokemon` 成功結算進化後，設定一個短暫的狀態（例如 `evolvedCardId`），讓 `Card.jsx` 根據此狀態播放 CSS 動畫。
- 疊牌效果可藉由判斷 `card.stage > 0` 或是卡牌物件中是否包含 `basePokemon` 來決定是否渲染疊影樣式。
