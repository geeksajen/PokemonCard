# 2. 棄牌堆檢視面板與牌庫計數 (Discard Viewer & Deck Count)

## 痛點分析
在卡牌對戰的中後期，計算剩餘資源（能量、特定道具）是非常關鍵的戰術行為。目前遊戲中較難隨時掌握棄牌堆的完整內容，牌庫的剩餘張數也不夠顯眼。

## 優化設計 (UI/UX)
1. **牌庫計數徽章 (Deck Count Badge)**：
   - 在畫面上方（對手）與下方（我方）的牌庫 UI 元件上，常駐顯示一個明顯的數字徽章（Badge），例如「剩餘 24 張」。
   - 當牌數低於危險值（如 5 張以下）時，可將數字變為紅色以作警示。
2. **棄牌堆檢視器 (Discard Pile Viewer)**：
   - 將棄牌堆 UI 設為可點擊 (Clickable)。
   - 點擊後彈出一個全螢幕的半透明 Modal，以畫廊 (Grid) 的形式整齊排列展示該棄牌堆中的所有卡牌。
   - 目的：滿足深度玩家在思考戰術時的「算牌」需求，提升競技體驗。

## 實作建議
- 新增一個 `<DiscardViewerModal>` 元件，接收 `gameState.players[id].discardPile` 作為資料來源，並使用 Flexbox 或 CSS Grid 排版。
- 在 `PilePair.jsx` (牌堆元件) 加上 `onClick` 事件來開啟該 Modal。
