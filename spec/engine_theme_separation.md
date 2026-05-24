# Engine / Theme Separation — 架構原則

> **核心原則：PKCard 是「卡牌遊戲引擎 + 主題包」的組合，而非「寶可夢卡牌遊戲」。**
> 遊戲機制(engine)是與主題無關的；視覺、色彩、卡牌資料、頁面氛圍都是可換的「主題包」(theme pack)。
> 未來只要設計新的主題包（例如奇幻、科幻、武俠），不需動引擎程式碼，整個遊戲就能換皮上線。

---

## 1. 四層架構 (Architecture Layers)

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 4 — Page Atmospheres                                 │
│  (HomePage 星空 / SetupPage 分割漸層等獨立藝術方向)             │
│  → --page-* CSS tokens                                       │
├─────────────────────────────────────────────────────────────┤
│  Layer 3 — Game Palette                                     │
│  (玩家色、能量元素色、卡種框邊色)                                │
│  → --palette-* CSS tokens                                    │
├─────────────────────────────────────────────────────────────┤
│  Layer 2 — UI Theme (Dark Cosmic / Light Holographic Glass) │
│  (背景、面板、文字、邊框、陰影、毛玻璃強度)                       │
│  → --theme-* CSS tokens                                      │
├─────────────────────────────────────────────────────────────┤
│  Layer 1 — Game Engine (immutable)                          │
│  (回合制、能量附加、攻擊解算、勝負條件)                          │
│  → src/game/rules.js + src/hooks/useGameEngine.js            │
│                                                              │
│  ⚠️ Content Pack 目前仍與引擎耦合 — 見「未完成事項」              │
└─────────────────────────────────────────────────────────────┘
```

**重點：**
- **Layer 1 不應該知道 Layer 2/3/4 的存在。** 規則函式 `(state, ...args) => { ok, state }` 永遠不直接讀色碼。
- **Layer 2 不應該知道 Layer 3 的存在。** 換 Dark/Light 不該改變火屬性是紅色這件事。
- **Layer 3 通常不需要隨 Light/Dark 切換。** 火元素在 Light 模式下依然應該是紅色（除非該主題包另有設計）。

---

## 2. Token 命名與職責 (Token Contract)

### Layer 2 — `--theme-*` (UI 鍍層)
| Token | 用途 |
|---|---|
| `--theme-bg-global` | 全域 body 背景 |
| `--theme-panel-light/base/dark` | 三層毛玻璃面板（淺/中/深） |
| `--theme-glass-border` | 玻璃邊框高光 |
| `--theme-text-main` / `--theme-text-muted` | 主要 / 次要文字 |
| `--theme-shadow` | 統一陰影 |
| `--theme-blur` | 統一毛玻璃 blur 強度 |

### Layer 3 — `--palette-*` (遊戲色板)
| Token | 用途 |
|---|---|
| `--palette-player1` / `--palette-player1-glow` | 玩家 1 主色 / 光暈 |
| `--palette-player2` / `--palette-player2-glow` | 玩家 2 主色 / 光暈 |
| `--palette-element-1`～`-6` | 元素類型 1-6 的漸層（採數字索引，與主題語意解耦） |
| `--palette-element-neutral` | 無屬性 / 一般類型漸層 |
| `--palette-class-basic` | 基本卡背景漸層 |
| `--palette-class-stage1` / `-mid` / `-accent` | 一階進化卡背景 / 中段紫 / 金色強調 |
| `--palette-class-stage2` / `-accent` / `-accent2` | 二階進化卡背景 / 雙色強調 |
| `--palette-class-trainer` | 訓練家卡漸層 |
| `--palette-class-item` | 道具卡漸層 |
| `--palette-card-back` / `-accent` | 卡背設計(face-down card) — 對應品牌視覺 |

**Element 命名決策：** 採用數字索引 (`element-1`) 而非語意名稱 (`element-fire`)，目的是讓元素系統可以重新映射。例如奇幻主題包可以把 `element-1` 重新對應到「火焰魔法」，把 `element-3` 對應到「自然魔法」，JS 層的 `EnergyTypes` enum 不變。

### Layer 4 — `--page-*` (頁面氛圍)
| Token | 用途 |
|---|---|
| `--page-lobby-bg` | HomePage 主背景 |
| `--page-lobby-nebula` | HomePage 星雲光暈色 |
| `--page-lobby-starfield-color` | 星空點點顏色 |
| `--page-setup-bg` | SetupPage 主背景 |
| `--page-setup-overlay` | SetupPage Header/Footer bar 背景 |
| `--page-setup-divider` | SetupPage 分隔線 |

---

## 3. JS 端的對接規則 (JS Integration Rules)

### 規則 A — JS 不直接寫 hex/rgba 色碼
所有顏色字串應為 `var(--palette-*)` 或 `var(--theme-*)`。範例：
```js
// ❌ 不允許
const getEnergyColor = (type) => {
  if (type === 'fire') return 'linear-gradient(135deg, #f87171, #dc2626)';
};

// ✅ 應該
const getEnergyColor = (type) => {
  const map = { fire: 'var(--palette-element-1)', water: 'var(--palette-element-2)' };
  return map[type] ?? 'var(--palette-element-neutral)';
};
```

### 規則 B — 設定物件用 token 字串，不用色碼
`RARITY_CONFIG` (`src/models/cards.js`) 等視覺設定物件存放 `var(--palette-*)` 字串，運行時由 CSS 解析。

### 規則 C — 換主題流程
新增一個主題包（例如「奇幻」）的標準步驟：
1. 複製 `[data-theme="light"]` 為 `[data-theme="fantasy"]`，覆寫所有 `--theme-*` / `--palette-*` / `--page-*`
2. 替換 `public/images/` 下的卡牌圖（檔名/結構保持一致）
3. 在 `useThemeStore` 的允許值新增 `"fantasy"`
4. 完成。**不需動 JSX、不需動 rules.js、不需動 hook**

---

## 4. 已完成的工作 (Done)

### Phase 1 — 三層 Token 架構 (2026-05-24)
- ✅ Layer 2 (`--theme-*`) 完整建立，Dark + Light 兩主題並存
- ✅ 主題切換按鈕 ([ThemeToggle](../src/components/ThemeToggle.jsx)) + Zustand persist store
- ✅ Layer 3 (`--palette-*`) token 完整定義(玩家色、元素色 1-6、卡背、卡種框邊)
- ✅ Layer 4 (`--page-*`) token 在 `:root` 與 Light 主題定義
- ✅ Studio、Login、Profile、Navigation 全面 token 化
- ✅ Modal、HUD、Toast、Log Drawer、Turn Transition Overlay 共用元件 token 化

### Phase 2 — UI 鍍層收尾 (2026-05-24)
- ✅ `CardInspectModal.jsx` — 34 處硬寫死全清(panel、border、HP 條、能量球、徽章邊框等)
- ✅ `GameArena.jsx` — pendingAction 目標選擇浮窗、selectedCard 提示氣泡
- ✅ `Board.jsx` — 戰鬥區/備戰區虛線邊框、空位背景
- ✅ `HudOverlay.jsx` — 分隔線、玩家面板光暈改用 `--palette-player1-glow`
- ✅ `SettingsModal.jsx` — 靜音狀態背景
- ✅ `PilePair.jsx` — 牌庫/棄牌標籤、空位虛線框

### Phase 3 — Layer 3 色板遷移 (2026-05-24)
- ✅ `Card.jsx` `getEnergyColor()` → `var(--palette-element-N)` 對應 fire/water/grass/electric/psychic/fighting/normal
- ✅ `Card.jsx` 卡背設計(藍底金邊) → `var(--palette-card-back)` + `var(--palette-card-back-accent)`
- ✅ `CardInspectModal.jsx` 能量色 + trainer/item 邊框漸層
- ✅ `TurnTransition.jsx` 玩家色(P1 藍 / P2 紅) → `var(--palette-player1/2)`
- ✅ `cards.js` `RARITY_CONFIG` 所有硬寫死漸層 → `var(--palette-class-*)`
  - 使用 `color-mix(in srgb, var(--palette-class-*) X%, transparent)` 處理 rgba 變體

### Phase 4 — Layer 4 頁面氛圍 (2026-05-24)
- ✅ `HomePage.jsx` 根容器、星空、星雲、status bar、玩家頭像/Lv 徽章/Title gradient/PLAY 按鈕、Frosted name badge、左側導覽 → 全換 token
- ✅ `SetupPage.jsx` 根容器、header bar、DeckList 選項、Mode toggle、VS 分隔線、Confirm footer/按鈕 → 全換 token

---

## 5. 剩餘已知耦合 (Known Coupling — 留給 D3)

以下是**內容資料**(content metadata)層級的耦合，屬於 [D3 Content Pack 抽離](#6-d3-未完成事項--content-pack-抽離) 範圍，不在本次主題化重構的工作範圍內：

| 位置 | 內容 |
|---|---|
| `src/pages/HomePage.jsx` 的 `ACE_POKEMON` | 噴火龍/水箭龜/妙蛙花/雷丘 名稱、圖片、glow rgba |
| `src/pages/SetupPage.jsx` 的 `themes` 陣列 | fire/water/grass/electric 起手牌組與其 color rgba |
| `src/models/cards.js` 的 `cardDatabase` | 整個寶可夢卡牌資料庫 |
| `src/components/Lobby.jsx` (legacy) | 未被路由使用，可封存或保留作為舊版參考 |
| `RARITY_CONFIG.basic.stageBadge.gradient` 的 `#64748b, #94a3b8` | 「基礎」徽章灰階漸層，視為通用 UI 灰階，可選擇是否抽 token |

這些都會在 D3 抽出內容包時一併移除。

---

## 6. D3 未完成事項 — Content Pack 抽離

**目前狀態：** 引擎和「寶可夢」內容仍然耦合在 `src/models/cards.js` 裡。

**問題點：**
- `cardDatabase` 直接寫死寶可夢名字、HP、攻擊招式名稱、圖片路徑 (`/images/charizard.png` 等)
- `generateThemeDeck(theme)` 寫死了 fire/water/grass/electric 四個 theme 與其對應卡片組合
- 圖片資源直接放在 `public/images/`，與寶可夢命名綁定 (charizard.png, blastoise.png...)
- `HomePage.jsx` 的 `ACE_POKEMON` 常數直接列出噴火龍、水箭龜、妙蛙花、雷丘
- `Lobby.jsx` (legacy) 和 `SetupPage.jsx` 的 `themes` 陣列直接寫死寶可夢主題名稱

**未來 D3 應該做的（不在本次範圍）：**

1. **抽出 Content Pack 介面**
   - 建立 `src/engine/content-pack-schema.js` — 定義一個合法主題包必須提供哪些欄位
   - 範例 schema：
     ```
     {
       packId: string,
       packName: string,
       elements: [{ id, name, paletteIndex }],  // 對應 --palette-element-N
       cardDatabase: { [cardId]: CardData },
       starterDecks: { [deckId]: { name, cards } },
       assets: { imagePathBase, sounds },
       aceShowcase: [{ cardId, glowColor }]    // HomePage 主視覺
     }
     ```

2. **重組目錄**
   ```
   src/
     engine/           ← 純引擎（規則、流程、不依賴主題）
       rules.js        ← 從 game/rules.js 搬過來
       useGameEngine.js
       content-pack-schema.js
     themes/
       pokemon/        ← 第一個主題包
         pack.json
         cards.js      ← 從 models/cards.js 搬過來
         assets/       ← 圖片從 public/images 搬過來
       fantasy/        ← 未來範例
         pack.json
         ...
     models/           ← 通用型別與 helper（去除寶可夢特定資料）
   ```

3. **由 store/設定載入主題包**
   - `useGameStore` 或新的 `usePackStore` 在啟動時載入指定 pack
   - `cardDatabase` 變成 `pack.cardDatabase`，`generateThemeDeck` 接收 `pack` 為參數

4. **修改受影響的元件**
   - `HomePage.ACE_POKEMON` → 改用 `pack.aceShowcase`
   - `SetupPage.themes` → 改用 `pack.starterDecks`
   - `Card.jsx` 圖片路徑 → 改用 `pack.assets.imagePathBase + card.image`

5. **驗收標準**
   - 在不動引擎程式碼的情況下，新建一個 `themes/fantasy/` 主題包就能啟動一場可玩的「奇幻卡牌對戰」
   - 切換 `usePackStore` 的 packId 可在大廳/設定頁切換內容包

**預估工作量：** D3 是目前所有工作裡最大的一塊（大約是 P1-P4 加總的 1.5-2 倍），涉及檔案搬移、引入新抽象、修改所有引用 `cardDatabase` 的元件。建議在 P1-P4 全部完成、視覺層完全解耦後，再啟動 D3。

---

## 7. 開發者守則 (Maintenance Rules)

寫新元件 / 修改既有元件時：

1. **永遠不在 JSX `style={{ }}` 寫具體色碼或 rgba。** 一律用 `var(--theme-*)` / `var(--palette-*)` / `var(--page-*)`。
2. **不在 JS 模組頂層寫色碼字串。** 如必須在 JS 決定顏色，使用 token 字串：`'var(--palette-element-1)'`。
3. **新主題包不應該需要修改任何 .jsx / .js 檔。** 如果你發現必須改 JSX 才能換主題，那就是引擎/主題分離的破口，請補 token 而非 hardcode。
4. **新的視覺需求若沒有現成 token，先加 token 再用。** Token 是契約，不該繞過。

---

## 附錄 — 相關檔案

- Token 定義：[src/index.css](../src/index.css)
- 主題切換 store：[src/store/useThemeStore.js](../src/store/useThemeStore.js)
- 切換按鈕元件：[src/components/ThemeToggle.jsx](../src/components/ThemeToggle.jsx)
- Light 主題規範：[spec/theme/theme_b_light_glass.md](./theme/theme_b_light_glass.md)
- 重構進度追蹤：[spec/theme/高優先.md](./theme/高優先.md)
