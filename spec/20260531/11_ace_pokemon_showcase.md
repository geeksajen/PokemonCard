# 11. 王牌寶可夢「看板展示」 (Ace Pokemon Showcase) ✅ 已完成

> 實作摘要（2026-05-31）：
> - 新增純函式 util `utils/deckInsights.js`（theme-agnostic）：`getAceCard`（先比進化階級再比 HP）、`getDominantEnergy`、`elementColorVar`，供 11/12/13 共用。
> - `useCardStore` 新增持久化 `selectedDeckId` + `setSelectedDeck`（大廳/輪播共用「目前選定牌組」）。
> - `HomePage`：王牌看板改為動態——掃描選定牌組（或第一個自訂牌組）取最具代表性的寶可夢立繪，光暈依牌組主要屬性；無自訂牌組/無立繪時回退主題包預設王牌（保留原行為）。
> - 視覺：保留既有 `floatPokemon` 呼吸浮動，並新增滑鼠視差（`onMouseMove` 偏移王牌看板 ±約 15px，0.25s ease 平滑）。
> - 顏色走 token/pack 資料，未在 JSX 寫死色值字面量；未動引擎層。

## 痛點分析
目前大廳可能只使用靜態的背景圖，隨著遊玩時間增加容易產生視覺疲勞，且無法展現玩家當前使用的牌組特色，缺乏個人化的代入感。

## 優化設計 (UI/UX)
1. **動態提取王牌 (Dynamic Ace Selection)**：
   - 系統自動掃描玩家「目前選定牌組」，挑選出 HP 最高、或稀有度最高 (例如 VMAX, ex) 的寶可夢作為該牌組的「王牌」。
   - 將這隻寶可夢的立繪 (Artwork) 去背放大，作為大廳的主視覺（放置於畫面左側或右側的大面積留白處）。
2. **視覺動態特效 (Breathing & Parallax)**：
   - 為該看板寶可夢加上微幅的 CSS `@keyframes` 動畫（例如 `translateY` 緩慢上下浮動），營造「呼吸」的生命感。
   - 可選：根據滑鼠移動軌跡，加入輕微的視差滾動 (Parallax) 效果，讓大廳充滿立體感。
   - 目的：讓大廳每次切換牌組時都有全新的視覺感受，並強化玩家與自己愛用寶可夢的羈絆。

## 實作建議
- 在大廳載入時，撰寫一個 helper function 從 `currentDeck` 中過濾出 `CardTypes.POKEMON` 並依照 `currentHp` 或 `rarity` 排序取出第一名。
- 確保去背圖檔解析度足夠，或利用 CSS 遮罩融入背景。
