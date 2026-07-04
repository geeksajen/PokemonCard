# 1. 平衡快速修正 (Balance Quick Wins) ✅ 已完成

> 實作摘要（2026-07-04）：
> - **prizeYield**：`resolveKnockout` 依 `faintedPokemon.prizeYield || 1` 扣獎賞卡（`Math.max` 防負數）；
>   超夢/卡比獸標記 `prizeYield: 2`；Card.jsx 名稱旁 EX 角標（`--color-energy` token）、
>   CardInspectModal 增 EX 警示區塊、擊倒時 toast 強調。
> - **先攻限制**：`endTurnState` 補上 `turn += 1`（原本永遠停在 1），`canAttack` 以
>   `state.turn === 1` 擋下先攻方第一回合攻擊；AI 走同一判定、attackReady 光暈自動熄滅。
> - **支援者限制**：新旗標 `hasPlayedSupporterThisTurn`（初始化/重置與既有旗標同模式）；
>   閘門設於 `resolveBoardCardEffect` 與 `playCardOnPokemon` TRAINER 分支；立旗設於實際消耗處
>   （`playProfessor`、`resolveBossOrders`、TRAINER 型 `applyPotion`/`applySwitch`），
>   老大指令取消不消耗；`canPlayCard`/`getValidTargets` 同步（手牌提示一致）。
> - lint：無新增錯誤（既有 88 個專案級錯誤不在本次範圍）。

> 三個獨立的小型規則修正，皆只動 `rules.js` + 少量 UI，共用現有的
> 「回合旗標」與「effect.kind 分派」模式。目標：修正目前對局中最明顯的
> 三個不公平來源，為後續的多招式 / 特殊狀態系統鋪路。

## 痛點分析

1. **高數值基礎寶可夢零風險**：超夢、卡比獸 130 HP 高面板，被擊倒卻只掉 1 張獎賞卡，
   與 60 HP 的小火龍完全相同。`spec/prize_yield_mechanic.md` 已規劃解法但從未實作。
2. **先攻優勢過大**：擲硬幣決定先攻後，先攻方第 1 回合就能「填能量＋攻擊」，
   同速對轟時永遠先擊倒對手，勝負在擲硬幣時就傾斜。
3. **支援者卡無限制**：兩張大木博士可以同回合連打（棄手牌抽 7 再抽 7），
   老大的指令也可連發。ITEM 與 TRAINER 在規則上目前完全等價，
   TRAINER（支援者）這個分類毫無遊戲意義。

## A. 多重獎賞卡 (prizeYield)

實作 `spec/prize_yield_mechanic.md` 的既有規格：

### 引擎（src/game/rules.js）
- `resolveKnockout()`：`me.prizes -= 1` 改為
  `me.prizes = Math.max(0, me.prizes - (faintedPokemon.prizeYield || 1))`。
- 擊倒 log 明確顯示拿取張數（`prizeYield > 1` 時強調）。

### 卡牌資料（src/themes/pokemon/cards.js）
- `p-150` 超夢、`p-143` 卡比獸加上 `prizeYield: 2`。

### UI
- `Card.jsx`：`prizeYield > 1` 的寶可夢在名稱旁顯示醒目角標（如 `EX`），
  色彩走既有 token（不新增 hex）。
- `CardInspectModal.jsx`：技能區下補一行說明
  「此寶可夢被擊倒時，對手獲得 2 張獎賞卡」。
- `useGameEngine.js`：擊倒 `prizeYield > 1` 的寶可夢時 toast 強調
  （例：「擊倒 EX 級寶可夢！獲得 2 張獎賞卡！」）。

## B. 先攻第一回合禁止攻擊

對應實體 TCG 規則，抵銷先攻的節奏優勢。

### 引擎
- **回合計數修正**：`state.turn` 目前初始化後從未遞增（永遠是 1）。
  `endTurnState()` 增加 `newState.turn += 1`（以「玩家回合」為單位遞增）。
- `canAttack()` 新增前置檢查：`state.turn === 1` 時回傳
  `{ ok: false, error: '先攻方的第一個回合無法攻擊！' }`。
  - 因為 `turn === 1` 只會是先攻方的第一個回合，不需要記錄 firstPlayer。
  - AI 走同一個 `canAttack` 判定，無需改動 `ai.js`。

### UI
- 攻擊按鈕的就緒光暈（`attackReady`）已綁 `canAttack`，會自動熄滅；
  玩家點擊時由既有 toast 顯示錯誤訊息，無需新 UI。

## C. 支援者每回合限用一張

讓 ITEM（物品，不限次數）與 TRAINER（支援者，每回合 1 張）產生真正的規則區分。

### 引擎
- `gameState` 新增旗標 `hasPlayedSupporterThisTurn: false`
  （`createInitialGameState` 初始化、`endTurnState()` 重置，與既有兩個旗標同模式）。
- **閘門（入口統一檢查）**：
  - `resolveBoardCardEffect()`：`card.type === TRAINER` 且旗標已立 → 回傳錯誤
    `'每回合只能使用一張支援者卡！'`。
  - `playCardOnPokemon()` 的 TRAINER 分支（heal / switchActive 型支援者）：同上。
- **立旗（卡片實際消耗處）**：
  - `playProfessor()`、`resolveBossOrders()` 成功時設定旗標。
  - `applyPotion()` / `applySwitch()` 在 `card.type === TRAINER` 時設定旗標。
  - 老大的指令在「選擇目標階段」（`applyBossOrders`）不立旗，
    取消（`cancelPendingAction`）即不消耗，避免取消後被誤鎖。
- **查詢層同步**（UI 提示一致性）：
  - `canPlayCard()`：TRAINER 且旗標已立 → `false`（手牌不發光）。
  - `getValidTargets()`：TRAINER 且旗標已立 → `[]`。

### AI
- AI 目前不會用支援者，無需改動；spec 02 實作 AI 用卡時直接沿用此閘門。

## 驗收條件

1. 擊倒超夢 / 卡比獸 → 一次獲得 2 張獎賞卡，log 與 toast 正確顯示；
   獎賞卡 3 → 1 的情況下擊倒 EX 直接獲勝（`Math.max` 不出現負數）。
2. 先攻方第 1 回合點攻擊 → toast「先攻方的第一個回合無法攻擊！」；
   後攻方第 1 回合可正常攻擊；第 2 回合起雙方皆可攻擊。
3. 同回合打出第 2 張大木博士 → toast 錯誤；隔回合可再打。
   老大的指令選目標時按取消 → 本回合仍可再使用支援者。
4. `npm run lint` 通過；fantasy / zeus 主題包不受影響（`prizeYield` 未定義時預設 1）。
