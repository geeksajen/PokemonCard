# 3. 浮動傷害與補血跳字 (Floating Combat Text) ✅ 已完成

> 實作摘要（2026-05-29）：
> - `useGameEngine.js`：`damageAnim` 擴充為通用戰鬥文字描述 `{ amount, kind, isTopPlayer, zone, benchIndex }`。攻擊命中 → `kind:'damage'`；`playToLocation` 偵測傷藥成功使用後，依「實際回復量」（前後 currentHp 差）觸發 `kind:'heal'`（出牌方恆為下方，`isTopPlayer:false`，支援戰鬥區與備戰區）。
> - `Board.jsx`：以 `combatText` 取代純量 `damageTaken`，依 `isTopPlayer`＋`zone`(+benchIndex) 在對應卡牌中央渲染跳字；傷害時才觸發 `shake-anim`。
> - `index.css`：以 `.combat-text` + `.combat-text-damage`（紅色放大彈跳）/`.combat-text-heal`（綠色柔和上飄）取代舊的 `.damage-text`；顏色改用 `--color-danger`/`--color-success` token 與 `color-mix`。

## 痛點分析
目前遊戲中對於傷害的回饋（如卡牌震動或單純的數字跳動）較為靜態，缺乏卡牌對戰中「拳拳到肉」的打擊爽快感，且不容易立刻辨識扣血還是補血。

## 優化設計 (UI/UX)
1. **動態跳字生成**：
   - 當寶可夢受到攻擊（受到傷害）或使用傷藥（回復 HP）時，在該卡牌正中央生成獨立的數字浮動元件。
2. **視覺區分與動畫**：
   - **傷害 (Damage)**：顯示紅色的負數（例如 `-120`），配合字體放大與強烈的震動，隨後緩慢向上飄移並淡出。
   - **回復 (Heal)**：顯示綠色的正數（例如 `+20`），帶著柔和的向上飄浮軌跡與淡出效果。
   - 目的：強化戰鬥的實感，讓每一次的攻防都有明確且令人愉悅的視覺回饋。

## 實作建議
- 擴充目前的 `damageAnim` 狀態，使其能支援文字與顏色參數。
- 撰寫新的 CSS `@keyframes` 控制 `transform: translateY(-50px)` 與 `opacity: 0` 來達成浮動消散效果。
