# 9. 拖曳入編與物理音效 (Drag-to-Deck & Satisfying SFX) ✅ 已完成

> 實作摘要（2026-05-31）— 以原生 HTML5 DnD 實作，不污染戰鬥用的自訂拖曳 hook：
> - **跨區拖曳**：庫存卡（`CardLibrary`）與牌組項目（`DeckList`）皆設 `draggable`，分別以自訂 MIME 型別 `application/x-pk-from-library` / `application/x-pk-from-deck` 標記來源（型別名在 `dragover` 階段即可辨識，免共享 React 狀態）。牌組面板只接受 from-library 放置→加入；卡牌庫只接受 from-deck 放置→移除。放置區拖曳懸停時加上 `.studio-drop-active` 高亮（加入＝藍、移除＝紅）。
> - **物理音效**：`sounds.js` 新增 `sfxDeckAdd`（裝入卡套摩擦＋上揚雙音）與 `sfxDeckRemove`（下行抽出聲）；於 `StudioPage` 的 `handleAddCard`／`handleRemoveCard` 成功時觸發，點擊與拖曳皆共用同一入口故兩種操作都有聲。
> - 拖曳放置最終仍走既有的 `handleAddCard`／`handleRemoveCard`（含 27 張與同名 4 張的規則檢查），保持單一真相；未改動 Zustand store 結構或遊戲規則。

## 痛點分析
單純使用滑鼠點擊卡牌旁邊的「+」或「-」按鈕雖然實用，但作為一款收集型卡牌遊戲，這樣組牌的過程稍嫌機械化，缺乏「把實體卡牌塞進專屬牌盒」的沉浸感與樂趣。

## 優化設計 (UI/UX)
1. **拖曳式編排 (Drag and Drop Interaction)**：
   - 允許玩家直接按住左側庫存區的卡牌，將其拖曳至右側的「牌組清單」區域放開，即可將卡牌加入牌組。
   - 反之，將卡牌從右側拖曳到外部放開，即可將其移除。
   - 拖曳過程中，目標區域需有高亮提示 (`drop-zone-highlight`)。
2. **清脆的實體音效 (Physical SFX)**：
   - 無論是用點擊還是拖曳加入卡牌，觸發一個清脆的「卡片摩擦聲」或「裝入卡套聲」。
   - 移除卡牌時，播放另一種輕快的「抽出聲」。
   - 目的：透過聽覺與觸覺（拖曳）的雙重回饋，把枯燥的組牌過程變成一種感官享受。

## 實作建議
- 結合目前戰鬥中使用的拖曳套件（如 `react-dnd` 或原生 API）來實作跨區域拖曳。
- 準備短促且不刺耳的 UI 音效檔，於狀態更新 (`addCardToDeck` / `removeCardFromDeck`) 成功時觸發播放。
