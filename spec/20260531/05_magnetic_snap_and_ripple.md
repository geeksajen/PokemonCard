# 5. 拖曳的「磁吸」與放置漣漪 (Magnetic Snap & Drop Ripple) ✅ 已完成

> 實作摘要（2026-05-31）— 沿用既有自訂拖曳系統，未動規則：
> - **磁吸**：`useDragDrop` 在 `onMove` 額外算出懸停 zone 的中心座標 `hoverZoneCenter`（保持泛用、不知道規則）；`GameArena` 把既有的 `validDropZones`（由 `rules.getValidTargets` 算出）傳給 `<DragOverlay>`。`DragOverlay` 僅在「懸停於合法落點」時，把卡牌中心朝目標格中心吸附 32%（透過 transform 的 translate delta + 0.12s transition 平滑帶入/釋放），引導玩家鬆手。
> - **放置漣漪**：`useGameEngine` 新增 `dropRipple` 狀態，`playToLocation` 成功放置後設置 `{ zone, benchIndex, id }` 並於 600ms 清除；`GameArena` 傳給下方玩家 `<Board>`，於相符的戰鬥區/備戰區格子中央插入 `.drop-ripple`（CSS `@keyframes drop-ripple-anim` 擴散光圈，用 `--palette-player1` token），搭配既有的 `sfxPlace` 放置音效。
> - 磁吸只作用於合法落點（規則判定仍集中在 `getValidTargets`），漣漪只針對人類玩家落子；顏色全走 token。

## 痛點分析
目前卡牌拖曳放置的功能較為生硬，卡牌放下時缺乏與場地互動的物理回饋感，難以營造出「把實體卡牌用力拍在桌上」的爽快感。

## 優化設計 (UI/UX)
1. **磁吸效應 (Magnetic Snap)**：
   - 當玩家拖曳卡牌靠近合法的放置區 (Drop Zone) 且進入判定範圍時，放置區除了高亮之外，卡牌本身應產生些微的自動位移（吸附效果），引導玩家鬆開滑鼠。
2. **放置漣漪與灰塵特效 (Drop Ripple / Particle)**：
   - 當卡牌成功放下的瞬間，在該座標觸發一個短暫的擴散動畫。
   - 可以是一個向外擴散消散的圓形光圈 (Ripple)，或是幾許灰塵特效，搭配厚實的卡牌放置音效。
   - 目的：強化拖曳放開瞬間的打擊感與確定感，提升整體的物理操作沉浸感。

## 實作建議
- 磁吸效果可在 `react-dnd` 或現有的自訂拖曳邏輯中，當 `isOver` 成立時，將卡牌的中心點稍微向目標區塊的中心點做 CSS `transform` 偏移。
- 漣漪效果可寫一個簡單的 CSS `@keyframes ripple`，當觸發 `onDrop` 或接收到 `applyResult(ok: true)` 時，在目標區域動態插入一個 `<div className="drop-ripple" />` 並在 500ms 後移除。
