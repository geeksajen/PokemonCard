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
    retreatCost: 1,
    weakness: { type: EnergyTypes.WATER, value: 'x2' },
    image: '/images/pokemon/charmander.png',
    attacks: [{ name: '火花', cost: [EnergyTypes.FIRE], damage: 20 }]
  },
  'p-002': {
    id: 'p-002',
    type: CardTypes.POKEMON,
    name: '傑尼龜',
    hp: 60,
    maxHp: 60,
    energyType: EnergyTypes.WATER,
    retreatCost: 1,
    weakness: { type: EnergyTypes.ELECTRIC, value: 'x2' },
    image: '/images/pokemon/squirtle.png',
    attacks: [{ name: '水槍', cost: [EnergyTypes.WATER], damage: 20 }]
  },
  'p-003': {
    id: 'p-003',
    type: CardTypes.POKEMON,
    name: '妙蛙種子',
    hp: 70,
    maxHp: 70,
    energyType: EnergyTypes.GRASS,
    retreatCost: 1,
    weakness: { type: EnergyTypes.FIRE, value: 'x2' },
    image: '/images/pokemon/bulbasaur.png',
    attacks: [
      { name: '藤鞭', cost: [EnergyTypes.GRASS], damage: 20 },
      {
        name: '催眠粉',
        cost: [EnergyTypes.GRASS],
        damage: 10,
        effect: { kind: 'inflict', condition: 'asleep' },
        description: '對手的戰鬥寶可夢陷入睡眠。'
      }
    ]
  },
  'p-004': {
    id: 'p-004',
    type: CardTypes.POKEMON,
    name: '皮卡丘',
    hp: 60,
    maxHp: 60,
    energyType: EnergyTypes.ELECTRIC,
    retreatCost: 1,
    weakness: { type: EnergyTypes.FIGHTING, value: 'x2' },
    image: '/images/pokemon/pikachu.png',
    attacks: [
      { name: '電擊', cost: [EnergyTypes.ELECTRIC], damage: 20 },
      {
        name: '電磁波',
        cost: [EnergyTypes.ELECTRIC],
        damage: 10,
        effect: { kind: 'inflict', condition: 'paralyzed' },
        description: '對手的戰鬥寶可夢麻痺。'
      }
    ]
  },
  'p-150': {
    id: 'p-150',
    type: CardTypes.POKEMON,
    name: '超夢',
    hp: 130,
    maxHp: 130,
    energyType: EnergyTypes.PSYCHIC,
    prizeYield: 2, // EX 級：被擊倒時對手拿 2 張獎賞卡
    retreatCost: 3,
    weakness: { type: EnergyTypes.PSYCHIC, value: 'x2' },
    image: '/images/pokemon/mewtwo.png',
    attacks: [
      {
        name: '念力',
        cost: [EnergyTypes.PSYCHIC],
        damage: 20,
        effect: { kind: 'inflict', condition: 'asleep' },
        description: '對手的戰鬥寶可夢陷入睡眠。'
      },
      { name: '精神強念', cost: [EnergyTypes.PSYCHIC, EnergyTypes.PSYCHIC], damage: 60 }
    ]
  },
  'p-066': {
    id: 'p-066',
    type: CardTypes.POKEMON,
    name: '腕力',
    hp: 70,
    maxHp: 70,
    energyType: EnergyTypes.FIGHTING,
    retreatCost: 1,
    weakness: { type: EnergyTypes.PSYCHIC, value: 'x2' },
    image: '/images/pokemon/machop.png',
    attacks: [
      { name: '空手劈', cost: [EnergyTypes.FIGHTING], damage: 20 },
      { name: '地獄翻滾', cost: [EnergyTypes.FIGHTING, EnergyTypes.FIGHTING], damage: 40 }
    ]
  },
  'p-143': {
    id: 'p-143',
    type: CardTypes.POKEMON,
    name: '卡比獸',
    hp: 130,
    maxHp: 130,
    energyType: EnergyTypes.NORMAL,
    prizeYield: 2, // EX 級：被擊倒時對手拿 2 張獎賞卡
    retreatCost: 3,
    weakness: { type: EnergyTypes.FIGHTING, value: 'x2' },
    resistance: { type: EnergyTypes.PSYCHIC, value: '-20' },
    image: '/images/pokemon/snorlax.png',
    attacks: [
      { name: '滾動', cost: [EnergyTypes.NORMAL, EnergyTypes.NORMAL], damage: 30 },
      {
        name: '捨身衝撞',
        cost: [EnergyTypes.NORMAL, EnergyTypes.NORMAL, EnergyTypes.NORMAL],
        damage: 80,
        effect: { kind: 'selfDamage', amount: 20 },
        description: '這隻寶可夢也會受到 20 點反作用傷害。'
      }
    ]
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
    retreatCost: 2,
    weakness: { type: EnergyTypes.WATER, value: 'x2' },
    image: '/images/pokemon/charmeleon.png',
    attacks: [
      { name: '利爪', cost: [EnergyTypes.FIRE], damage: 20 },
      { name: '火焰放射', cost: [EnergyTypes.FIRE, EnergyTypes.FIRE], damage: 50 }
    ]
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
    retreatCost: 1,
    weakness: { type: EnergyTypes.ELECTRIC, value: 'x2' },
    image: '/images/pokemon/wartortle.png',
    attacks: [
      { name: '咬住', cost: [EnergyTypes.WATER], damage: 20 },
      { name: '水砲', cost: [EnergyTypes.WATER, EnergyTypes.WATER], damage: 50 }
    ]
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
    retreatCost: 2,
    weakness: { type: EnergyTypes.FIRE, value: 'x2' },
    image: '/images/pokemon/ivysaur.png',
    attacks: [
      {
        name: '毒粉',
        cost: [EnergyTypes.GRASS, EnergyTypes.GRASS],
        damage: 20,
        effect: { kind: 'inflict', condition: 'poisoned' },
        description: '對手的戰鬥寶可夢中毒。'
      },
      { name: '飛葉快刀', cost: [EnergyTypes.GRASS, EnergyTypes.GRASS], damage: 50 }
    ]
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
    retreatCost: 1,
    weakness: { type: EnergyTypes.FIGHTING, value: 'x2' },
    image: '/images/pokemon/raichu.png',
    attacks: [
      { name: '電光一閃', cost: [EnergyTypes.ELECTRIC], damage: 20 },
      { name: '十萬伏特', cost: [EnergyTypes.ELECTRIC, EnergyTypes.ELECTRIC], damage: 60 }
    ]
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
    retreatCost: 3,
    weakness: { type: EnergyTypes.WATER, value: 'x2' },
    image: '/images/pokemon/charizard.png',
    attacks: [
      { name: '火焰旋渦', cost: [EnergyTypes.FIRE, EnergyTypes.FIRE, EnergyTypes.FIRE], damage: 60 },
      {
        name: '大字爆炎',
        cost: [EnergyTypes.FIRE, EnergyTypes.FIRE, EnergyTypes.FIRE],
        damage: 120,
        effect: { kind: 'discardSelfEnergy', count: 2 },
        description: '棄掉這隻寶可夢身上的 2 張能量。'
      }
    ]
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
    retreatCost: 2,
    weakness: { type: EnergyTypes.ELECTRIC, value: 'x2' },
    image: '/images/pokemon/blastoise.png',
    attacks: [
      { name: '猛烈衝撞', cost: [EnergyTypes.WATER, EnergyTypes.WATER], damage: 40 },
      {
        name: '水砲連發',
        cost: [EnergyTypes.WATER, EnergyTypes.WATER, EnergyTypes.WATER],
        damage: 80
      }
    ]
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
    retreatCost: 2,
    weakness: { type: EnergyTypes.FIRE, value: 'x2' },
    image: '/images/pokemon/venusaur.png',
    attacks: [
      {
        name: '吸取',
        cost: [EnergyTypes.GRASS, EnergyTypes.GRASS],
        damage: 30,
        effect: { kind: 'healSelf', amount: 30 },
        description: '這隻寶可夢回復 30 點 HP。'
      },
      {
        name: '日光束',
        cost: [EnergyTypes.GRASS, EnergyTypes.GRASS, EnergyTypes.GRASS],
        damage: 80
      }
    ]
  },

  // ---- 能量卡 ------------------------------------------------------------
  'e-fire':     { id: 'e-fire',     type: CardTypes.ENERGY, name: '火能量',   energyType: EnergyTypes.FIRE },
  'e-water':    { id: 'e-water',    type: CardTypes.ENERGY, name: '水能量',   energyType: EnergyTypes.WATER },
  'e-grass':    { id: 'e-grass',    type: CardTypes.ENERGY, name: '草能量',   energyType: EnergyTypes.GRASS },
  'e-electric': { id: 'e-electric', type: CardTypes.ENERGY, name: '雷能量',   energyType: EnergyTypes.ELECTRIC },
  'e-psychic':  { id: 'e-psychic',  type: CardTypes.ENERGY, name: '超能能量', energyType: EnergyTypes.PSYCHIC },
  'e-fighting': { id: 'e-fighting', type: CardTypes.ENERGY, name: '格鬥能量', energyType: EnergyTypes.FIGHTING },
  'e-normal':   { id: 'e-normal',   type: CardTypes.ENERGY, name: '無色能量', energyType: EnergyTypes.NORMAL },
  'e-dce': {
    id: 'e-dce',
    type: CardTypes.ENERGY,
    name: '雙倍無色能量',
    energyType: EnergyTypes.NORMAL,
    provides: 2, // 一張卡提供 2 個無色能量單位（只能抵無色費用與撤退費）
    description: '提供 2 個無色能量。不能作為屬性能量使用。'
  },

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
  'i-charger': {
    id: 'i-charger',
    type: CardTypes.ITEM,
    name: '充電器',
    effect: { kind: 'attachFromDiscard' },
    description: '從棄牌區選 1 張能量卡，附加到你場上的 1 隻寶可夢身上（優先同屬性；不受每回合 1 次填附限制）。'
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
  't-bill': {
    id: 't-bill',
    type: CardTypes.TRAINER,
    name: '比爾',
    effect: { kind: 'draw', count: 2 },
    description: '抽 2 張卡。'
  },
  't-cynthia': {
    id: 't-cynthia',
    type: CardTypes.TRAINER,
    name: '希羅娜',
    effect: { kind: 'shuffleDraw', count: 6 },
    description: '將手牌全部洗回牌庫，然後抽 6 張卡。'
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
