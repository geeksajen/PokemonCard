// ============================================================
//  Pokemon Theme Pack — Card Database
//  此檔僅包含寶可夢主題的卡牌資料；類型 enum 與引擎機制請見
//  src/models/cards.js。
// ============================================================
import { CardTypes, EnergyTypes } from '../../models/cardTypes';
import { GREATBALL_TOPN } from '../../game/constants';

export const cardDatabase = {
  // ---- 基礎寶可夢 --------------------------------------------------------
  'p-001': {
    id: 'p-001',
    type: CardTypes.POKEMON,
    name: '小火龍',
    hp: 60,
    maxHp: 60,
    energyType: EnergyTypes.FIRE,
    image: '/images/pokemon/charmander.png',
    attack: { name: '火花', cost: [EnergyTypes.FIRE], damage: 20 }
  },
  'p-002': {
    id: 'p-002',
    type: CardTypes.POKEMON,
    name: '傑尼龜',
    hp: 60,
    maxHp: 60,
    energyType: EnergyTypes.WATER,
    image: '/images/pokemon/squirtle.png',
    attack: { name: '水槍', cost: [EnergyTypes.WATER], damage: 20 }
  },
  'p-003': {
    id: 'p-003',
    type: CardTypes.POKEMON,
    name: '妙蛙種子',
    hp: 70,
    maxHp: 70,
    energyType: EnergyTypes.GRASS,
    image: '/images/pokemon/bulbasaur.png',
    attack: { name: '藤鞭', cost: [EnergyTypes.GRASS], damage: 20 }
  },
  'p-004': {
    id: 'p-004',
    type: CardTypes.POKEMON,
    name: '皮卡丘',
    hp: 60,
    maxHp: 60,
    energyType: EnergyTypes.ELECTRIC,
    image: '/images/pokemon/pikachu.png',
    attack: { name: '電擊', cost: [EnergyTypes.ELECTRIC], damage: 20 }
  },
  'p-150': {
    id: 'p-150',
    type: CardTypes.POKEMON,
    name: '超夢',
    hp: 130,
    maxHp: 130,
    energyType: EnergyTypes.PSYCHIC,
    image: '/images/pokemon/mewtwo.png',
    attack: { name: '精神強念', cost: [EnergyTypes.PSYCHIC, EnergyTypes.PSYCHIC], damage: 60 }
  },
  'p-066': {
    id: 'p-066',
    type: CardTypes.POKEMON,
    name: '腕力',
    hp: 70,
    maxHp: 70,
    energyType: EnergyTypes.FIGHTING,
    image: '/images/pokemon/machop.png',
    attack: { name: '空手劈', cost: [EnergyTypes.FIGHTING], damage: 20 }
  },
  'p-143': {
    id: 'p-143',
    type: CardTypes.POKEMON,
    name: '卡比獸',
    hp: 130,
    maxHp: 130,
    energyType: EnergyTypes.NORMAL,
    image: '/images/pokemon/snorlax.png',
    attack: {
      name: '泰山壓頂',
      cost: [EnergyTypes.NORMAL, EnergyTypes.NORMAL, EnergyTypes.NORMAL],
      damage: 50
    }
  },

  // ---- 一階進化寶可夢 ----------------------------------------------------
  'p-001-ev1': {
    id: 'p-001-ev1',
    type: CardTypes.POKEMON,
    name: '火恐龍',
    hp: 90,
    maxHp: 90,
    energyType: EnergyTypes.FIRE,
    evolvesFrom: 'p-001',
    stage: 1,
    image: '/images/pokemon/charmeleon.png',
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
    image: '/images/pokemon/wartortle.png',
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
    image: '/images/pokemon/ivysaur.png',
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
    image: '/images/pokemon/raichu.png',
    attack: { name: '十萬伏特', cost: [EnergyTypes.ELECTRIC, EnergyTypes.ELECTRIC], damage: 60 }
  },

  // ---- 二階進化寶可夢 ----------------------------------------------------
  'p-001-ev2': {
    id: 'p-001-ev2',
    type: CardTypes.POKEMON,
    name: '噴火龍',
    hp: 150,
    maxHp: 150,
    energyType: EnergyTypes.FIRE,
    evolvesFrom: 'p-001-ev1',
    stage: 2,
    image: '/images/pokemon/charizard.png',
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
    image: '/images/pokemon/blastoise.png',
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
    image: '/images/pokemon/venusaur.png',
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

  // ---- 物品卡 -----------------------------------------------------------
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
    image: '/images/pokemon/rarecandy.png',
    effect: { kind: 'rareCandy' },
    description: '當你從手牌將二階進化寶可夢放到基礎寶可夢上時，將自動消耗此卡並跳過一階進化。'
  },
  'i-escaperope': {
    id: 'i-escaperope',
    type: CardTypes.ITEM,
    name: '離洞繩',
    image: '/images/pokemon/escaperope.png',
    effect: { kind: 'escapeRope' },
    description: '雙方玩家都必須將戰鬥區的寶可夢與備戰區的寶可夢互換（對手先替換）。'
  },

  // ---- 支援者卡 ---------------------------------------------------------
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
    image: '/images/pokemon/boss_orders.png',
    effect: { kind: 'bossOrders' },
    description: '選擇對手備戰區的一隻寶可夢，並將其與對手戰鬥區的寶可夢互換。'
  }
};
