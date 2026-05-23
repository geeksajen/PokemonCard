# PKCard 程式碼優化建議

此文件記錄整體程式碼 review，依對擴充與維護的影響程度排序。

---

## 🔴 高優先：直接影響擴充效率 / 潛在 bug

### 1. 卡牌效果用 `card.id` 字串硬編碼、散落多處（最大問題）

**現狀問題**：新增一張卡目前要改 **3~4 個檔案**：

- `src/game/rules.js:266-274` — `playCardOnPokemon` 用 `card.heal` / `card.id === 'i-switch'` 分派
- `src/hooks/useGameEngine.js:249-268` — `handleDropBoard` 一長串 `if (card.id === 't-prof') ... else if ('t-pokeball') ...`
- `src/models/cards.js` — 卡片定義
- `src/models/cards.js:335` — 加進 `generateThemeDeck`

職責分散，易遺漏，難維護。

**解決方案**：改成**資料驅動的效果註冊表**。

每張卡在 `cardDatabase` 自帶 `effect` 描述：

```js
cardDatabase = {
  't-prof': {
    id: 't-prof',
    type: CardTypes.TRAINER,
    name: '大木博士',
    image: './images/professor.png',
    effect: {
      kind: 'professor'  // 規則層用這個 kind 分派
    }
  },
  'i-greatball': {
    id: 'i-greatball',
    type: CardTypes.ITEM,
    name: '超級球',
    effect: {
      kind: 'searchDeck',
      topN: 7,
      filter: 'pokemon'  // hook 端用此決定是否開 DeckSearchModal
    }
  },
  't-boss': {
    id: 't-boss',
    type: CardTypes.TRAINER,
    name: '老大的指令',
    effect: {
      kind: 'pendingSelect',
      target: 'opponentBench',
      action: 'swapActive'
    }
  }
}
```

`rules.js` 端建立 `effectHandlers` map：

```js
const effectHandlers = {
  professor: (state, playerId, card) => playProfessor(state, playerId, card),
  pendingSelect: (state, playerId, card) => applyBossOrders(state, playerId, card),
  // ...
};

// 在 handleDropBoard 中統一分派
if (card.effect && card.effect.kind) {
  const handler = effectHandlers[card.effect.kind];
  if (handler) applyResult(handler(gameState, currentPlayerId, card));
}
```

**收益**：新增卡只動 `cards.js`，視需要加一個 handler 函式，職責清晰。

---

### 2. `instanceId` 碰撞風險（潛在 bug）

**現狀問題**（`src/models/cards.js:354` 等）：

```js
for (let i = 0; i < 6; i++) {
  deck.push({
    ...cardDatabase[selectedTheme.basic],
    instanceId: `deck-p-${i}-${Date.now()}`,  // Date.now() 在迴圈內相同
    // ...
  });
}
```

- 同一迴圈內 `Date.now()` 完全相同，唯一性其實只靠 `prefix + i`
- **兩位玩家都呼叫 `generateThemeDeck`**，若同主題（或前綴重疊），會產生**相同的 `instanceId`**
  - 例：`player1` 與 `player2` 都得 `deck-p-0-<同一timestamp>`
- `instanceId` 是全域鍵，用來 `findIndex` / `filter` 定位卡片——碰撞會導致誤刪/誤動對方卡牌

**解決方案**：用單調遞增計數器或 UUID。

```js
let _instanceSeq = 0;

const generateInstanceId = (prefix) => {
  return `${prefix}-${_instanceSeq++}-${Math.random().toString(36).slice(2, 8)}`;
};

// 或更簡單的：
const generateInstanceId = (prefix) => {
  return `${prefix}-${++_instanceSeq}`;
};

// 使用
instanceId: generateInstanceId('deck-p'),
instanceId: generateInstanceId('deck-pev'),
// ...
```

**收益**：消除全域 id 碰撞風險，遊戲狀態更安全。

---

### 3. 進化以「中文名稱字串」比對（脆弱）

**現狀問題**（`src/game/rules.js:62-63, 69`）：

```js
// rules.js
const stage1 = Object.values(cardDatabase).find(c => c.name === card.evolvesFrom);
if (existing && card.stage && existing.name === card.evolvesFrom) {
  // 進化邏輯
}
```

問題：
- 用中文名稱字串當鍵脆弱（易改名、搜尋時 O(n) 掃描 DB）
- 神奇糖果實現複雜

**解決方案**：`evolvesFrom` 改存**卡片 id**，建進化鏈查表。

```js
cardDatabase = {
  'p-001': { id: 'p-001', name: '小火龍', stage: 0, /* ... */ },
  'p-001-ev1': {
    id: 'p-001-ev1',
    name: '火恐龍',
    stage: 1,
    evolvesFrom: 'p-001',  // 改成 id，不用名稱
  },
  'p-001-ev2': {
    id: 'p-001-ev2',
    name: '噴火龍',
    stage: 2,
    evolvesFrom: 'p-001-ev1',
  },
};

// rules.js：進化檢查
const canEvolve = (existing, evoCard) => {
  return evoCard.stage && existing.id === evoCard.evolvesFrom;
};

// 神奇糖果檢查：檢查二階進化的前一階是否在場
const checkRareCandy = (existing, evoCard) => {
  if (evoCard.stage !== 2) return false;
  const stage1Id = evoCard.evolvesFrom;
  const stage1 = cardDatabase[stage1Id];
  return stage1 && existing.id === stage1.evolvesFrom;
};
```

**收益**：進化邏輯清晰、高效、名稱改了也沒問題。

---

## 🟡 中優先：減少重複、降低維護成本

### 4. 抽出「從手牌棄掉」邏輯

**現狀**：`p.discardPile.push(card); removeFromHand(p, id)` 這組在 `rules.js` 出現至少 7 次，寫法不一致。

**解決方案**：

```js
// rules.js
const discardFromHand = (player, instanceId) => {
  const idx = player.hand.findIndex(c => c.instanceId === instanceId);
  if (idx !== -1) {
    const card = player.hand.splice(idx, 1)[0];
    player.discardPile.push(card);
    return card;
  }
  return null;
};

// 使用處簡化
discardFromHand(p, card.instanceId);
```

**收益**：一個地方維護邏輯，一致性提高。

---

### 5. `generateThemeDeck` 卡片實例化樣板重複

**現狀**（`src/models/cards.js:351-388`）：四段迴圈都在重複 `{ ...card, instanceId, attachedEnergy: [], currentHp: hp }`。

**解決方案**：

```js
const instantiate = (cardId, customInstanceId = null) => {
  const card = cardDatabase[cardId];
  if (!card) return null;
  const isPokemon = card.type === CardTypes.POKEMON;
  return {
    ...card,
    instanceId: customInstanceId || generateInstanceId(cardId),
    ...(isPokemon && {
      attachedEnergy: [],
      currentHp: card.maxHp
    })
  };
};

// 牌組組成用資料描述
const deckComposition = (theme) => {
  const themeMap = {
    fire: { basic: 'p-001', ev1: 'p-001-ev1', ev2: 'p-001-ev2', energy: 'e-fire' },
    // ...
  };
  const t = themeMap[theme];
  return [
    { id: t.basic, count: 6 },
    { id: t.ev1, count: 3 },
    { id: t.ev2, count: 2 },
    { id: t.energy, count: 6 },
    { id: 't-potion', count: 1 },
    { id: 'i-hyperpotion', count: 1 },
    // ...
  ];
};

export const generateThemeDeck = (theme) => {
  const deck = [];
  const composition = deckComposition(theme);
  for (const { id, count } of composition) {
    for (let i = 0; i < count; i++) {
      const card = instantiate(id);
      if (card) deck.push(card);
    }
  }
  return deck.sort(() => Math.random() - 0.5);
};
```

**收益**：牌組調整只改資料表，邏輯清晰、易維護。

---

### 6. 集中魔術數字

**分散的常數**：`bench < 3`、`prizes`、手牌 7 張、牌組 20 張、超級球 topN=7。

**解決方案**：建 `src/game/constants.js`

```js
export const GAME_CONSTANTS = {
  BENCH_MAX: 3,
  INITIAL_PRIZES: 3,
  INITIAL_HAND_SIZE: 7,
  DECK_SIZE: 20,
  GREATBALL_TOPN: 7,
  PROFESSOR_DRAW: 7,
  POTION_HEAL: 20,
  HYPERPOTION_HEAL: 50,
  MAX_POKEMON_ATTACKS_PER_TURN: 1,
  MAX_ENERGY_ATTACHMENTS_PER_TURN: 1,
};
```

在各檔 import 使用，規則調整一處生效。

---

### 7. `themeMap['normal']` 借用超能能量（語意混亂）

**現狀**（`src/models/cards.js:345`）：

```js
normal: { basic: 'p-143', energy: 'e-psychic' }  // 用超能當通用？
```

**解決方案**：加一張通用能量卡 `e-normal`（無色能量），讓無色牌組自洽：

```js
'e-normal': {
  id: 'e-normal',
  type: CardTypes.ENERGY,
  name: '無色能量',
  energyType: EnergyTypes.NORMAL,
  image: './images/colorless.png'
},

// themeMap
normal: { basic: 'p-143', energy: 'e-normal' }
```

**收益**：語意清晰，符合「任意能量填附」的設計。

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

## 建議落地優先順序

1. **第 #2（instanceId）** ← 先修，潛在 bug
2. **第 #11（加測試）** ← 為後續重構鋪安全網
3. **第 #1（效果註冊表）+ 第 #3（id 化進化）** ← 一次解決「新增卡要改多檔」的痛點
4. **第 #4~#10** ← 漸進清理，優化體驗

---

## 預期收益

| 優化項 | 難度 | 擴充效率 | 維護成本 | 穩定性 |
|--------|------|--------|--------|--------|
| #1 效果註冊表 | 中 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| #2 instanceId | 低 | ⭐ | ⭐ | ⭐⭐⭐ |
| #3 id 化進化 | 低 | ⭐⭐ | ⭐⭐ | ⭐⭐ |
| #4 discardFromHand | 低 | ⭐ | ⭐⭐ | ⭐ |
| #5 instantiate | 低 | ⭐⭐ | ⭐⭐ | ⭐ |
| #6 常數集中 | 低 | ⭐ | ⭐⭐ | ⭐ |
| #11 測試 | 中 | ⭐ | ⭐⭐ | ⭐⭐⭐ |

---

**備註**：上述建議均為 breaking changes，建議開分支或討論後再施行。如需具體實作協助，可優先要求第 #1、#2、#3 三項。
