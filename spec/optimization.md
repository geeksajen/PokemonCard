# PKCard 程式碼優化建議

此文件記錄未來優化的機會。

---

## 🟢 低優先：一致性 / 未來鋪路

### 8. UI 一致性：`pendingAction` 提示用 inline style

**現狀**（`src/components/GameArena.jsx:189-208`）：一大段 inline style 的浮窗，但其他彈窗都已抽成 `arena/` 子元件。

**解決方案**：抽成 `src/components/arena/PendingActionPrompt.jsx`

```jsx
// src/components/arena/PendingActionPrompt.jsx
export default function PendingActionPrompt({ pendingAction, onCancel }) {
  const message = 
    pendingAction.type === 'select_opponent_bench'
      ? '請點擊對手備戰區的一隻寶可夢'
      : '請點擊我方備戰區的一隻寶可夢';
  
  return (
    <div className="pending-action-prompt">
      <h2>請選擇目標</h2>
      <p>{message}</p>
      <button onClick={onCancel}>取消</button>
    </div>
  );
}
```

並在 `GameArena.jsx` 簡化：

```jsx
{gameState.pendingAction && (
  <PendingActionPrompt
    pendingAction={gameState.pendingAction}
    onCancel={handleCancelPending}
  />
)}
```

**收益**：風格一致、複用性高、修改易集中。

---

### 9. `applyResult` 一律播 `sfxPlace()`

**現狀**（`src/hooks/useGameEngine.js:71`）：不論放卡、補血、交換都播同一音效。

**解決方案**：讓規則結果帶 `sfx` 提示，或由呼叫端指定：

```js
// Option A：規則層帶 sfx hint
const applyResult = (result, sfx = null) => {
  if (result.ok) {
    setGameState(result.state);
    setSelectedCard(null);
    if (sfx) sfx();
    else sfxPlace();  // 預設
  } else if (result.error) {
    showToast(result.error);
    sfxError();
  }
};

// 使用
applyResult(playProfessor(...), sfxDraw);  // 大木博士特殊音效

// Option B：結果帶 sfx kind
// { ok: true, state, sfx: 'place' | 'draw' | null }
const applyResult = (result) => {
  if (result.ok) {
    const sfxMap = { place: sfxPlace, draw: sfxDraw, attack: sfxAttack };
    const sfx = sfxMap[result.sfx];
    if (sfx) sfx();
    // ...
  }
};
```

**收益**：音效可細化，未來新卡有特殊音效易擴充。

---

### 10. 攻擊模型只支援單一 `attack`（難擴充特性）

**現狀**：Pokémon 只有一個 `attack` 物件，無處安放「多招式」或「被動特性」。

**解決方案**：先預留資料結構，無需實現，但給未來預留空間：

```js
// 新的卡牌結構（相容舊的）
'p-002-ev2': {
  id: 'p-002-ev2',
  name: '水箭龜',
  hp: 140,
  energyType: EnergyTypes.WATER,
  // 舊 api（保持相容）
  attack: { name: '水砲連發', cost: [...], damage: 80 },
  
  // 新結構（未來啟用）
  attacks: [
    {
      name: '水砲連發',
      cost: [EnergyTypes.WATER, EnergyTypes.WATER, EnergyTypes.WATER],
      damage: 80,
      // 傷害修正：依基礎寶可夢身上水能量數量+20傷
      modifier: (pokemon) => pokemon.attachedEnergy.filter(e => e.energyType === EnergyTypes.WATER).length * 20
    }
  ],
  ability: {
    name: '雨的福澤',
    description: '這隻寶可夢一回合最多可填附 2 張水能量。'
  }
}
```

傷害計算可改成接受修正函式：

```js
const applyAttackDamage = (state, attackerId) => {
  const attacker = state.players[attackerId].activePokemon;
  const attack = attacker.attacks?.[0] || attacker.attack;  // fallback
  let damage = attack.damage;
  if (attack.modifier) {
    damage += attack.modifier(attacker);
  }
  // ...
};
```

**收益**：資料結構預留好，不破壞舊卡，往後改起來成本低。

---

### 11. 補單元測試（rules.js 純函式，成本低）

**現狀**：無測試覆蓋。

**理由**：`rules.js` 完全純、無副作用，是最值得加單元測試的地方。

**建議內容**：

- `canAttack` 無色能量邏輯
- `evolveCard` 繼承傷害、能量
- `resolveKnockout` 勝負判定
- `applyAttackDamage` 傷害計算
- Rare Candy 進化邏輯

**工具**：Vitest（Vite 原生支援）

```bash
npm install -D vitest
```

```js
// src/game/rules.test.js
import { describe, it, expect } from 'vitest';
import { canAttack, applyAttackDamage, /* ... */ } from './rules';

describe('canAttack', () => {
  it('應拒絕無色成本不足的攻擊', () => {
    const state = { /* 測試狀態 */ };
    const result = canAttack(state, 'player1');
    expect(result.ok).toBe(false);
  });
});
```

**收益**：重構時有護欄，退化風險低。尤其上面第 1、3 點大重構時護欄關鍵。

---

## 建議落地順序

優化項目可根據需要漸進實施，無特定優先順序：

- **#8 PendingActionPrompt** — UI 一致性提升
- **#9 applyResult 音效** — 未來特殊音效易擴充
- **#10 attacks 結構** — 為多招式、被動特性預留空間
- **#11 單元測試** — 保護既有邏輯

---

## 預期收益

| 優化項 | 難度 | 可維護性 | 擴充性 |
|--------|------|--------|--------|
| #8 UI 一致性 | 低 | ⭐⭐ | ⭐ |
| #9 音效擴充 | 低 | ⭐⭐ | ⭐⭐ |
| #10 attacks 預留 | 低 | ⭐ | ⭐⭐ |
| #11 單元測試 | 中 | ⭐⭐⭐ | ⭐ |
