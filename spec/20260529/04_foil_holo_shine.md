# 4. 卡牌「閃卡/亮面」特效 (Foil/Holo CSS Shine) ✅ 已完成

> 實作摘要（2026-05-29）：
> - `index.css`：新增 `.card-shine`（`pointer-events:none`、`mix-blend-mode:screen` 的斜向光束層），父層 `.card-shine-host:hover` 觸發 `background-position` 由右下掃到左上；`.card-shine-holo` 為彩虹雷射變體；`.card-shine-idle` + `@keyframes holo-idle-sweep` 供檢視器常駐流光。
> - `Card.jsx`：卡面容器加 `card-shine-host`，並覆蓋一層光澤 `div`，依既有的 `rarity.foil` 旗標（一/二階進化為 true）決定彩虹或素白光澤。利用容器既有的 `overflow:hidden` 確保光澤不外溢。
> - `CardInspectModal.jsx`：高稀有度卡牌在沉浸式檢視器中常駐流動彩虹反光，強化收藏質感。
> - 依稀有度差異化光澤（基礎/能量/訓練家＝素白；進化＝彩虹），完全 CSS、零額外圖檔。

## 痛點分析
實體卡牌遊戲的一大魅力在於收集特殊的「閃卡 (Foil / Holographic)」，而目前遊戲內的靜態圖片看久了較為單調，缺乏高級感與稀有度帶來的視覺享受。

## 優化設計 (UI/UX)
1. **純 CSS 反光特效**：
   - 不需額外製作動態圖檔。在 `<Card>` 元件的 DOM 結構上，覆蓋一層具有 `pointer-events: none` 的隱形 `div`。
   - 透過 CSS 的 `linear-gradient` 繪製一條斜向的半透明白色光束（或彩色雷射光澤）。
2. **互動觸發**：
   - 當玩家滑鼠懸停 (Hover) 或點擊卡牌時，利用 `transition` 或 `@keyframes` 讓這條光束從卡牌左上角掃到右下角。
   - 目的：以極低的效能與開發成本，為卡牌注入「實體閃卡」的高級質感，大幅提升玩家收藏與使用的愉悅度。

## 實作建議
- 針對不同稀有度的卡牌 (例如 Rare, V, VMAX)，可配置不同的 `linear-gradient` 顏色（例如基礎白光、彩虹反光）。
- 搭配 `overflow: hidden` 確保光澤不會超出卡牌邊緣。
