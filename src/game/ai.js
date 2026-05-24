// AI 對手決策層（純函式，不依賴 React / 音效 / 動畫）。
// 採「單步決策」：給定當前 state，回傳下一個該執行的動作，由引擎執行後再次詢問，
// 直到回傳 { kind: 'end' }。引擎負責動畫、延遲與終止保護。
//
// 動作格式：
//   { kind: 'play', card, location }   // 放置 / 進化 / 填能量（走 playCardOnPokemon）
//   { kind: 'promote', benchIndex }    // 從備戰區推派上場
//   { kind: 'attack' }                 // 發動攻擊
//   { kind: 'end' }                    // 結束回合
import { CardTypes } from '../models/cards';
import { canAttack, getMatchupEffectiveness, getOpponentId } from './rules';
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

export const decideAIAction = (state, playerId) => {
  const me = state.players[playerId];
  const oppActive = state.players[getOpponentId(playerId)].activePokemon;
  const basics = me.hand.filter((c) => c.type === CardTypes.POKEMON && !c.stage);
  const evolutions = me.hand.filter((c) => c.type === CardTypes.POKEMON && c.stage === 1);
  const energies = me.hand.filter((c) => c.type === CardTypes.ENERGY);

  // 1. 戰鬥區沒有寶可夢：推派 / 放置最佳匹配者，否則無法行動
  if (!me.activePokemon) {
    if (me.bench.length > 0) return { kind: 'promote', benchIndex: pickBestIndex(me.bench, oppActive) };
    if (basics.length > 0) {
      const bestBasic = basics[pickBestIndex(basics, oppActive)];
      return { kind: 'play', card: bestBasic, location: { zone: 'active' } };
    }
    return { kind: 'end' };
  }

  // 2. 進化（優先戰鬥區，其次備戰區；#3: 改用 id 比對）
  for (const evo of evolutions) {
    if (me.activePokemon.id === evo.evolvesFrom) {
      return { kind: 'play', card: evo, location: { zone: 'active' } };
    }
    const benchIdx = me.bench.findIndex((b) => b.id === evo.evolvesFrom);
    if (benchIdx !== -1) {
      return { kind: 'play', card: evo, location: { zone: 'bench', index: benchIdx } };
    }
  }

  // 3. 補滿備戰區（被擊倒後才有寶可夢可遞補）：優先放上能剋制對手的基礎寶可夢
  if (me.bench.length < BENCH_MAX && basics.length > 0) {
    const bestBasic = basics[pickBestIndex(basics, oppActive)];
    return { kind: 'play', card: bestBasic, location: { zone: 'bench', index: me.bench.length } };
  }

  // 4. 為戰鬥區填附能量（每回合限一次，且尚未足以攻擊時才填）
  if (!state.hasAttachedEnergyThisTurn && energies.length > 0) {
    const active = me.activePokemon;
    const have = active.attachedEnergy ? active.attachedEnergy.length : 0;
    if (have < active.attack.cost.length) {
      return { kind: 'play', card: energies[0], location: { zone: 'active' } };
    }
  }

  // 5. 能攻擊就攻擊
  if (canAttack(state, playerId).ok) return { kind: 'attack' };

  // 6. 結束回合
  return { kind: 'end' };
};
