// 簡化的卡牌資料庫
import { GREATBALL_TOPN } from '../game/constants';

export const CardTypes = {
  POKEMON: 'pokemon',
  ENERGY: 'energy',
  TRAINER: 'trainer', // 支援者：每回合行動受限的強力效果（如大木博士）
  ITEM: 'item' // 物品：可自由使用的輔助道具（傷藥、精靈球等）
};

export const EnergyTypes = {
  FIRE: 'fire',
  WATER: 'water',
  GRASS: 'grass',
  ELECTRIC: 'electric',
  PSYCHIC: 'psychic',
  FIGHTING: 'fighting',
  NORMAL: 'normal'
};

// #2: 全域單調遞增計數器，避免同一 tick 內 Date.now() 重複導致 instanceId 碰撞
let _instanceSeq = 0;
export const newInstanceId = (prefix) => `${prefix}-${++_instanceSeq}`;

export const cardDatabase = {
  // ---- 基礎寶可夢 --------------------------------------------------------
  'p-001': {
    id: 'p-001',
    type: CardTypes.POKEMON,
    name: '小火龍',
    hp: 60,
    maxHp: 60,
    energyType: EnergyTypes.FIRE,
    image: '/images/charmander.png',
    attack: { name: '火花', cost: [EnergyTypes.FIRE], damage: 20 }
  },
  'p-002': {
    id: 'p-002',
    type: CardTypes.POKEMON,
    name: '傑尼龜',
    hp: 60,
    maxHp: 60,
    energyType: EnergyTypes.WATER,
    image: '/images/squirtle.png',
    attack: { name: '水槍', cost: [EnergyTypes.WATER], damage: 20 }
  },
  'p-003': {
    id: 'p-003',
    type: CardTypes.POKEMON,
    name: '妙蛙種子',
    hp: 70,
    maxHp: 70,
    energyType: EnergyTypes.GRASS,
    image: '/images/bulbasaur.png',
    attack: { name: '藤鞭', cost: [EnergyTypes.GRASS], damage: 20 }
  },
  'p-004': {
    id: 'p-004',
    type: CardTypes.POKEMON,
    name: '皮卡丘',
    hp: 60,
    maxHp: 60,
    energyType: EnergyTypes.ELECTRIC,
    image: '/images/pikachu.png',
    attack: { name: '電擊', cost: [EnergyTypes.ELECTRIC], damage: 20 }
  },
  'p-150': {
    id: 'p-150',
    type: CardTypes.POKEMON,
    name: '超夢',
    hp: 130,
    maxHp: 130,
    energyType: EnergyTypes.PSYCHIC,
    image: '/images/mewtwo.png',
    attack: { name: '精神強念', cost: [EnergyTypes.PSYCHIC, EnergyTypes.PSYCHIC], damage: 60 }
  },
  'p-066': {
    id: 'p-066',
    type: CardTypes.POKEMON,
    name: '腕力',
    hp: 70,
    maxHp: 70,
    energyType: EnergyTypes.FIGHTING,
    image: '/images/machop.png',
    attack: { name: '空手劈', cost: [EnergyTypes.FIGHTING], damage: 20 }
  },
  'p-143': {
    id: 'p-143',
    type: CardTypes.POKEMON,
    name: '卡比獸',
    hp: 130,
    maxHp: 130,
    energyType: EnergyTypes.NORMAL,
    image: '/images/snorlax.png',
    attack: {
      name: '泰山壓頂',
      cost: [EnergyTypes.NORMAL, EnergyTypes.NORMAL, EnergyTypes.NORMAL],
      damage: 50
    }
  },

  // ---- 一階進化寶可夢 (#3: evolvesFrom 改為卡片 id) ----------------------
  'p-001-ev1': {
    id: 'p-001-ev1',
    type: CardTypes.POKEMON,
    name: '火恐龍',
    hp: 90,
    maxHp: 90,
    energyType: EnergyTypes.FIRE,
    evolvesFrom: 'p-001',
    stage: 1,
    image: '/images/charmeleon.png',
    attack: { name: '火焰放射', cost: [EnergyTypes.FIRE, EnergyTypes.FIRE], damage: 50 }
  },
  'p-002-ev1': {
    id: 'p-002-ev1',
    type: CardTypes.POKEMON,
    name: '卡咪龜',
    hp: 90,
    maxHp: 90,
    energyType: EnergyTypes.WATER,
    evolvesFrom: 'p-002',
    stage: 1,
    image: '/images/wartortle.png',
    attack: { name: '水砲', cost: [EnergyTypes.WATER, EnergyTypes.WATER], damage: 50 }
  },
  'p-003-ev1': {
    id: 'p-003-ev1',
    type: CardTypes.POKEMON,
    name: '妙蛙草',
    hp: 100,
    maxHp: 100,
    energyType: EnergyTypes.GRASS,
    evolvesFrom: 'p-003',
    stage: 1,
    image: '/images/ivysaur.png',
    attack: { name: '飛葉快刀', cost: [EnergyTypes.GRASS, EnergyTypes.GRASS], damage: 50 }
  },
  'p-004-ev1': {
    id: 'p-004-ev1',
    type: CardTypes.POKEMON,
    name: '雷丘',
    hp: 90,
    maxHp: 90,
    energyType: EnergyTypes.ELECTRIC,
    evolvesFrom: 'p-004',
    stage: 1,
    image: '/images/raichu.png',
    attack: { name: '十萬伏特', cost: [EnergyTypes.ELECTRIC, EnergyTypes.ELECTRIC], damage: 60 }
  },

  // ---- 二階進化寶可夢 (#3: evolvesFrom 改為卡片 id) ----------------------
  'p-001-ev2': {
    id: 'p-001-ev2',
    type: CardTypes.POKEMON,
    name: '噴火龍',
    hp: 150,
    maxHp: 150,
    energyType: EnergyTypes.FIRE,
    evolvesFrom: 'p-001-ev1',
    stage: 2,
    image: '/images/charizard.png',
    attack: {
      name: '大字爆炎',
      cost: [EnergyTypes.FIRE, EnergyTypes.FIRE, EnergyTypes.FIRE, EnergyTypes.FIRE],
      damage: 100
    }
  },
  'p-002-ev2': {
    id: 'p-002-ev2',
    type: CardTypes.POKEMON,
    name: '水箭龜',
    hp: 140,
    maxHp: 140,
    energyType: EnergyTypes.WATER,
    evolvesFrom: 'p-002-ev1',
    stage: 2,
    image: '/images/blastoise.png',
    attack: {
      name: '水砲連發',
      cost: [EnergyTypes.WATER, EnergyTypes.WATER, EnergyTypes.WATER],
      damage: 80
    }
  },
  'p-003-ev2': {
    id: 'p-003-ev2',
    type: CardTypes.POKEMON,
    name: '妙蛙花',
    hp: 140,
    maxHp: 140,
    energyType: EnergyTypes.GRASS,
    evolvesFrom: 'p-003-ev1',
    stage: 2,
    image: '/images/venusaur.png',
    attack: {
      name: '日光束',
      cost: [EnergyTypes.GRASS, EnergyTypes.GRASS, EnergyTypes.GRASS, EnergyTypes.GRASS],
      damage: 90
    }
  },

  // ---- 能量卡 ------------------------------------------------------------
  'e-fire':     { id: 'e-fire',     type: CardTypes.ENERGY, name: '火能量',   energyType: EnergyTypes.FIRE },
  'e-water':    { id: 'e-water',    type: CardTypes.ENERGY, name: '水能量',   energyType: EnergyTypes.WATER },
  'e-grass':    { id: 'e-grass',    type: CardTypes.ENERGY, name: '草能量',   energyType: EnergyTypes.GRASS },
  'e-electric': { id: 'e-electric', type: CardTypes.ENERGY, name: '雷能量',   energyType: EnergyTypes.ELECTRIC },
  'e-psychic':  { id: 'e-psychic',  type: CardTypes.ENERGY, name: '超能能量', energyType: EnergyTypes.PSYCHIC },
  'e-fighting': { id: 'e-fighting', type: CardTypes.ENERGY, name: '格鬥能量', energyType: EnergyTypes.FIGHTING },
  'e-normal':   { id: 'e-normal',   type: CardTypes.ENERGY, name: '無色能量', energyType: EnergyTypes.NORMAL },

  // ---- 物品卡 (#1: 新增 effect 欄位描述效果種類) --------------------------
  't-potion': {
    id: 't-potion',
    type: CardTypes.ITEM,
    name: '傷藥',
    heal: 20,
    effect: { kind: 'heal' },
    description: '回復一隻寶可夢 20 點 HP。'
  },
  'i-hyperpotion': {
    id: 'i-hyperpotion',
    type: CardTypes.ITEM,
    name: '高級傷藥',
    heal: 50,
    effect: { kind: 'heal' },
    description: '回復一隻寶可夢 50 點 HP。'
  },
  'i-switch': {
    id: 'i-switch',
    type: CardTypes.ITEM,
    name: '寶可夢交換器',
    effect: { kind: 'switchActive' },
    description: '將戰鬥區的寶可夢與一隻備戰區的寶可夢互換。'
  },
  'i-energy-retrieval': {
    id: 'i-energy-retrieval',
    type: CardTypes.ITEM,
    name: '能量回收',
    effect: { kind: 'energyRetrieval' },
    description: '從棄牌區拿回最多 2 張能量卡加入手牌。'
  },
  't-pokeball': {
    id: 't-pokeball',
    type: CardTypes.ITEM,
    name: '精靈球',
    effect: { kind: 'searchDeck', topN: null },
    description: '從牌庫尋找一張寶可夢卡加入手牌，然後洗牌。'
  },
  'i-greatball': {
    id: 'i-greatball',
    type: CardTypes.ITEM,
    name: '超級球',
    effect: { kind: 'searchDeck', topN: GREATBALL_TOPN },
    description: '查看牌庫頂的 7 張卡，從中挑選 1 張寶可夢加入手牌，然後洗牌。'
  },
  'i-rarecandy': {
    id: 'i-rarecandy',
    type: CardTypes.ITEM,
    name: '神奇糖果',
    image: '/images/rarecandy.png',
    effect: { kind: 'rareCandy' },
    description: '當你從手牌將二階進化寶可夢放到基礎寶可夢上時，將自動消耗此卡並跳過一階進化。'
  },
  'i-escaperope': {
    id: 'i-escaperope',
    type: CardTypes.ITEM,
    name: '離洞繩',
    image: '/images/escaperope.png',
    effect: { kind: 'escapeRope' },
    description: '雙方玩家都必須將戰鬥區的寶可夢與備戰區的寶可夢互換（對手先替換）。'
  },

  // ---- 支援者卡 (#1: 新增 effect 欄位) -----------------------------------
  't-prof': {
    id: 't-prof',
    type: CardTypes.TRAINER,
    name: '大木博士',
    effect: { kind: 'professor' },
    description: '捨棄你的所有手牌，然後從牌庫抽出 7 張卡。'
  },
  't-boss': {
    id: 't-boss',
    type: CardTypes.TRAINER,
    name: '老大的指令',
    image: '/images/boss_orders.png',
    effect: { kind: 'bossOrders' },
    description: '選擇對手備戰區的一隻寶可夢，並將其與對手戰鬥區的寶可夢互換。'
  }
};

// 將 cardId 實體化為可放入牌組的卡片物件
const instantiate = (cardId) => {
  const card = cardDatabase[cardId];
  return {
    ...card,
    instanceId: newInstanceId(cardId),
    ...(card.type === CardTypes.POKEMON && { attachedEnergy: [], currentHp: card.maxHp })
  };
};

let customInstantiator = null;

export const setCardInstantiator = (instantiator) => {
  customInstantiator = instantiator;
};

const getInstantiator = () => customInstantiator || instantiate;

// 主題 → 進化線與能量的對應表
const themeMap = {
  fire:     { basic: 'p-001', ev1: 'p-001-ev1', ev2: 'p-001-ev2', energy: 'e-fire' },
  water:    { basic: 'p-002', ev1: 'p-002-ev1', ev2: 'p-002-ev2', energy: 'e-water' },
  grass:    { basic: 'p-003', ev1: 'p-003-ev1', ev2: 'p-003-ev2', energy: 'e-grass' },
  electric: { basic: 'p-004', ev1: 'p-004-ev1',                   energy: 'e-electric' },
  psychic:  { basic: 'p-150',                                       energy: 'e-psychic' },
  fighting: { basic: 'p-066',                                       energy: 'e-fighting' },
  normal:   { basic: 'p-143',                                       energy: 'e-normal' },
};

// 將主題轉成 [{ id, count }] 牌組組成表，調整牌數只需改這裡
const buildComposition = (t) => [
  { id: t.basic, count: t.ev1 ? 6 : 9 },
  ...(t.ev1 ? [{ id: t.ev1, count: 3 }] : []),
  ...(t.ev2 ? [{ id: t.ev2, count: 2 }] : []),
  { id: t.energy,       count: 6 },
  { id: 't-potion',     count: 1 },
  { id: 'i-hyperpotion', count: 1 },
  { id: 'i-switch',     count: 1 },
  { id: 't-pokeball',   count: 1 },
  { id: 'i-greatball',  count: 1 },
  { id: 't-prof',       count: 2 },
  { id: 'i-rarecandy',  count: 1 },
  { id: 'i-escaperope', count: 1 },
  { id: 't-boss',       count: 1 },
];

// 產生特定主題的純色牌組
export const generateThemeDeck = (theme) => {
  const t = themeMap[theme] || themeMap.fire;
  const deck = [];
  const instantiator = getInstantiator();
  for (const { id, count } of buildComposition(t)) {
    for (let i = 0; i < count; i++) deck.push(instantiator(id));
  }
  return deck.sort(() => Math.random() - 0.5);
};

// ---- 稀有度設定表 ----------------------------------------------------------
// 集中管理卡牌的所有視覺稀有度屬性。
// 新增稀有度等級：在此加一筆，Card.jsx / CardInspectModal.jsx 自動生效。
// 欄位說明：
//   background    — 卡面主漸層（null → Card.jsx 改用 getEnergyColor）
//   border        — 卡框邊線
//   badge         — Card.jsx 右側角標（null = 不顯示；basic 不顯示角標）
//   stageBadge    — CardInspectModal 的階段標籤（Pokemon 限定；null = 非 Pokemon）
//   cardShadow    — Card.jsx 的 box-shadow（normal / selected 兩態）
//   inspectShadow — CardInspectModal 外框光暈
//   foil          — 是否啟用閃卡反光（Pretask 3 / Feature ① 預留旗標）
const RARITY_CONFIG = {
  basic: {
    background:    'linear-gradient(135deg, #334155, #0f172a)',
    border:        'none',
    badge:         null,
    stageBadge:    { label: '基礎',     gradient: 'linear-gradient(90deg, #64748b, #94a3b8)', textShadow: 'none' },
    cardShadow:    { normal: 'var(--card-shadow)', selected: 'var(--card-shadow-hover)' },
    inspectShadow: '0 20px 60px rgba(0,0,0,0.6)',
    foil:          false,
  },
  stage1: {
    background:    'linear-gradient(135deg, #4f46e5, #a855f7, #eab308)',
    border:        '1px solid rgba(234,179,8,0.5)',
    badge:         { label: '進化', background: '#eab308',                              color: '#000', textShadow: 'none' },
    stageBadge:    { label: '一階進化', gradient: 'linear-gradient(90deg, #a855f7, #eab308)', textShadow: 'none' },
    cardShadow:    { normal: 'inset 0 0 10px rgba(234,179,8,0.4)', selected: '0 0 20px rgba(234,179,8,0.6)' },
    inspectShadow: '0 0 30px rgba(234,179,8,0.5), 0 20px 60px rgba(0,0,0,0.5)',
    foil:          true,
  },
  stage2: {
    background:    'linear-gradient(135deg, #e2e8f0, #38bdf8, #fbbf24)',
    border:        '2px solid rgba(251,191,36,0.8)',
    badge:         { label: '二階', background: 'linear-gradient(90deg, #38bdf8, #fcd34d)', color: '#000', textShadow: '0 0 2px rgba(255,255,255,0.8)' },
    stageBadge:    { label: '二階進化', gradient: 'linear-gradient(90deg, #38bdf8, #fcd34d)', textShadow: '0 0 3px rgba(255,255,255,0.6)' },
    cardShadow:    { normal: 'inset 0 0 15px rgba(56,189,248,0.6)', selected: '0 0 25px rgba(56,189,248,0.8), 0 0 10px rgba(251,191,36,0.6)' },
    inspectShadow: '0 0 40px rgba(56,189,248,0.6), 0 0 80px rgba(251,191,36,0.3), 0 20px 60px rgba(0,0,0,0.5)',
    foil:          true,
  },
  energy: {
    background:    null,
    border:        'none',
    badge:         null,
    stageBadge:    null,
    cardShadow:    { normal: 'var(--card-shadow)', selected: 'var(--card-shadow-hover)' },
    inspectShadow: '0 20px 60px rgba(0,0,0,0.6)',
    foil:          false,
  },
  trainer: {
    background:    'linear-gradient(135deg, #14b8a6, #0f766e)',
    border:        'none',
    badge:         null,
    stageBadge:    null,
    cardShadow:    { normal: 'var(--card-shadow)', selected: 'var(--card-shadow-hover)' },
    inspectShadow: '0 20px 60px rgba(0,0,0,0.6)',
    foil:          false,
  },
  item: {
    background:    'linear-gradient(135deg, #f59e0b, #b45309)',
    border:        'none',
    badge:         null,
    stageBadge:    null,
    cardShadow:    { normal: 'var(--card-shadow)', selected: 'var(--card-shadow-hover)' },
    inspectShadow: '0 20px 60px rgba(0,0,0,0.6)',
    foil:          false,
  },
};

// 回傳指定卡牌的稀有度設定物件（唯一查詢入口）。
// 未來若新增卡種或分級，只需更新 RARITY_CONFIG 與這裡的分派邏輯。
export const getCardRarity = (card) => {
  if (!card)                          return RARITY_CONFIG.basic;
  if (card.type === CardTypes.ENERGY)  return RARITY_CONFIG.energy;
  if (card.type === CardTypes.TRAINER) return RARITY_CONFIG.trainer;
  if (card.type === CardTypes.ITEM)    return RARITY_CONFIG.item;
  if (card.stage === 2)                return RARITY_CONFIG.stage2;
  if (card.stage === 1)                return RARITY_CONFIG.stage1;
  return RARITY_CONFIG.basic;
};
