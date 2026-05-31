# 6. 視覺化的圖示篩選器 (Visual Icon Filters) ✅ 已完成

> 實作摘要（2026-05-31）— 純 Studio UI，沿用 CardLibrary 自有篩選狀態：
> - `CardLibrary.jsx`：把原本單選的 `filterType`/`filterElement` 改為多選陣列 `selectedTypes` / `selectedElements`；類型用 🐾 寶可夢 / 👤 訓練家 / ⚡ 能量 圖示按鈕，能量屬性用以 `--palette-element-*` token 上色的圓形圖示按鈕。
> - 即時多重篩選：類型與屬性以 AND 組合（例：水＋寶可夢＝只剩水系寶可夢）；選屬性時排除無屬性的訓練家/物品；附「✕ 清除篩選」。
> - `studio.css`：新增 `.lib-type-btn` / `.lib-energy-btn`（active 亮起 + 光暈 + 放大）等樣式；順手把搜尋框與空狀態的硬編碼 `rgba`/`white` 換成 `--theme-*` token。
> - 篩選狀態屬瀏覽行為，續留在 `CardLibrary`，不污染 `StudioPage` 的牌組狀態。

## 痛點分析
在卡牌工坊中，隨著玩家收集的卡牌數量增加，如果只能依賴文字輸入框來搜尋，或是漫無目的地滾動頁面，組牌的效率會非常低且容易感到煩躁。

## 優化設計 (UI/UX)
1. **屬性與類型圖示按鈕 (Icon Toggle Buttons)**：
   - 在卡牌庫的上方或側邊，設計一排直覺的「圓形或方形圖示按鈕」。
   - **能量屬性**：火、水、草、電、超能力、格鬥、無色等專屬能量 Icon。
   - **卡牌類型**：寶可夢 (球)、道具 (背包)、支援者 (人像) 等 Icon。
2. **即時多重篩選 (Instant Multi-filtering)**：
   - 點擊圖示時，按鈕會亮起（Active 狀態），下方卡牌庫即時過濾出對應的卡牌。
   - 支援複選（例如同時點擊「水」與「寶可夢」，只顯示水系寶可夢）。
   - 目的：大幅減少文字輸入的麻煩，利用視覺直覺達成「所見即所搜」的流暢體驗。

## 實作建議
- 在 Studio 的狀態管理中新增 `filters` 物件（包含 type 與 energy 陣列）。
- 準備好精緻的 SVG 屬性圖示，配合 CSS `opacity` 與 `box-shadow` 來呈現按鈕的點擊狀態。
