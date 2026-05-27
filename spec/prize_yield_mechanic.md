# 多重獎賞卡機制 (Prize Yield Mechanism) 規格企劃書

## 1. 系統設計目標與背景
目前遊戲中的部分基礎寶可夢（如「超夢」、「卡比獸」）擁有極高的基礎數值（High HP, High Damage），在不需進化的情況下即可發揮極大的戰鬥力。
為了維持遊戲整體的平衡性（參考 PKCard 價值點數公式），我們需要引入「高風險高報酬」的機制：**當這些強力的寶可夢被對手擊倒時，對手可以一次拿取多張獎賞卡（Prize Cards）。**

此機制類似於實體寶可夢 TCG 中的「EX / V / ex」系統。

## 2. 核心引擎修改 (src/game/rules.js)
在處理寶可夢被擊倒的結算邏輯中，將原本固定扣除 1 張獎賞卡的寫死數值，改為讀取卡牌本身的 `prizeYield` 屬性。

**目標函式**: `resolveKnockout(state, attackerId, faintedPokemon)`
**修改邏輯**:
* 取得被擊倒寶可夢的掉落數量：`const yieldAmount = faintedPokemon.prizeYield || 1;`
* 從攻擊方的獎賞卡中扣除該數量：`me.prizes -= yieldAmount;`
* 修改對戰紀錄 (Logs)，在擊倒訊息中明確顯示拿取了幾張獎賞卡。
* 若 `me.prizes` 小於或等於 0，則攻擊方獲得勝利。

## 3. 介面呈現 (UI)
雖然邏輯層面的改動很小，但在 UI 上必須給予玩家明確的提示，避免產生「為什麼對手打倒我一隻怪就贏了」的疑惑。

### 3.1 卡面設計 (Card.jsx)
* 當讀取到卡牌具有 `prizeYield > 1` 時，卡面外觀應該要有明顯的區別。
* **建議作法**：
  * 在卡牌名稱旁邊加入醒目的標籤（例如：`[EX]` 或 `[V]`）。
  * 或是給予卡牌特殊的發光邊框 / 異色背景。
  * 卡面說明文字區域下方可以補充一行小字：「當這隻寶可夢被擊倒時，對手拿取 2 張獎賞卡。」

### 3.2 對戰特效 (GameArena.jsx)
* 當一次拿取 2 張獎賞卡時，可以考慮觸發特殊的 Toast 通知或稍微強烈一點的音效，以強調這個關鍵的戰局變化。

## 4. 卡牌資料庫更新 (src/themes/pokemon/cards.js)
針對目前數值超模的卡牌，加入 `prizeYield` 屬性：

```javascript
'p-150': {
  id: 'p-150',
  type: CardTypes.POKEMON,
  name: '超夢',
  hp: 130,
  maxHp: 130,
  energyType: EnergyTypes.PSYCHIC,
  prizeYield: 2, // <-- 新增此行
  // ...
},
'p-143': {
  id: 'p-143',
  type: CardTypes.POKEMON,
  name: '卡比獸',
  hp: 130,
  maxHp: 130,
  energyType: EnergyTypes.NORMAL,
  prizeYield: 2, // <-- 新增此行
  // ...
}
```

## 5. 未來擴充性
此機制未來也可以擴充至 `prizeYield: 3`（對應實體卡牌的 VMAX 或 TAG TEAM 等超大型寶可夢），只要數值設定得當，引擎都能夠完美相容。
