import React, { useState, useEffect } from 'react';
import { createInitialGameState } from '../models/gameState';
import { CardTypes } from '../models/cards';
import Board from './Board';
import Hand from './Hand';

const GameArena = () => {
  const [gameState, setGameState] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  
  useEffect(() => {
    const initialState = createInitialGameState();
    for(let i=0; i<7; i++) {
      initialState.players.player1.hand.push(initialState.players.player1.deck.pop());
      initialState.players.player2.hand.push(initialState.players.player2.deck.pop());
    }
    setGameState(initialState);
  }, []);

  if (!gameState) return <div style={{ color: 'white', padding: '2rem' }}>載入遊戲中...</div>;

  const currentPlayerId = gameState.currentPlayer;
  const currentPlayer = gameState.players[currentPlayerId];
  const opponentId = currentPlayerId === 'player1' ? 'player2' : 'player1';
  const opponent = gameState.players[opponentId];

  const endTurn = () => {
    setGameState(prev => {
      const newState = structuredClone(prev);
      const nextPlayerId = newState.currentPlayer === 'player1' ? 'player2' : 'player1';
      newState.currentPlayer = nextPlayerId;
      newState.hasAttachedEnergyThisTurn = false;
      newState.hasAttackedThisTurn = false;
      
      const nextPlayer = newState.players[nextPlayerId];
      if (nextPlayer.deck.length > 0) {
        nextPlayer.hand.push(nextPlayer.deck.pop());
      }
      return newState;
    });
    setSelectedCard(null);
  };

  const handleHandCardClick = (card) => {
    if (selectedCard?.instanceId === card.instanceId) {
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  };

  const handleDragStart = (e, card) => {
    setSelectedCard(card);
    e.dataTransfer.setData('cardId', card.instanceId);
  };

  const placeCardInActive = (targetCard) => {
    if (targetCard.type === CardTypes.POKEMON) {
      if (!currentPlayer.activePokemon) {
        setGameState(prev => {
          const newState = structuredClone(prev);
          const p = newState.players[currentPlayerId];
          p.activePokemon = targetCard;
          p.hand = p.hand.filter(c => c.instanceId !== targetCard.instanceId);
          return newState;
        });
        setSelectedCard(null);
      }
    } else if (targetCard.type === CardTypes.ENERGY) {
      if (currentPlayer.activePokemon && !gameState.hasAttachedEnergyThisTurn) {
        setGameState(prev => {
          const newState = structuredClone(prev);
          const p = newState.players[currentPlayerId];
          p.activePokemon.attachedEnergy = [...(p.activePokemon.attachedEnergy || []), targetCard];
          p.hand = p.hand.filter(c => c.instanceId !== targetCard.instanceId);
          newState.hasAttachedEnergyThisTurn = true;
          return newState;
        });
        setSelectedCard(null);
      } else if (gameState.hasAttachedEnergyThisTurn) {
        alert('這回合已經填附過能量了！');
      }
    }
  };

  const placeCardInBench = (targetCard, existingPokemon, index) => {
    if (targetCard.type === CardTypes.POKEMON) {
      if (!existingPokemon && currentPlayer.bench.length < 3) {
        setGameState(prev => {
          const newState = structuredClone(prev);
          const p = newState.players[currentPlayerId];
          p.bench.push(targetCard);
          p.hand = p.hand.filter(c => c.instanceId !== targetCard.instanceId);
          return newState;
        });
        setSelectedCard(null);
      }
    } else if (targetCard.type === CardTypes.ENERGY && existingPokemon) {
      if (!gameState.hasAttachedEnergyThisTurn) {
        setGameState(prev => {
          const newState = structuredClone(prev);
          const p = newState.players[currentPlayerId];
          const target = p.bench.find(c => c.instanceId === existingPokemon.instanceId);
          if (target) {
            target.attachedEnergy = [...(target.attachedEnergy || []), targetCard];
            p.hand = p.hand.filter(c => c.instanceId !== targetCard.instanceId);
            newState.hasAttachedEnergyThisTurn = true;
          }
          return newState;
        });
        setSelectedCard(null);
      } else {
        alert('這回合已經填附過能量了！');
      }
    }
  };

  const handleMyActiveClick = () => {
    if (!selectedCard) return;
    placeCardInActive(selectedCard);
  };

  const handleMyBenchClick = (existingPokemon, index) => {
    if (!selectedCard) return;
    placeCardInBench(selectedCard, existingPokemon, index);
  };

  const handleDropActive = (e) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    const targetCard = currentPlayer.hand.find(c => c.instanceId === cardId);
    if (targetCard) placeCardInActive(targetCard);
  };

  const handleDropBench = (e, existingPokemon, index) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    const targetCard = currentPlayer.hand.find(c => c.instanceId === cardId);
    if (targetCard) placeCardInBench(targetCard, existingPokemon, index);
  };

  const handleAttackClick = () => {
    if (gameState.hasAttackedThisTurn) {
      alert('這回合已經攻擊過了！'); return;
    }
    if (!currentPlayer.activePokemon) {
      alert('你的戰鬥區沒有寶可夢！'); return;
    }
    if (!opponent.activePokemon) {
      alert('對手戰鬥區沒有寶可夢，請先結束回合讓對手派出寶可夢！'); return;
    }

    const attacker = currentPlayer.activePokemon;
    const energyCount = attacker.attachedEnergy ? attacker.attachedEnergy.length : 0;
    
    if (energyCount < attacker.attack.cost.length) {
      alert(`能量不足無法攻擊！需要 ${attacker.attack.cost.length} 個能量。`);
      return;
    }

    setGameState(prev => {
      const newState = structuredClone(prev);
      const opp = newState.players[opponentId];
      const damage = attacker.attack.damage;
      
      opp.activePokemon.currentHp -= damage;
      
      if (opp.activePokemon.currentHp <= 0) {
        opp.activePokemon = null; 
        newState.players[currentPlayerId].prizes -= 1;
        
        if (newState.players[currentPlayerId].prizes <= 0) {
          newState.winner = currentPlayerId;
        } else {
          alert(`成功擊倒對手！拿取一張獎賞卡。剩餘獎賞卡：${newState.players[currentPlayerId].prizes}`);
        }
      } else {
        alert(`造成了 ${damage} 點傷害！`);
      }
      
      newState.hasAttackedThisTurn = true;
      return newState;
    });
  };

  if (gameState.winner) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--color-primary)' }}>
          {gameState.winner === 'player1' ? '玩家 1' : '玩家 2'} 獲勝！
        </h1>
        <button onClick={() => window.location.reload()} style={{ marginTop: '2rem', padding: '1rem 2rem', fontSize: '1.2rem' }}>
          再來一局
        </button>
      </div>
    );
  }

  const isPlayer1Turn = currentPlayerId === 'player1';
  const topPlayer = isPlayer1Turn ? gameState.players.player2 : gameState.players.player1;
  const bottomPlayer = isPlayer1Turn ? gameState.players.player1 : gameState.players.player2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: '40px' }}>
      <div style={{ transform: 'rotate(180deg)' }}>
         <Hand hand={topPlayer.hand} isCurrentPlayer={false} />
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <Board 
          activePokemon={topPlayer.activePokemon} 
          bench={topPlayer.bench} 
          isTopPlayer={true} 
        />
        
        <div className="glass-panel" style={{ 
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          display: 'flex', gap: '20px', padding: '10px 20px', alignItems: 'center', zIndex: 10
        }}>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>剩餘獎賞卡</span>
            <div style={{ color: 'var(--color-danger)', fontWeight: 'bold', fontSize: '1.2rem' }}>
              對手: {topPlayer.prizes} | 你: {bottomPlayer.prizes}
            </div>
          </div>
          
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '20px' }}>
            <button 
              onClick={handleAttackClick} 
              disabled={gameState.hasAttackedThisTurn}
              style={{ 
                background: gameState.hasAttackedThisTurn ? 'var(--color-bg-panel)' : 'var(--color-danger)', 
                marginRight: '10px' 
              }}
            >
              發動攻擊
            </button>
            <button onClick={endTurn}>結束回合 ({isPlayer1Turn ? '玩家1' : '玩家2'})</button>
          </div>
        </div>

        <Board 
          activePokemon={bottomPlayer.activePokemon} 
          bench={bottomPlayer.bench} 
          isTopPlayer={false}
          onActiveClick={handleMyActiveClick}
          onBenchClick={handleMyBenchClick}
          onDropActive={handleDropActive}
          onDropBench={handleDropBench}
        />
      </div>

      <div style={{ position: 'relative' }}>
        {selectedCard && (
          <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', 
                        background: 'rgba(59, 130, 246, 0.8)', padding: '5px 15px', borderRadius: '20px', 
                        fontSize: '0.9rem', pointerEvents: 'none', zIndex: 20 }}>
            選中了：{selectedCard.name} (請點擊戰鬥區或備戰區放置)
          </div>
        )}
        <Hand 
          hand={bottomPlayer.hand} 
          isCurrentPlayer={true} 
          onCardClick={handleHandCardClick} 
          onDragStart={handleDragStart}
        />
      </div>
    </div>
  );
};

export default GameArena;
