import { generateThemeDeck } from './cards';

export const createInitialGameState = (player1Theme = 'fire', player2Theme = 'water') => {
  return {
    turn: 1,
    currentPlayer: 'player1', // 'player1' or 'player2'
    winner: null,
    
    // 限制每回合的行動
    hasAttachedEnergyThisTurn: false,
    hasAttackedThisTurn: false,
    
    logs: [], // 對戰紀錄

    players: {
      player1: {
        id: 'player1',
        name: 'Player 1',
        deck: generateThemeDeck(player1Theme),
        hand: [],
        activePokemon: null,
        bench: [], // Max 3
        discardPile: [], // 棄牌區
        prizes: 3, // 取代真實卡牌的獎賞卡，這裡簡化為數字(剩餘需要擊敗的數量)
      },
      player2: {
        id: 'player2',
        name: 'Player 2',
        deck: generateThemeDeck(player2Theme),
        hand: [],
        activePokemon: null,
        bench: [], // Max 3
        discardPile: [], // 棄牌區
        prizes: 3,
      }
    }
  };
};
