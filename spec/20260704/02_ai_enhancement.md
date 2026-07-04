# 2. AI 對手補強 (AI Enhancement) ✅ 已完成

> 實作摘要（2026-07-04）：
> - `ai.js` 決策重寫為 11 步優先序：推派 → 進化（含二階直升與神奇糖果跳級，
>   修正原本只篩 `stage === 1` 的死牌 bug）→ 補血（受傷 ≥ 回復量才用）→ 補備戰 →
>   老大的指令（以新查詢 `getEffectiveDamage` 算擊殺線）→ 檢索球（超級球只看牌庫頂 topN）→
>   大木博士（其餘手牌 ≤ 2）→ 填能量（戰鬥區優先，滿了補缺口最小的備戰主力，優先同屬性能量）→
>   撤退（被剋 + 打不死 + 備戰有 +3 分候選且缺能 ≤ 1）→ 攻擊 → 結束。
> - 新動作：`{ kind: 'useCard', card, ...params }`、`{ kind: 'retreat', benchIndex }`。
> - `rules.js` 新增純查詢 `getEffectiveDamage(state, attacker, defender)`（含弱點/抵抗修正）。
> - `useGameEngine` AI 執行器新增 `executeAIAction` 分派：檢索球直接 `pullPokemonFromDeck`
>   （不開 modal）、老大指令與撤退直接串兩段純函式（跳過 pendingAction UI）；
>   失敗即結束回合的保護與 `steps > 40` 上限維持不變。
> - 支援者相關決策自行檢查 `hasPlayedSupporterThisTurn`（與 spec 01 閘門一致）。

> 單人模式是最常被遊玩的模式，但目前 AI 有一個 bug 級缺陷（永遠不會進化二階）
> 與多個能力空白（不用道具/支援者、不撤退、只給戰鬥區充能）。
> 本規格補齊 AI 的決策面，讓單人對局有真實的壓力與變化。
> 維持既有架構：`ai.js` 純函式單步決策，動畫/延遲由 `useGameEngine` 編排。

## 現況缺陷（src/game/ai.js）

| # | 缺陷 | 影響 |
|---|------|------|
| 1 | `evolutions` 只篩 `c.stage === 1`，**二階進化卡永遠是死牌** | AI 牌組裡的水箭龜/噴火龍全浪費，後期毫無威脅 |
| 2 | 完全不使用道具與支援者 | 大木博士、傷藥、老大的指令等 10 張卡是死牌，AI 常陷入無牌可打 |
| 3 | 只為戰鬥區填能量，滿足攻擊費用即停 | 戰鬥區被擊倒後，遞補上場的寶可夢永遠 0 能量 |
| 4 | 不會撤退、不會用交換器 | 屬性被剋死也硬打到死 |

## 決策設計

### 動作格式擴充
既有：`play`（放置/進化/填能量）、`promote`、`attack`、`end`。
新增一種：

```js
{ kind: 'useCard', card, ...params }
// params 依 effect.kind 而異：
//   heal / switchActive → { location }          // 走 playCardOnPokemon
//   searchDeck          → { pickInstanceId }     // AI 直接指定要抽的卡，不開 modal
//   bossOrders          → { benchIndex }         // 引擎串 applyBossOrders + resolveBossOrders
//   professor / energyRetrieval → {}             // 走 resolveBoardCardEffect
```

### decideAIAction 決策順序（重排後）

1. **戰鬥區空缺** → 推派 / 放置最佳匹配者（維持現狀）。
2. **進化**（修正 #1）：
   - 改為篩選所有 `c.stage` 卡，用 `canEvolve(target, card)` 對戰鬥區與備戰區逐一檢查。
   - **神奇糖果**：手牌同時有 `i-rarecandy` 與二階卡、且場上有對應基礎寶可夢
     （`cardDatabase[card.evolvesFrom].evolvesFrom === target.id`）時，直接打出二階
     （`playPokemon` 會自動消耗糖果）。
3. **補血**（修正 #2）：戰鬥區寶可夢已受傷 ≥ 卡片回復量（傷藥 20 / 高級傷藥 50）
   → 使用，避免溢出浪費。
4. **補滿備戰區**（維持現狀）。
5. **老大的指令**（修正 #2）：對手備戰區存在「本回合攻擊可直接擊倒」的目標
   （`attack.damage ≥ target.currentHp`，含弱點修正）、而目前戰鬥區的對手打不死時
   → 使用並指定該目標。
6. **檢索球**（修正 #2）：手牌沒有任何寶可夢卡時 → 使用精靈球/超級球，
   目標優先序：場上寶可夢的進化卡 ＞ HP 最高的基礎寶可夢。
   超級球只能從牌庫頂 `topN` 張（`deck.slice(-topN)`）中挑選。
7. **大木博士**（修正 #2）：手牌 ≤ 2 張且牌庫 ≥ 7 張、且尚未使用支援者 → 使用。
   （支援者每回合一張的閘門由 spec 01 的旗標把關，AI 決策端也自行檢查。）
8. **填能量**（修正 #3）：
   - 戰鬥區費用未滿 → 優先填戰鬥區（現狀）。
   - 戰鬥區已滿 → 改填「距離可攻擊最近」的備戰區寶可夢（缺口最小者優先，
     其次偏好有進化卡在手/在牌庫的主力）。
9. **撤退**（修正 #4）：同時滿足以下條件才撤退（避免 AI 反覆橫跳）：
   - 戰鬥區 `scoreMatchup ≤ -2`（被剋制）；
   - 備戰區存在 `scoreMatchup` 高出 ≥ 3 的候選；
   - 能量足以支付撤退費用，且撤退後仍有能量發動攻擊、或候選者已可攻擊。
10. **攻擊**（維持現狀，`canAttack` 把關先攻限制）。
11. **結束回合**。

### 引擎編排（useGameEngine.js AI stepper）
- 處理 `useCard`：
  - `heal` / `switchActive` → `playCardOnPokemon(state, 'player2', card, location)`。
  - `searchDeck` → `pullPokemonFromDeck(state, 'player2', pickInstanceId, card)`（不開 modal）。
  - `bossOrders` → `applyBossOrders` 成功後立即 `resolveBossOrders(state, 'player2', benchIndex)`
    （跳過 pendingAction UI）。
  - 其餘 → `resolveBoardCardEffect`。
- 失敗（`!result.ok`）沿用現行保護：直接結束回合，避免卡死。
- 動作間延遲沿用 650ms 節奏；`steps > 40` 終止保護維持。

## 與後續規格的銜接

- spec 03（多招式）落地後，第 10 步改為「挑選最佳可用招式」（該 spec 內定義）。
- spec 05（新卡）落地後，第 6~8 步的候選卡自然涵蓋新道具/支援者（依 effect.kind 泛用判斷，
  不寫死卡片 id；本 spec 實作時即以 `effect.kind` 分派）。

## 驗收條件

1. AI 牌組含二階卡時，能觀察到 AI 完成 基礎→一階→二階 的進化（或用神奇糖果跳級）。
2. AI 會在合理時機使用傷藥、大木博士、精靈球、老大的指令（對局 log 可驗證）。
3. AI 戰鬥區已充滿能量後，會繼續為備戰區充能；主力被擊倒後遞補者能較快接戰。
4. AI 被屬性剋制且備戰區有優勢屬性時會撤退換人。
5. AI 決策全部通過 rules.js 的合法性檢查（不出現非法狀態）；`npm run lint` 通過。
