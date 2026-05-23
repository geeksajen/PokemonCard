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
import { canAttack } from './rules';

export const decideAIAction = (state, playerId) => {
  const me = state.players[playerId];
  const basics = me.hand.filter((c) => c.type === CardTypes.POKEMON && !c.stage);
  const evolutions = me.hand.filter((c) => c.type === CardTypes.POKEMON && c.stage === 1);
  const energies = me.hand.filter((c) => c.type === CardTypes.ENERGY);

  // 1. 戰鬥區沒有寶可夢：先補上，否則無法行動
  if (!me.activePokemon) {
    if (me.bench.length > 0) return { kind: 'promote', benchIndex: 0 };
    if (basics.length > 0) return { kind: 'play', card: basics[0], location: { zone: 'active' } };
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

  // 3. 補滿備戰區（被擊倒後才有寶可夢可遞補）
  if (me.bench.length < 3 && basics.length > 0) {
    return { kind: 'play', card: basics[0], location: { zone: 'bench', index: me.bench.length } };
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
