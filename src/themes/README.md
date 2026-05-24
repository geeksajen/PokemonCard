# Themes — 主題包系統

這個資料夾收納所有可換的「主題包」(content pack)。每個主題包都是一套完整的卡牌世界：自己的卡牌資料、起手牌組、首頁主視覺。

## 主題包介面 (Content Pack Contract)

一個合法的主題包 (`themes/<id>/index.js`) 必須 default export 物件，包含以下欄位：

| 欄位 | 型別 | 用途 |
|---|---|---|
| `packId` | `string` | 唯一識別碼 |
| `packName` | `string` | 顯示用名稱 |
| `version` | `string` | 版本號（semver） |
| `cardDatabase` | `{ [cardId]: CardData }` | 所有卡牌定義 |
| `themeMap` | `{ [themeId]: { basic, ev1?, ev2?, energy } }` | 主題 → 進化線/能量映射 |
| `buildComposition` | `(themeEntry) => [{ id, count }]` | 給定主題回傳牌組組成 |
| `starterDecks` | `[{ id, name, color }]` | SetupPage 起手牌組清單 |
| `customDeckColor` | `string` | 自訂牌組的預覽色 |
| `aceShowcase` | `{ [key]: { name, image, glow } }` | HomePage 中央主視覺 |
| `defaultAceKey` | `string` | 預設顯示哪隻 ace |

可選擴充欄位（未來）：

| 欄位 | 用途 |
|---|---|
| `assets.imagePathBase` | 圖片資源根目錄（目前直接寫在 cardDatabase 內） |
| `assets.sounds` | 音效資源映射 |

## 切換主題包

編輯 [`src/themes/active.js`](active.js)，把 import 指向新的主題包即可：

```js
import myNewPack from './fantasy';
export const activePack = myNewPack;
```

整個遊戲（首頁、設定頁、卡牌、戰鬥、商店）會跟著換內容，無需修改任何 engine 程式碼。

## 新增主題包步驟

1. 在 `themes/<your-id>/` 建立資料夾，照 pokemon pack 的檔案結構鏡像建立 6 個檔案。
2. 在 `pack.meta.js` 寫好 packId/version 等。
3. 把你的卡牌資料填進 `cards.js`（每張卡 id 唯一、type 為 `pokemon|energy|item|trainer`）。
4. 在 `decks.js` 定義你的主題→卡牌映射與牌組組成。
5. 在 `starter-decks.js` 寫好首頁選單顯示資料。
6. 在 `ace-showcase.js` 寫好首頁主視覺資料。
7. 在 `index.js` 把以上 default export 出去。
8. 修改 `themes/active.js` 切到你的新主題包。
9. （可選）覆寫 `src/index.css` 的 `--palette-*` token 來換掉色彩風格。

## 設計原則

詳見 [`spec/engine_theme_separation.md`](../../spec/engine_theme_separation.md)。
