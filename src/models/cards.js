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
    image: '/images/charmander.png',
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
    image: '/images/squirtle.png',
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
    image: '/images/bulbasaur.png',
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
    image: '/images/pikachu.png',
    attack: {
      name: '電擊',
      cost: [EnergyTypes.ELECTRIC],
      damage: 20
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
  
  // 隨機放入 10 張寶可夢，10 張能量
  for (let i = 0; i < 10; i++) {
    const randomPokemon = pokemonIds[Math.floor(Math.random() * pokemonIds.length)];
    deck.push({ ...cardDatabase[randomPokemon], instanceId: `deck-p-${i}-${Date.now()}`, attachedEnergy: [], currentHp: cardDatabase[randomPokemon].hp });
  }
  for (let i = 0; i < 10; i++) {
    const randomEnergy = energyIds[Math.floor(Math.random() * energyIds.length)];
    deck.push({ ...cardDatabase[randomEnergy], instanceId: `deck-e-${i}-${Date.now()}` });
  }
  
  // 洗牌
  return deck.sort(() => Math.random() - 0.5);
};
