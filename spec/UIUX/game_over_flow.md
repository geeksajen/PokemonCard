# 遊戲結算畫面 (Game Over Screen) UI/UX 規劃

> **狀態:✅ 已實作完成 — 2026-05-27**
> 
> **實作摘要:**
> - **引擎層**: `gameState.winReason` enum ('prizes'|'bench_out'|'deck_out')，由 rules.js `resolveKnockout` / `drawForTurn` 輸出
> - **協調層**: `useGameEngine` 中 `gameOverStage` 狀態機 (null → 'cinematic' → 'panel'，延遲 2 秒)，統一 KO 與牌組耗盡的動畫時序
> - **UI 層**: `GameOverPanel` 元件、`showReviewMode` 切換、檢視按鈕、LogDrawer 整合
> - **CSS**: 代幣制風格（`--theme-*`, `--palette-*`），`gameOverBannerIn` 動畫，全層級無硬編碼顏色

為了解決目前遊戲結束時「直接蓋版導致玩家一頭霧水」的問題，我們將重新設計結算流程與 UI，讓玩家能清楚明白勝負原因，並允許他們事後覆盤。

## 1. 使用者痛點分析
目前當 `gameState.winner` 產生時，系統會瞬間彈出一個結算畫面覆蓋全螢幕。這會造成：
- 玩家無法看清楚最後一擊造成了多少傷害、誰倒下了。
- 玩家不知道自己是因為「獎賞卡抽完」、「無牌可抽(Deck Out)」，還是「備戰區無怪可推派(Bench Out)」而輸贏。
- 沒辦法回顧整場的對戰紀錄來找出關鍵失誤。

---

## 2. 全新結算流程設計 (UX Flow)

### 階段一：戲劇性延遲與動畫 (Dramatic Delay)
當達成勝利條件時，**不要立刻彈出蓋版**。
1. 讓最後一擊的傷害數字、擊倒動畫 (Faint Animation) 完整播放完畢。
2. 畫面中央閃出大字體提示（例如：`VICTORY` 或 `DEFEAT`），伴隨對應的音效，停留約 2 秒鐘。

### 階段二：結算面板彈出 (Result Panel)
動畫結束後，畫面變暗（加上半透明黑色遮罩，而非實體蓋版），中央浮現「結算面板」。面板上需包含：
- **勝負標題**: 「🏆 玩家 1 獲得勝利！」
- **致勝原因 (Win Condition)**: 
  - *「成功拿取了所有獎賞卡！」*
  - *「對手備戰區已無寶可夢可上場！」* (Bench Out)
  - *「對手牌組耗盡，無法抽牌！」* (Deck Out)
- **操作按鈕**:
  1. `[🎮 再來一局]`：返回大廳或重新開始。
  2. `[👁️ 檢視最終盤面]`：點擊後隱藏面板，讓玩家看清楚死局的模樣。
  3. `[📜 查看對戰紀錄]`：打開 Log 面板，查看每一回合的動作歷史。

### 階段三：盤面檢視模式 (Review Mode)
當玩家點擊 `[檢視最終盤面]` 後：
- 結算面板會縮小變成畫面角落的一個 `[⬅ 返回結算選單]` 按鈕。
- 玩家可以自由地查看場上的卡牌、雙方手牌（若是單機模式）、甚至點擊卡牌查看詳細資訊。
- 這能極大地滿足玩家「覆盤」與「截圖分享」的需求。

### 階段四：對戰紀錄面板 (Game Log Modal)
利用我們系統底層已經實作好的 `gameState.logs`：
- 以時間軸 (Timeline) 或是對話框 (Chat-style) 的形式，條列出整場遊戲的動作。
- 例如：
  - *Turn 14: 玩家 1 為 噴火龍 填附了 火能量*
  - *Turn 14: 玩家 1 使用了 離洞繩...*
  - *Turn 14: 玩家 1 的 噴火龍 發動攻擊，造成 120 點傷害*
  - *System: 對手場上已無寶可夢可遞補，玩家 1 獲得勝利！*

---

## 3. 預計修改的程式架構 (Technical Plan)

1. **`GameArena.jsx`**: 
   - 移除現有的強硬蓋版 Modal。
   - 實作新的 `<GameOverPanel>` 元件，並加入 `showReviewMode` (布林值) 的狀態來切換隱藏。
2. **結算原因傳遞**: 
   - 目前 `rules.js` 的 `resolveKnockout` 與 `drawForTurn` 中雖然有寫入 system log，但沒有明確將「結算原因」輸出到 state 的獨立欄位。
   - 預計在 `gameState` 新增 `winReason: 'prizes' | 'bench_out' | 'deck_out'`，方便 UI 直接對應顯示圖示與文案。
3. **實作 `<GameLogViewer>` 元件**:
   - 讀取 `gameState.logs` 陣列，渲染成可滾動的列表。
   - 在結算面板中呼叫此元件。
