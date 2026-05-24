# 遊戲全面性 UI 設計與視覺整合計畫

## 🎯 核心目標 (Core Goal)
解決「卡牌工坊 (Studio)」與「主遊戲 (Battle)」在視覺上的斷層，並將整個遊戲的 UI 統一提升至 `02.design.md` 中要求的 **「Modern & Premium (現代與頂級感)」** 沉浸式體驗。

---

## 🔍 現況問題分析 (Current Issues)

1. **背景色衝突 (Background Inconsistency)**
   - 全域 (`index.css`)：使用孔雀綠/深藍綠色的放射漸層 (`#0f766e` 到 `#042f2e`)。
   - 工坊 (`studio.css`)：強制覆蓋成深灰/深藍色的線性漸層 (`#111827` 到 `#1f2937`)。
   - 違背了設計規範中規定的「深宇宙色系 (`#0f172a` 到 `#1e1b4b`)」。
2. **毛玻璃 (Glassmorphism) 標準不一**
   - 戰鬥 HUD (`.hud-panel`)、一般面板 (`.glass-panel`)、工坊面板 (`.card-library`) 各自寫了不同的 `blur` 值（從 8px 到 15px 不等）與不同的背景透明度。
3. **按鈕與互動元件碎裂**
   - `index.css` 定義了一套泛用 `button`。
   - `studio.css` 又自訂了 `.filter-btn` 和 `.deck-action-btn`，導致 hover 動畫、陰影邏輯在不同頁面體驗不同。

---

## 🛠️ 實作規劃 (Implementation Plan)

### 1. 統一宇宙深色背景 (Global Background)
- **目標**：讓所有頁面（包含大廳、工坊、戰鬥）共用同一塊「深宇宙畫布」。
- **作法**：
  - 修改 `src/index.css` 的 `body` 背景，統一改為深宇宙漸層 (`#0f172a` 到 `#1e1b4b`)。
  - 移除 `src/studio.css` 中 `.studio-container` 私有的 `background` 屬性。

### 2. 建立 Glassmorphism 標準化 Tokens
- **目標**：讓全域的玻璃擬物化質感保持絕對一致。
- **作法**：在 `index.css` 建立一套標準化的 CSS Classes，例如：
  - `.glass-panel-light` (小元件、小按鈕)
  - `.glass-panel-base` (一般區塊、資訊面板)
  - `.glass-panel-dark` (大型背景板、Modal)
  - 統一 `backdrop-filter` 與邊框的高光反射 (`rgba(255, 255, 255, 0.1)`)。

### 3. 按鈕與互動元件收斂 (Button Standardization)
- **目標**：統一全遊戲的點擊回饋與互動微動畫。
- **作法**：
  - 在 `index.css` 定義統一的 Button 基礎樣式與變體（如 Primary, Danger, Ghost）。
  - 將 `studio.css` 中的 `.filter-btn` 和 `.deck-action-btn` 重構，改為繼承或直接使用全域 Button class。
  - 規範統一的微動畫：Hover 時上浮 (-2px) 並增加外發光。

### 4. 排版與佈局 (Layout & Spacing)
- **目標**：確保各頁面切換時，畫面焦點平穩不跳動。
- **作法**：
  - 確認 `src/components/Navigation.jsx` 在所有非戰鬥頁面的頂部能完美以毛玻璃形態懸浮融入背景。
  - 清理 `StudioPage.jsx` 與 `HomePage.jsx` 中多餘的 inline-styles，改用統一的 margin/padding CSS Variables。

---

## 🚀 預期效益 (Expected Outcome)
- **視覺一致性**：玩家從大廳進入卡牌工坊，再進入戰鬥，將感受到渾然一體的「宇宙競技場」頂級氛圍。
- **程式碼可維護性**：大幅減少重複的 CSS 樣式，未來新增頁面只需套用標準 class 即可。
