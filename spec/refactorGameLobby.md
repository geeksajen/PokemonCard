# 遊戲大廳與架構重構計畫 (Refactor Game Lobby & Architecture)

## 1. 背景與目標
目前的專案為「單機版對戰原型」，所有的狀態依賴 `App.jsx` 的單一 `appState` 切換，且卡牌資料庫為靜態字典。為了將遊戲擴展為具備「會員系統」與「自訂卡牌系統」的完整遊戲平台，並支援未來的線上對戰 (PvP)，必須進行前端架構的重構。

## 2. 核心架構決策
基於討論，確立了以下三個核心決策：

1. **會員系統**：
   - 初期階段：純前端模擬，會員資料與狀態（如登入狀態、自訂卡牌庫）將儲存於 `LocalStorage` 中。
   - 目的：快速驗證會員系統的 UI/UX 與流程。
2. **自訂卡牌系統**：
   - 初期階段：允許玩家自訂卡牌，並能將其編入牌組中與 **AI 電腦** 對戰。
   - 長期目標：支援兩個會員在線上拿自己的自訂卡互相對戰 (Online PvP)。
3. **全域狀態管理 (Global State)**：
   - 選用 **Zustand** 作為全域狀態管理工具。
   - 目的：集中管理會員登入狀態、玩家持有的卡牌庫等，避免深層的 Props Drilling，並保持輕量化。

## 3. 架構調整方向

### 3.1 導入前端路由 (React Router)
淘汰 `App.jsx` 中的 `useState` 切換，全面改用 `react-router-dom` 進行頁面管理。
- `/` - 遊戲大廳首頁 (Lobby)
- `/battle` - 遊戲對戰區 (GameArena)
- `/login` - 會員登入/註冊 (模擬)
- `/studio` - 自訂卡牌工坊 (Custom Card Studio)
- `/profile` - 會員中心與牌組管理

### 3.2 目錄結構重整 (Feature-based Architecture)
將目前集中在 `components` 下的元件，按領域進行模組化拆分：
```text
src/
 ├─ api/          # 模擬後端連線 (LocalStorage wrapper)
 ├─ components/   # 共用 UI 元件 (按鈕、對話框等)
 ├─ features/     # 核心功能模組
 │   ├─ battle/   # 包含 GameArena, Board, Hand 等對戰元件
 │   ├─ studio/   # 自訂卡牌編輯器、卡牌預覽等
 │   └─ auth/     # 登入表單、會員資訊等
 ├─ pages/        # 路由對應的頁面外殼 (HomePage, BattlePage, StudioPage)
 ├─ store/        # Zustand Stores (useAuthStore, useCardStore)
 └─ models/       # 資料結構定義 (Repository Pattern)
```

### 3.3 資料庫抽象層 (Repository Pattern)
修改 `models/cards.js` 的存取方式。遊戲引擎不再直接存取靜態 JSON，而是透過 `CardRepository.getCard(cardId)` 的介面獲取。底層邏輯先查詢官方靜態卡，若無則向會員的 LocalStorage 資料庫查詢自訂卡牌。

---

## 4. 實作任務清單 (Tasks)

- [ ] **Task 1: 基礎設施建置**
  - [ ] 安裝 `react-router-dom` 與 `zustand` 套件。
  - [ ] 在 `src` 下建立 `pages/`, `features/`, `store/`, `api/` 等新目錄。

- [ ] **Task 2: 建立全域狀態 (Zustand)**
  - [ ] 實作 `useAuthStore`：包含模擬登入、登出功能，並將資料持久化至 LocalStorage。
  - [ ] 實作 `useCardStore`：管理玩家的自訂卡牌清單與客製化牌組。

- [ ] **Task 3: 路由與頁面骨架切換**
  - [ ] 建立 `HomePage`, `BattlePage`, `LoginPage`, `StudioPage`, `ProfilePage` 的基礎元件外殼。
  - [ ] 在 `App.jsx` 中設定 React Router，取代原有的 `appState` 邏輯。
  - [ ] 確保大廳導航 (Navigation Bar) 可以正確切換這些頁面。

- [ ] **Task 4: 重構現有對戰模組**
  - [ ] 將與對戰高度相關的元件 (`GameArena.jsx`, `Board.jsx`, `Hand.jsx` 等) 移至 `src/features/battle/`。
  - [ ] 更新所有相關檔案的 import 路徑，確保遊戲編譯不會出錯。
  - [ ] 確認對戰功能 (Drag & Drop, 動畫, AI 決策) 在新的路由與目錄結構下維持正常運作。

- [ ] **Task 5: 卡牌資料庫抽象化**
  - [ ] 建立 `CardRepository` 介面，統一管理卡牌讀取邏輯。
  - [ ] 讓 `useGameEngine` 與 `generateThemeDeck` 改為呼叫 `CardRepository` 來獲取卡片，支援讀取使用者建立的自訂卡牌。
