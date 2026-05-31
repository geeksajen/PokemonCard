// 牌組洞察（純函式，theme-agnostic）：從一組 cardIds 推導出王牌寶可夢、主要能量屬性，
// 以及屬性對應的 CSS 顏色 token。供大廳王牌看板、牌盒上色、對戰按鈕光環共用。
import { CardTypes, EnergyTypes } from '../models/cards';

// 屬性 → --palette-element-* token（與 battle/Card 的 getEnergyColor 對齊）
const ELEMENT_COLOR_VARS = {
  [EnergyTypes.FIRE]:     'var(--palette-element-1)',
  [EnergyTypes.WATER]:    'var(--palette-element-2)',
  [EnergyTypes.GRASS]:    'var(--palette-element-3)',
  [EnergyTypes.ELECTRIC]: 'var(--palette-element-4)',
  [EnergyTypes.PSYCHIC]:  'var(--palette-element-5)',
  [EnergyTypes.FIGHTING]: 'var(--palette-element-6)',
  [EnergyTypes.NORMAL]:   'var(--palette-element-neutral)',
};

const ELEMENT_LABELS = {
  [EnergyTypes.FIRE]: '火', [EnergyTypes.WATER]: '水', [EnergyTypes.GRASS]: '草',
  [EnergyTypes.ELECTRIC]: '電', [EnergyTypes.PSYCHIC]: '超能', [EnergyTypes.FIGHTING]: '格鬥',
  [EnergyTypes.NORMAL]: '一般',
};

const ELEMENT_EMOJI = {
  [EnergyTypes.FIRE]: '🔥', [EnergyTypes.WATER]: '💧', [EnergyTypes.GRASS]: '🌿',
  [EnergyTypes.ELECTRIC]: '⚡', [EnergyTypes.PSYCHIC]: '🔮', [EnergyTypes.FIGHTING]: '👊',
  [EnergyTypes.NORMAL]: '⭐',
};

export const elementEmoji = (energyType) => ELEMENT_EMOJI[energyType] || '🃏';

export const elementColorVar = (energyType) =>
  ELEMENT_COLOR_VARS[energyType] || 'var(--palette-element-neutral)';

export const elementLabel = (energyType) => ELEMENT_LABELS[energyType] || '一般';

// 把 cardIds 解析成卡片物件（找不到者略過）
const resolveCards = (cardIds = [], allCards = []) =>
  cardIds.map((id) => allCards.find((c) => c.id === id)).filter(Boolean);

// 王牌：場上最具代表性的寶可夢 —— 先比進化階級，再比最大 HP。
export const getAceCard = (cardIds, allCards) => {
  const pokemons = resolveCards(cardIds, allCards).filter((c) => c.type === CardTypes.POKEMON);
  if (pokemons.length === 0) return null;
  return pokemons.reduce((best, c) => {
    const score = (c.stage || 0) * 1000 + (c.maxHp || c.hp || 0);
    const bestScore = (best.stage || 0) * 1000 + (best.maxHp || best.hp || 0);
    return score > bestScore ? c : best;
  });
};

// 主要能量屬性：統計牌組中帶 energyType 的卡，回傳出現最多的屬性（無則 null）。
export const getDominantEnergy = (cardIds, allCards) => {
  const counts = {};
  for (const card of resolveCards(cardIds, allCards)) {
    if (!card.energyType) continue;
    counts[card.energyType] = (counts[card.energyType] || 0) + 1;
  }
  let top = null;
  let max = 0;
  for (const [type, n] of Object.entries(counts)) {
    if (n > max) { max = n; top = type; }
  }
  return top;
};
