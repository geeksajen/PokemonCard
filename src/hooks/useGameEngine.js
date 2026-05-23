import { useState, useEffect, useRef } from 'react';
import { INITIAL_HAND_SIZE } from '../game/constants';
import { createInitialGameState } from '../models/gameState';
import { CardTypes } from '../models/cards';
import { decideAIAction } from '../game/ai';
import {
  getOpponentId,
  playCardOnPokemon,
  promoteFromBench,
  pullPokemonFromDeck,
  cancelPokeball,
  canAttack,
  applyAttackDamage,
  resolveKnockout,
  endTurnState,
  drawForTurn,
  resolveBossOrders,
  resolveEscapeRope,
  cancelPendingAction,
  resolveBoardCardEffect,
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
export const useGameEngine = (p1Theme, p2Theme, vsAI = false) => {
  const [gameState, setGameState] = useState(null);
  const aiActiveRef = useRef(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [damageAnim, setDamageAnim] = useState(null);
  const [toast, setToast] = useState({ id: 0, message: '' });
  const [showTurnTransition, setShowTurnTransition] = useState(false);

  const [bgmMuted, setBgmMuted] = useState(true);
  const [sfxMuted, setSfxMuted] = useState(false);
  const [showDeckSearch, setShowDeckSearch] = useState(false);
  const [cardToConsume, setCardToConsume] = useState(null);
  const [deckSearchTopN, setDeckSearchTopN] = useState(null); // null=全牌庫；數字=只看牌庫頂 N 張
  const [attackAnim, setAttackAnim] = useState(null);
  const [drawnCardAnim, setDrawnCardAnim] = useState(null);
  const [faintAnim, setFaintAnim] = useState(null);

  useEffect(() => {
    const initialState = createInitialGameState(p1Theme, p2Theme);
    for (let i = 0; i < INITIAL_HAND_SIZE; i++) {
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

  // ---- AI 對手回合 -------------------------------------------------------
  // 輪到 player2 且為單人模式時，逐步執行 AI 決策（含動畫延遲），結束後換回人類。
  // 必須在任何提前 return 之前呼叫，以符合 Hooks 規則；proceedToDraw / performAttack
  // 為後方宣告的函式，因 effect callback 於 render 完成後才執行，前向參照可正常解析。
  useEffect(() => {
    if (!vsAI || !gameState || gameState.winner) return;
    if (gameState.currentPlayer !== 'player2') {
      aiActiveRef.current = false;
      return;
    }
    if (aiActiveRef.current) return;
    aiActiveRef.current = true;

    let working = gameState;
    let steps = 0;

    const finishTurn = () => {
      aiActiveRef.current = false;
      proceedToDraw(endTurnState(working).state);
    };

    const step = () => {
      if (!working || working.winner || steps++ > 40) {
        aiActiveRef.current = false;
        return;
      }
      const action = decideAIAction(working, 'player2');

      if (action.kind === 'end') return finishTurn();

      if (action.kind === 'attack') {
        performAttack(working, 'player2', false, (resolved) => {
          working = resolved;
          if (resolved.winner) {
            aiActiveRef.current = false;
            return;
          }
          setTimeout(step, 800);
        });
        return;
      }

      const result =
        action.kind === 'promote'
          ? promoteFromBench(working, 'player2', action.benchIndex)
          : playCardOnPokemon(working, 'player2', action.card, action.location);

      if (!result.ok) return finishTurn(); // 決策無法執行就結束，避免卡死
      working = result.state;
      setGameState(result.state);
      sfxPlace();
      setTimeout(step, 650);
    };

    const timer = setTimeout(step, 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vsAI, gameState?.currentPlayer, gameState?.winner]);

  if (!gameState) {
    return { loading: true };
  }

  const currentPlayerId = gameState.currentPlayer;
  const currentPlayer = gameState.players[currentPlayerId];
  const opponentId = getOpponentId(currentPlayerId);
  const opponent = gameState.players[opponentId];

  // 超級球只看牌庫頂 N 張（deck 尾端為頂端，因抽牌用 pop）；精靈球看全牌庫
  const deckSearchCards = deckSearchTopN
    ? currentPlayer.deck.slice(-deckSearchTopN)
    : currentPlayer.deck;

  // ---- 手牌互動 ----------------------------------------------------------
  const handleHandCardClick = (card) => {
    setSelectedCard((prev) => (prev?.instanceId === card.instanceId ? null : card));
  };

  // ---- 放置卡牌 ----------------------------------------------------------
  const playToLocation = (card, location) =>
    applyResult(playCardOnPokemon(gameState, currentPlayerId, card, location));

  const handleMyActiveClick = () => {
    if (!selectedCard) return;
    playToLocation(selectedCard, { zone: 'active' });
  };

  const handleMyBenchClick = (existingPokemon, index) => {
    // 優先處理 Escape Rope 這類的換位選擇
    if (gameState?.pendingAction?.type === 'select_my_bench') {
      applyResult(resolveEscapeRope(gameState, currentPlayerId, index));
      return;
    }
    
    // 戰鬥區空缺時，點擊備戰區寶可夢直接推派上場
    if (!currentPlayer.activePokemon && existingPokemon) {
      const result = promoteFromBench(gameState, currentPlayerId, index);
      if (result.ok) setGameState(result.state);
      return;
    }
    if (!selectedCard) return;
    playToLocation(selectedCard, { zone: 'bench', index });
  };

  const handleOpponentBenchClick = (existingPokemon, index) => {
    if (gameState?.pendingAction?.type === 'select_opponent_bench') {
      applyResult(resolveBossOrders(gameState, currentPlayerId, index));
    }
  };

  const handleCancelPending = () => {
    applyResult(cancelPendingAction(gameState, currentPlayerId));
  };

  // ---- 自訂拖曳放置 (Custom Drag & Drop) ----------------------------------
  // 由 useDragDrop hook 的 onDrop callback 呼叫，接收 { card, source, zone }
  const handleCustomDrop = ({ card, source, zone }) => {
    if (!zone || !card) return;

    // 備戰區 → 戰鬥區推派
    if (source?.type === 'bench' && zone === 'my-active') {
      const result = promoteFromBench(gameState, currentPlayerId, source.index);
      if (result.ok) setGameState(result.state);
      return;
    }

    // 手牌 → 戰鬥區
    if (zone === 'my-active') {
      playToLocation(card, { zone: 'active' });
      return;
    }

    // 手牌 → 備戰區
    if (zone.startsWith('my-bench-')) {
      const index = parseInt(zone.split('-')[2], 10);
      playToLocation(card, { zone: 'bench', index });
      return;
    }

    // 手牌 → 棋盤空白處（訓練家/物品卡效果）
    if (zone === 'board') {
      if (card.type !== CardTypes.TRAINER && card.type !== CardTypes.ITEM) return;
      const kind = card.effect?.kind;
      if (!kind) return;

      if (kind === 'searchDeck') {
        setDeckSearchTopN(card.effect.topN ?? null);
        setCardToConsume(card);
        setShowDeckSearch(true);
      } else {
        applyResult(resolveBoardCardEffect(gameState, currentPlayerId, card));
      }
    }
  };

  // ---- 精靈球牌庫檢索 ----------------------------------------------------
  const handlePickFromDeck = (card) => {
    const result = pullPokemonFromDeck(gameState, currentPlayerId, card.instanceId, cardToConsume);
    setGameState(result.state);
    setShowDeckSearch(false);
    setCardToConsume(null);
    setDeckSearchTopN(null);
    sfxPlace();
  };

  const handleCancelDeckSearch = () => {
    setShowDeckSearch(false);
    setCardToConsume(null);
    setDeckSearchTopN(null);
    setGameState(cancelPokeball(gameState, currentPlayerId, cardToConsume).state);
  };

  // ---- 回合流程 ----------------------------------------------------------
  // 為新的當前玩家抽牌並播放抽牌動畫（AI 模式下取代「點擊繼續」過場）
  const proceedToDraw = (state) => {
    const { state: drawn, drawnCardId, deckOut } = drawForTurn(state);
    setGameState(drawn);
    if (deckOut) {
      sfxVictory();
      return;
    }
    // 單人模式下，AI（player2）的抽牌不播放中央特寫，避免替對手「亮牌」
    const hideDraw = vsAI && drawn.currentPlayer === 'player2';
    if (drawnCardId && !hideDraw) {
      setDrawnCardAnim({ cardId: drawnCardId, playerId: drawn.currentPlayer });
      setTimeout(() => setDrawnCardAnim(null), 2200);
    }
  };

  const endTurn = () => {
    if (!currentPlayer.activePokemon && currentPlayer.bench.length > 0) {
      showToast('戰鬥區空缺，請先從備戰區推派一隻寶可夢上場！');
      sfxError();
      return;
    }
    const ended = endTurnState(gameState).state;
    setSelectedCard(null);
    sfxEndTurn();
    if (vsAI) {
      // 單人模式不需要「換手過場」，直接抽牌交給對手；AI 回合由下方 effect 接手
      proceedToDraw(ended);
    } else {
      setGameState(ended);
      setShowTurnTransition(true);
    }
  };

  const handleTurnTransitionClick = () => {
    setShowTurnTransition(false);
    proceedToDraw(gameState);
  };

  // ---- 攻擊 --------------------------------------------------------------
  // 共用攻擊流程（人類與 AI 皆走此處）。defenderIsTop 決定擊倒動畫位置，
  // onDone(finalState) 在攻擊完全結算後呼叫。
  const performAttack = (state, attackerId, defenderIsTop, onDone) => {
    const attacker = state.players[attackerId].activePokemon;
    sfxAttack();
    // toTop：投射物飛行方向，朝被攻擊方（defender 在上 → 往上，在下 → 往下）
    setAttackAnim({ type: attacker.energyType || 'fire', toTop: defenderIsTop });

    setTimeout(() => {
      setAttackAnim(null);
      sfxDamage();

      const { state: afterDamage, damage, knockedOut, faintedPokemon } = applyAttackDamage(
        state,
        attackerId
      );
      setGameState(afterDamage);
      setDamageAnim({ damage });
      setTimeout(() => setDamageAnim(null), 500);

      if (knockedOut) {
        setFaintAnim({ pokemon: faintedPokemon, isTopPlayer: defenderIsTop });
        setTimeout(() => {
          setFaintAnim(null);
          const { state: resolved, winner } = resolveKnockout(afterDamage, attackerId, faintedPokemon);
          setGameState(resolved);
          if (winner) sfxVictory();
          if (onDone) onDone(resolved);
        }, 1000);
      } else if (onDone) {
        onDone(afterDamage);
      }
    }, 400);
  };

  const handleAttackClick = () => {
    const check = canAttack(gameState, currentPlayerId);
    if (!check.ok) {
      showToast(check.error);
      sfxError();
      return;
    }
    // 人類玩家固定在下方，被攻擊的對手永遠在上方
    performAttack(gameState, currentPlayerId, true);
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
    bgmMuted,
    sfxMuted,
    showDeckSearch,
    deckSearchCards,
    attackAnim,
    drawnCardAnim,
    faintAnim,
    // 動作
    toggleBGM,
    toggleSFX,
    handleHandCardClick,
    handleCustomDrop,
    handleMyActiveClick,
    handleMyBenchClick,
    handlePickFromDeck,
    handleCancelDeckSearch,
    endTurn,
    handleTurnTransitionClick,
    handleAttackClick,
    handleOpponentBenchClick,
    handleCancelPending,
  };
};
