import React, { useState, useEffect } from 'react';
import { createInitialGameState } from '../models/gameState';
import { CardTypes } from '../models/cards';
import Board from './Board';
import Hand from './Hand';

const GameArena = () => {
  const [gameState, setGameState] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [damageAnim, setDamageAnim] = useState(null); // { target: 'top' | 'bottom', damage: number }
  const [toast, setToast] = useState({ id: 0, message: '' });
  const [showSettings, setShowSettings] = useState(false);
  const [showLog, setShowLog] = useState(false);

  const showToast = (message) => {
    setToast({ id: Date.now(), message });
  };

  const pushLog = (state, playerId, actionStr) => {
    if (!state.logs) state.logs = [];
    state.logs.push({ player: playerId, action: actionStr, time: Date.now() });
  };
  
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
      pushLog(newState, prev.currentPlayer, '結束了回合');
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
          pushLog(newState, currentPlayerId, `將 ${targetCard.name} 放置於戰鬥區`);
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
          pushLog(newState, currentPlayerId, `為戰鬥區的 ${p.activePokemon.name} 填附了 ${targetCard.name}`);
          return newState;
        });
        setSelectedCard(null);
      } else if (gameState.hasAttachedEnergyThisTurn) {
        showToast('這回合已經填附過能量了！');
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
          pushLog(newState, currentPlayerId, `將 ${targetCard.name} 放置於備戰區`);
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
            pushLog(newState, currentPlayerId, `為備戰區的 ${target.name} 填附了 ${targetCard.name}`);
          }
          return newState;
        });
        setSelectedCard(null);
      } else {
        showToast('這回合已經填附過能量了！');
      }
    }
  };

  const handleMyActiveClick = () => {
    if (!selectedCard) return;
    placeCardInActive(selectedCard);
  };

  const handleMyBenchClick = (existingPokemon, index) => {
    if (!currentPlayer.activePokemon && existingPokemon) {
      setGameState(prev => {
        const newState = structuredClone(prev);
        const p = newState.players[currentPlayerId];
        p.activePokemon = p.bench[index];
        p.bench.splice(index, 1);
        pushLog(newState, currentPlayerId, `將備戰區的 ${p.activePokemon.name} 推上戰鬥區`);
        return newState;
      });
      return;
    }

    if (!selectedCard) return;
    placeCardInBench(selectedCard, existingPokemon, index);
  };

  const handleDragStartBench = (e, index) => {
    e.dataTransfer.setData('sourceBenchIndex', index.toString());
  };

  const handleDropActive = (e) => {
    e.preventDefault();
    const sourceBenchIndex = e.dataTransfer.getData('sourceBenchIndex');
    
    if (sourceBenchIndex !== '') {
      const idx = parseInt(sourceBenchIndex, 10);
      if (!currentPlayer.activePokemon) {
        setGameState(prev => {
          const newState = structuredClone(prev);
          const p = newState.players[currentPlayerId];
          p.activePokemon = p.bench[idx];
          p.bench.splice(idx, 1);
          pushLog(newState, currentPlayerId, `將備戰區的 ${p.activePokemon.name} 推上戰鬥區`);
          return newState;
        });
      }
      return;
    }

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
      showToast('這回合已經攻擊過了！'); return;
    }
    if (!currentPlayer.activePokemon) {
      showToast('你的戰鬥區沒有寶可夢！'); return;
    }
    if (!opponent.activePokemon) {
      showToast('對手戰鬥區沒有寶可夢，請先結束回合讓對手派出寶可夢！'); return;
    }

    const attacker = currentPlayer.activePokemon;
    const energyCount = attacker.attachedEnergy ? attacker.attachedEnergy.length : 0;
    
    if (energyCount < attacker.attack.cost.length) {
      showToast(`能量不足無法攻擊！需要 ${attacker.attack.cost.length} 個能量。`);
      return;
    }

    setGameState(prev => {
      const newState = structuredClone(prev);
      const opp = newState.players[opponentId];
      const damage = attacker.attack.damage;
      
      opp.activePokemon.currentHp -= damage;
      
      pushLog(newState, currentPlayerId, `使用 ${attacker.name} 發動攻擊，造成 ${damage} 點傷害`);
      
      setDamageAnim({ damage });
      setTimeout(() => setDamageAnim(null), 1000);
      
      if (opp.activePokemon.currentHp <= 0) {
        pushLog(newState, currentPlayerId, `擊倒了對手的 ${opp.activePokemon.name}！拿取一張獎賞卡。`);
        setTimeout(() => {
          setGameState(current => {
            const nextState = structuredClone(current);
            const targetOpp = nextState.players[opponentId];
            if (targetOpp.activePokemon && targetOpp.activePokemon.currentHp <= 0) {
               targetOpp.activePokemon = null; 
               nextState.players[currentPlayerId].prizes -= 1;
               if (nextState.players[currentPlayerId].prizes <= 0) {
                 nextState.winner = currentPlayerId;
               }
            }
            return nextState;
          });
        }, 1000);
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {toast.message && (
        <div key={toast.id} className="custom-toast show">
          {toast.message}
        </div>
      )}

      {/* HUD 頂部對手資訊 */}
      <div className="hud-panel hud-top-left">
        <div>
          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>對手</div>
          <div style={{ fontWeight: 'bold' }}>{isPlayer1Turn ? '玩家 2' : '玩家 1'}</div>
        </div>
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '15px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>剩餘獎賞卡</div>
          <div style={{ color: 'var(--color-danger)', fontWeight: 'bold', fontSize: '1.2rem' }}>{topPlayer.prizes}</div>
        </div>
      </div>

      {/* HUD 右上角設定與紀錄 */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '15px', zIndex: 50 }}>
        <div className="hud-panel" style={{ position: 'static', padding: '10px', cursor: 'pointer' }} onClick={() => setShowLog(true)}>
          <span style={{ fontSize: '1.5rem' }}>📜</span>
        </div>
        <div className="hud-panel" style={{ position: 'static', padding: '10px', cursor: 'pointer' }} onClick={() => setShowSettings(true)}>
          <span style={{ fontSize: '1.5rem' }}>⚙️</span>
        </div>
      </div>

      {/* HUD 底部玩家資訊 */}
      <div className="hud-panel hud-bottom-left" style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}>
        <div>
          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>你的回合</div>
          <div style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{isPlayer1Turn ? '玩家 1' : '玩家 2'}</div>
        </div>
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '15px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>剩餘獎賞卡</div>
          <div style={{ color: 'var(--color-danger)', fontWeight: 'bold', fontSize: '1.2rem' }}>{bottomPlayer.prizes}</div>
        </div>
      </div>

      {/* HUD 右下角動作區 */}
      <div className="hud-panel hud-bottom-right">
        <button 
          onClick={handleAttackClick} 
          disabled={gameState.hasAttackedThisTurn}
          style={{ 
            background: gameState.hasAttackedThisTurn ? 'var(--color-bg-panel)' : 'var(--color-danger)', 
            padding: '10px 20px', fontSize: '1.1rem'
          }}
        >
          發動攻擊
        </button>
        <button onClick={endTurn} style={{ padding: '10px 20px', fontSize: '1.1rem' }}>結束回合</button>
      </div>

      {/* 設定彈窗 */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>遊戲設定</h2>
            <button 
              onClick={() => window.location.reload()} 
              style={{ display: 'block', width: '100%', marginBottom: '15px', padding: '12px', background: 'var(--color-danger)', fontSize: '1.1rem' }}
            >
              重新開始遊戲
            </button>
            <button 
              onClick={() => setShowSettings(false)} 
              style={{ display: 'block', width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', fontSize: '1.1rem' }}
            >
              關閉
            </button>
          </div>
        </div>
      )}

      {/* 對戰紀錄抽屜 */}
      <div className={`log-drawer ${showLog ? 'open' : ''}`}>
        <div className="log-header">
          對戰紀錄
          <button onClick={() => setShowLog(false)} style={{ background: 'transparent', color: 'white', fontSize: '1.5rem', padding: '0 5px' }}>×</button>
        </div>
        <div className="log-content">
          {gameState.logs && gameState.logs.length > 0 ? (
            [...gameState.logs].reverse().map((log, idx) => {
              const time = new Date(log.time).toLocaleTimeString('zh-TW', { hour12: false });
              return (
                <div key={idx} className="log-entry">
                  <span className={log.player === 'player1' ? 'log-player1' : 'log-player2'}>
                    {log.player === 'player1' ? '玩家 1' : '玩家 2'}
                  </span>
                  {' '}{log.action}
                  <span className="log-time">{time}</span>
                </div>
              );
            })
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: '20px' }}>尚未有任何紀錄</div>
          )}
        </div>
      </div>

      <div className="hand-wrapper-top">
         <Hand hand={topPlayer.hand} isCurrentPlayer={false} />
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', justifyContent: 'center', padding: '100px 0' }}>
        <Board 
          activePokemon={topPlayer.activePokemon} 
          bench={topPlayer.bench} 
          isTopPlayer={true} 
          damageTaken={damageAnim ? damageAnim.damage : null}
        />

        <Board 
          activePokemon={bottomPlayer.activePokemon} 
          bench={bottomPlayer.bench} 
          isTopPlayer={false}
          onActiveClick={handleMyActiveClick}
          onBenchClick={handleMyBenchClick}
          onDropActive={handleDropActive}
          onDropBench={handleDropBench}
          onDragStartBench={handleDragStartBench}
        />
      </div>

      <div className={`hand-wrapper-bottom ${selectedCard ? 'hand-active' : ''}`}>
        {selectedCard && (
          <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', 
                        background: 'rgba(59, 130, 246, 0.9)', padding: '8px 20px', borderRadius: '20px', 
                        fontSize: '1rem', fontWeight: 'bold', pointerEvents: 'none', zIndex: 40,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.5)', whiteSpace: 'nowrap' }}>
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
