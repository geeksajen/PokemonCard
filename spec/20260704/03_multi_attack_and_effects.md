# 3. 多招式與攻擊效果框架 (Multi-Attack & Attack Effects) ✅ 已完成

> 實作摘要（2026-07-04）：
> - `models/cards.js` 新增 `getAttacks(card)` 相容層（`attacks[]` 優先，退回單數 `attack`）；
>   rules / ai / Card / CardInspectModal 全面改經此入口，fantasy、zeus 包與自訂卡零改動。
> - `rules.js`：`canAttack` / `applyAttackDamage` 增加 `attackIndex` 參數；新增純查詢
>   `getUsableAttacks`；新增 `attackEffectHandlers` 註冊表（discardSelfEnergy /
>   selfDamage / healSelf，`inflict` 留給 spec 04），於傷害結算後分派並回傳 metadata
>   （`selfKnockedOut` / `selfFaintedPokemon` / `healedSelf`）。
> - `useGameEngine.performAttack` 改為「擊倒結算佇列」：先防守方、後自傷反殺，
>   逐筆播 faint 動畫 + `resolveKnockout`，分出勝負即中止；`handleAttackClick(attackIndex)`。
> - `HudOverlay` 新增招式選單（>1 招時點攻擊鍵自按鈕上方展開；費用圓點走 palette tokens、
>   不可用招變暗附原因）；`GameArena` 的 `attackReady` 改為「任一招可用」。
> - pokemon 包 14 隻全數遷移 `attacks[]` 並補第二招；節奏重整：噴火龍改
>   「火焰旋渦 3 能量 60 ／ 大字爆炎 3 能量 120（棄 2 能量）」、卡比獸「捨身衝撞 80（自傷 20）」、
>   妙蛙花「吸取 30（回復 30）」。
> - AI：`chooseAttack`（KO 優先 → 有效傷害最高 → 自殺招最後手段）；充能改
>   gapToStrongest（戰鬥區）/ gapToCheapest（備戰區）。
> - `npm run build:web` 通過；lint 無新增錯誤。

> 戰鬥深度的根本解。目前每隻寶可夢只有一招純傷害攻擊，能量湊齊後每回合的
> 唯一最佳解就是「按攻擊鍵」。本規格把 `attack`（單數）演進為 `attacks[]`（複數），
> 並仿照 `boardCardHandlers` 的模式建立「攻擊效果註冊表」，讓招式能附帶代價與效果。
> 特殊狀態（中毒/睡眠/麻痺）的效果 kind 在此定義介面、由 spec 04 實作。

## 資料模型

### 卡牌欄位
```js
attacks: [
  { name: '火花',   cost: [FIRE],             damage: 20 },
  { name: '火焰旋渦', cost: [FIRE, FIRE, FIRE], damage: 60,
    effect: { kind: 'discardSelfEnergy', count: 1 },
    description: '棄掉這隻寶可夢的 1 張能量。' },
]
```

### 向後相容（關鍵）
fantasy / zeus 主題包與（潛在的）自訂卡仍使用單數 `attack`。
在 `src/models/cards.js` 新增唯一取用入口：

```js
export const getAttacks = (card) =>
  card.attacks ?? (card.attack ? [card.attack] : []);
```

- **rules.js / ai.js / Card.jsx / CardInspectModal.jsx 一律改用 `getAttacks()`**，
  不再直接讀 `card.attack`。
- pokemon 主題包本次全面遷移為 `attacks[]`；其他包不動、靠 shim 相容。

## 攻擊效果註冊表（rules.js）

比照 `boardCardHandlers` 模式：

```js
const attackEffectHandlers = {
  discardSelfEnergy, // { count }   棄掉攻擊者 count 張能量（大招代價）
  selfDamage,        // { amount }  攻擊者自身受到 amount 傷害（不套弱點抵抗）
  healSelf,          // { amount }  攻擊者回復 amount HP
  inflict,           // { condition } 使防禦方陷入特殊狀態 — 介面先定義，spec 04 實作
};
```

- 在 `applyAttackDamage` 傷害結算後分派執行，效果寫入同一個 `newState` 並 `pushLog`。
- `selfDamage` 可能反殺攻擊者：回傳值擴充 `selfKnockedOut` / `selfFaintedPokemon`，
  由引擎在防禦方擊倒結算後接著處理（攻擊者被擊倒 → 對手拿獎賞、攻擊方需遞補）。
- 新增效果 kind 時只需：cards.js 設 `effect`、註冊表加一行。

## 引擎修改（rules.js）

- `canAttack(state, attackerId, attackIndex = 0)`：能量檢查改針對
  `getAttacks(active)[attackIndex]`；先攻限制、已攻擊旗標等前置檢查不變。
- 新增查詢述詞 `getUsableAttacks(state, playerId)`：
  回傳 `[{ attack, index, usable, error }]`，供 UI 選單與 AI 共用
  （與 `getValidTargets` 同屬純查詢層）。
- `applyAttackDamage(state, attackerId, attackIndex = 0)`：以指定招式結算，
  結算後執行 `attackEffectHandlers` 分派。

## UI

### 招式選擇（HudOverlay / GameArena）
- 戰鬥區寶可夢只有 1 招 → 攻擊按鈕行為不變（直接發動）。
- **有 2 招以上 → 點「發動攻擊」彈出招式選單**（HUD 右下往上展開的小面板）：
  - 每列：招式名、能量費用圓球（沿用 `EnergyOrb` 樣式）、傷害數字、效果描述小字。
  - 能量不足的招式變暗禁用，並顯示原因。
  - 點擊列即發動；點擊面板外或 ESC 取消。
- `attackReady` 光暈條件改為「任一招可用」（`getUsableAttacks().some(a => a.usable)`）。

### 卡面（Card.jsx / CardInspectModal.jsx）
- `Card.jsx` 技能區改為列出全部招式（最多 2 招，行高縮小）；
- `CardInspectModal.jsx` 技能區以迴圈渲染每一招（名稱/費用/傷害/描述）。

## AI 整合（ai.js）

- 攻擊決策改為：從 `getUsableAttacks` 的可用招式中挑選——
  1. 優先挑「可直接擊倒對手」的最低代價招；
  2. 否則挑有效傷害（含弱點/抵抗修正）最高者；
  3. `selfDamage` 會反殺自己時，除非能同時擊倒對手，否則降級選次佳招。
- 動作格式 `{ kind: 'attack' }` 擴充為 `{ kind: 'attack', attackIndex }`。

## Pokemon 主題包內容更新（cards.js）

全面遷移 `attack` → `attacks[]`，並為進化系與主力補第二招（含二階節奏重整）：

| 卡 | 招式 1 | 招式 2 |
|----|--------|--------|
| 小火龍 | 火花 [火] 20 | — |
| 火恐龍 | 利爪 [火] 20 | 火焰放射 [火火] 50 |
| **噴火龍** | 火焰旋渦 [火火火] 60 | **大字爆炎 [火火火] 120，棄 2 能量** |
| 傑尼龜 | 水槍 [水] 20 | — |
| 卡咪龜 | 咬住 [水] 20 | 水砲 [水水] 50 |
| 水箭龜 | 猛烈衝撞 [水水] 40 | 水砲連發 [水水水] 80 |
| 妙蛙種子 | 藤鞭 [草] 20 | — |
| 妙蛙草 | 飛葉快刀 [草草] 50 | — |
| **妙蛙花** | 吸取 [草草] 30，自身回復 30 | 日光束 [草草草] 80 |
| 皮卡丘 | 電擊 [雷] 20 | — |
| 雷丘 | 電光一閃 [雷] 20 | 十萬伏特 [雷雷] 60 |
| 超夢 | 念力 [超] 30 | 精神強念 [超超] 60 |
| 卡比獸 | 滾動 [無無] 30 | **捨身衝撞 [無無無] 80，自傷 20** |
| 腕力 | 空手劈 [格] 20 | 地獄翻滾 [格格] 40 |

> 平衡註記：噴火龍大招從「4 能量 100」改為「3 能量 120＋棄 2 能量」——
> 更快上線、單發更重、但連發需要能量回收/充電器支援（高風險高報酬，spec 05 銜接）。

## 驗收條件

1. 舊存檔的自訂牌組與 fantasy/zeus 包（單數 `attack`）進戰鬥不壞（shim 生效）。
2. 多招寶可夢點攻擊會出現招式選單；能量不足的招正確禁用；單招寶可夢行為不變。
3. 噴火龍大字爆炎發動後自動棄 2 張能量（log 可驗）；卡比獸捨身衝撞自傷、
   自傷致死時正確結算雙方擊倒與獎賞卡。
4. 妙蛙花吸取回復自身 HP（不超過 maxHp）。
5. AI 會在能擊倒時選大招、平時選有效傷害最高的招。
6. `npm run lint` 通過。
