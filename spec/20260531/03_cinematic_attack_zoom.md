# 3. 攻擊時的「電影級」動態視角 (Cinematic Attack Zoom) ✅ 已完成

> 實作摘要（2026-05-31）— 純演出層，未動規則：
> - **編排層 `useGameEngine.js`**：新增 `cinematicAttack` 狀態。`performAttack` 一開始即設為 true，並依結算路徑在「整個攻擊→傷害→擊倒判定」結束後才關閉——無擊倒時於傷害爆發後 0.5s 拉回、擊倒時於 faint 結算後拉回。刻意不直接綁既有 `attackAnim`（其僅存在投射物飛行的 400ms），以符合規格「傷害跳字與擊倒判定結束後再縮回」。
> - **`GameArena.jsx`**：戰鬥區容器加上 `board-stage`，`cinematicAttack` 時附加 `cinematic-attack`；transition 補上 `transform` 以平滑縮放。
> - **`Board.jsx`**：出戰區容器加 `board-active`、備戰區容器加 `board-bench`（雙方皆套用）。
> - **`index.css`**：`.board-stage.cinematic-attack` 整體 `scale(1.05)`；備戰區 `brightness(0.4)` 變暗、出戰寶可夢 `brightness(1.12)` 提亮並打上白色聚光 drop-shadow，營造聚光燈聚焦雙方決鬥者的效果。全程 0.3s ease-out 平滑進退場。
> - 顏色僅用於聚光高光（白光，非主題色），未在 JSX 寫死任何主題色值。

## 痛點分析
目前的攻擊演出雖然有跳字跟卡牌震動，但背景依然是整個棋盤，視覺焦點不夠集中，稍微缺乏一擊定勝負的魄力與緊張感。

## 優化設計 (UI/UX)
1. **全域縮放與聚焦 (Board Zoom & Focus)**：
   - 當玩家確認發動攻擊時，讓整個遊戲區塊 (Board) 平滑地微幅放大（例如 `transform: scale(1.05)`）。
   - 同時，利用一個覆蓋全場但挖空中央的遮罩，或是直接降低背景與備戰區卡牌的亮度 (`filter: brightness(0.5)`)，將唯一的視覺焦點強烈集中在「雙方的出戰寶可夢」身上。
2. **動畫退場 (Resolution Fade)**：
   - 配合傷害跳字與擊倒判定結束後，畫面再平滑地縮回原比例與正常亮度。
   - 目的：營造出「聚光燈打在決鬥者身上」的電影級戰鬥氛圍。

## 實作建議
- 擴展目前的 `attackAnim` 狀態，當其處於 active 狀態時，為 `GameArena` 最外層容器加上對應的 CSS 縮放類別 (`cinematic-zoom`)。
- 可利用 CSS `transition: all 0.3s ease-out` 來確保縮放與變暗的過程平滑自然。
