# 撤退機制 (Retreat Mechanism) 實作計畫

[已完成]

本次實作將在遊戲引擎中加入寶可夢卡牌遊戲經典的「撤退」機制，允許玩家在自己的回合支付撤退費用（丟棄能量卡），將戰鬥區的寶可夢與備戰區的寶可夢交換。

## 待確認事項

**能量丟棄的選擇方式：**
目前介面上並沒有實作「選擇要丟棄哪幾張特定能量卡」的 UI。為了保持流程順暢，目前的計畫是：當玩家支付撤退費用時，引擎會 **自動從該寶可夢身上隨機（或從後方）移除對應數量的能量卡**。這在未來如果加入了特殊能量卡時可能會有影響，但目前對基本能量來說已經足夠。

## 預計修改內容

### 1. Game Engine (Core Logic)
**目標檔案**: `src/game/rules.js`
*   新增 `canRetreat(state, playerId)`:
    *   檢查戰鬥區是否有寶可夢。
    *   檢查備戰區是否至少有一隻寶可夢可以替換。
    *   檢查戰鬥區寶可夢身上的 `attachedEnergy` 數量是否大於等於該寶可夢的 `retreatCost`（若無定義則預設為 0 或 1）。
*   新增 `initiateRetreat(state, playerId)`:
    *   寫入 `state.pendingAction = { type: 'select_retreat_bench', player: playerId }`，通知 UI 進入選擇替換目標的狀態。
*   新增 `resolveRetreat(state, playerId, targetBenchIndex)`:
    *   從戰鬥寶可夢身上自動移除 `retreatCost` 數量的能量卡，並將其推入 `discardPile`。
    *   將目標備戰區寶可夢與戰鬥區寶可夢互換。
    *   寫入對戰紀錄 `logs`。
    *   清除 `pendingAction`。

### 2. React Hooks (State Management)
**目標檔案**: `src/hooks/useGameEngine.js`
*   匯出新的 `handleRetreatClick` 方法給 UI 呼叫，內部會驗證 `canRetreat`，若成功則呼叫 `initiateRetreat` 改變 `pendingAction`。
*   修改 `handleMyBenchClick`，增加對 `gameState.pendingAction.type === 'select_retreat_bench'` 的判斷。若在此狀態下點擊備戰區，則呼叫 `resolveRetreat`。

### 3. UI Components
**目標檔案**: `src/features/battle/arena/HudOverlay.jsx`
*   在右下角的動作區（包含「發動攻擊」、「結束回合」）新增一個 **「撤退」按鈕**。
*   接收新的 `onRetreat` prop 並綁定至該按鈕。
*   當 `actionsEnabled` 為 false，或是無法撤退時，按鈕應為禁用狀態。

**目標檔案**: `src/features/battle/GameArena.jsx`
*   從 `useGameEngine` 解構出 `handleRetreatClick`。
*   將 `handleRetreatClick` 傳遞給 `HudOverlay` 的 `onRetreat` 屬性。
*   在顯示 `pendingAction` 提示文字的地方，加上對 `select_retreat_bench` 的說明（如：「請選擇要替換上場的備戰寶可夢」）。

### 4. Card Database (Content)
**目標檔案**: `src/themes/pokemon/cards.js`
*   為所有的寶可夢加上 `retreatCost` 屬性：
    *   基礎寶可夢（如小火龍、皮卡丘）：`retreatCost: 1`
    *   重量級基礎寶可夢（卡比獸）：`retreatCost: 3`
    *   一階進化（火恐龍）：`retreatCost: 1` 或 `2`
    *   二階進化（噴火龍）：`retreatCost: 2` 或 `3`

## 測試計畫
1.  在戰鬥區放上一隻寶可夢，備戰區也放上一隻。
2.  此時「撤退」按鈕應可見，但如果沒有足夠能量，點擊後會顯示 Toast 錯誤提示。
3.  填附足夠的能量給戰鬥區寶可夢。
4.  點擊「撤退」，遊戲會提示「請選擇目標」。
5.  點擊備戰區的寶可夢，戰鬥區寶可夢退回備戰區，並自動棄掉對應數量的能量卡。
6.  檢查棄牌區是否正確多出了能量卡。
