# 弱點與抵抗力 (Weakness & Resistance) 規格企劃書

## 1. 系統設計目標
為遊戲引入屬性相剋的深度策略：
- 寶可夢受到自己「弱點」屬性的攻擊時，傷害加倍（或增加）。
- 受到「抵抗力」屬性攻擊時，傷害減少。

此機制本質是「依攻擊方屬性對防禦方做傷害修正」的純數值運算，與寶可夢內容無關，因此**機制放在引擎層（rules.js），屬性資料放在主題卡牌**，符合引擎／內容分離原則。

## 2. 資料結構設計
弱點／抵抗力以字串標示數值操作，相容不同世代的計算方式。欄位掛在卡牌定義上：

```javascript
weakness:   { type: EnergyTypes.WATER,    value: 'x2'  } // 乘算，或 '+20' 加算
resistance: { type: EnergyTypes.FIGHTING, value: '-20' } // 減算
```

> **不需改動實例化邏輯**：場上實例與進化後寶可夢都會自動帶上這兩個欄位。
> - 實際 instantiator 是 `cardRepository.instantiateCard`（[src/api/CardRepository.js](../src/api/CardRepository.js)，啟動時以 `setCardInstantiator` 註冊取代 `defaultInstantiate`），官方卡與自訂卡的實例化**都以 `...card` 整份展開**。
> - 進化由 `evolveCard`（[src/game/rules.js](../src/game/rules.js)）以 `...evoCard` 展開，亦會帶上欄位。

支援的 `value` 格式（需實作一個小 parser）：
| 格式 | 意義 | 範例 |
|------|------|------|
| `'xN'` | 基礎傷害乘以 N | `'x2'` |
| `'+N'` | 基礎傷害加 N | `'+20'` |
| `'-N'` | 基礎傷害減 N | `'-20'` |

## 3. 遊戲引擎修改 ([src/game/rules.js](../src/game/rules.js))
於 `applyAttackDamage(state, attackerId)` 結算時：

1. 取得基礎傷害 `baseDamage = attacker.attack.damage`。
2. **判定基準是攻擊「寶可夢」的屬性 `attacker.energyType`**，而非附加在身上的能量屬性。（與攻擊特效取屬性的方式一致，見 [src/hooks/useGameEngine.js](../src/hooks/useGameEngine.js) `setAttackAnim`。）
3. **僅在 `baseDamage > 0 時**才套用弱抵修正（傷害為 0 的招式不觸發「效果絕佳」）。
4. 檢查防禦方 `weakness`：若 `weakness.type === attacker.energyType`，依 `value` 修正（如 `x2`）。
5. 檢查防禦方 `resistance`：若 `resistance.type === attacker.energyType`，依 `value` 修正（如 `-20`）。
6. 結算後傷害 `Math.max(0, finalDamage)`，不得小於 0。
7. 回傳結果新增 `effectiveness` 欄位，值為 `'weakness'` | `'resistance'` | `null`，供上層播 toast。

回傳簽章（現有欄位 + 新欄位）：
```javascript
return { ok: true, state, damage, knockedOut, faintedPokemon, effectiveness };
```

> 弱點與抵抗力的 `type` 不會同時等於攻擊方屬性（兩者互斥），故 `effectiveness` 為單一值即可。

## 4. 結算與提示串接 ([src/hooks/useGameEngine.js](../src/hooks/useGameEngine.js))
> ⚠️ Toast 與整個攻擊結算編排都在 `useGameEngine.js`，**不在 GameArena.jsx**。

`performAttack` 內解構 `applyAttackDamage` 回傳值時一併取出 `effectiveness`，並呼叫既有的 `showToast`：
- `effectiveness === 'weakness'` → `showToast('效果絕佳！')`
- `effectiveness === 'resistance'` → `showToast('效果不好…')`

GameArena.jsx 無需改動。

## 5. 介面呈現 (UI)
所有顏色一律走既有的 `getEnergyColor()` token（`var(--palette-element-*)`），**禁止寫死 hex**（見 CLAUDE.md 視覺規範）。

> ⚠️ **弱抵欄位為 optional，必須條件渲染**：`weakness` / `resistance` 不存在時，整列不顯示（graceful absence）。自訂卡（來自 `useCardStore`，經 `cardRepository` 取得）通常沒有這兩個欄位；未配抵抗力的初代寶可夢亦然。三處 UI 都需先判斷欄位存在才渲染，避免空白列或存取錯誤。

### 5.1 對戰卡面 ([src/features/battle/Card.jsx](../src/features/battle/Card.jsx))
- 在招式說明框下方新增一列小圖示區，顯示弱點與抵抗力（如 `弱 [水] ×2`、`抵 [鬥] -20`）。
- **排版注意**：附加能量的小圓點目前以絕對定位置於卡片右下角（`attachedEnergy` 區塊），新增列需避免重疊，建議放在招式框內或固定於底部安全區。

### 5.2 卡片詳情 ([src/features/battle/CardInspectModal.jsx](../src/features/battle/CardInspectModal.jsx))
- 詳情視窗同步顯示弱點／抵抗力，維持資訊一致。

### 5.3 牌庫工坊 ([src/features/studio/CardLibrary.jsx](../src/features/studio/CardLibrary.jsx))
- 卡牌庫瀏覽時亦顯示弱抵，方便組牌時評估。

## 6. 卡牌資料庫更新 ([src/themes/pokemon/cards.js](../src/themes/pokemon/cards.js))

### 6.1 弱點（全寶可夢實裝，含進化型）
| 系別（家族） | 弱點 |
|---|---|
| 火（小火龍家族） | 水 ×2 |
| 水（傑尼龜家族） | 雷 ×2 |
| 草（妙蛙種子家族） | 火 ×2 |
| 雷（皮卡丘家族） | 鬥 ×2 |
| 超能（超夢） | 超能 ×2 |
| 鬥（腕力） | 超能 ×2 |
| 無色（卡比獸） | 鬥 ×2 |

> 進化型沿用家族弱點（如火恐龍、噴火龍皆弱水 ×2）。

### 6.2 抵抗力
初代多數寶可夢無抵抗力，但為讓 resistance 程式碼路徑能被實際觸發，至少實裝下列（取自基礎系列設定）：
| 寶可夢 | 抵抗力 |
|---|---|
| 卡比獸（無色系） | 超能 -20 |

> 其餘寶可夢暫不設抵抗力；引擎能力保留，未來新增卡牌可隨時掛上。

## 7. 驗收檢查點
- [ ] 火屬性攻擊草系 → 傷害 ×2，跳出「效果絕佳！」。
- [ ] 超能屬性攻擊卡比獸 → 傷害 -20，跳出「效果不好…」，且結算不低於 0。
- [ ] 傷害為 0 的招式不觸發弱點提示。
- [ ] 進化後寶可夢仍正確帶有弱抵欄位。
- [ ] Card / CardInspectModal / CardLibrary 三處顯示一致，顏色走 token。
- [ ] §8 開關關閉時，攻擊傷害回歸無相剋的原始結果，且不跳相剋 toast。

## 8. 對戰選項：啟用弱點與抵抗力
進對戰前可由玩家決定是否啟用屬性相剋。此為**引擎層的規則選項**（theme-agnostic），與弱抵主功能解耦——關閉時 `applyAttackDamage` 走原本邏輯，等同 feature 未上。

### 8.1 設定的存放位置
旗標存於 `gameState.options.weaknessResistance`（boolean）。採用 `options` 物件而非散落的旗標，未來其他規則開關（如先攻不可攻擊等）可共用同一容器。

### 8.2 資料流（沿用現有 router state → props 鏈）
```
SetupPage（toggle UI）
  └─ navigate('/battle', { state: { p1Theme, p2Theme, vsAI, weaknessEnabled } })
       └─ BattlePage 讀 location.state（沿用 state.xxx ?? 預設 寫法）
            └─ <GameArena weaknessEnabled={...} />
                 └─ useGameEngine(p1Theme, p2Theme, vsAI, { weaknessResistance })
                      └─ createInitialGameState(p1Theme, p2Theme, options)
                           └─ gameState.options.weaknessResistance
                                └─ rules.js applyAttackDamage 套修正前先 gate
```

### 8.3 各檔案改動
| # | 檔案 | 改動 |
|---|---|---|
| 1 | [SetupPage.jsx](../src/pages/SetupPage.jsx) | 加 toggle（`useState`，**預設開啟**），併入 `navigate` 的 state |
| 2 | [BattlePage.jsx](../src/pages/BattlePage.jsx) | 從 `location.state` 取 `weaknessEnabled`（預設 `true`），傳給 GameArena |
| 3 | [GameArena.jsx](../src/features/battle/GameArena.jsx) | 當作 prop 往下傳給 `useGameEngine` |
| 4 | [useGameEngine.js](../src/hooks/useGameEngine.js) | 簽章加 options 參數，轉交 `createInitialGameState` |
| 5 | [gameState.js](../src/models/gameState.js) | 寫入 `state.options.weaknessResistance` |
| 6 | [rules.js](../src/game/rules.js) | `applyAttackDamage` 在套修正前先判 `state.options?.weaknessResistance` |

### 8.4 預設與相容
- 預設 **開啟**，讓相剋成為標準體驗。
- 舊存檔／未帶 options 的呼叫：`state.options?.weaknessResistance` 為 `undefined` 時視同關閉或以建立預設值補上（建議 `createInitialGameState` 一律補預設物件，避免 undefined 散播）。
- AI 決策（[ai.js](../src/game/ai.js)）暫不納入相剋考量；不影響可玩性，列為後續增強。
- 雙人/連線模式目前 `vsAI` 固定 true，開關對單人即生效；連線同步留待後續。

### 8.5 驗收
- [ ] SetupPage toggle 預設開啟，可切換。
- [ ] 開啟 → 相剋生效（同 §7）；關閉 → 傷害無修正、無相剋 toast。
- [ ] 直接進 `/battle`（未經 SetupPage）時以預設值運作，不報錯。
