# 12. 實體感「牌盒」輪播選擇器 (3D Deck Box Carousel) ✅ 已完成

> 實作摘要（2026-05-31）— 純 CSS 3D，未引入新套件：
> - 新增 `features/lobby/DeckBoxCarousel.jsx` + `features/lobby/lobby.css`：以 `perspective` + `rotateY` 做 coverflow，選中牌盒置中放大、盒蓋（`.deckbox-lid`）微掀並發光，兩側傾斜淡出；‹ › 箭頭或點擊側盒切換。
> - `SetupPage`：把原本 P1／P2 的純文字 `DeckList` 按鈕欄換成牌盒輪播。每個牌盒依牌組「主要能量屬性」自動上色（`elementColorVar`）與配屬性圖示（`elementEmoji`）——starter 牌組的 id 即屬性 key，自訂牌組以 `getDominantEnergy` 推導。
> - 選 P1 牌組時同步寫入 `setSelectedDeck`（自訂牌組帶 deckId），與 spec 11 大廳王牌看板連動。
> - 顏色全走 token；移除原本內嵌的 `DeckList` 死碼。

## 痛點分析
大廳中若僅使用下拉式選單 (Dropdown) 或純文字列表來選擇出戰牌組，操作體驗較為扁平死板，缺乏收集實體卡牌遊戲的樂趣。

## 優化設計 (UI/UX)
1. **具象化牌盒 (Deck Box Visuals)**：
   - 將玩家建立的每一個牌組，在 UI 上繪製成一個立體的「卡牌盒 (Deck Box)」。
   - 根據牌組內佔比最高的能量屬性，自動為牌盒上色（例如火系為主則牌盒為紅色，並帶有火焰圖騰）。
2. **輪播式選擇 (Carousel Interaction)**：
   - 取代傳統列表，讓這些牌盒以水平輪播 (Carousel) 或 3D Coverflow 的方式排列於畫面中央或底部。
   - 玩家可左右滑動或點擊兩側箭頭切換。目前選中的牌盒會放大置中，並呈現「打開」的微動畫。
   - 目的：利用隱喻 (Metaphor) 將數位介面實體化，提升玩家準備出戰時的期待感。

## 實作建議
- 可使用現成的 React Carousel 套件（如 Swiper.js），配合 CSS 的 `transform: perspective` 與 `rotateY` 達成 3D 效果。
- 牌盒樣式可利用 CSS 繪製出簡單的 3D 方塊，或使用精美的 2D 圖片替換。
