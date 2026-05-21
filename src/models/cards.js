// 簡化的卡牌資料庫
export const CardTypes = {
  POKEMON: 'pokemon',
  ENERGY: 'energy'
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
    image: '', 
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
    image: '', 
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
    image: '', 
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
    image: '', 
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
  }
};

// 產生一副隨機的測試牌組
export const generateStarterDeck = () => {
  const deck = [];
  const pokemonIds = ['p-001', 'p-002', 'p-003', 'p-004'];
  const energyIds = ['e-fire', 'e-water', 'e-grass', 'e-electric'];
  
  // 隨機放入 8 張基礎寶可夢，4張進化寶可夢，8 張能量
  for (let i = 0; i < 8; i++) {
    const randomPokemon = pokemonIds[Math.floor(Math.random() * pokemonIds.length)];
    deck.push({ ...cardDatabase[randomPokemon], instanceId: `deck-p-${i}-${Date.now()}`, attachedEnergy: [], currentHp: cardDatabase[randomPokemon].hp });
  }
  
  const evIds = ['p-001-ev1', 'p-002-ev1', 'p-003-ev1', 'p-004-ev1'];
  for (let i = 0; i < 4; i++) {
    const randomEv = evIds[Math.floor(Math.random() * evIds.length)];
    deck.push({ ...cardDatabase[randomEv], instanceId: `deck-pev-${i}-${Date.now()}`, attachedEnergy: [], currentHp: cardDatabase[randomEv].hp });
  }
  
  for (let i = 0; i < 8; i++) {
    const randomEnergy = energyIds[Math.floor(Math.random() * energyIds.length)];
    deck.push({ ...cardDatabase[randomEnergy], instanceId: `deck-e-${i}-${Date.now()}` });
  }
  
  // 洗牌
  return deck.sort(() => Math.random() - 0.5);
};
