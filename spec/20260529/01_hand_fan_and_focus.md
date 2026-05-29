# 1. 手牌「扇形展開」與「抽牌放大」 (Hand Fan & Focus) ✅ 已完成

> 實作摘要（2026-05-29）：
> - `Hand.jsx`：扇形排列改用對稱基準 `centerIndex = (n-1)/2`，兩側卡牌依距離遞增旋轉角（每張 4°）與下沉量（`|offset|^1.4 * 6`px），形成自然手持弧線；transition 改為帶回彈的 cubic-bezier。
> - `index.css` `.hand-card:hover`：在扇形旋轉基礎上「立正 + 放大 1.15」並上抬 40px，`z-index` 拉高至 100（高於抽牌動畫的 50）確保聚焦卡永遠不被相鄰卡遮蔽。

## 痛點分析
目前手牌排列方式為線性（Flex Row），當手牌數量增多時，卡牌邊緣會擠壓在一起，導致玩家難以辨識卡牌名稱或數值，操作上較為侷限。

## 優化設計 (UI/UX)
1. **滑鼠懸停聚焦 (Hover Focus)**：
   - 當玩家滑鼠移至某張手牌時，該卡牌應在原本微幅上升 (`translateY`) 的基礎上，增加放大效果 (`scale: 1.15`)。
   - 同時調整該卡牌的 `z-index` 至最高，確保其不會被相鄰卡牌遮蔽。
   - 目的：創造「翻閱實體牌」的流暢與清晰感。
2. **扇形排列 (Fan Layout)**：
   - 利用 CSS `transform: rotate()` 配合不同的 `transform-origin`，依據卡牌在手牌中的索引值 (index) 給予微小的旋轉角度。
   - 中央卡牌直立，兩側卡牌向外微傾，形成弧形排列（類似實體持牌方式）。

## 實作建議
- 修改 `Hand.jsx` 或對應的 CSS (例如 `.hand-wrapper`)。
- 使用 React inline-style 計算角度：`rotate(${(index - centerIndex) * 3}deg)`。
