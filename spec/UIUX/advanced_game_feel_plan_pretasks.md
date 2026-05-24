# 進階遊戲打擊感 — 前置重構任務 (Pretasks)

> 本文件是 [`advanced_game_feel_plan.md`](./advanced_game_feel_plan.md) 四大功能的「地基工程」。
>
> **Code Review 結論**：現有分層 (`rules.js` → `useGameEngine.js` → components) 是落地四功能的最大本錢，
> 但有三個結構性缺口會在實作時咬到。視覺狀態與驗證邏輯目前散落在元件裡，沒有跟著分層走。
> 下列前置任務依「投報率 / 被依賴程度」排序。

---

## 缺口 → 功能 對照

| 結構缺口 | 影響的功能 | 對應 Pretask |
|---|---|---|
| 沒有對外的「可打出 / 打到哪」純述詞；Board 自行重寫一份且有 bug | ② 智慧出牌提示、拖曳高亮 | **P1** |
| 稀有度被 `card.stage` 隱式代理，在 Card.jsx 四處重算 | ① 閃卡反光 | P2 |
| 視覺狀態 Card 全 inline、Board 走 CSS class，不一致 | ①③④ | P3 |
| 拖曳 / Overlay 系統單一用途（只會搬卡片） | ③ 指向性箭頭 | P4 |
| 殘局門檻判斷無純選擇器；BGM 節拍寫死無法變速 | ④ 殘局警告 | P5 |

---

## Pretask 1 — `rules.js` 純目標驗證層 + 修 Board 高亮 bug　【本次實作】

**問題**
- 「這張牌能不能打 / 能打到哪個位置」的邏輯只隱含在 `rules.js` play 函式回傳的 `{ ok:false }` 裡，沒有對外的純述詞給 UI 查詢。
- [Board.jsx](../../src/features/battle/Board.jsx) 為了拖曳高亮**自行重寫了一份簡化驗證** (`isSmartTarget` / `isEmptyTarget`)，與 `rules.js` 已不一致：
  - `rules.js` 進化判定用 **id**：`existing.id === card.evolvesFrom`
  - `Board.jsx` 進化判定用 **name**：`draggedCard.evolvesFrom === pokemon.name` ← 永遠不成立
  - `evolvesFrom` 實際存的是 id（如 `'p-001'`），故**進化卡的拖曳綠色高亮目前實際是壞的**。
- 能量高亮也沒檢查 `hasAttachedEnergyThisTurn`（已填附後仍亮）。

**做法**
- `rules.js` 新增純查詢層（read-only，不 clone、不寫 log）：
  - `canEvolve(target, card)` — 以 id 比對，與 `playPokemon` 同一套判定。
  - `getValidTargets(state, playerId, card)` — 列出手牌的所有合法棋盤落點。
  - `canPlayCard(state, playerId, card)` — 「現在能不能打出」布林值（供 P2 手牌發光）。
- [GameArena.jsx](../../src/features/battle/GameArena.jsx) 在拖曳手牌時呼叫 `getValidTargets`，算出合法落點 zone 集合傳給下方 Board。
- [Board.jsx](../../src/features/battle/Board.jsx) 移除自寫的 `isSmartTarget` / `isEmptyTarget`，改吃 `validZones`，驗證邏輯回歸 `rules.js` 唯一真相。

**服務功能**：② 智慧出牌提示（`canPlayCard`）、拖曳高亮正確性。

---

## Pretask 2 — 稀有度顯式化

把散落在 `Card.jsx` 的 `card.stage` 三元判斷（`bgStyle` / `boxShadow` / `border` / 徽章）收斂成
`getCardRarity(card)` + 稀有度設定表（顏色 / 光暈 / 是否啟用 foil）。

**服務功能**：① 閃卡反光（foil 強度由稀有度驅動）。

---

## Pretask 3 — 視覺狀態一律走 CSS class

四個功能皆為視覺疊層。沿用 Board 既有的 class 慣例（`highlight-valid-target`、`dimmed-target`…），
不要再往 Card.jsx 塞 inline style，避免元件持續膨脹。

**服務功能**：①③④。

---

## Pretask 4 — 泛化拖曳 / Overlay 為多模式

`useDragDrop` 已全域追蹤指標座標 + `hitTest`，基礎設施足夠。
給 `dragState` 加 `mode: 'move' | 'target'`，Overlay 依 mode 決定畫 `<Card>` 或 `<TargetingArrow>`（SVG）。
順便把 `pendingAction`（老大 / 離洞繩）的點擊選擇統一成同一套 targeting。

**服務功能**：③ 指向性攻擊箭頭。

---

## Pretask 5 — `selectClimax` 純選擇器 + BGM 變速 API

- `rules.js` 加 `selectClimax(gameState)`（獎賞剩 1 張 or 主將 HP < 20%）→ 回傳等級，由 engine 推導後傳給 GameArena 掛 class。
- [sounds.js](../../src/utils/sounds.js) 的 `setInterval(playBGMStep, 150)` 把節拍寫死成常數，需參數化提供 `setBGMTempo(ms)`。

**服務功能**：④ 殘局與戰局高潮警告。
