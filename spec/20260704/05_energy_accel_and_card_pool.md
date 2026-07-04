# 5. 能量加速與卡池擴充 (Energy Acceleration & Card Pool) ✅ 已完成

> 實作摘要（2026-07-04）：
> - **雙倍無色能量 `e-dce`**（`provides: 2`）：`canAttack` 能量池改以「單位」展開
>   （無色單位不匹配屬性費用）；`canRetreat` 以單位總數計費；`resolveRetreat`
>   從最近附加的能量往回棄、湊滿單位為止（可能超付，對應實體規則）。
> - **充電器 `i-charger`**：目標式物品（`attachFromDiscard`），拖到寶可夢後從棄牌區
>   取能量直附（優先同屬性），不佔每回合手動填附；`getValidTargets` 在棄牌區無能量時回空。
> - **比爾 `t-bill`**（draw 2）、**希羅娜 `t-cynthia`**（shuffleDraw 6）：
>   `boardCardHandlers` 加 `draw` / `shuffleDraw` 兩行；受 spec 01 支援者限制。
> - **牌組**（`buildComposition`）：27 → 33 張。每副加無色支線坦 ×1
>   （卡比獸；normal 主題改配超夢——皆為 prizeYield 2 的 EX）、DCE ×2、充電器/比爾/希羅娜各 ×1。
> - **AI**：新增 7.5 過牌步（比爾＝手牌 ≤ 3 補牌；希羅娜＝手牌 ≥ 4 且無能量可填時重整）
>   與 8.5 充電器步（共用 `pickBenchChargeIdx` 充能目標）；全部依 `effect.kind` 泛用分派。
> - **UI**：DCE 在卡面附能球、能量卡面、檢視器均顯示 ×2；特殊能量的
>   description 於檢視器顯示。
> - build 通過；lint 無新增錯誤；fantasy / zeus 包不受影響。

> 解決「二階寶可夢練出來時遊戲已結束」的節奏問題，並打破「每場對局都長一樣」
> 的單調感。受素材限制（只有現有 14 隻寶可夢有插圖），新卡以**不需插圖的
> 物品／支援者／能量卡**為主，寶可夢多樣性靠「無色系混編」達成。

## A. 新卡（src/themes/pokemon/cards.js）

### 能量
| id | 卡名 | 效果 |
|----|------|------|
| `e-dce` | 雙倍無色能量 | 一張卡提供 **2 個無色能量**（`provides: 2`）。只能抵無色費用與撤退費，不能當屬性能量 |

**引擎修改（rules.js）**：能量計數抽象化。
- 新 helper `energyUnits(card) = card.provides ?? 1`。
- `canAttack` 的 pool 展開：屬性費用仍逐張比對 `energyType`（DCE 的
  `energyType: NORMAL` 自然不會匹配屬性費用）；無色費用以「剩餘單位總數」計。
- `canRetreat` 的費用檢查改為單位總數；`resolveRetreat` 棄能量時以
  「湊滿單位數的最少張數」棄卡（可能超付，對應實體規則）。

### 物品
| id | 卡名 | 效果 kind | 說明 |
|----|------|-----------|------|
| `i-charger` | 充電器 | `attachFromDiscard` | 指定我方 1 隻寶可夢，從棄牌區抽出 1 張能量卡附加給它（優先同屬性，其次任意）。**不佔每回合 1 次的手動填附**。 |

- 目標選擇沿用傷藥的「拖到目標寶可夢」互動（`playCardOnPokemon` 分派、
  `getValidTargets` 回傳「棄牌區有能量時的所有我方寶可夢」）。

### 支援者（受 spec 01 每回合一張限制）
| id | 卡名 | 效果 kind | 說明 |
|----|------|-----------|------|
| `t-bill` | 比爾 | `draw` `{ count: 2 }` | 抽 2 張卡（低風險過牌，和大木博士形成取捨） |
| `t-cynthia` | 希羅娜 | `shuffleDraw` `{ count: 6 }` | 手牌洗回牌庫，抽 6 張（不棄牌的手牌重整） |

- `boardCardHandlers` 各加一行（`draw`、`shuffleDraw`、以及物品的
  `attachFromDiscard` 走目標式分派）；handler 內依 spec 01 慣例立支援者旗標。
- 牌庫不足時抽到多少算多少（比照大木博士）。

## B. 牌組多樣化（src/themes/pokemon/decks.js）

每副主題牌組加入「無色支線＋新道具」：

```js
// buildComposition 追加：
{ id: 'p-143',     count: 1 },  // 卡比獸：無色招式吃任何能量，任何牌組都能用；
                                //         prizeYield 2（spec 01）= 高風險高報酬的後期坦
{ id: 'e-dce',     count: 2 },  // 雙倍無色：加速卡比獸與撤退
{ id: 'i-charger', count: 1 },
{ id: 't-bill',    count: 1 },
{ id: 't-cynthia', count: 1 },
```

- 牌組從 27 張 → 33 張；normal 主題（本體就是卡比獸）改加超夢作支線
  （`p-150`，同為 prizeYield 2）。
- 對局變化來源：起手是否抽到支線坦、DCE 加速線、充電器回收線。

## C. 節奏配套

- 噴火龍大招的能量代價已由 spec 03 改為「棄 2 能量」——充電器與能量回收
  讓「棄能量大招」形成可循環的 deck 引擎（打大招 → 充電器回填 → 再打）。
- 比爾/希羅娜提高過牌速度，二階進化卡更容易在中盤前湊齊。

## D. AI 整合（ai.js，沿用 spec 02 的 useCard 動作）

以 `effect.kind` 泛用分派（不寫死卡 id）：
- `draw`：手牌 ≤ 3 且未用支援者 → 使用（優先序低於大木博士的空手判定）。
- `shuffleDraw`：手牌 ≥ 4 且其中沒有可行動作（無可放置/進化/可用能量）→ 使用。
- `attachFromDiscard`：棄牌區有能量且戰鬥區或「充能中的備戰主力」缺能量 → 使用，
  目標沿用 spec 02 第 8 步的挑選邏輯。

## E. UI

- DCE 在卡面/檢視器的能量圓球顯示「×2」小字（`provides` 泛用渲染，
  附加能量列同步；色彩走 `--palette-element-neutral`）。
- 充電器/比爾/希羅娜為純文字卡（🎒/👤 emoji 版面已支援，無需插圖）。

## 驗收條件

1. DCE：可支付無色費用與撤退（1 張抵 2）；不能拿去付屬性費用；
   卡比獸裝 1 DCE + 1 任意能量即可用「滾動」（無無）＋ 3 單位時可用捨身衝撞。
2. 充電器：從棄牌區抽出能量直附目標，不影響本回合手動填附；棄牌區無能量時不可用。
3. 比爾抽 2；希羅娜手牌洗回抽 6；兩者受「每回合一張支援者」限制。
4. 各主題牌組實際出現卡比獸支線與新卡；normal 主題改為超夢支線。
5. AI 會使用比爾/希羅娜/充電器（log 可驗）。
6. fantasy / zeus 包不受影響（未用 `provides` 的能量卡行為不變）。
7. `npm run lint` 通過。
