import React, { useState, useEffect } from 'react';
import { createInitialGameState } from '../models/gameState';
import { CardTypes } from '../models/cards';
import Board from './Board';
import Hand from './Hand';
import Card from './Card';
import { sfxPlace, sfxAttack, sfxDamage, sfxEndTurn, sfxVictory, sfxError, AudioSettings, startBGM, stopBGM } from '../utils/sounds';

const GameArena = ({ p1Theme, p2Theme, onReturnLobby }) => {
  const [gameState, setGameState] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [damageAnim, setDamageAnim] = useState(null); // { target: 'top' | 'bottom', damage: number }
  const [toast, setToast] = useState({ id: 0, message: '' });
  const [showSettings, setShowSettings] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [showTurnTransition, setShowTurnTransition] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [bgmMuted, setBgmMuted] = useState(true); // 預設未播放，等待玩家互動
  const [sfxMuted, setSfxMuted] = useState(false);
  const [showDeckSearch, setShowDeckSearch] = useState(false);
  const [cardToConsume, setCardToConsume] = useState(null);

  const toggleBGM = () => {
    if (bgmMuted) {
      startBGM();
      setBgmMuted(false);
    } else {
      stopBGM();
      setBgmMuted(true);
    }
  };

  const toggleSFX = () => {
    AudioSettings.sfxMuted = !sfxMuted;
    setSfxMuted(!sfxMuted);
  };

  const showToast = (message) => {
    setToast({ id: Date.now(), message });
  };

  const pushLog = (state, playerId, actionStr) => {
    if (!state.logs) state.logs = [];
    state.logs.push({ player: playerId, action: actionStr, time: Date.now() });
  };
  
  useEffect(() => {
    const initialState = createInitialGameState(p1Theme, p2Theme);
    for(let i=0; i<7; i++) {
      initialState.players.player1.hand.push(initialState.players.player1.deck.pop());
      initialState.players.player2.hand.push(initialState.players.player2.deck.pop());
    }
    setGameState(initialState);
  }, [p1Theme, p2Theme]);

  if (!gameState) return <div style={{ color: 'white', padding: '2rem' }}>載入遊戲中...</div>;

  const currentPlayerId = gameState.currentPlayer;
  const currentPlayer = gameState.players[currentPlayerId];
  const opponentId = currentPlayerId === 'player1' ? 'player2' : 'player1';
  const opponent = gameState.players[opponentId];

  const endTurn = () => {
    if (!currentPlayer.activePokemon && currentPlayer.bench.length > 0) {
      showToast('戰鬥區空缺，請先從備戰區推派一隻寶可夢上場！');
      sfxError();
      return;
    }

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
        pushLog(newState, 'system', `回合開始，${nextPlayer.name} 抽了一張牌`);
      } else {
        newState.winner = prev.currentPlayer;
        pushLog(newState, 'system', `${nextPlayer.name} 牌組耗盡，${newState.players[prev.currentPlayer].name} 獲得勝利！`);
        sfxVictory();
      }
      return newState;
    });
    setSelectedCard(null);
    setShowTurnTransition(true);
    sfxEndTurn();
  };

  const handleHandCardClick = (card) => {
    if (selectedCard?.instanceId === card.instanceId) {
      setSelectedCard(null);
    } else {
      setSelectedCard(card);
    }
  };

  const handleDragStart = (e, card) => {
    e.dataTransfer.setData('cardId', card.instanceId);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    // 延遲解除 is-dragging，讓瀏覽器有時間重新計算 :hover
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleDropBoard = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const cardId = e.dataTransfer.getData('cardId');
    if (!currentPlayer) return;
    const targetCard = currentPlayer.hand.find(c => c.instanceId === cardId);
    if (!targetCard || targetCard.type !== CardTypes.TRAINER) return;

    if (targetCard.id === 't-prof') {
      setGameState(prev => {
        const newState = structuredClone(prev);
        const p = newState.players[currentPlayerId];
        p.hand = []; // 清空手牌
        let drawn = 0;
        for (let i = 0; i < 7; i++) {
          if (p.deck.length > 0) {
            p.hand.push(p.deck.pop());
            drawn++;
          }
        }
        pushLog(newState, currentPlayerId, `使用了大木博士，捨棄手牌並抽取了 ${drawn} 張牌`);
        return newState;
      });
      setSelectedCard(null);
      sfxPlace();
    } else if (targetCard.id === 't-pokeball') {
      setCardToConsume(targetCard);
      setShowDeckSearch(true);
    }
  };

  const placeCardInActive = (targetCard) => {
    if (targetCard.type === CardTypes.POKEMON) {
      if (!currentPlayer.activePokemon && !targetCard.stage) {
        setGameState(prev => {
          const newState = structuredClone(prev);
          const p = newState.players[currentPlayerId];
          p.activePokemon = targetCard;
          p.hand = p.hand.filter(c => c.instanceId !== targetCard.instanceId);
          pushLog(newState, currentPlayerId, `將 ${targetCard.name} 放置於戰鬥區`);
          return newState;
        });
        setSelectedCard(null);
        sfxPlace();
      } else if (currentPlayer.activePokemon && targetCard.stage === 1 && currentPlayer.activePokemon.name === targetCard.evolvesFrom) {
        // 進化戰鬥區寶可夢
        setGameState(prev => {
          const newState = structuredClone(prev);
          const p = newState.players[currentPlayerId];
          const oldActive = p.activePokemon;
          // 計算傷害並繼承
          const damage = oldActive.maxHp - oldActive.currentHp;
          
          const newEvolvedCard = { ...targetCard };
          newEvolvedCard.attachedEnergy = oldActive.attachedEnergy || [];
          newEvolvedCard.currentHp = Math.max(10, newEvolvedCard.maxHp - damage); // 繼承傷害
          
          p.activePokemon = newEvolvedCard;
          p.hand = p.hand.filter(c => c.instanceId !== targetCard.instanceId);
          pushLog(newState, currentPlayerId, `將戰鬥區的 ${oldActive.name} 進化成 ${newEvolvedCard.name}！`);
          return newState;
        });
        setSelectedCard(null);
        sfxPlace();
      } else if (!currentPlayer.activePokemon && targetCard.stage === 1) {
        showToast('無法直接打出進化寶可夢！必須先打出基礎寶可夢。');
        sfxError();
      } else {
        showToast('無法進化！對象不符。');
        sfxError();
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
        sfxPlace();
      } else if (gameState.hasAttachedEnergyThisTurn) {
        showToast('這回合已經填附過能量了！');
        sfxError();
      }
    } else if (targetCard.type === CardTypes.TRAINER && targetCard.id === 't-potion') {
      if (currentPlayer.activePokemon) {
        if (currentPlayer.activePokemon.currentHp >= currentPlayer.activePokemon.maxHp) {
          showToast('寶可夢 HP 已滿，無法使用傷藥！');
          sfxError();
          return;
        }
        setGameState(prev => {
          const newState = structuredClone(prev);
          const p = newState.players[currentPlayerId];
          p.activePokemon.currentHp = Math.min(p.activePokemon.maxHp, p.activePokemon.currentHp + 20);
          p.hand = p.hand.filter(c => c.instanceId !== targetCard.instanceId);
          pushLog(newState, currentPlayerId, `對戰鬥區的 ${p.activePokemon.name} 使用了傷藥，回復 20 點 HP`);
          return newState;
        });
        setSelectedCard(null);
        sfxPlace();
      }
    }
  };

  const placeCardInBench = (targetCard, existingPokemon, index) => {
    if (targetCard.type === CardTypes.POKEMON) {
      if (!existingPokemon && currentPlayer.bench.length < 3 && !targetCard.stage) {
        setGameState(prev => {
          const newState = structuredClone(prev);
          const p = newState.players[currentPlayerId];
          p.bench.push(targetCard);
          p.hand = p.hand.filter(c => c.instanceId !== targetCard.instanceId);
          pushLog(newState, currentPlayerId, `將 ${targetCard.name} 放置於備戰區`);
          return newState;
        });
        setSelectedCard(null);
        sfxPlace();
      } else if (existingPokemon && targetCard.stage === 1 && existingPokemon.name === targetCard.evolvesFrom) {
        // 進化備戰區寶可夢
        setGameState(prev => {
          const newState = structuredClone(prev);
          const p = newState.players[currentPlayerId];
          const targetIdx = p.bench.findIndex(c => c.instanceId === existingPokemon.instanceId);
          if (targetIdx !== -1) {
            const oldBench = p.bench[targetIdx];
            const damage = oldBench.maxHp - oldBench.currentHp;
            
            const newEvolvedCard = { ...targetCard };
            newEvolvedCard.attachedEnergy = oldBench.attachedEnergy || [];
            newEvolvedCard.currentHp = Math.max(10, newEvolvedCard.maxHp - damage);
            
            p.bench[targetIdx] = newEvolvedCard;
            p.hand = p.hand.filter(c => c.instanceId !== targetCard.instanceId);
            pushLog(newState, currentPlayerId, `將備戰區的 ${oldBench.name} 進化成 ${newEvolvedCard.name}！`);
          }
          return newState;
        });
        setSelectedCard(null);
        sfxPlace();
      } else if (!existingPokemon && targetCard.stage === 1) {
        showToast('無法直接打出進化寶可夢！必須先打出基礎寶可夢。');
        sfxError();
      } else if (existingPokemon) {
        showToast('無法進化！對象不符。');
        sfxError();
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
        sfxPlace();
      } else {
        showToast('這回合已經填附過能量了！');
        sfxError();
      }
    } else if (targetCard.type === CardTypes.TRAINER && targetCard.id === 't-potion' && existingPokemon) {
      if (existingPokemon.currentHp >= existingPokemon.maxHp) {
        showToast('寶可夢 HP 已滿，無法使用傷藥！');
        sfxError();
        return;
      }
      setGameState(prev => {
        const newState = structuredClone(prev);
        const p = newState.players[currentPlayerId];
        const targetIdx = p.bench.findIndex(c => c.instanceId === existingPokemon.instanceId);
        if (targetIdx !== -1) {
          p.bench[targetIdx].currentHp = Math.min(p.bench[targetIdx].maxHp, p.bench[targetIdx].currentHp + 20);
          p.hand = p.hand.filter(c => c.instanceId !== targetCard.instanceId);
          pushLog(newState, currentPlayerId, `對備戰區的 ${p.bench[targetIdx].name} 使用了傷藥，回復 20 點 HP`);
        }
        return newState;
      });
      setSelectedCard(null);
      sfxPlace();
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
    setIsDragging(false);
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
    setIsDragging(false);
    const cardId = e.dataTransfer.getData('cardId');
    const targetCard = currentPlayer.hand.find(c => c.instanceId === cardId);
    if (targetCard) placeCardInBench(targetCard, existingPokemon, index);
  };

  const handleAttackClick = () => {
    if (gameState.hasAttackedThisTurn) {
      showToast('這回合已經攻擊過了！'); sfxError(); return;
    }
    if (!currentPlayer.activePokemon) {
      showToast('你的戰鬥區沒有寶可夢！'); sfxError(); return;
    }
    if (!opponent.activePokemon) {
      showToast('對手戰鬥區沒有寶可夢，請先結束回合讓對手派出寶可夢！'); sfxError(); return;
    }

    const attacker = currentPlayer.activePokemon;
    const energyCount = attacker.attachedEnergy ? attacker.attachedEnergy.length : 0;
    
    if (energyCount < attacker.attack.cost.length) {
      showToast(`能量不足無法攻擊！需要 ${attacker.attack.cost.length} 個能量。`);
      sfxError();
      return;
    }

    setGameState(prev => {
      const newState = structuredClone(prev);
      const opp = newState.players[opponentId];
      const damage = attacker.attack.damage;
      
      opp.activePokemon.currentHp -= damage;
      
      pushLog(newState, currentPlayerId, `使用 ${attacker.name} 發動攻擊，造成 ${damage} 點傷害`);
      
      sfxAttack();
      setDamageAnim({ damage });
      setTimeout(() => { setDamageAnim(null); sfxDamage(); }, 300);
      
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
                 sfxVictory();
               } else if (targetOpp.bench.length === 0) {
                 pushLog(nextState, 'system', `${targetOpp.name} 場上已無寶可夢可遞補，${nextState.players[currentPlayerId].name} 獲得勝利！`);
                 nextState.winner = currentPlayerId;
                 sfxVictory();
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
        <button onClick={onReturnLobby} style={{ marginTop: '2rem', padding: '1rem 2rem', fontSize: '1.2rem' }}>
          返回大廳
        </button>
      </div>
    );
  }

  const isPlayer1Turn = currentPlayerId === 'player1';
  const topPlayer = isPlayer1Turn ? gameState.players.player2 : gameState.players.player1;
  const bottomPlayer = isPlayer1Turn ? gameState.players.player1 : gameState.players.player2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {toast.message && (
        <div key={toast.id} className="custom-toast show">
          {toast.message}
        </div>
      )}

      {/* HUD 頂部對手資訊與設定 */}
      <div className="hud-panel hud-top-left" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>對手</div>
            <div style={{ fontWeight: 'bold' }}>{isPlayer1Turn ? '玩家 2' : '玩家 1'}</div>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '15px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>剩餘獎賞卡</div>
            <div style={{ color: 'var(--color-danger)', fontWeight: 'bold', fontSize: '1.2rem' }}>{topPlayer.prizes}</div>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '15px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>牌庫</div>
            <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>{topPlayer.deck.length}</div>
          </div>
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
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '15px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>牌庫</div>
          <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>{bottomPlayer.deck.length}</div>
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
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <button 
                onClick={toggleBGM} 
                style={{ flex: 1, marginRight: '5px', padding: '12px', background: bgmMuted ? 'rgba(255,255,255,0.1)' : 'var(--color-primary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {bgmMuted ? '🔇 音樂 (關)' : '🎵 音樂 (開)'}
              </button>
              <button 
                onClick={toggleSFX} 
                style={{ flex: 1, marginLeft: '5px', padding: '12px', background: sfxMuted ? 'rgba(255,255,255,0.1)' : 'var(--color-primary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {sfxMuted ? '🔈 音效 (關)' : '🔊 音效 (開)'}
              </button>
            </div>
            <button 
              onClick={onReturnLobby} 
              style={{ display: 'block', width: '100%', marginBottom: '15px', padding: '12px', background: 'var(--color-danger)', fontSize: '1.1rem' }}
            >
              返回大廳
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

      {showTurnTransition && !gameState.winner && (
        <div className="turn-transition-overlay" onClick={() => setShowTurnTransition(false)} style={{ cursor: 'pointer' }}>
          <h1 style={{ fontSize: '4rem', marginBottom: '20px', color: isPlayer1Turn ? '#60a5fa' : '#f87171' }}>
            換 {isPlayer1Turn ? '玩家 1' : '玩家 2'} 的回合了！
          </h1>
          <p style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.7)', animation: 'pulse 2s infinite' }}>
            (點擊畫面任意處繼續)
          </p>
        </div>
      )}

      {/* 對手手牌實體佔位 */}
      <div style={{ height: '40px', position: 'relative', zIndex: 30, flexShrink: 0 }}>
        <div className="hand-wrapper-top">
           <Hand hand={topPlayer.hand} isCurrentPlayer={false} />
        </div>
      </div>
      
      {/* 戰鬥區 (置中排版) */}
      <div 
        style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', justifyContent: 'center', padding: '10px 0', gap: '20px', overflowY: 'auto' }}
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={handleDropBoard}
      >
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

      {/* 玩家手牌實體佔位 */}
      <div style={{ height: '50px', position: 'relative', zIndex: 40, flexShrink: 0 }}>
        <div className={`hand-wrapper-bottom ${selectedCard && !isDragging ? 'hand-active' : ''} ${isDragging ? 'is-dragging' : ''}`}>
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
            onDragEnd={handleDragEnd}
          />
        </div>
      </div>

      {/* 牌庫檢索彈窗 (精靈球) */}
      {showDeckSearch && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '80%', maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '20px' }}>從牌庫選擇一張寶可夢</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
              {currentPlayer.deck.filter(c => c.type === CardTypes.POKEMON).map(card => (
                <div 
                  key={card.instanceId} 
                  onClick={() => {
                    setGameState(prev => {
                      const newState = structuredClone(prev);
                      const p = newState.players[currentPlayerId];
                      const idx = p.deck.findIndex(c => c.instanceId === card.instanceId);
                      if (idx !== -1) {
                        const [pulledCard] = p.deck.splice(idx, 1);
                        p.hand.push(pulledCard);
                        // 洗牌
                        p.deck.sort(() => Math.random() - 0.5);
                        // 移除精靈球卡
                        if (cardToConsume) {
                          p.hand = p.hand.filter(c => c.instanceId !== cardToConsume.instanceId);
                        }
                        pushLog(newState, currentPlayerId, `使用了精靈球，從牌庫抽出了 ${pulledCard.name}`);
                      }
                      return newState;
                    });
                    setShowDeckSearch(false);
                    setCardToConsume(null);
                    sfxPlace();
                  }}
                  style={{ cursor: 'pointer', transform: 'scale(0.8)', transformOrigin: 'top left', width: '120px', height: '168px' }}
                >
                  <Card card={card} />
                </div>
              ))}
              {currentPlayer.deck.filter(c => c.type === CardTypes.POKEMON).length === 0 && (
                <div style={{ padding: '2rem' }}>牌庫中已經沒有寶可夢卡了！</div>
              )}
            </div>
            <button 
              onClick={() => {
                setShowDeckSearch(false);
                setCardToConsume(null);
                // 取消時卡牌仍然消耗
                setGameState(prev => {
                  const newState = structuredClone(prev);
                  const p = newState.players[currentPlayerId];
                  if (cardToConsume) {
                    p.hand = p.hand.filter(c => c.instanceId !== cardToConsume.instanceId);
                  }
                  pushLog(newState, currentPlayerId, `使用了精靈球，但沒有選擇任何寶可夢`);
                  return newState;
                });
              }} 
              style={{ display: 'block', width: '100%', marginTop: '20px', padding: '12px', background: 'var(--color-danger)', fontSize: '1.1rem' }}
            >
              取消 / 關閉
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameArena;
