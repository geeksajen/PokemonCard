# 13. 帶有屬性特效的「快速對戰」大按鈕 (Elemental 'BATTLE' Button) ✅ 已完成

> 實作摘要（2026-05-31）：
> - `SetupPage`：把「確認出戰」改造為英雄級大按鈕，依 **P1 牌組主要屬性**（`getDominantEnergy`／starter 的屬性 key）套上 `battle-btn battle-btn-<element>` class。
> - 屬性連動光環：`lobby.css` 各屬性 class 設 `--aura`（box-shadow 需實色，故於 CSS 定義對應 rgba）與屬性漸層背景（`--palette-element-*`），搭配 `@keyframes battle-aura-pulse` 呼吸光暈與向上飄散的 `.battle-particle` 粒子（顏色綁 `--aura`）。
> - 爆發性點擊回饋：`:active` 時 `scale(0.9)` 向內收縮，並在 `handleStart` 觸發 `sfxBattleStart`（重低音衝擊＋上行警報，新增於 `sounds.js`）。
> - 顏色實色僅存在於 CSS 層；JSX 只掛 class 與 token，未寫死色值。

## 痛點分析
「開始遊戲」按鈕是整個遊戲最重要的 Call to Action (CTA)，如果設計得太過普通，將無法點燃玩家即將進入決鬥的熱血情緒。

## 優化設計 (UI/UX)
1. **巨型動態按鈕 (Massive Hero Button)**：
   - 將「BATTLE」或「尋找對戰」設計為畫面中最醒目、體積最大的按鈕，帶有金屬光澤或玻璃透視質感。
2. **屬性連動光影 (Elemental Aura)**：
   - 根據玩家當前選擇牌組的主要屬性，按鈕周圍會散發對應顏色的光環 (Aura)。
   - 例如：火系牌組會有紅橘色的呼吸光暈及向上飄散的火星粒子 (CSS 粒子特效)；水系則有藍色水波紋漣漪。
3. **爆發性點擊回饋 (Impactful Click)**：
   - 點擊瞬間，按鈕劇烈向內收縮 (`scale: 0.9`)，光環瞬間爆發，同時伴隨極具重量感的音效。
   - 目的：把「點擊開始」這個簡單的動作，變成充滿儀式感的啟動開關。

## 實作建議
- 利用 CSS `box-shadow` 的多層次疊加來製作 Aura 效果。
- 粒子特效可寫入獨立的 `@keyframes`，或套用輕量級的 React Particle 套件，並綁定牌組的 `primaryEnergyType` 變數來切換顏色。
