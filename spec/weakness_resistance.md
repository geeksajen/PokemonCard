# 弱點與抵抗力 (Weakness & Resistance) 規格企劃書

## 1. 系統設計目標
為遊戲引入屬性相剋的深度策略。當寶可夢受到自己「弱點」屬性的攻擊時，受到的傷害會加倍或增加；當受到「抵抗力」屬性攻擊時，受到的傷害會減少。

## 2. 資料結構設計
為了相容不同世代的卡牌計算方式，我們會在卡牌屬性中以字串來標示數值操作：

```javascript
weakness: { type: EnergyTypes.WATER, value: 'x2' } // 或 '+20'
resistance: { type: EnergyTypes.FIGHTING, value: '-20' }
```

## 3. 遊戲引擎修改 (src/game/rules.js)
在 `applyAttackDamage(state, attackerId)` 結算時：
1. 取得攻擊招式的基礎傷害 `baseDamage`。
2. 檢查防禦方的 `weakness`。若其 `type` 與攻擊方的 `energyType` 相同，根據 `value` 進行計算（如乘以 2）。
3. 檢查防禦方的 `resistance`。若其 `type` 與攻擊方的 `energyType` 相同，根據 `value` 減少傷害。
4. 結算後的傷害不得小於 0。
5. 將屬性剋制結果（效果絕佳 / 效果不好）作為 `effectiveness` 屬性回傳給 UI。

## 4. 介面呈現 (UI)
### 4.1 卡面 (Card.jsx)
* 在卡牌下方（招式說明的下方）新增一列小圖示區域。
* 顯示該卡牌的弱點與抵抗力，使用對應的能量顏色和文字（例如：`[水] x2`）。

### 4.2 對戰特效 (GameArena.jsx)
* 當引擎回傳傷害結算結果包含 `effectiveness === 'weakness'` 時，觸發 Toast 通知「效果絕佳！」。
* 若 `effectiveness === 'resistance'`，觸發 Toast 通知「效果不好...」。

## 5. 卡牌資料庫更新 (src/themes/pokemon/cards.js)
所有寶可夢將實裝初代弱點：
* **火系 (小火龍家族)**: 弱點 水 (x2)
* **水系 (傑尼龜家族)**: 弱點 雷 (x2)
* **草系 (妙蛙種子家族)**: 弱點 火 (x2)
* **雷系 (皮卡丘家族)**: 弱點 鬥 (x2)
* **超能系 (超夢)**: 弱點 超能 (x2)
* **無色系 (卡比獸)**: 弱點 鬥 (x2)
