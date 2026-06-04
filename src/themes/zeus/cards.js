import { CardTypes, EnergyTypes } from '../../models/cardTypes';

export const cardDatabase = {
  // === Zeus Line ===
  'z-001': {
    id: 'z-001',
    type: CardTypes.POKEMON,
    name: '小電雲',
    hp: 50,
    maxHp: 50,
    energyType: EnergyTypes.ELECTRIC,
    image: '/images/zeus/spark.png',
    attack: { name: '靜電', cost: [EnergyTypes.ELECTRIC], damage: 20 }
  },
  'z-001-ev1': {
    id: 'z-001-ev1',
    type: CardTypes.POKEMON,
    name: '閃電使者',
    hp: 80,
    maxHp: 80,
    energyType: EnergyTypes.ELECTRIC,
    evolvesFrom: 'z-001',
    stage: 1,
    image: '/images/zeus/herald.png',
    attack: { name: '落雷', cost: [EnergyTypes.ELECTRIC, EnergyTypes.ELECTRIC], damage: 50 }
  },
  'z-001-ev2': {
    id: 'z-001-ev2',
    type: CardTypes.POKEMON,
    name: '宙斯',
    hp: 150,
    maxHp: 150,
    energyType: EnergyTypes.ELECTRIC,
    evolvesFrom: 'z-001-ev1',
    stage: 2,
    image: '/images/zeus/zeus.png',
    attack: { name: '萬鈞神雷', cost: [EnergyTypes.ELECTRIC, EnergyTypes.ELECTRIC, EnergyTypes.ELECTRIC, EnergyTypes.ELECTRIC], damage: 120 }
  },

  // === Poseidon Line ===
  'z-002': {
    id: 'z-002',
    type: CardTypes.POKEMON,
    name: '水精靈',
    hp: 60,
    maxHp: 60,
    energyType: EnergyTypes.WATER,
    image: '/images/zeus/nymph.png',
    attack: { name: '水流', cost: [EnergyTypes.WATER], damage: 20 }
  },
  'z-002-ev1': {
    id: 'z-002-ev1',
    type: CardTypes.POKEMON,
    name: '海潮守衛',
    hp: 90,
    maxHp: 90,
    energyType: EnergyTypes.WATER,
    evolvesFrom: 'z-002',
    stage: 1,
    image: '/images/zeus/guard.png',
    attack: { name: '巨浪', cost: [EnergyTypes.WATER, EnergyTypes.WATER], damage: 40 }
  },
  'z-002-ev2': {
    id: 'z-002-ev2',
    type: CardTypes.POKEMON,
    name: '波賽頓',
    hp: 160,
    maxHp: 160,
    energyType: EnergyTypes.WATER,
    evolvesFrom: 'z-002-ev1',
    stage: 2,
    image: '/images/zeus/poseidon.png',
    attack: { name: '海神三叉戟', cost: [EnergyTypes.WATER, EnergyTypes.WATER, EnergyTypes.WATER], damage: 90 }
  },

  // === Hades Line ===
  'z-003': {
    id: 'z-003',
    type: CardTypes.POKEMON,
    name: '冥火',
    hp: 50,
    maxHp: 50,
    energyType: EnergyTypes.PSYCHIC,
    image: '/images/zeus/wisp.png',
    attack: { name: '幽影', cost: [EnergyTypes.PSYCHIC], damage: 20 }
  },
  'z-003-ev1': {
    id: 'z-003-ev1',
    type: CardTypes.POKEMON,
    name: '地獄犬',
    hp: 80,
    maxHp: 80,
    energyType: EnergyTypes.PSYCHIC,
    evolvesFrom: 'z-003',
    stage: 1,
    image: '/images/zeus/cerberus.png',
    attack: { name: '撕咬', cost: [EnergyTypes.PSYCHIC, EnergyTypes.NORMAL], damage: 40 }
  },
  'z-003-ev2': {
    id: 'z-003-ev2',
    type: CardTypes.POKEMON,
    name: '黑帝斯',
    hp: 140,
    maxHp: 140,
    energyType: EnergyTypes.PSYCHIC,
    evolvesFrom: 'z-003-ev1',
    stage: 2,
    image: '/images/zeus/hades.png',
    attack: { name: '靈魂收割', cost: [EnergyTypes.PSYCHIC, EnergyTypes.PSYCHIC, EnergyTypes.PSYCHIC], damage: 100 }
  },

  // === Energies ===
  'e-electric': { id: 'e-electric', type: CardTypes.ENERGY, name: '雷霆能量', energyType: EnergyTypes.ELECTRIC },
  'e-water':    { id: 'e-water', type: CardTypes.ENERGY, name: '深海能量', energyType: EnergyTypes.WATER },
  'e-psychic':  { id: 'e-psychic', type: CardTypes.ENERGY, name: '冥界能量', energyType: EnergyTypes.PSYCHIC },

  // === Trainers / Items ===
  't-athena': {
    id: 't-athena',
    type: CardTypes.TRAINER,
    name: '雅典娜的庇護',
    image: '/images/zeus/athena.png',
    heal: 30,
    effect: { kind: 'heal' },
    description: '智慧女神的祝福，回復戰鬥區神祇 30 點 HP。'
  },
  'i-chariot': {
    id: 'i-chariot',
    type: CardTypes.ITEM,
    name: '神使戰車',
    image: '/images/zeus/chariot.png',
    effect: { kind: 'switch' },
    description: '赫密士的戰車，可以將己方戰鬥區的神祇與備戰區的神祇互換。'
  }
};
