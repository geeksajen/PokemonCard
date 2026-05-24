// 純遊戲規則層
// 所有函式皆為 (state, ...args) => 結果，內部以 structuredClone 維持不可變性。
// 不依賴 React，不觸發音效/動畫，方便單元測試。
//
// 慣例：
//  - 成功的「放置/動作」會直接寫入 state.logs，並回傳 { ok: true, state }
//  - 失敗時回傳 { ok: false, error }（error 為 null 代表「靜默無效」，不顯示提示）
import { CardTypes, EnergyTypes, cardDatabase } from '../models/cards';
import { BENCH_MAX, PROFESSOR_DRAW, ENERGY_RETRIEVAL_MAX } from './constants';

export const getOpponentId = (playerId) =>
  playerId === 'player1' ? 'player2' : 'player1';

export const pushLog = (state, player, action) => {
  if (!state.logs) state.logs = [];
  state.logs.push({ player, action, time: Date.now() });
};

// 進化：繼承能量與既有傷害
const evolveCard = (oldCard, evoCard) => {
  const damage = oldCard.maxHp - oldCard.currentHp;
  return {
    ...evoCard,
    attachedEnergy: oldCard.attachedEnergy || [],
    currentHp: Math.max(10, evoCard.maxHp - damage),
  };
};

// 讀取某位置上的寶可夢。location: { zone: 'active' } | { zone: 'bench', index }
const readSlot = (player, location) =>
  location.zone === 'active' ? player.activePokemon : player.bench[location.index];

// 從手牌移除（卡片進場用，不進棄牌區）
const removeFromHand = (player, instanceId) => {
  player.hand = player.hand.filter((c) => c.instanceId !== instanceId);
};

// 從手牌移除並放入棄牌區，回傳被棄掉的卡（找不到時回傳 null）
const discardFromHand = (player, instanceId) => {
  const idx = player.hand.findIndex((c) => c.instanceId === instanceId);
  if (idx === -1) return null;
  const [card] = player.hand.splice(idx, 1);
  player.discardPile.push(card);
  return card;
};

// ---- 放置 / 進化寶可夢 ----------------------------------------------------
const playPokemon = (state, playerId, card, location) => {
  const newState = structuredClone(state);
  const p = newState.players[playerId];
  const existing = readSlot(p, location);
  const zoneLabel = location.zone === 'active' ? '戰鬥區' : '備戰區';

  // 放置基礎寶可夢
  const canPlaceBasic =
    !existing && !card.stage && (location.zone === 'active' || p.bench.length < BENCH_MAX);
  if (canPlaceBasic) {
    if (location.zone === 'active') {
      p.activePokemon = card;
    } else {
      p.bench.push(card);
    }
    removeFromHand(p, card.instanceId);
    pushLog(newState, playerId, `將 ${card.name} 放置於${zoneLabel}`);
    return { ok: true, state: newState };
  }

  // 檢查是否使用神奇糖果跳級進化（#3: 改用 id 比對，並直接用 cardDatabase[id] 取代 O(n) 掃描）
  const candyIndex = p.hand.findIndex(c => c.id === 'i-rarecandy');
  const isRareCandyCandidate = existing && !existing.stage && card.stage === 2 && candyIndex !== -1;
  let canEvolveRareCandy = false;
  if (isRareCandyCandidate) {
    const stage1 = cardDatabase[card.evolvesFrom];
    if (stage1 && stage1.evolvesFrom === existing.id) {
      canEvolveRareCandy = true;
    }
  }

  // 進化（#3: existing.id === card.evolvesFrom 取代名稱字串比對）
  if ((existing && card.stage && existing.id === card.evolvesFrom) || canEvolveRareCandy) {
    const evolved = evolveCard(existing, card);
    if (location.zone === 'active') {
      p.activePokemon = evolved;
    } else {
      const idx = p.bench.findIndex((c) => c.instanceId === existing.instanceId);
      if (idx !== -1) p.bench[idx] = evolved;
    }
    removeFromHand(p, card.instanceId);
    if (canEvolveRareCandy) {
      discardFromHand(p, p.hand[candyIndex].instanceId);
      pushLog(newState, playerId, `使用神奇糖果，將${zoneLabel}的 ${existing.name} 直接進化成 ${evolved.name}！`);
    } else {
      pushLog(newState, playerId, `將${zoneLabel}的 ${existing.name} 進化成 ${evolved.name}！`);
    }
    return { ok: true, state: newState };
  }

  if (!existing && card.stage) {
    return { ok: false, error: '無法直接打出進化寶可夢！必須先打出基礎寶可夢。' };
  }
  if (existing) {
    return { ok: false, error: '無法進化！對象不符。' };
  }
  // 備戰區已滿等情況：靜默無效
  return { ok: false, error: null };
};

// ---- 填附能量 ------------------------------------------------------------
const attachEnergy = (state, playerId, card, location) => {
  const newState = structuredClone(state);
  const p = newState.players[playerId];

  // 戰鬥區：先檢查本回合是否已填附（保留原行為，即使沒有寶可夢也會跳提示）
  if (location.zone === 'active') {
    if (newState.hasAttachedEnergyThisTurn) {
      return { ok: false, error: '這回合已經填附過能量了！' };
    }
    if (!p.activePokemon) return { ok: false, error: null };
    p.activePokemon.attachedEnergy = [...(p.activePokemon.attachedEnergy || []), card];
    removeFromHand(p, card.instanceId);
    newState.hasAttachedEnergyThisTurn = true;
    pushLog(newState, playerId, `為戰鬥區的 ${p.activePokemon.name} 填附了 ${card.name}`);
    return { ok: true, state: newState };
  }

  // 備戰區：必須有目標寶可夢才會作用
  const target = p.bench[location.index];
  if (!target) return { ok: false, error: null };
  if (newState.hasAttachedEnergyThisTurn) {
    return { ok: false, error: '這回合已經填附過能量了！' };
  }
  target.attachedEnergy = [...(target.attachedEnergy || []), card];
  removeFromHand(p, card.instanceId);
  newState.hasAttachedEnergyThisTurn = true;
  pushLog(newState, playerId, `為備戰區的 ${target.name} 填附了 ${card.name}`);
  return { ok: true, state: newState };
};

// ---- 使用傷藥（回復量由 card.heal 決定）-----------------------------------
const applyPotion = (state, playerId, card, location) => {
  const newState = structuredClone(state);
  const p = newState.players[playerId];
  const target = readSlot(p, location);
  if (!target) return { ok: false, error: null };
  if (target.currentHp >= target.maxHp) {
    return { ok: false, error: '寶可夢 HP 已滿，無法使用傷藥！' };
  }
  const heal = card.heal || 20;
  const zoneLabel = location.zone === 'active' ? '戰鬥區' : '備戰區';
  target.currentHp = Math.min(target.maxHp, target.currentHp + heal);
  discardFromHand(p, card.instanceId);
  pushLog(newState, playerId, `對${zoneLabel}的 ${target.name} 使用了${card.name}，回復 ${heal} 點 HP`);
  return { ok: true, state: newState };
};

// ---- 寶可夢交換器：戰鬥區 ↔ 指定備戰區互換 --------------------------------
const applySwitch = (state, playerId, card, location) => {
  // 只能對備戰區的寶可夢使用
  if (location.zone !== 'bench') return { ok: false, error: null };
  const newState = structuredClone(state);
  const p = newState.players[playerId];
  const benchPokemon = p.bench[location.index];
  if (!benchPokemon) return { ok: false, error: null };
  if (!p.activePokemon) {
    return { ok: false, error: '戰鬥區沒有寶可夢可供交換，請直接推派上場！' };
  }
  const active = p.activePokemon;
  p.activePokemon = benchPokemon;
  p.bench[location.index] = active;
  discardFromHand(p, card.instanceId);
  pushLog(newState, playerId, `使用了寶可夢交換器，將 ${active.name} 換下、${benchPokemon.name} 上場`);
  return { ok: true, state: newState };
};

// ---- 戰術卡：老大的指令 ----------------------------------------------------
export const applyBossOrders = (state, playerId, card) => {
  const newState = structuredClone(state);
  newState.pendingAction = {
    type: 'select_opponent_bench',
    cardId: card.instanceId,
    player: playerId
  };
  return { ok: true, state: newState };
};

export const resolveBossOrders = (state, playerId, targetBenchIndex) => {
  const newState = structuredClone(state);
  const me = newState.players[playerId];
  const oppId = getOpponentId(playerId);
  const opp = newState.players[oppId];
  
  const target = opp.bench[targetBenchIndex];
  if (!target) return { ok: false, error: '無效的目標' };
  
  const active = opp.activePokemon;
  opp.activePokemon = target;
  opp.bench[targetBenchIndex] = active;
  
  discardFromHand(me, newState.pendingAction.cardId);
  newState.pendingAction = null;
  pushLog(newState, playerId, `使用老大的指令，將對手戰鬥區的 ${active.name} 與備戰區的 ${target.name} 互換！`);
  return { ok: true, state: newState };
};

export const cancelPendingAction = (state, playerId) => {
  const newState = structuredClone(state);
  newState.pendingAction = null;
  return { ok: true, state: newState };
};

// ---- 戰術卡：離洞繩 ----------------------------------------------------
export const applyEscapeRope = (state, playerId, card) => {
  const newState = structuredClone(state);
  const me = newState.players[playerId];
  const oppId = getOpponentId(playerId);
  const opp = newState.players[oppId];
  
  if (opp.bench.length > 0) {
    const randIdx = Math.floor(Math.random() * opp.bench.length);
    const target = opp.bench[randIdx];
    const active = opp.activePokemon;
    opp.activePokemon = target;
    opp.bench[randIdx] = active;
    pushLog(newState, 'system', `對手受到離洞繩影響，將 ${active.name} 替換為 ${target.name}`);
  }
  
  if (me.bench.length > 0) {
    newState.pendingAction = {
      type: 'select_my_bench',
      cardId: card.instanceId,
      player: playerId
    };
  } else {
    discardFromHand(me, card.instanceId);
    pushLog(newState, playerId, `使用了離洞繩，但備戰區沒有寶可夢可供替換。`);
  }
  return { ok: true, state: newState };
};

export const resolveEscapeRope = (state, playerId, targetBenchIndex) => {
  const newState = structuredClone(state);
  const me = newState.players[playerId];
  
  const target = me.bench[targetBenchIndex];
  if (!target) return { ok: false, error: '無效的目標' };
  
  const active = me.activePokemon;
  me.activePokemon = target;
  me.bench[targetBenchIndex] = active;
  
  discardFromHand(me, newState.pendingAction.cardId);
  newState.pendingAction = null;
  pushLog(newState, playerId, `離洞繩發動：將 ${active.name} 替換為 ${target.name}`);
  return { ok: true, state: newState };
};

// 對某個位置打出一張手牌（寶可夢 / 能量 / 需指定目標的物品）
// #1: 物品效果改由 card.effect.kind 分派，取代硬編碼的 card.id / card.heal 判斷
export const playCardOnPokemon = (state, playerId, card, location) => {
  if (card.type === CardTypes.POKEMON) return playPokemon(state, playerId, card, location);
  if (card.type === CardTypes.ENERGY) return attachEnergy(state, playerId, card, location);
  if (card.type === CardTypes.ITEM) {
    const kind = card.effect?.kind;
    if (kind === 'heal') return applyPotion(state, playerId, card, location);
    if (kind === 'switchActive') return applySwitch(state, playerId, card, location);
  }
  return { ok: false, error: null };
};

// ---- 從備戰區推派上場 -----------------------------------------------------
export const promoteFromBench = (state, playerId, benchIndex) => {
  const newState = structuredClone(state);
  const p = newState.players[playerId];
  if (p.activePokemon || !p.bench[benchIndex]) return { ok: false, error: null };
  p.activePokemon = p.bench[benchIndex];
  p.bench.splice(benchIndex, 1);
  pushLog(newState, playerId, `將備戰區的 ${p.activePokemon.name} 推上戰鬥區`);
  return { ok: true, state: newState };
};

// ---- 訓練家：大木博士 -----------------------------------------------------
export const playProfessor = (state, playerId, card) => {
  const newState = structuredClone(state);
  const p = newState.players[playerId];
  p.discardPile.push(card);
  p.discardPile.push(...p.hand);
  p.hand = [];
  let drawn = 0;
  for (let i = 0; i < PROFESSOR_DRAW; i++) {
    if (p.deck.length > 0) {
      p.hand.push(p.deck.pop());
      drawn++;
    }
  }
  pushLog(newState, playerId, `使用了大木博士，捨棄手牌並抽取了 ${drawn} 張牌`);
  return { ok: true, state: newState };
};

// ---- 訓練家：精靈球（從牌庫挑一張寶可夢）---------------------------------
export const pullPokemonFromDeck = (state, playerId, pickedInstanceId, consumeCard) => {
  const newState = structuredClone(state);
  const p = newState.players[playerId];
  const idx = p.deck.findIndex((c) => c.instanceId === pickedInstanceId);
  if (idx !== -1) {
    const [pulled] = p.deck.splice(idx, 1);
    p.hand.push(pulled);
    p.deck.sort(() => Math.random() - 0.5); // 洗牌
    if (consumeCard) {
      discardFromHand(p, consumeCard.instanceId);
    }
    pushLog(newState, playerId, `使用了${consumeCard?.name || '精靈球'}，從牌庫抽出了 ${pulled.name}`);
  }
  return { ok: true, state: newState };
};

// 取消牌庫檢索（卡牌仍消耗）
export const cancelPokeball = (state, playerId, consumeCard) => {
  const newState = structuredClone(state);
  const p = newState.players[playerId];
  if (consumeCard) {
    discardFromHand(p, consumeCard.instanceId);
  }
  pushLog(newState, playerId, `使用了${consumeCard?.name || '精靈球'}，但沒有選擇任何寶可夢`);
  return { ok: true, state: newState };
};

// ---- 能量回收：從棄牌區拿回最多 2 張能量 ----------------------------------
export const retrieveEnergy = (state, playerId, card) => {
  const newState = structuredClone(state);
  const p = newState.players[playerId];
  const energyIndexes = [];
  for (let i = p.discardPile.length - 1; i >= 0 && energyIndexes.length < ENERGY_RETRIEVAL_MAX; i--) {
    if (p.discardPile[i].type === CardTypes.ENERGY) energyIndexes.push(i);
  }
  if (energyIndexes.length === 0) {
    return { ok: false, error: '棄牌區沒有能量卡可以回收！' };
  }
  // 由大到小移除，避免索引位移
  const retrieved = energyIndexes.map((i) => p.discardPile.splice(i, 1)[0]);
  p.hand.push(...retrieved);
  discardFromHand(p, card.instanceId);
  pushLog(newState, playerId, `使用了能量回收，從棄牌區拿回了 ${retrieved.length} 張能量卡`);
  return { ok: true, state: newState };
};

// ---- 攻擊 ----------------------------------------------------------------
// 攻擊前置檢查，回傳 { ok, error }
export const canAttack = (state, attackerId) => {
  const me = state.players[attackerId];
  const opp = state.players[getOpponentId(attackerId)];
  if (state.hasAttackedThisTurn) return { ok: false, error: '這回合已經攻擊過了！' };
  if (!me.activePokemon) return { ok: false, error: '你的戰鬥區沒有寶可夢！' };
  if (!opp.activePokemon)
    return { ok: false, error: '對手戰鬥區沒有寶可夢，請先結束回合讓對手派出寶可夢！' };
  const attachedEnergy = me.activePokemon.attachedEnergy || [];
  const cost = me.activePokemon.attack.cost || [];

  const pool = attachedEnergy.map(e => e.energyType);

  // 首先滿足指定的屬性能量
  for (const c of cost) {
    if (c !== EnergyTypes.NORMAL) {
      const idx = pool.indexOf(c);
      if (idx !== -1) {
        pool.splice(idx, 1);
      } else {
        return { ok: false, error: `能量屬性不符或不足！無法發動攻擊。` };
      }
    }
  }

  // 剩下的成本由剩餘任意能量（無色）填補
  const normalCostCount = cost.filter(c => c === EnergyTypes.NORMAL).length;
  if (pool.length < normalCostCount) {
    return { ok: false, error: `能量總數不足！無法發動攻擊。` };
  }

  return { ok: true };
};

// 結算傷害（不含擊倒後的棄牌/獎賞，那由 resolveKnockout 處理）
// 回傳 { state, damage, knockedOut, faintedPokemon }
export const applyAttackDamage = (state, attackerId) => {
  const newState = structuredClone(state);
  const opponentId = getOpponentId(attackerId);
  const attacker = newState.players[attackerId].activePokemon;
  const opp = newState.players[opponentId];
  const damage = attacker.attack.damage;

  opp.activePokemon.currentHp -= damage;
  pushLog(newState, attackerId, `使用 ${attacker.name} 發動攻擊，造成 ${damage} 點傷害`);

  let knockedOut = false;
  let faintedPokemon = null;
  if (opp.activePokemon.currentHp <= 0) {
    knockedOut = true;
    pushLog(newState, attackerId, `擊倒了對手的 ${opp.activePokemon.name}！拿取一張獎賞卡。`);
    faintedPokemon = structuredClone(opp.activePokemon);
    opp.activePokemon = null; // 從戰鬥區隱藏（棄牌延後到動畫結束）
  }

  newState.hasAttackedThisTurn = true;
  return { ok: true, state: newState, damage, knockedOut, faintedPokemon };
};

// 擊倒後結算：放入棄牌區、扣除獎賞卡、判定勝負
// 回傳 { state, winner }
export const resolveKnockout = (state, attackerId, faintedPokemon) => {
  const newState = structuredClone(state);
  const opponentId = getOpponentId(attackerId);
  const opp = newState.players[opponentId];
  const me = newState.players[attackerId];

  opp.discardPile.push(faintedPokemon);
  if (faintedPokemon.attachedEnergy) {
    opp.discardPile.push(...faintedPokemon.attachedEnergy);
  }

  me.prizes -= 1;
  let winner = null;
  if (me.prizes <= 0) {
    winner = attackerId;
    newState.winner = winner;
  } else if (opp.bench.length === 0) {
    pushLog(newState, 'system', `${opp.name} 場上已無寶可夢可遞補，${me.name} 獲得勝利！`);
    winner = attackerId;
    newState.winner = winner;
  }
  return { ok: true, state: newState, winner };
};

// ---- 回合流程 ------------------------------------------------------------
// 結束回合：切換玩家並重置旗標。回傳 state（驗證由呼叫端負責）
export const endTurnState = (state) => {
  const newState = structuredClone(state);
  pushLog(newState, state.currentPlayer, '結束了回合');
  newState.currentPlayer = getOpponentId(state.currentPlayer);
  newState.hasAttachedEnergyThisTurn = false;
  newState.hasAttackedThisTurn = false;
  return { ok: true, state: newState };
};

// ---- 效果註冊表：不需指定目標的訓練家 / 物品卡 (#1) --------------------
// 新增一張無目標卡時，只需在 cardDatabase 設 effect.kind，並在此加一行對應。
const boardCardHandlers = {
  professor:       playProfessor,
  energyRetrieval: retrieveEnergy,
  bossOrders:      applyBossOrders,
  escapeRope:      applyEscapeRope,
};

export const resolveBoardCardEffect = (state, playerId, card) => {
  const handler = boardCardHandlers[card.effect?.kind];
  if (handler) return handler(state, playerId, card);
  return { ok: false, error: null };
};

// ---- 純查詢述詞層（read-only：不 clone、不寫 log、不觸發副作用）-----------
// 供 UI 高亮與出牌提示共用，與上方「實際執行」的 play 函式維持同一套判定。
// 新增可放置的卡種時，play 函式與這裡要一起更新。

// 進化判定：target 必須是 card.evolvesFrom 指向的寶可夢（以 id 比對，與 playPokemon 一致）。
export const canEvolve = (target, card) =>
  !!target && !!card.stage && target.id === card.evolvesFrom;

// 列出某張手牌目前所有「合法的棋盤落點」。
// 回傳：[{ zone: 'active' } | { zone: 'bench', index }]
// 僅涵蓋需指定棋盤目標的卡（寶可夢 / 能量 / 傷藥 / 交換器）；
// 無目標型訓練家 / 物品（大木、精靈球等）請改用 canPlayCard。
export const getValidTargets = (state, playerId, card) => {
  if (!card) return [];
  const p = state.players[playerId];
  const slots = [
    { zone: 'active', pokemon: p.activePokemon },
    ...[0, 1, 2].map((index) => ({ zone: 'bench', index, pokemon: p.bench[index] })),
  ];
  const pick = (predicate) =>
    slots
      .filter(predicate)
      .map(({ zone, index }) => (zone === 'active' ? { zone } : { zone, index }));

  // 基礎寶可夢 → 空位（備戰區受 BENCH_MAX 限制）
  if (card.type === CardTypes.POKEMON && !card.stage) {
    return pick((s) => !s.pokemon && (s.zone === 'active' || p.bench.length < BENCH_MAX));
  }
  // 進化寶可夢 → 符合進化來源的寶可夢
  if (card.type === CardTypes.POKEMON && card.stage) {
    return pick((s) => canEvolve(s.pokemon, card));
  }
  // 能量 → 本回合尚未填附時，可給場上任一寶可夢
  if (card.type === CardTypes.ENERGY) {
    if (state.hasAttachedEnergyThisTurn) return [];
    return pick((s) => !!s.pokemon);
  }
  // 物品（依 effect.kind）
  if (card.type === CardTypes.ITEM) {
    const kind = card.effect?.kind;
    if (kind === 'heal') return pick((s) => s.pokemon && s.pokemon.currentHp < s.pokemon.maxHp);
    if (kind === 'switchActive') {
      if (!p.activePokemon) return [];
      return pick((s) => s.zone === 'bench' && s.pokemon);
    }
  }
  return [];
};

// 這張牌「現在能不能打出」（供 P2 手牌發光提示）。
// 需棋盤目標的卡 → 有合法落點即可；無目標型 → 大致可打，
// 細部前置條件（如棄牌區有無能量）仍由執行層在實際打出時回報。
export const canPlayCard = (state, playerId, card) => {
  if (!card) return false;
  if (getValidTargets(state, playerId, card).length > 0) return true;
  const kind = card.effect?.kind;
  if (kind === 'searchDeck') return true;
  if (boardCardHandlers[kind]) return true;
  return false;
};

// ---- 撤退 ----------------------------------------------------------------
// 前置檢查（read-only）：回傳 { ok, error }
export const canRetreat = (state, playerId) => {
  const p = state.players[playerId];
  if (!p.activePokemon) return { ok: false, error: null };
  if (p.bench.length === 0) return { ok: false, error: '備戰區沒有寶可夢可以替換！' };
  const cost = p.activePokemon.retreatCost ?? 1;
  if ((p.activePokemon.attachedEnergy || []).length < cost)
    return { ok: false, error: `撤退費用不足！需要 ${cost} 個能量。` };
  return { ok: true };
};

// 進入撤退選擇狀態（寫入 pendingAction，等待 UI 選擇備戰區目標）
export const initiateRetreat = (state, playerId) => {
  const newState = structuredClone(state);
  newState.pendingAction = { type: 'select_retreat_bench', player: playerId };
  return { ok: true, state: newState };
};

// 結算撤退：棄掉 retreatCost 張能量、互換戰鬥區與備戰區寶可夢
export const resolveRetreat = (state, playerId, targetBenchIndex) => {
  const newState = structuredClone(state);
  const p = newState.players[playerId];
  const target = p.bench[targetBenchIndex];
  if (!target) return { ok: false, error: '無效的目標' };
  const active = p.activePokemon;
  const cost = active.retreatCost ?? 1;
  const energyToDiscard = active.attachedEnergy.splice(-cost, cost);
  p.discardPile.push(...energyToDiscard);
  p.activePokemon = target;
  p.bench[targetBenchIndex] = active;
  newState.pendingAction = null;
  pushLog(newState, playerId, `${active.name} 撤退（丟棄 ${energyToDiscard.length} 個能量），${target.name} 上場！`);
  return { ok: true, state: newState };
};

// 回合開始抽牌。回傳 { state, drawnCardId, deckOut }
export const drawForTurn = (state) => {
  const newState = structuredClone(state);
  const nextPlayer = newState.players[newState.currentPlayer];
  if (nextPlayer.deck.length > 0) {
    const drawn = nextPlayer.deck.pop();
    nextPlayer.hand.push(drawn);
    pushLog(newState, 'system', `回合開始，${nextPlayer.name} 抽了一張牌`);
    return { ok: true, state: newState, drawnCardId: drawn.instanceId, deckOut: false };
  }
  const prevPlayerId = getOpponentId(newState.currentPlayer);
  newState.winner = prevPlayerId;
  pushLog(
    newState,
    'system',
    `${nextPlayer.name} 牌組耗盡，${newState.players[prevPlayerId].name} 獲得勝利！`
  );
  return { ok: true, state: newState, drawnCardId: null, deckOut: true };
};
