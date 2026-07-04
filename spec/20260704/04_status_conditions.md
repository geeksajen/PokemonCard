# 4. 特殊狀態系統 (Special Conditions) ✅ 已完成

> 實作摘要（2026-07-04）：
> - 資料模型：寶可夢實例 `poisoned`（可疊加）＋ `specialCondition: 'asleep'|'paralyzed'`（互斥）。
> - `rules.js`：`inflict` 攻擊效果 handler（防守方已被擊倒則不施加，回傳 `inflicted` 供 toast）；
>   `runCheckup`（中毒 10 傷 → 睡眠 50% 擲硬幣醒來 → 結束回合方麻痺解除）內嵌於
>   `endTurnState`，回傳 `checkupKnockouts`；`canAttack` / `canRetreat` 擋睡眠與麻痺；
>   `clearConditions` 於交換器 / 撤退 / 老大指令 / 離洞繩（雙側）呼叫，進化以新物件自然清除。
> - 引擎：`finalizeEndTurn` 逐筆 `resolveKnockout` 結算中毒擊倒（含獎賞與勝負，
>   人類與 AI 兩條結束回合路徑共用）；施加狀態 toast 與相剋提示錯開 900ms。
> - **規格偏差**：中毒傷害與擊倒以 toast + log + HP 條呈現，未播浮動跳字 / faint 動畫——
>   checkup 發生在換手瞬間，熱座模式的上下方向會翻轉，動畫定位歧義，留待後續 UIUX spec。
> - UI：卡面左側狀態徽章（僅場上）、檢視器狀態標籤；新 tokens
>   `--palette-status-{poison,sleep,paralysis}`（含 light 覆寫）。
> - 卡牌：妙蛙種子催眠粉（10+睡）、妙蛙草毒粉（20+毒）、皮卡丘電磁波（10+麻）、
>   超夢念力（20+睡）。AI：狀態招對無狀態對手 +15 等值加權。
> - build 通過；lint 無新增錯誤。

> 依附 spec 03 的攻擊效果框架，實作 TCG 戰術核心：中毒、睡眠、麻痺。
> 低傷害招式因此有了存在意義（「上狀態拖節奏」vs「打面板傷害」的分歧），
> 也讓「換人／進化解狀態」成為有價值的操作。

## 資料模型（寶可夢實例欄位）

```js
// 依實體 TCG：中毒可與 睡眠/麻痺 疊加；睡眠與麻痺互斥（後蓋前）。
poisoned: false,            // 中毒（持續傷害）
specialCondition: null,     // null | 'asleep' | 'paralyzed'
```

- 只有戰鬥區的寶可夢會保有狀態；**離開戰鬥區（撤退/交換/被老大指令拉走）
  或進化時，全部狀態解除**（對應實體規則）。
- 實作共用 helper `clearConditions(pokemon)`，呼叫點：`evolveCard`、
  `applySwitch`、`resolveRetreat`、`resolveBossOrders`、`resolveEscapeRope`。

## 規則效果

| 狀態 | 效果 | 解除 |
|------|------|------|
| 中毒 | 每次「回合間結算」受 10 傷害 | 離場/進化 |
| 睡眠 | 不能攻擊、不能撤退 | 每次回合間結算擲硬幣，正面醒來（50%）；離場/進化 |
| 麻痺 | 不能攻擊、不能撤退 | 「自己這方」的回合結束時自動解除；離場/進化 |

### 回合間結算（checkup）
- 新增純函式 `runCheckup(state, endingPlayerId)`，由 `endTurnState()` 在切換
  `currentPlayer` 前呼叫：
  1. 雙方戰鬥區中毒者各受 10 傷害（`pushLog`）。
  2. 睡眠者擲硬幣（`Math.random`），正面醒來（log 記錄結果）。
  3. `endingPlayerId` 的戰鬥區麻痺解除。
  4. 中毒傷害可能擊倒：將 HP ≤ 0 的戰鬥區寶可夢設為 null，
     回傳 `checkupKnockouts: [{ ownerId, faintedPokemon }]`。
- `endTurnState` 回傳擴充為 `{ ok, state, checkupKnockouts }`。
- **引擎（useGameEngine）**：對每筆 checkupKnockout 播放 faint 動畫後呼叫
  `resolveKnockout(state, getOpponentId(ownerId), faintedPokemon)`
  （獎賞卡歸屬、bench_out 勝負判定全部復用，含 spec 01 的 prizeYield）。
  被擊倒方在自己回合開始時依既有流程從備戰區推派。

### 行動限制（rules.js）
- `canAttack()`：`specialCondition === 'asleep'` → 「寶可夢正在睡眠中，無法攻擊！」；
  `'paralyzed'` → 「寶可夢麻痺了，無法攻擊！」。
- `canRetreat()`：同上兩種狀態禁止撤退。

### 攻擊效果 kind（補完 spec 03 預留的 `inflict`）
```js
inflict: { condition: 'poisoned' | 'asleep' | 'paralyzed' }
```
- 命中後對防禦方戰鬥區施加：`poisoned` 設布林；`asleep`/`paralyzed`
  寫入 `specialCondition`（互相覆蓋）。
- 防禦方被本次攻擊直接擊倒則不施加。

## UI

### 狀態徽章（Card.jsx，onField 限定）
- 卡面左上角顯示狀態小徽章列：中毒 ☠️、睡眠 💤、麻痺 ⚡。
- **新增 CSS tokens**（`src/index.css` + light 覆寫，遵守視覺主題規則）：
  `--palette-status-poison`、`--palette-status-sleep`、`--palette-status-paralysis`。
- `CardInspectModal.jsx` 同步顯示目前狀態。

### 回饋
- 施加狀態時 toast（「對手的皮卡丘麻痺了！」）＋ 既有 `sfxDamage` 音效。
- checkup 的中毒傷害以既有浮動戰鬥文字（紅色 -10）呈現於對應卡面。
- 睡眠擲硬幣結果、麻痺解除都寫入對戰 log。

## AI 整合（ai.js）

- 攻擊選擇（spec 03 的評分）加入狀態價值：對手無狀態時，
  `inflict` 招式的有效傷害加權 +15（粗略等值），已有狀態則不重複加權。
- 自身戰鬥區睡眠/麻痺時：AI 無法攻擊（`canAttack` 把關），會自然轉向
  充能/佈局；不需額外邏輯。

## Pokemon 主題包內容更新（cards.js）

| 卡 | 調整 |
|----|------|
| 妙蛙種子 | 新增招式 2：催眠粉 [草] 10，`inflict: asleep` |
| 妙蛙草 | 新增招式 3 → 改為：毒粉 [草草] 20，`inflict: poisoned`（與飛葉快刀二選一） |
| 皮卡丘 | 新增招式 2：電磁波 [雷] 10，`inflict: paralyzed` |
| 超夢 | 念力 [超] 30 改為：念力 [超] 20，`inflict: asleep` |

> 設計原則：狀態招傷害刻意壓低（10~20），與高傷害招形成真實取捨。

## 驗收條件

1. 中毒後每次回合間扣 10、log/跳字正確；中毒致死正確觸發擊倒結算與獎賞卡。
2. 睡眠者不能攻擊/撤退；回合間 50% 醒來且 log 記錄擲硬幣結果。
3. 麻痺者不能攻擊/撤退；自己那方回合結束自動解除。
4. 撤退、交換器、老大指令、離洞繩、進化皆正確清除狀態。
5. 卡面徽章、toast、log 齊備；light/dark 主題下徽章色彩正常（token 生效）。
6. `npm run lint` 通過。
