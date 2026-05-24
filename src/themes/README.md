# Themes — 主題包系統

這個資料夾收納所有可換的「主題包」(content pack)。每個主題包都是一套完整的卡牌世界：自己的卡牌資料、起手牌組、首頁主視覺。**引擎（game rules）完全不認識任何主題包的內容**，換包不需要動任何 `.jsx` / `.js` 引擎檔案。

---

## 一、快速概覽

```
src/themes/
├── active.js          ← 只改這一行就能換包
├── README.md          ← 本文件
├── pokemon/           ← 預設主題包（寶可夢）
│   ├── index.js         集合匯出
│   ├── pack.meta.js     包名稱/版本
│   ├── cards.js         卡牌資料庫
│   ├── decks.js         主題→牌組映射
│   ├── starter-decks.js SetupPage 選牌組清單
│   └── ace-showcase.js  HomePage 主視覺
└── fantasy/           ← 示範 stub（奇幻主題）
    └── …（同上六個檔案）
```

---

## 二、主題包合約 (Content Pack Contract)

`index.js` 必須 **default export** 一個包含以下所有欄位的物件：

| 欄位 | 型別 | 說明 |
|---|---|---|
| `packId` | `string` | 唯一識別碼，英文小寫+底線，例如 `'fantasy'` |
| `packName` | `string` | 顯示用名稱，例如 `'Fantasy TCG'` |
| `version` | `string` | semver，例如 `'1.0.0'` |
| `cardDatabase` | `{ [cardId]: CardData }` | 所有卡牌定義（見第三節） |
| `themeMap` | `{ [themeId]: ThemeEntry }` | 主題 → 進化線/能量映射（見第四節） |
| `buildComposition` | `(ThemeEntry) => [{ id, count }]` | 回傳牌組組成清單 |
| `starterDecks` | `[{ id, name, color }]` | SetupPage 選牌組按鈕資料 |
| `customDeckColor` | `string` | 自訂牌組的預覽色 |
| `aceShowcase` | `{ [key]: { name, image, glow } }` | HomePage 中央主視覺 |
| `defaultAceKey` | `string` | 預設顯示哪個 ace |

---

## 三、卡牌資料結構 (CardData)

所有卡牌都需要從引擎取得常數：

```js
import { CardTypes, EnergyTypes } from '../../models/cardTypes';
```

### 可用常數

**CardTypes（卡牌種類）**
```js
CardTypes.POKEMON   // 'pokemon'
CardTypes.ENERGY    // 'energy'
CardTypes.TRAINER   // 'trainer'
CardTypes.ITEM      // 'item'
```

**EnergyTypes（屬性/能量種類）**
```js
EnergyTypes.FIRE      // 'fire'
EnergyTypes.WATER     // 'water'
EnergyTypes.GRASS     // 'grass'
EnergyTypes.ELECTRIC  // 'electric'
EnergyTypes.PSYCHIC   // 'psychic'
EnergyTypes.FIGHTING  // 'fighting'
EnergyTypes.NORMAL    // 'normal'
```

> ⚠️ **不要自己造字串** — 永遠用 `CardTypes.*` / `EnergyTypes.*` 這些常數，引擎比對時用的就是這些值。

---

### 3-1 寶可夢卡 (POKEMON)

```js
'my-001': {
  id:          'my-001',                    // 必須與 key 相同，包內唯一
  type:        CardTypes.POKEMON,
  name:        '炎獸',                       // 顯示用名稱
  hp:          60,                          // 初始 HP
  maxHp:       60,                          // 最大 HP（與 hp 相同）
  energyType:  EnergyTypes.FIRE,            // 決定屬性色與能量需求
  image:       '/images/my-creature.png',   // 可為 null（會顯示 emoji fallback）
  attack: {
    name:   '焚燒',
    cost:   [EnergyTypes.FIRE],             // 陣列，每個元素是一個能量需求
    damage: 20,
  }
}
```

**進化卡（Stage 1 / Stage 2）** — 在基礎格式上加 `evolvesFrom`：

```js
'my-001-ev1': {
  id:          'my-001-ev1',
  type:        CardTypes.POKEMON,
  name:        '炎龍',
  hp:          90, maxHp: 90,
  energyType:  EnergyTypes.FIRE,
  image:       '/images/my-ev1.png',
  evolvesFrom: 'my-001',               // ← 進化來源的 id
  attack: { name: '炎爆', cost: [EnergyTypes.FIRE, EnergyTypes.FIRE], damage: 50 }
}
```

---

### 3-2 能量卡 (ENERGY)

```js
'e-fire': {
  id:         'e-fire',
  type:       CardTypes.ENERGY,
  name:       '熾焰結晶',
  energyType: EnergyTypes.FIRE,   // 決定提供哪種能量
}
```

---

### 3-3 訓練家卡 (TRAINER)

```js
't-potion': {
  id:          't-potion',
  type:        CardTypes.TRAINER,
  name:        '藥水',
  heal:        20,               // 回血量（若有回血效果）
  effect:      { kind: 'heal' }, // 引擎識別效果的 descriptor
  description: '回復 20 HP。',
}
```

---

### 3-4 物品卡 (ITEM)

物品卡與訓練家卡格式相同，差異只在 `type`：

```js
'i-switch': {
  id:          'i-switch',
  type:        CardTypes.ITEM,
  name:        '切換石',
  effect:      { kind: 'switch' },
  description: '將己方主動生物換到備戰區。',
}
```

---

## 四、主題映射 (themeMap & buildComposition)

```js
// decks.js

export const themeMap = {
  // key = themeId，需與 starterDecks[].id 一致
  fire: {
    basic:  'my-001',       // 基礎卡 id（必填）
    ev1:    'my-001-ev1',   // Stage 1 卡 id（可省略）
    ev2:    'my-001-ev2',   // Stage 2 卡 id（可省略，省略 ev1 則 ev2 也必須省略）
    energy: 'e-fire',       // 搭配的能量卡 id（必填）
  },
  water: { basic: 'my-002', ev1: 'my-002-ev1', energy: 'e-water' },
};

// buildComposition：把 themeEntry 轉成「各種卡多少張」的陣列
export const buildComposition = (t) => [
  { id: t.basic,  count: t.ev1 ? 6 : 9 },
  ...(t.ev1 ? [{ id: t.ev1,  count: 3 }] : []),
  ...(t.ev2 ? [{ id: t.ev2,  count: 2 }] : []),
  { id: t.energy,     count: 6 },
  // 加入你自己的物品/訓練家卡：
  { id: 't-potion',   count: 2 },
  { id: 'i-switch',   count: 1 },
];
// 注意：所有 id 都必須存在於你的 cardDatabase 中
```

---

## 五、選牌組清單 (starter-decks.js)

```js
// starter-decks.js

export const starterDecks = [
  // id 必須與 themeMap 的 key 完全一致
  { id: 'fire',  name: '🔥 烈焰突擊', color: 'rgba(239, 68, 68, 0.8)' },
  { id: 'water', name: '💧 水花四濺', color: 'rgba(59, 130, 246, 0.8)' },
];

// 自訂牌組按鈕的顏色（與起手牌組顏色做區別用）
export const customDeckColor = 'rgba(139, 92, 246, 0.8)';
```

> `color` 欄位是 SetupPage 牌組按鈕的邊框光暈色，代表該牌組的「屬性色」。  
> 可用 `rgba()` 直接帶屬性色（如上），或對應到 CSS token（見第六節）。

---

## 六、首頁主視覺 (ace-showcase.js)

```js
// ace-showcase.js

export const aceShowcase = {
  // key 對應到你的 themeMap key 或任意自訂 key
  fire: {
    name:  '炎龍王',
    image: '/images/my-fire-ace.png',  // public/ 目錄下的路徑；沒有圖可填 null
    glow:  'rgba(239, 68, 68, 0.45)',  // 角色背後的光暈色（rgba）
  },
  water: {
    name:  '深淵巨獸',
    image: null,   // null → HomePage 自動顯示 🃏 emoji fallback
    glow:  'rgba(59, 130, 246, 0.45)',
  },
};

export const defaultAceKey = 'fire'; // 預設顯示哪個
```

---

## 七、彙整匯出 (index.js)

```js
// index.js — 固定格式，照搬改名即可

import { packMeta }                    from './pack.meta';
import { cardDatabase }                from './cards';
import { themeMap, buildComposition }  from './decks';
import { starterDecks, customDeckColor } from './starter-decks';
import { aceShowcase, defaultAceKey }  from './ace-showcase';

const myPack = {
  ...packMeta,
  cardDatabase,
  themeMap,
  buildComposition,
  starterDecks,
  customDeckColor,
  aceShowcase,
  defaultAceKey,
};

export default myPack;
```

---

## 八、⚠️ 顏色守則 — 必須遵守

這些規則防止主題包破壞全局的 dark/light CSS 切換系統：

### 規則 1：JS 模組頂層不得有硬寫死的顏色常數

```js
// ❌ 禁止 — 頂層常數用 hex/rgba
const THEME_COLOR = '#ff0000';
export const myData = { color: THEME_COLOR };

// ✅ 正確 — 直接在資料裡用 rgba 或 CSS token string
export const starterDecks = [
  { id: 'fire', color: 'rgba(239, 68, 68, 0.8)' },     // 可接受（屬性色）
  { id: 'fire', color: 'var(--palette-element-1)' },    // 更好（對應 CSS token）
];
```

### 規則 2：`customDeckColor` 建議使用 CSS token

```js
// ✅ 推薦
export const customDeckColor = 'var(--palette-class-stage1-mid)';

// 可接受（固定識別色）
export const customDeckColor = 'rgba(139, 92, 246, 0.8)';
```

### 規則 3：主題包不能修改任何 `.jsx` / `.js` 引擎檔案

新主題包所有的資料都應該放在 `src/themes/<pack>/` 內。  
如果你發現必須修改引擎才能讓主題包運作，代表需要擴充引擎 API，而不是改引擎本身的邏輯。

---

## 九、新增主題色彩 (CSS palette tokens)

如果你的主題包需要使用新的顏色（例如新屬性、新卡牌等級），需要在 CSS token 系統裡新增，**而不是直接 inline 顏色**：

### 步驟

1. **開啟 `src/index.css`**，在 `:root { }` 區塊的 `/* Layer 2: Palette */` 段落加入新 token：

```css
/* ── 自訂主題包擴充 ── */
--palette-element-7: linear-gradient(135deg, #c0a060, #7c5c20);  /* 大地屬性 */
--palette-element-7-glow: rgba(192, 160, 96, 0.5);
```

2. **如果需要 light mode 覆寫**，在同一個檔案的 `[data-theme="light"] { }` 區塊也加入對應的覆寫值：

```css
[data-theme="light"] {
  --palette-element-7: linear-gradient(135deg, #d4b896, #a07840);
}
```

3. **在你的主題包資料中用 token string 引用**：

```js
{ id: 'earth', name: '🌍 大地', color: 'var(--palette-element-7-glow)' }
```

### 現有可用的 palette tokens

| Token | 用途 |
|---|---|
| `--palette-player1` | 玩家1主色（藍） |
| `--palette-player1-glow` | 玩家1光暈 |
| `--palette-player2` | 玩家2主色（紅） |
| `--palette-player2-glow` | 玩家2光暈 |
| `--palette-element-1` | 火屬性漸層 |
| `--palette-element-2` | 水屬性漸層 |
| `--palette-element-3` | 草屬性漸層 |
| `--palette-element-4` | 電屬性漸層 |
| `--palette-element-5` | 超能屬性漸層 |
| `--palette-element-6` | 格鬥屬性漸層 |
| `--palette-element-neutral` | 一般屬性漸層 |
| `--palette-class-basic` | 基礎卡等級漸層 |
| `--palette-class-stage1` | Stage 1 漸層 |
| `--palette-class-stage1-mid` | Stage 1 中間色 |
| `--palette-class-stage1-accent` | Stage 1 強調色 |
| `--palette-class-stage2` | Stage 2 漸層 |
| `--palette-class-stage2-accent` | Stage 2 強調色 |
| `--palette-class-trainer` | 訓練家卡漸層 |
| `--palette-class-item` | 物品卡漸層 |
| `--palette-card-back` | 卡背漸層 |
| `--palette-card-back-accent` | 卡背強調色 |

---

## 十、新增主題包完整步驟

```
1. 在 src/themes/<your-id>/ 建立資料夾
2. 建立 pack.meta.js       （packId, packName, version, author, description）
3. 建立 cards.js           （cardDatabase，參見第三節）
4. 建立 decks.js           （themeMap + buildComposition，參見第四節）
5. 建立 starter-decks.js   （starterDecks + customDeckColor，參見第五節）
6. 建立 ace-showcase.js    （aceShowcase + defaultAceKey，參見第六節）
7. 建立 index.js           （彙整匯出，參見第七節）
8. 如需新顏色：在 src/index.css 加入 --palette-* token（參見第九節）
9. 修改 src/themes/active.js 切換到你的新主題包（參見第十一節）
```

---

## 十一、切換主題包

編輯 `src/themes/active.js`，把 import 指向新的主題包即可：

```js
// 改這一行
import myNewPack from './my-new-pack';
export const activePack = myNewPack;
```

整個遊戲（首頁、設定頁、卡牌、戰鬥）會跟著換內容，**無需修改任何引擎程式碼**。

---

## 十二、參考實作

| 主題包 | 路徑 | 說明 |
|---|---|---|
| Pokémon（完整） | `src/themes/pokemon/` | 生產級完整實作，四大主題、進化線、七種物品/訓練家卡 |
| Fantasy（stub） | `src/themes/fantasy/` | 最小可玩示範，兩個主題、無進化線，可作為新包起點 |

詳細架構設計見 [`spec/engine_theme_separation.md`](../../spec/engine_theme_separation.md)。
