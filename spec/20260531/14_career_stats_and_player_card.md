# 14. 生涯戰績與個人名片 (Career Stats & Player Card) ✅ 已完成

> 實作摘要（2026-05-31）：
> - 新增 `useStatsStore`（zustand + persist）：`wins/losses/games`、`elementCounts`（各屬性使用場數）、`history`（近 50 場）、`recordResult()`。
> - 戰績記錄：`useGameEngine` 新增 `onGameOver` 回呼（以 ref 確保整場僅觸發一次，於 winner 出現時呼叫）；`GameArena` 透傳；`BattlePage` 注入 `handleGameOver`，以人類玩家（player1）視角、依 p1 牌組主要屬性記錄勝負（vsAI 時）。
> - `HomePage` 個人名片：常駐顯示暱稱、代表頭像、🏆 勝場／勝率／總場數，並依 `elementCounts` 最大值頒發「最愛屬性訓練家」徽章；點擊名片開啟 `PlayerStatsModal` 檢視總覽與歷史對戰（對手、使用屬性、勝負、日期）。
> - 顏色全走 token；統計資料皆來自 store，UI 僅讀取渲染。

## 痛點分析
長期遊玩卡牌遊戲的玩家需要成就感與目標感。如果大廳沒有展示玩家的累積努力，很容易讓人覺得「打完一場什麼都沒留下」，影響長期黏著度。

## 優化設計 (UI/UX)
1. **專屬訓練家名片 (Player Card Panel)**：
   - 在大廳的左上角或右上角，設計一個常駐的精美名片小卡。
   - 顯示玩家暱稱、大頭貼（或代表寶可夢）。
2. **核心數據展示 (Core Statistics)**：
   - 簡潔明瞭地列出：**總勝場數、勝率 (%)、總對戰場數**。
   - 根據玩家最常使用的牌組屬性，頒發並顯示一枚**「最愛屬性徽章」**（例如：專精水屬性的訓練家）。
3. **戰績點擊展開 (Expandable Details)**：
   - 點擊名片後可展開一個 Modal，觀看更詳細的歷史對戰紀錄（對手是誰、使用牌組、勝負結果）。
   - 目的：提供玩家炫耀與回顧的介面，增加自我實現的滿足感。

## 實作建議
- 需在 Zustand (如 `useAuthStore` 或新的 `useStatsStore`) 中新增紀錄勝負場次、歷史紀錄的狀態欄位，並透過 `persist` 中介軟體存檔。
- 大廳讀取該 Store 的資料來渲染名片 UI。
