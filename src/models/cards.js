// 簡化的卡牌資料庫
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
  NORMAL: 'normal'
};

export const cardDatabase = {
  'p-001': {
    id: 'p-001',
    type: CardTypes.POKEMON,
    name: '小火龍',
    hp: 60,
    maxHp: 60,
    energyType: EnergyTypes.FIRE,
    image: './images/charmander.png',
    attack: {
      name: '火花',
      cost: [EnergyTypes.FIRE],
      damage: 20
    }
  },
  'p-002': {
    id: 'p-002',
    type: CardTypes.POKEMON,
    name: '傑尼龜',
    hp: 60,
    maxHp: 60,
    energyType: EnergyTypes.WATER,
    image: './images/squirtle.png',
    attack: {
      name: '水槍',
      cost: [EnergyTypes.WATER],
      damage: 20
    }
  },
  'p-003': {
    id: 'p-003',
    type: CardTypes.POKEMON,
    name: '妙蛙種子',
    hp: 70,
    maxHp: 70,
    energyType: EnergyTypes.GRASS,
    image: './images/bulbasaur.png',
    attack: {
      name: '藤鞭',
      cost: [EnergyTypes.GRASS],
      damage: 20
    }
  },
  'p-004': {
    id: 'p-004',
    type: CardTypes.POKEMON,
    name: '皮卡丘',
    hp: 60,
    maxHp: 60,
    energyType: EnergyTypes.ELECTRIC,
    image: './images/pikachu.png',
    attack: {
      name: '電擊',
      cost: [EnergyTypes.ELECTRIC],
      damage: 20
    }
  },
  // 一階進化寶可夢
  'p-001-ev1': {
    id: 'p-001-ev1',
    type: CardTypes.POKEMON,
    name: '火恐龍',
    hp: 90,
    maxHp: 90,
    energyType: EnergyTypes.FIRE,
    evolvesFrom: '小火龍',
    stage: 1,
    image: './images/charmeleon.png',
    attack: {
      name: '火焰放射',
      cost: [EnergyTypes.FIRE, EnergyTypes.FIRE],
      damage: 50
    }
  },
  'p-002-ev1': {
    id: 'p-002-ev1',
    type: CardTypes.POKEMON,
    name: '卡咪龜',
    hp: 90,
    maxHp: 90,
    energyType: EnergyTypes.WATER,
    evolvesFrom: '傑尼龜',
    stage: 1,
    image: './images/wartortle.png',
    attack: {
      name: '水砲',
      cost: [EnergyTypes.WATER, EnergyTypes.WATER],
      damage: 50
    }
  },
  'p-003-ev1': {
    id: 'p-003-ev1',
    type: CardTypes.POKEMON,
    name: '妙蛙草',
    hp: 100,
    maxHp: 100,
    energyType: EnergyTypes.GRASS,
    evolvesFrom: '妙蛙種子',
    stage: 1,
    image: './images/ivysaur.png',
    attack: {
      name: '飛葉快刀',
      cost: [EnergyTypes.GRASS, EnergyTypes.GRASS],
      damage: 50
    }
  },
  'p-004-ev1': {
    id: 'p-004-ev1',
    type: CardTypes.POKEMON,
    name: '雷丘',
    hp: 90,
    maxHp: 90,
    energyType: EnergyTypes.ELECTRIC,
    evolvesFrom: '皮卡丘',
    stage: 1,
    image: './images/raichu.png',
    attack: {
      name: '十萬伏特',
      cost: [EnergyTypes.ELECTRIC, EnergyTypes.ELECTRIC],
      damage: 60
    }
  },
  'e-fire': {
    id: 'e-fire',
    type: CardTypes.ENERGY,
    name: '火能量',
    energyType: EnergyTypes.FIRE
  },
  'e-water': {
    id: 'e-water',
    type: CardTypes.ENERGY,
    name: '水能量',
    energyType: EnergyTypes.WATER
  },
  'e-grass': {
    id: 'e-grass',
    type: CardTypes.ENERGY,
    name: '草能量',
    energyType: EnergyTypes.GRASS
  },
  'e-electric': {
    id: 'e-electric',
    type: CardTypes.ENERGY,
    name: '雷能量',
    energyType: EnergyTypes.ELECTRIC
  },
  't-potion': {
    id: 't-potion',
    type: CardTypes.ITEM,
    name: '傷藥',
    heal: 20,
    description: '回復一隻寶可夢 20 點 HP。'
  },
  't-pokeball': {
    id: 't-pokeball',
    type: CardTypes.ITEM,
    name: '精靈球',
    description: '從牌庫尋找一張寶可夢卡加入手牌，然後洗牌。'
  },
  'i-hyperpotion': {
    id: 'i-hyperpotion',
    type: CardTypes.ITEM,
    name: '高級傷藥',
    heal: 50,
    description: '回復一隻寶可夢 50 點 HP。'
  },
  'i-switch': {
    id: 'i-switch',
    type: CardTypes.ITEM,
    name: '寶可夢交換器',
    description: '將戰鬥區的寶可夢與一隻備戰區的寶可夢互換。'
  },
  'i-energy-retrieval': {
    id: 'i-energy-retrieval',
    type: CardTypes.ITEM,
    name: '能量回收',
    description: '從棄牌區拿回最多 2 張能量卡加入手牌。'
  },
  'i-greatball': {
    id: 'i-greatball',
    type: CardTypes.ITEM,
    name: '超級球',
    description: '查看牌庫頂的 7 張卡，從中挑選 1 張寶可夢加入手牌，然後洗牌。'
  },
  't-prof': {
    id: 't-prof',
    type: CardTypes.TRAINER,
    name: '大木博士',
    description: '捨棄你的所有手牌，然後從牌庫抽出 7 張卡。'
  }
};

// 產生特定主題的純色牌組 (20張)
export const generateThemeDeck = (theme) => {
  const deck = [];
  
  const themeMap = {
    'fire': { basic: 'p-001', ev1: 'p-001-ev1', energy: 'e-fire' },
    'water': { basic: 'p-002', ev1: 'p-002-ev1', energy: 'e-water' },
    'grass': { basic: 'p-003', ev1: 'p-003-ev1', energy: 'e-grass' },
    'electric': { basic: 'p-004', ev1: 'p-004-ev1', energy: 'e-electric' }
  };

  const selectedTheme = themeMap[theme] || themeMap['fire']; // 預設火

  // 7 張基礎寶可夢
  for (let i = 0; i < 7; i++) {
    deck.push({ 
      ...cardDatabase[selectedTheme.basic], 
      instanceId: `deck-p-${i}-${Date.now()}`, 
      attachedEnergy: [], 
      currentHp: cardDatabase[selectedTheme.basic].hp 
    });
  }
  
  // 4 張一階進化寶可夢
  for (let i = 0; i < 4; i++) {
    deck.push({ 
      ...cardDatabase[selectedTheme.ev1], 
      instanceId: `deck-pev-${i}-${Date.now()}`, 
      attachedEnergy: [], 
      currentHp: cardDatabase[selectedTheme.ev1].hp 
    });
  }
  
  // 5 張屬性對應能量
  for (let i = 0; i < 5; i++) {
    deck.push({
      ...cardDatabase[selectedTheme.energy],
      instanceId: `deck-e-${i}-${Date.now()}`
    });
  }

  // 7 張物品 / 支援者卡
  deck.push({ ...cardDatabase['t-potion'], instanceId: `deck-t-pot-${Date.now()}` });
  deck.push({ ...cardDatabase['i-hyperpotion'], instanceId: `deck-i-hpot-${Date.now()}` });
  deck.push({ ...cardDatabase['t-pokeball'], instanceId: `deck-t-ball-${Date.now()}` });
  deck.push({ ...cardDatabase['i-greatball'], instanceId: `deck-i-gball-${Date.now()}` });
  deck.push({ ...cardDatabase['i-switch'], instanceId: `deck-i-switch-${Date.now()}` });
  deck.push({ ...cardDatabase['i-energy-retrieval'], instanceId: `deck-i-eret-${Date.now()}` });
  deck.push({ ...cardDatabase['t-prof'], instanceId: `deck-t-prof-${Date.now()}` });

  // 洗牌
  return deck.sort(() => Math.random() - 0.5);
};
