import { useState, useEffect } from 'react';
import { createInitialGameState } from '../models/gameState';
import { CardTypes } from '../models/cards';
import {
  getOpponentId,
  playCardOnPokemon,
  promoteFromBench,
  playProfessor,
  pullPokemonFromDeck,
  cancelPokeball,
  canAttack,
  applyAttackDamage,
  resolveKnockout,
  endTurnState,
  drawForTurn,
} from '../game/rules';
import {
  sfxPlace,
  sfxAttack,
  sfxDamage,
  sfxEndTurn,
  sfxVictory,
  sfxError,
  AudioSettings,
  startBGM,
  stopBGM,
} from '../utils/sounds';

// 集中管理遊戲狀態、UI 狀態與所有副作用（state 更新 / 音效 / 動畫 / 提示）。
// 規則判定一律委派給 src/game/rules.js 的純函式。
export const useGameEngine = (p1Theme, p2Theme) => {
  const [gameState, setGameState] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [damageAnim, setDamageAnim] = useState(null);
  const [toast, setToast] = useState({ id: 0, message: '' });
  const [showTurnTransition, setShowTurnTransition] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [bgmMuted, setBgmMuted] = useState(true);
  const [sfxMuted, setSfxMuted] = useState(false);
  const [showDeckSearch, setShowDeckSearch] = useState(false);
  const [cardToConsume, setCardToConsume] = useState(null);
  const [attackAnim, setAttackAnim] = useState(null);
  const [drawnCardAnim, setDrawnCardAnim] = useState(null);
  const [faintAnim, setFaintAnim] = useState(null);

  useEffect(() => {
    const initialState = createInitialGameState(p1Theme, p2Theme);
    for (let i = 0; i < 7; i++) {
      initialState.players.player1.hand.push(initialState.players.player1.deck.pop());
      initialState.players.player2.hand.push(initialState.players.player2.deck.pop());
    }
    setGameState(initialState);
  }, [p1Theme, p2Theme]);

  const showToast = (message) => setToast({ id: Date.now(), message });

  // 套用一個規則層回傳的 { ok, state, error }：成功播音效，失敗時視情況提示
  const applyResult = (result) => {
    if (result.ok) {
      setGameState(result.state);
      setSelectedCard(null);
      sfxPlace();
    } else if (result.error) {
      showToast(result.error);
      sfxError();
    }
  };

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

  if (!gameState) {
    return { loading: true };
  }

  const currentPlayerId = gameState.currentPlayer;
  const currentPlayer = gameState.players[currentPlayerId];
  const opponentId = getOpponentId(currentPlayerId);
  const opponent = gameState.players[opponentId];

  // ---- 手牌互動 ----------------------------------------------------------
  const handleHandCardClick = (card) => {
    setSelectedCard((prev) => (prev?.instanceId === card.instanceId ? null : card));
  };

  const handleDragStart = (e, card) => {
    e.dataTransfer.setData('cardId', card.instanceId);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleDragStartBench = (e, index) => {
    e.dataTransfer.setData('sourceBenchIndex', index.toString());
  };

  // ---- 放置卡牌 ----------------------------------------------------------
  const playToLocation = (card, location) =>
    applyResult(playCardOnPokemon(gameState, currentPlayerId, card, location));

  const handleMyActiveClick = () => {
    if (!selectedCard) return;
    playToLocation(selectedCard, { zone: 'active' });
  };

  const handleMyBenchClick = (existingPokemon, index) => {
    // 戰鬥區空缺時，點擊備戰區寶可夢直接推派上場
    if (!currentPlayer.activePokemon && existingPokemon) {
      const result = promoteFromBench(gameState, currentPlayerId, index);
      if (result.ok) setGameState(result.state);
      return;
    }
    if (!selectedCard) return;
    playToLocation(selectedCard, { zone: 'bench', index });
  };

  const handleDropActive = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const sourceBenchIndex = e.dataTransfer.getData('sourceBenchIndex');
    if (sourceBenchIndex !== '') {
      const idx = parseInt(sourceBenchIndex, 10);
      const result = promoteFromBench(gameState, currentPlayerId, idx);
      if (result.ok) setGameState(result.state);
      return;
    }
    const cardId = e.dataTransfer.getData('cardId');
    const card = currentPlayer.hand.find((c) => c.instanceId === cardId);
    if (card) playToLocation(card, { zone: 'active' });
  };

  const handleDropBench = (e, existingPokemon, index) => {
    e.preventDefault();
    setIsDragging(false);
    const cardId = e.dataTransfer.getData('cardId');
    const card = currentPlayer.hand.find((c) => c.instanceId === cardId);
    if (card) playToLocation(card, { zone: 'bench', index });
  };

  // 拖到棋盤空白處：訓練家卡（大木博士 / 精靈球）
  const handleDropBoard = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const cardId = e.dataTransfer.getData('cardId');
    const card = currentPlayer.hand.find((c) => c.instanceId === cardId);
    if (!card || card.type !== CardTypes.TRAINER) return;

    if (card.id === 't-prof') {
      setGameState(playProfessor(gameState, currentPlayerId, card));
      setSelectedCard(null);
      sfxPlace();
    } else if (card.id === 't-pokeball') {
      setCardToConsume(card);
      setShowDeckSearch(true);
    }
  };

  // ---- 精靈球牌庫檢索 ----------------------------------------------------
  const handlePickFromDeck = (card) => {
    setGameState(pullPokemonFromDeck(gameState, currentPlayerId, card.instanceId, cardToConsume));
    setShowDeckSearch(false);
    setCardToConsume(null);
    sfxPlace();
  };

  const handleCancelDeckSearch = () => {
    setShowDeckSearch(false);
    setCardToConsume(null);
    setGameState(cancelPokeball(gameState, currentPlayerId, cardToConsume));
  };

  // ---- 回合流程 ----------------------------------------------------------
  const endTurn = () => {
    if (!currentPlayer.activePokemon && currentPlayer.bench.length > 0) {
      showToast('戰鬥區空缺，請先從備戰區推派一隻寶可夢上場！');
      sfxError();
      return;
    }
    setGameState(endTurnState(gameState));
    setSelectedCard(null);
    setShowTurnTransition(true);
    sfxEndTurn();
  };

  const handleTurnTransitionClick = () => {
    setShowTurnTransition(false);
    const { state, drawnCardId, deckOut } = drawForTurn(gameState);
    setGameState(state);
    if (deckOut) {
      sfxVictory();
    } else if (drawnCardId) {
      setDrawnCardAnim({ cardId: drawnCardId, playerId: state.currentPlayer });
      setTimeout(() => setDrawnCardAnim(null), 2200);
    }
  };

  // ---- 攻擊 --------------------------------------------------------------
  const handleAttackClick = () => {
    const check = canAttack(gameState, currentPlayerId);
    if (!check.ok) {
      showToast(check.error);
      sfxError();
      return;
    }

    sfxAttack();
    setAttackAnim({
      type: currentPlayer.activePokemon.energyType || 'fire',
      isPlayer1: currentPlayerId === 'player1',
    });

    setTimeout(() => {
      setAttackAnim(null);
      sfxDamage();

      const { state, damage, knockedOut, faintedPokemon } = applyAttackDamage(
        gameState,
        currentPlayerId
      );
      setGameState(state);
      setDamageAnim({ damage });
      setTimeout(() => setDamageAnim(null), 500);

      if (knockedOut) {
        setFaintAnim({ pokemon: faintedPokemon, isTopPlayer: true });
        setTimeout(() => {
          setFaintAnim(null);
          setGameState((current) => {
            const { state: resolved, winner } = resolveKnockout(
              current,
              currentPlayerId,
              faintedPokemon
            );
            if (winner) sfxVictory();
            return resolved;
          });
        }, 1000);
      }
    }, 400);
  };

  return {
    loading: false,
    gameState,
    currentPlayerId,
    currentPlayer,
    opponentId,
    opponent,
    // UI 狀態
    selectedCard,
    damageAnim,
    toast,
    showTurnTransition,
    isDragging,
    bgmMuted,
    sfxMuted,
    showDeckSearch,
    attackAnim,
    drawnCardAnim,
    faintAnim,
    // 動作
    toggleBGM,
    toggleSFX,
    handleHandCardClick,
    handleDragStart,
    handleDragEnd,
    handleDragStartBench,
    handleMyActiveClick,
    handleMyBenchClick,
    handleDropActive,
    handleDropBench,
    handleDropBoard,
    handlePickFromDeck,
    handleCancelDeckSearch,
    endTurn,
    handleTurnTransitionClick,
    handleAttackClick,
  };
};
