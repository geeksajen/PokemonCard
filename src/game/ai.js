// AI 對手決策層（純函式，不依賴 React / 音效 / 動畫）。
// 採「單步決策」：給定當前 state，回傳下一個該執行的動作，由引擎執行後再次詢問，
// 直到回傳 { kind: 'end' }。引擎負責動畫、延遲與終止保護。
//
// 動作格式：
//   { kind: 'play', card, location }        // 放置 / 進化 / 填能量（走 playCardOnPokemon）
//   { kind: 'promote', benchIndex }         // 從備戰區推派上場
//   { kind: 'useCard', card, ...params }    // 道具 / 支援者（params 依 effect.kind 而異）
//       heal / switchActive → { location }
//       searchDeck          → { pickInstanceId }
//       bossOrders          → { benchIndex }
//       professor 等無目標型 → 無 params
//   { kind: 'retreat', benchIndex }         // 撤退（引擎串 initiateRetreat + resolveRetreat）
//   { kind: 'attack' }                      // 發動攻擊
//   { kind: 'end' }                         // 結束回合
import { CardTypes, cardDatabase, getAttacks } from '../models/cards';
import {
  canEvolve,
  canRetreat,
  getEffectiveDamage,
  getMatchupEffectiveness,
  getOpponentId,
  getUsableAttacks,
} from './rules';
import { BENCH_MAX } from './constants';

// 從「我方寶可夢 cand 對上對手戰鬥區 opp」的角度評分，分數越高代表越有利。
// 進攻：剋制對手 +3 / 被對手抵抗 -2；防守：被對手剋 -3 / 抵抗對手 +2；HP 作微幅 tiebreak。
const scoreMatchup = (cand, opp) => {
  if (!cand) return -Infinity;
  let score = (cand.currentHp ?? cand.maxHp ?? 0) * 0.01; // 同條件下偏好血量高者
  if (opp) {
    const offense = getMatchupEffectiveness(cand.energyType, opp);
    if (offense === 'weakness') score += 3;
    else if (offense === 'resistance') score -= 2;
    const defense = getMatchupEffectiveness(opp.energyType, cand);
    if (defense === 'weakness') score -= 3;
    else if (defense === 'resistance') score += 2;
  }
  return score;
};

// 在一組候選中挑出對上 opp 最有利者，回傳其在原陣列的索引（空陣列回 -1）。
const pickBestIndex = (candidates, opp) =>
  candidates.reduce(
    (best, cand, idx) => (scoreMatchup(cand, opp) > best.score ? { idx, score: scoreMatchup(cand, opp) } : best),
    { idx: -1, score: -Infinity }
  ).idx;

// 招式費用缺口（無招式視為無缺口）。
// gapToCheapest：距離「最快能出手」還差幾張能量（備戰區充能排序用）；
// gapToStrongest：距離「最貴的招」還差幾張（戰鬥區持續充能到大招上線）。
const attackCosts = (pokemon) => getAttacks(pokemon).map((a) => a.cost?.length ?? 0);
const attachedCount = (pokemon) => pokemon?.attachedEnergy?.length ?? 0;
const gapToCheapest = (pokemon) => {
  const costs = attackCosts(pokemon);
  if (costs.length === 0) return 0;
  return Math.max(0, Math.min(...costs) - attachedCount(pokemon));
};
const gapToStrongest = (pokemon) => {
  const costs = attackCosts(pokemon);
  if (costs.length === 0) return 0;
  return Math.max(0, Math.max(...costs) - attachedCount(pokemon));
};

// 從可用招式中挑最佳者：能擊倒defender的招（費用低者優先）＞ 有效傷害最高；
// 狀態招對「還沒有狀態的對手」有加成；自傷反殺又打不死對手的招視為最後手段。
// 回傳 { index, damage } 或 null。
const INFLICT_BONUS = 15; // 特殊狀態的粗略等值傷害
const chooseAttack = (state, playerId, defender) => {
  const active = state.players[playerId].activePokemon;
  const usable = getUsableAttacks(state, playerId).filter((a) => a.usable);
  let best = null;
  for (const a of usable) {
    const damage = getEffectiveDamage(state, active, defender, a.attack);
    let score = damage;
    const kills = defender && damage >= defender.currentHp;
    if (kills) score += 1000 - (a.attack.cost?.length ?? 0);
    if (
      a.attack.effect?.kind === 'inflict' &&
      defender && !defender.poisoned && !defender.specialCondition && !kills
    ) {
      score += INFLICT_BONUS;
    }
    const selfHit = a.attack.effect?.kind === 'selfDamage' ? (a.attack.effect.amount ?? 0) : 0;
    if (selfHit >= active.currentHp && !kills) score -= 500;
    if (!best || score > best.score) best = { index: a.index, damage, score };
  }
  return best;
};

// 優先挑與目標同屬性的能量（屬性費用需求），沒有再拿任意能量
const pickEnergyFor = (target, energies) =>
  energies.find((e) => e.energyType === target.energyType) || energies[0];

// 備戰區充能目標：缺口最小者優先（最快能接戰），平手取 maxHp 高者；無缺口回 -1
const pickBenchChargeIdx = (bench) => {
  let bestIdx = -1;
  bench.forEach((b, i) => {
    const gap = gapToCheapest(b);
    if (gap <= 0) return;
    if (
      bestIdx === -1 ||
      gap < gapToCheapest(bench[bestIdx]) ||
      (gap === gapToCheapest(bench[bestIdx]) && (b.maxHp ?? 0) > (bench[bestIdx].maxHp ?? 0))
    ) {
      bestIdx = i;
    }
  });
  return bestIdx;
};

// 牌庫檢索目標：場上寶可夢的進化卡 ＞ HP 最高的基礎寶可夢 ＞ 任一寶可夢
const pickSearchTarget = (me, card) => {
  const topN = card.effect?.topN;
  const pool = topN ? me.deck.slice(-topN) : me.deck;
  const pokemons = pool.filter((c) => c.type === CardTypes.POKEMON);
  if (pokemons.length === 0) return null;
  const board = [me.activePokemon, ...me.bench].filter(Boolean);
  const evo = pokemons.find((c) => c.stage && board.some((t) => canEvolve(t, c)));
  if (evo) return evo;
  const basics = pokemons.filter((c) => !c.stage);
  if (basics.length > 0) return basics.reduce((best, c) => ((c.maxHp ?? 0) > (best.maxHp ?? 0) ? c : best));
  return pokemons[0];
};

export const decideAIAction = (state, playerId) => {
  const me = state.players[playerId];
  const opp = state.players[getOpponentId(playerId)];
  const oppActive = opp.activePokemon;
  const basics = me.hand.filter((c) => c.type === CardTypes.POKEMON && !c.stage);
  const evolutions = me.hand.filter((c) => c.type === CardTypes.POKEMON && c.stage);
  const energies = me.hand.filter((c) => c.type === CardTypes.ENERGY);
  const hasRareCandy = me.hand.some((c) => c.id === 'i-rarecandy');

  // 1. 戰鬥區沒有寶可夢：推派 / 放置最佳匹配者，否則無法行動
  if (!me.activePokemon) {
    if (me.bench.length > 0) return { kind: 'promote', benchIndex: pickBestIndex(me.bench, oppActive) };
    if (basics.length > 0) {
      const bestBasic = basics[pickBestIndex(basics, oppActive)];
      return { kind: 'play', card: bestBasic, location: { zone: 'active' } };
    }
    return { kind: 'end' };
  }

  // 2. 進化（一階 / 二階直升 / 神奇糖果跳級，優先戰鬥區）
  const slots = [
    { location: { zone: 'active' }, pokemon: me.activePokemon },
    ...me.bench.map((b, index) => ({ location: { zone: 'bench', index }, pokemon: b })),
  ];
  for (const evo of evolutions) {
    for (const { location, pokemon } of slots) {
      if (canEvolve(pokemon, evo)) return { kind: 'play', card: evo, location };
      // 神奇糖果：基礎 + 手上有糖果 + 二階卡的進化鏈對得上（playPokemon 會自動消耗糖果）
      if (hasRareCandy && !pokemon.stage && evo.stage === 2) {
        const stage1 = cardDatabase[evo.evolvesFrom];
        if (stage1 && stage1.evolvesFrom === pokemon.id) return { kind: 'play', card: evo, location };
      }
    }
  }

  // 3. 補血：戰鬥區已受傷 ≥ 回復量才用（不浪費），支援者型受每回合一張限制
  const healCards = me.hand.filter(
    (c) =>
      c.effect?.kind === 'heal' &&
      (c.type !== CardTypes.TRAINER || !state.hasPlayedSupporterThisTurn)
  );
  for (const healCard of healCards) {
    const damageTaken = me.activePokemon.maxHp - me.activePokemon.currentHp;
    if (damageTaken >= (healCard.heal || 20)) {
      return { kind: 'useCard', card: healCard, location: { zone: 'active' } };
    }
  }

  // 4. 補滿備戰區（被擊倒後才有寶可夢可遞補）：優先放上能剋制對手的基礎寶可夢
  if (me.bench.length < BENCH_MAX && basics.length > 0) {
    const bestBasic = basics[pickBestIndex(basics, oppActive)];
    return { kind: 'play', card: bestBasic, location: { zone: 'bench', index: me.bench.length } };
  }

  // 5. 老大的指令：攻擊已就緒、現任對手打不死、但備戰區有能一擊擊倒的目標
  if (!state.hasPlayedSupporterThisTurn && oppActive) {
    const boss = me.hand.find((c) => c.effect?.kind === 'bossOrders');
    const vsActive = boss && chooseAttack(state, playerId, oppActive);
    if (vsActive && vsActive.damage < oppActive.currentHp) {
      const targetIdx = opp.bench.findIndex(
        (b) => (chooseAttack(state, playerId, b)?.damage ?? 0) >= b.currentHp
      );
      if (targetIdx !== -1) return { kind: 'useCard', card: boss, benchIndex: targetIdx };
    }
  }

  // 6. 檢索球：手牌沒有任何寶可夢時，從牌庫找（超級球只看牌庫頂 topN 張）
  if (basics.length === 0 && evolutions.length === 0) {
    for (const ball of me.hand.filter((c) => c.effect?.kind === 'searchDeck')) {
      const pick = pickSearchTarget(me, ball);
      if (pick) return { kind: 'useCard', card: ball, pickInstanceId: pick.instanceId };
    }
  }

  // 7. 大木博士：除它以外的手牌 ≤ 2 張且牌庫夠抽時，重整手牌
  if (!state.hasPlayedSupporterThisTurn && me.deck.length >= 7) {
    const prof = me.hand.find((c) => c.effect?.kind === 'professor');
    if (prof && me.hand.length - 1 <= 2) return { kind: 'useCard', card: prof };
  }

  // 7.5 過牌支援者（effect.kind 泛用，不寫死卡片 id）：
  //     比爾（draw）：手牌偏少時低風險補牌；
  //     希羅娜（shuffleDraw）：手牌多但無事可做（能量已填/沒能量）時重整手牌。
  if (!state.hasPlayedSupporterThisTurn) {
    const drawCard = me.hand.find((c) => c.effect?.kind === 'draw');
    if (drawCard && me.hand.length - 1 <= 3 && me.deck.length > 0) {
      return { kind: 'useCard', card: drawCard };
    }
    const shuffleCard = me.hand.find((c) => c.effect?.kind === 'shuffleDraw');
    const energyDone = state.hasAttachedEnergyThisTurn || energies.length === 0;
    if (shuffleCard && me.hand.length - 1 >= 4 && energyDone) {
      return { kind: 'useCard', card: shuffleCard };
    }
  }

  // 8. 填能量（每回合限一次）：戰鬥區充到最貴的招上線為止；
  //    已充滿則補「最快能接戰（缺口最小）」的備戰主力
  if (!state.hasAttachedEnergyThisTurn && energies.length > 0) {
    if (gapToStrongest(me.activePokemon) > 0) {
      return { kind: 'play', card: pickEnergyFor(me.activePokemon, energies), location: { zone: 'active' } };
    }
    const bestIdx = pickBenchChargeIdx(me.bench);
    if (bestIdx !== -1) {
      return {
        kind: 'play',
        card: pickEnergyFor(me.bench[bestIdx], energies),
        location: { zone: 'bench', index: bestIdx },
      };
    }
  }

  // 8.5 充電器：棄牌區有能量、場上還有缺能量的主力（不佔每回合手動填附）
  const charger = me.hand.find(
    (c) =>
      c.effect?.kind === 'attachFromDiscard' &&
      (c.type !== CardTypes.TRAINER || !state.hasPlayedSupporterThisTurn)
  );
  if (charger && me.discardPile.some((c) => c.type === CardTypes.ENERGY)) {
    if (gapToStrongest(me.activePokemon) > 0) {
      return { kind: 'useCard', card: charger, location: { zone: 'active' } };
    }
    const benchIdx = pickBenchChargeIdx(me.bench);
    if (benchIdx !== -1) {
      return { kind: 'useCard', card: charger, location: { zone: 'bench', index: benchIdx } };
    }
  }

  // 9. 撤退：被屬性剋制、又打不死對手、備戰區有明顯更優（+3 分）且能快速接戰的候選
  if (oppActive && canRetreat(state, playerId).ok) {
    const activeScore = scoreMatchup(me.activePokemon, oppActive);
    const canKO = (chooseAttack(state, playerId, oppActive)?.damage ?? 0) >= oppActive.currentHp;
    if (activeScore <= -2 && !canKO) {
      const bestIdx = pickBestIndex(me.bench, oppActive);
      const cand = me.bench[bestIdx];
      if (cand && scoreMatchup(cand, oppActive) >= activeScore + 3 && gapToCheapest(cand) <= 1) {
        return { kind: 'retreat', benchIndex: bestIdx };
      }
    }
  }

  // 10. 能攻擊就攻擊（挑最佳可用招式）
  const attackChoice = chooseAttack(state, playerId, oppActive);
  if (attackChoice) return { kind: 'attack', attackIndex: attackChoice.index };

  // 11. 結束回合
  return { kind: 'end' };
};
