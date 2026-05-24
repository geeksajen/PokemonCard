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

## 6. D3 — Content Pack 抽離 ✅ DONE (2026-05-24)

**最終狀態：** 引擎已與「寶可夢」內容完全分離。

### 完成的工作

#### 6.1 新增主題包目錄結構
```
src/
  models/
    cardTypes.js              ← 引擎 enum (CardTypes, EnergyTypes)，獨立檔以避免循環引用
    cards.js                  ← 引擎核心：實例化、稀有度、generateThemeDeck 演算法
    gameState.js              ← 從 active pack 取得預設主題
  themes/                     ← 新增！主題包根目錄
    README.md                 ← 主題包契約與新增主題包教學
    active.js                 ← 選擇當前載入哪一個主題包（換包改這一行）
    pokemon/
      pack.meta.js            ← packId / version / 作者
      cards.js                ← cardDatabase（從 models/cards.js 搬出）
      decks.js                ← themeMap + buildComposition
      starter-decks.js        ← SetupPage 用的選單資料
      ace-showcase.js         ← HomePage 主視覺資料
      index.js                ← 彙整 default export
    fantasy/                  ← 示範主題包（證明可換皮）
      [同上結構，最小可玩配置]
```

#### 6.2 主題包契約 (Content Pack Contract)
詳見 [`src/themes/README.md`](../src/themes/README.md)。一個合法的 pack default export 物件需提供：

| 欄位 | 型別 | 用途 |
|---|---|---|
| `packId` | string | 唯一識別 |
| `packName` / `version` | string | 顯示 / 版本 |
| `cardDatabase` | `{ [id]: CardData }` | 卡牌資料 |
| `themeMap` | `{ [themeId]: { basic, ev1?, ev2?, energy } }` | 主題 → 卡片映射 |
| `buildComposition` | `(themeEntry) => [{ id, count }]` | 牌組組成函式 |
| `starterDecks` | `[{ id, name, color }]` | SetupPage 起手牌組 |
| `customDeckColor` | string | 自訂牌組預覽色 |
| `aceShowcase` | `{ [key]: { name, image, glow } }` | HomePage 主視覺 |
| `defaultAceKey` | string | 預設展示哪隻 ace |

#### 6.3 更新的引擎入口
- `models/cards.js` 不再內含寶可夢資料，只負責：型別 enum re-export、`newInstanceId`、`defaultInstantiate`、`setCardInstantiator`、`generateThemeDeck` 演算法、`RARITY_CONFIG`、`getCardRarity`
- `cardDatabase` 從 `activePack.cardDatabase` 取得並 re-export — 既有 consumer (`game/rules.js`、`CardRepository`、各 JSX) 完全不需改 import 路徑
- `generateThemeDeck(theme)` 演算法不變，但 `themeMap` / `buildComposition` 改從 active pack 取得
- `gameState.js` 的預設主題從 `activePack.themeMap` 第一個 key 推導，不再寫死 `'fire'`

#### 6.4 元件遷移
- `HomePage.jsx` — `ACE_POKEMON` 常數移除，改 `activePack.aceShowcase`；ace 圖片缺失時 fallback 顯示 🃏 emoji
- `SetupPage.jsx` — 寫死的 `themes` 陣列改 `activePack.starterDecks`；`useState` 預設值改 `themes[0]?.id`
- `BattlePage.jsx` — fallback theme 改 `activePack.starterDecks[0]?.id`
- `CardRepository.js` — 不變（透過 `models/cards.js` 的 re-export 拿到 `cardDatabase`）

#### 6.5 換主題包驗證
- 編輯 [`src/themes/active.js`](../src/themes/active.js) 的 import：
  ```diff
  - import pokemonPack from './pokemon';
  + import fantasyPack from './fantasy';
  - export const activePack = pokemonPack;
  + export const activePack = fantasyPack;
  ```
- 整個遊戲(首頁、設定頁、戰鬥區、卡牌庫)立刻變成 fantasy 內容
- **無需動引擎程式碼，無需改 JSX，無需改 store**
- 任何卡牌圖片缺失會由 fallback 機制顯示 emoji，不會 crash

### 已知小型耦合（不影響換皮）
| 位置 | 性質 |
|---|---|
| `useGameEngine.js:321` `attacker.energyType \|\| 'fire'` | 攻擊動畫類型 fallback，'fire' 對應 CSS 的 `.fx-fire` class — 屬於 EnergyTypes 槽位 ID 慣例 |
| `RARITY_CONFIG.basic.stageBadge.gradient` 灰階漸層 | 通用 UI 灰階，視為主題無關 |
| `src/components/Lobby.jsx` | Legacy 未路由，封存中 |
| `src/pages/StudioPage.jsx` + `src/features/studio/CardLibrary.jsx` | 卡牌工坊 UI 中文化標籤(「火/水/草/電…」)目前硬寫死，套到非寶可夢主題會顯示語意不符的中文。**戰鬥本身不受影響**，僅影響牌組編輯器 UI 文案。可在後續加 `pack.elementLabels` 解決。 |

### 後續可選擴充（不阻塞驗收）
- 加入 `usePackStore` 提供 runtime 主題包切換 UI（目前是建置期切換 = 改 `active.js`）
- 將 `public/images/` 重組為 `themes/pokemon/assets/` 並透過 `pack.assets.imagePathBase` 解析路徑
- 為 fantasy 主題包補完整的卡牌資料 + 自製圖檔，從示範升級成真實可玩主題

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
