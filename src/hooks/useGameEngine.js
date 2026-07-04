import { useState, useEffect, useRef } from 'react';
import { INITIAL_HAND_SIZE, BENCH_MAX } from '../game/constants';
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
  applyBossOrders,
  resolveBossOrders,
  resolveEscapeRope,
  cancelPendingAction,
  resolveBoardCardEffect,
  canRetreat,
  initiateRetreat,
  resolveRetreat,
  returnToHand,
  confirmReady,
  resolveSetup,
  bothReady,
} from '../game/rules';

const isBasicPokemon = (c) => c.type === CardTypes.POKEMON && !c.stage;
import {
  sfxPlace,
  sfxAttack,
  sfxDamage,
  sfxEndTurn,
  sfxVictory,
  sfxError,
  sfxTurnStart,
  sfxEvolve,
  AudioSettings,
  startBGM,
  stopBGM,
} from '../utils/sounds';

// 「你的回合」橫幅顯示時長（ms）；之後才開始抽牌
const TURN_BANNER_MS = 1100;
// 進化高光動畫時長（ms），與 .evolve-flash CSS 動畫一致
const EVOLVE_FLASH_MS = 800;

// 集中管理遊戲狀態、UI 狀態與所有副作用（state 更新 / 音效 / 動畫 / 提示）。
// 規則判定一律委派給 src/game/rules.js 的純函式。
export const useGameEngine = (p1Theme, p2Theme, vsAI = false, weaknessResistance = true, onGameOver = null) => {
  const [gameState, setGameState] = useState(null);
  const aiActiveRef = useRef(false);
  const aiSetupRef = useRef(false);
  const gameOverFiredRef = useRef(false); // 確保結算回呼只觸發一次
  const [coinFlip, setCoinFlip] = useState(null); // { firstPlayer, firstPlayerLabel, state }
  const [selectedCard, setSelectedCard] = useState(null);
  const [damageAnim, setDamageAnim] = useState(null);
  const [toast, setToast] = useState({ id: 0, message: '' });
  const [showTurnTransition, setShowTurnTransition] = useState(false);
  const [bigDamageShake, setBigDamageShake] = useState(false);

  const [bgmMuted, setBgmMuted] = useState(true);
  const [sfxMuted, setSfxMuted] = useState(false);
  const [showDeckSearch, setShowDeckSearch] = useState(false);
  const [cardToConsume, setCardToConsume] = useState(null);
  const [deckSearchTopN, setDeckSearchTopN] = useState(null); // null=全牌庫；數字=只看牌庫頂 N 張
  const [attackAnim, setAttackAnim] = useState(null);
  // 電影級攻擊聚焦：涵蓋整個攻擊→傷害→擊倒結算的期間（比 attackAnim 的投射物飛行更長），
  // 由 GameArena 套用縮放/變暗 class，結算完畢後平滑復原。
  const [cinematicAttack, setCinematicAttack] = useState(false);
  const [drawnCardAnim, setDrawnCardAnim] = useState(null);
  const [faintAnim, setFaintAnim] = useState(null);
  // 結算演出階段：null（未結束）| 'cinematic'（VICTORY/DEFEAT 大字）| 'panel'（結算面板）
  const [gameOverStage, setGameOverStage] = useState(null);
  // 「你的回合」過場橫幅：null 或 { id }（id 變更即重播動畫）
  const [turnBanner, setTurnBanner] = useState(null);
  // 進化高光：剛完成進化的卡牌 instanceId（短暫存在，供 Card 播放閃光動畫）
  const [evolvedCardId, setEvolvedCardId] = useState(null);
  // 放置漣漪：剛放置卡牌的棋盤格 { zone, benchIndex, id }（id 變更即重播動畫）
  const [dropRipple, setDropRipple] = useState(null);

  useEffect(() => {
    const initialState = createInitialGameState(p1Theme, p2Theme, { weaknessResistance });
    // 起手重抽（mulligan）：手牌沒有基礎寶可夢就洗回重抽，否則無法放置戰鬥區寶可夢而卡死。
    // 牌組已於工坊存檔時驗證至少含一隻基礎寶可夢，迴圈必定收斂；上限 20 次為安全防護。
    const drawOpeningHand = (player) => {
      for (let attempt = 0; attempt < 20; attempt++) {
        player.deck.push(...player.hand);
        player.hand = [];
        player.deck.sort(() => Math.random() - 0.5);
        for (let i = 0; i < INITIAL_HAND_SIZE; i++) player.hand.push(player.deck.pop());
        if (player.hand.some(isBasicPokemon)) break;
      }
    };
    drawOpeningHand(initialState.players.player1);
    drawOpeningHand(initialState.players.player2);
    setGameState(initialState);
  }, [p1Theme, p2Theme, weaknessResistance]);

  // ---- AI 準備階段自動佈置 ------------------------------------------------
  // 單人模式下，AI (player2) 在準備階段自動把基礎寶可夢佈置上場並標記就緒。
  // 卡牌對人類為背面（由 UI 處理），所以無需逐步動畫，一次到位即可。
  useEffect(() => {
    if (!vsAI || !gameState || gameState.phase !== 'setup') return;
    if (gameState.players.player2.isReady || aiSetupRef.current) return;
    aiSetupRef.current = true;

    let working = gameState;
    const basics = working.players.player2.hand.filter(isBasicPokemon);
    if (basics.length === 0) return; // mulligan 已保證至少一隻，理論上不會發生

    const place = (card, location) => {
      const r = playCardOnPokemon(working, 'player2', card, location);
      if (r.ok) working = r.state;
    };
    place(basics[0], { zone: 'active' });
    for (let i = 1; i < basics.length && i <= BENCH_MAX; i++) {
      place(basics[i], { zone: 'bench', index: working.players.player2.bench.length });
    }
    const ready = confirmReady(working, 'player2');
    if (ready.ok) working = ready.state;
    commitReadyState(working);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vsAI, gameState?.phase, gameState?.players.player2.isReady]);

  const showToast = (message) => setToast({ id: Date.now(), message });

  // 回合間結算（中毒）造成的擊倒：結算獎賞與勝負後回傳最終 state。
  // faint 動畫因換手時序複雜暫以 toast + log 呈現（詳 spec/20260704/04）。
  // 定義於 AI 回合 effect 之前，供其 finishTurn 與下方 endTurnFrom 共用。
  const finalizeEndTurn = (endResult) => {
    let cur = endResult.state;
    for (const k of endResult.checkupKnockouts || []) {
      const { state: resolved, winner } = resolveKnockout(cur, getOpponentId(k.ownerId), k.faintedPokemon);
      cur = resolved;
      showToast(`${k.faintedPokemon.name} 因中毒倒下了！`);
      if (winner) {
        sfxVictory();
        break;
      }
    }
    return cur;
  };

  // ---- 結算演出編排 ------------------------------------------------------
  // winner 出現後，先播 VICTORY/DEFEAT 大字（cinematic），約 2 秒後再揭開結算面板。
  // 動畫狀態屬編排層，依設計留在 useGameEngine（GameArena 僅持有 showReviewMode 純 UI toggle）。
  useEffect(() => {
    if (!gameState?.winner) {
      setGameOverStage(null);
      return;
    }
    setGameOverStage('cinematic');
    // 通知外層（記錄戰績），確保整場只觸發一次
    if (onGameOver && !gameOverFiredRef.current) {
      gameOverFiredRef.current = true;
      onGameOver({ winner: gameState.winner, winReason: gameState.winReason });
    }
    const t = setTimeout(() => setGameOverStage('panel'), 2000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.winner]);

  // 進化高光：依規則層回傳的 didEvolve metadata 觸發專屬音效與短暫的閃光狀態。
  // 人類與 AI 兩條出牌路徑共用，確保兩側進化都有一致演出。
  const flashEvolution = (result) => {
    if (!result.ok || !result.didEvolve) return;
    sfxEvolve();
    setEvolvedCardId(result.evolvedInstanceId);
    setTimeout(() => setEvolvedCardId(null), EVOLVE_FLASH_MS);
  };

  // 套用一個規則層回傳的 { ok, state, error }：成功播音效，失敗時視情況提示
  const applyResult = (result) => {
    if (result.ok) {
      setGameState(result.state);
      setSelectedCard(null);
      sfxPlace();
      flashEvolution(result);
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
      const ended = finalizeEndTurn(endTurnState(working));
      if (ended.winner) {
        setGameState(ended);
        return;
      }
      proceedToDraw(ended);
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
        }, action.attackIndex ?? 0);
        return;
      }

      // 依動作類型分派到規則層。useCard 的多步驟卡（老大指令/檢索球/撤退）
      // 由此直接串完兩段純函式，跳過人類玩家用的 pendingAction / modal 流程。
      const executeAIAction = () => {
        if (action.kind === 'promote') return promoteFromBench(working, 'player2', action.benchIndex);
        if (action.kind === 'retreat') {
          const initiated = initiateRetreat(working, 'player2');
          return initiated.ok ? resolveRetreat(initiated.state, 'player2', action.benchIndex) : initiated;
        }
        if (action.kind === 'useCard') {
          const kind = action.card.effect?.kind;
          if (kind === 'searchDeck') return pullPokemonFromDeck(working, 'player2', action.pickInstanceId, action.card);
          if (kind === 'bossOrders') {
            const applied = applyBossOrders(working, 'player2', action.card);
            return applied.ok ? resolveBossOrders(applied.state, 'player2', action.benchIndex) : applied;
          }
          // 需指定我方目標的卡（傷藥/交換器等）走 playCardOnPokemon；其餘走無目標分派
          if (action.location) return playCardOnPokemon(working, 'player2', action.card, action.location);
          return resolveBoardCardEffect(working, 'player2', action.card);
        }
        return playCardOnPokemon(working, 'player2', action.card, action.location);
      };
      const result = executeAIAction();

      if (!result.ok) return finishTurn(); // 決策無法執行就結束，避免卡死
      working = result.state;
      setGameState(result.state);
      sfxPlace();
      flashEvolution(result); // AI 進化也播放高光，與人類一致
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
  const playToLocation = (card, location) => {
    const result = playCardOnPokemon(gameState, currentPlayerId, card, location);
    applyResult(result);
    // 放置漣漪：成功放到某個棋盤格時，於該格觸發擴散光圈，強化「拍在桌上」的回饋感。
    if (result.ok) {
      setDropRipple({ zone: location.zone, benchIndex: location.index, id: Date.now() });
      setTimeout(() => setDropRipple(null), 600);
    }
    // 補血浮動文字：傷藥成功使用後，於目標卡牌顯示綠色正數（依實際回復量）。
    // 出牌方恆為當前玩家＝畫面下方，故 isTopPlayer 固定為 false。
    if (result.ok && card.type === CardTypes.ITEM && card.effect?.kind === 'heal') {
      const readHp = (state) => {
        const p = state.players[currentPlayerId];
        const slot = location.zone === 'active' ? p.activePokemon : p.bench[location.index];
        return slot?.currentHp ?? 0;
      };
      const healed = readHp(result.state) - readHp(gameState);
      if (healed > 0) {
        setDamageAnim({ amount: healed, kind: 'heal', isTopPlayer: false, zone: location.zone, benchIndex: location.index });
        setTimeout(() => setDamageAnim(null), 1050);
      }
    }
  };

  const handleMyActiveClick = () => {
    // 準備階段：點擊已佈置的戰鬥寶可夢將其收回手牌（供重新選擇）
    if (gameState.phase === 'setup' && currentPlayer.activePokemon) {
      applyResult(returnToHand(gameState, currentPlayerId, { zone: 'active' }));
      return;
    }
    if (!selectedCard) return;
    playToLocation(selectedCard, { zone: 'active' });
  };

  const handleRetreatClick = () => {
    const check = canRetreat(gameState, currentPlayerId);
    if (!check.ok) {
      if (check.error) { showToast(check.error); sfxError(); }
      return;
    }
    applyResult(initiateRetreat(gameState, currentPlayerId));
  };

  const handleMyBenchClick = (existingPokemon, index) => {
    // 準備階段：點擊備戰寶可夢收回手牌；空位 + 已選卡 → 放置
    if (gameState.phase === 'setup') {
      if (existingPokemon) {
        applyResult(returnToHand(gameState, currentPlayerId, { zone: 'bench', index }));
      } else if (selectedCard) {
        playToLocation(selectedCard, { zone: 'bench', index });
      }
      return;
    }
    // 撤退目標選擇
    if (gameState?.pendingAction?.type === 'select_retreat_bench') {
      applyResult(resolveRetreat(gameState, currentPlayerId, index));
      return;
    }
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

  // ---- 準備階段 ----------------------------------------------------------
  // 套用一次 confirmReady 的結果；若雙方皆就緒則開始擲硬幣過場（resolveSetup 已決定先攻）
  const commitReadyState = (next) => {
    if (bothReady(next)) {
      const resolved = resolveSetup(next);
      const label =
        resolved.firstPlayer === 'player1'
          ? (vsAI ? '你' : '玩家 1')
          : (vsAI ? '🤖 電腦' : '玩家 2');
      setGameState(next); // 先讓雙方 isReady 落地，過場結束後再切到 main
      setCoinFlip({ firstPlayer: resolved.firstPlayer, firstPlayerLabel: label, state: resolved.state });
    } else {
      setGameState(next);
    }
  };

  const handleReadyClick = () => {
    const result = confirmReady(gameState, currentPlayerId);
    if (!result.ok) {
      showToast(result.error);
      sfxError();
      return;
    }
    sfxEndTurn();
    commitReadyState(result.state);
  };

  // 擲硬幣過場結束：正式進入 main 階段
  const handleCoinFlipDone = () => {
    if (!coinFlip) return;
    setGameState(coinFlip.state);
    setCoinFlip(null);
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

    // 備戰區來源除了上面的推派(→戰鬥區)外無其他合法落點：
    // 放回備戰區/空白處皆視為無效，避免被當成「打出手牌」而誤觸進化判定。
    if (source?.type !== 'hand') return;

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
  // 實際抽牌並播放抽牌動畫（AI 模式下取代「點擊繼續」過場）
  const runDraw = (state) => {
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

  // 為新的當前玩家抽牌。單人模式下，當控制權「切回人類玩家」時，先播放
  // 「你的回合」霸氣橫幅再抽牌（橫幅期間全螢幕攔截點擊，避免搶先操作造成狀態競態）。
  const proceedToDraw = (state) => {
    if (vsAI && state.currentPlayer === 'player1' && !state.winner) {
      sfxTurnStart();
      setTurnBanner({ id: Date.now() });
      setTimeout(() => {
        setTurnBanner(null);
        runDraw(state);
      }, TURN_BANNER_MS);
    } else {
      runDraw(state);
    }
  };

  // 從指定 state 結束回合並交給對手（供手動結束與攻擊後自動結束共用）
  const endTurnFrom = (state) => {
    const ended = finalizeEndTurn(endTurnState(state));
    setSelectedCard(null);
    sfxEndTurn();
    if (ended.winner) {
      setGameState(ended); // 中毒反殺分出勝負：直接進結算演出
      return;
    }
    if (vsAI) {
      // 單人模式不需要「換手過場」，直接抽牌交給對手；AI 回合由下方 effect 接手
      proceedToDraw(ended);
    } else {
      setGameState(ended);
      setShowTurnTransition(true);
    }
  };

  const endTurn = () => {
    if (!currentPlayer.activePokemon && currentPlayer.bench.length > 0) {
      showToast('戰鬥區空缺，請先從備戰區推派一隻寶可夢上場！');
      sfxError();
      return;
    }
    endTurnFrom(gameState);
  };

  const handleTurnTransitionClick = () => {
    setShowTurnTransition(false);
    proceedToDraw(gameState);
  };

  // ---- 攻擊 --------------------------------------------------------------
  // 共用攻擊流程（人類與 AI 皆走此處）。defenderIsTop 決定擊倒動畫位置，
  // onDone(finalState) 在攻擊完全結算後呼叫。attackIndex 指定發動的招式。
  const performAttack = (state, attackerId, defenderIsTop, onDone, attackIndex = 0) => {
    const attacker = state.players[attackerId].activePokemon;
    sfxAttack();
    setCinematicAttack(true); // 進入電影聚焦：棋盤微幅放大、周邊變暗
    // toTop：投射物飛行方向，朝被攻擊方（defender 在上 → 往上，在下 → 往下）
    setAttackAnim({ type: attacker.energyType || 'fire', toTop: defenderIsTop });

    setTimeout(() => {
      setAttackAnim(null);
      sfxDamage();

      const {
        state: afterDamage,
        damage,
        knockedOut,
        faintedPokemon,
        effectiveness,
        selfKnockedOut,
        selfFaintedPokemon,
        inflicted,
        inflictedName,
      } = applyAttackDamage(state, attackerId, attackIndex);
      setGameState(afterDamage);
      if (effectiveness === 'weakness') showToast('效果絕佳！');
      else if (effectiveness === 'resistance') showToast('效果不好…');
      // 特殊狀態施加提示（若與相剋提示同時出現，錯開時間讓兩則都能被看到）
      if (inflicted) {
        const label = inflicted === 'poisoned' ? '中毒了' : inflicted === 'asleep' ? '睡著了' : '麻痺了';
        setTimeout(() => showToast(`${inflictedName} ${label}！`), effectiveness ? 900 : 0);
      }
      // 浮動戰鬥文字：攻擊一律命中對手戰鬥區，紅色負數。
      setDamageAnim({ amount: damage, kind: 'damage', isTopPlayer: defenderIsTop, zone: 'active' });
      if (damage >= 80) {
        setBigDamageShake(true);
        setTimeout(() => setBigDamageShake(false), 500);
      }
      setTimeout(() => setDamageAnim(null), 850);

      // 擊倒結算佇列：先結算防守方，再結算自傷反殺（捨身衝撞可能雙方倒下）。
      // 每筆依序播放 faint 動畫 → resolveKnockout；一旦分出勝負即中止後續結算。
      const knockouts = [];
      if (knockedOut) knockouts.push({ prizeTakerId: attackerId, fainted: faintedPokemon, isTopPlayer: defenderIsTop });
      if (selfKnockedOut) knockouts.push({ prizeTakerId: getOpponentId(attackerId), fainted: selfFaintedPokemon, isTopPlayer: !defenderIsTop });

      const resolveNext = (curState, queue) => {
        if (queue.length === 0) {
          setCinematicAttack(false); // 結算完畢，鏡頭平滑拉回
          if (onDone) onDone(curState);
          return;
        }
        const [next, ...rest] = queue;
        setFaintAnim({ pokemon: next.fainted, isTopPlayer: next.isTopPlayer });
        setTimeout(() => {
          setFaintAnim(null);
          const { state: resolved, winner } = resolveKnockout(curState, next.prizeTakerId, next.fainted);
          if ((next.fainted.prizeYield || 1) > 1) {
            showToast(`擊倒 EX 級寶可夢！一次獲得 ${next.fainted.prizeYield} 張獎賞卡！`);
          }
          setGameState(resolved);
          if (winner) {
            sfxVictory();
            setCinematicAttack(false);
            if (onDone) onDone(resolved);
            return;
          }
          resolveNext(resolved, rest);
        }, 1000);
      };

      if (knockouts.length > 0) {
        resolveNext(afterDamage, knockouts);
      } else {
        // 無擊倒：讓傷害跳字的爆發演完後再拉回鏡頭
        setTimeout(() => setCinematicAttack(false), 500);
        if (onDone) onDone(afterDamage);
      }
    }, 400);
  };

  const handleAttackClick = (attackIndex = 0) => {
    const check = canAttack(gameState, currentPlayerId, attackIndex);
    if (!check.ok) {
      showToast(check.error);
      sfxError();
      return;
    }
    // 人類玩家固定在下方，被攻擊的對手永遠在上方。
    // 攻擊即結束回合：結算完成後（若尚未分出勝負）自動換手給對手。
    performAttack(gameState, currentPlayerId, true, (resolved) => {
      if (resolved.winner) return;
      endTurnFrom(resolved);
    }, attackIndex);
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
    bigDamageShake,
    bgmMuted,
    sfxMuted,
    showDeckSearch,
    deckSearchCards,
    attackAnim,
    drawnCardAnim,
    faintAnim,
    gameOverStage,
    coinFlip,
    turnBanner,
    evolvedCardId,
    cinematicAttack,
    dropRipple,
    // 動作
    handleReadyClick,
    handleCoinFlipDone,
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
    handleRetreatClick,
    handleOpponentBenchClick,
    handleCancelPending,
  };
};
