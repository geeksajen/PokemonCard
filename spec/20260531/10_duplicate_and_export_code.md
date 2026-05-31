# 10. 一鍵複製與代碼匯出 (Duplicate & Export Deck Code) ✅ 已完成

> 實作摘要（2026-05-31）— 編解碼邏輯抽到 util，UI 僅呼叫 store／util：
> - `utils/deckCode.js`（新）：`encodeDeck({name,cardIds})` / `decodeDeck(code)`，格式為 `PKD1.` + UTF-8→Base64 的 JSON（支援中文名稱），解析失敗回 null 容錯。
> - **一鍵複製**：`DeckListPage` 每張牌組卡新增「複製」鈕 → 以原內容（含封面）呼叫既有 `createDeck` 建立「(原名) - 副本」，附 Toast 回饋。
> - **代碼匯出**：`StudioPage` 編輯列新增「🔗 分享代碼」鈕 → `encodeDeck` 後 `navigator.clipboard.writeText`（失敗則 `window.prompt` 供手動複製）。
> - **代碼匯入**：`DeckListPage` 新增「📥 從代碼匯入」入口 → `window.prompt` 取得代碼 → `decodeDeck` → 僅保留目前卡庫存在的卡 id → `createDeck` 後進入編輯。
> - 沿用既有 Zustand `createDeck`，未改 store 結構；順手補上 StudioPage 既有 toast 一直缺失的 `@keyframes slideInFast` 定義。

## 痛點分析
玩家花費大量時間組好一套滿意的牌組後，有時候只是想做點微調（例如把兩張傷藥換成精靈球）來測試強度。如果直接修改，可能會忘記原本的配置；如果手動重新組一副，又非常浪費時間。同時，現有架構也不方便與社群或朋友分享自己的得意牌組。

## 優化設計 (UI/UX)
1. **一鍵複製牌組 (Duplicate Button)**：
   - 在「我的牌組列表」頁面，每一組牌的旁邊提供一個 `[複製]` 圖示。
   - 點擊後直接產生一份名為「(原名) - 副本」的牌組，玩家可以毫無顧忌地在這個副本上進行實驗與微調。
2. **牌組代碼匯出/匯入 (Export / Import Deck Code)**：
   - 在編輯牌組畫面提供 `[分享代碼]` 按鈕，點擊後會自動將牌組內容轉換為一段 Base64 編碼的字串（或簡短 JSON）並複製到剪貼簿。
   - 同時在新增牌組處提供 `[從代碼匯入]` 功能。
   - 目的：大幅降低玩家實驗不同戰術的成本，並為未來的社群分享與討論打下基礎。

## 實作建議
- 複製功能只需讀取該牌組資料，變更 ID 與名稱後，重新寫入 Zustand store。
- 匯出功能可將 `cardIds` 陣列進行簡單的字串壓縮後呼叫 `navigator.clipboard.writeText` 複製。
