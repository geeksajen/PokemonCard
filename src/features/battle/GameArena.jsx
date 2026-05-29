import React, { useState, useCallback } from 'react';
import Board from './Board';
import Hand from './Hand';
import Card from './Card';
import DragOverlay from './DragOverlay';
import CardInspectModal from './CardInspectModal';
import PilePair from './arena/PilePair';
import HudOverlay from './arena/HudOverlay';
import SettingsModal from './arena/SettingsModal';
import LogDrawer from './arena/LogDrawer';
import TurnTransition from './arena/TurnTransition';
import DeckSearchModal from './arena/DeckSearchModal';
import GameOverPanel from './arena/GameOverPanel';
import CoinFlipScreen from './arena/CoinFlipScreen';
import { useGameEngine } from '../../hooks/useGameEngine';
import { useDragDrop } from '../../hooks/useDragDrop';
import { getValidTargets, canRetreat, canAttack } from '../../game/rules';

const EMPTY_ZONES = new Set();

const GameArena = ({ p1Theme, p2Theme, vsAI = false, weaknessEnabled = true, onReturnLobby }) => {
  const engine = useGameEngine(p1Theme, p2Theme, vsAI, weaknessEnabled);
  const { dragState, startDrag, registerZone, cancelDrag } = useDragDrop();

  // 純 UI 開關，與遊戲邏輯無關，留在此處管理
  const [showSettings, setShowSettings] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [inspectCard, setInspectCard] = useState(null);
  // 結算後的盤面檢視模式（純 UI toggle）：隱藏結算面板讓玩家覆盤、截圖
  const [showReviewMode, setShowReviewMode] = useState(false);

  if (engine.loading) {
    return <div style={{ color: 'white', padding: '2rem' }}>載入遊戲中...</div>;
  }

  const {
    gameState,
    currentPlayerId,
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
    toggleBGM,
    toggleSFX,
    handleReadyClick,
    handleCoinFlipDone,
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
  } = engine;

  const isPlayer1Turn = currentPlayerId === 'player1';
  // 單人模式：人類(player1)固定在下方、AI(player2)固定在上方。雙人熱座沿用翻轉。
  const topPlayer = vsAI
    ? gameState.players.player2
    : (isPlayer1Turn ? gameState.players.player2 : gameState.players.player1);
  const bottomPlayer = vsAI
    ? gameState.players.player1
    : (isPlayer1Turn ? gameState.players.player1 : gameState.players.player2);

  // 是否允許下方玩家操作（雙人模式恆為真；單人模式僅限人類回合）
  const isSetup = gameState.phase === 'setup';
  // 結算後鎖定所有操作（攻擊/撤退/出牌/結束回合），但保留右鍵檢視卡牌供覆盤
  const humanCanAct = (!vsAI || isPlayer1Turn) && !gameState.winner;
  const retreatDisabled = !humanCanAct || !canRetreat(gameState, currentPlayerId).ok;
  // 攻擊就緒提示：我方回合、本回合未攻擊、出戰寶可夢能量已滿足招式需求時發光。
  // canAttack 已涵蓋上述三項判定（含對手戰鬥區須有寶可夢），準備階段不適用。
  const attackReady = !isSetup && humanCanAct && canAttack(gameState, currentPlayerId).ok;
  const readyDisabled = !bottomPlayer.activePokemon || bottomPlayer.isReady;
  const topLabel = vsAI ? '🤖 電腦' : (isPlayer1Turn ? '玩家 2' : '玩家 1');
  const bottomLabel = vsAI ? '玩家 1' : (isPlayer1Turn ? '玩家 1' : '玩家 2');
  const turnText = isSetup
    ? (bottomPlayer.isReady ? '等待對手準備…' : '請佈置你的寶可夢')
    : (humanCanAct ? '你的回合' : '對手回合中…');

  // ---- 拖曳開始 ----
  const handlePointerDragStart = (card, event) => {
    startDrag(card, { type: 'hand' }, event, handleCustomDrop);
  };

  const handleBenchPointerDragStart = (benchIndex, event) => {
    const benchPokemon = bottomPlayer.bench[benchIndex];
    if (!benchPokemon) return;
    startDrag(benchPokemon, { type: 'bench', index: benchIndex }, event, handleCustomDrop);
  };

  // 拖曳手牌時，預先算出合法落點（唯一真相：rules.getValidTargets），交給下方 Board 高亮
  const toZoneId = (t) => (t.zone === 'active' ? 'my-active' : `my-bench-${t.index}`);
  const validDropZones =
    dragState.isDragging && dragState.source?.type === 'hand'
      ? new Set(getValidTargets(gameState, currentPlayerId, dragState.card).map(toZoneId))
      : EMPTY_ZONES;

  return (
    <div className={bigDamageShake ? 'arena-shake' : ''} style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {toast.message && (
        <div key={toast.id} className="custom-toast show">
          {toast.message}
        </div>
      )}

      <HudOverlay
        topLabel={topLabel}
        bottomLabel={bottomLabel}
        turnText={turnText}
        actionsEnabled={humanCanAct}
        topPlayer={topPlayer}
        bottomPlayer={bottomPlayer}
        hasAttackedThisTurn={gameState.hasAttackedThisTurn}
        onOpenLog={() => setShowLog(true)}
        onOpenSettings={() => setShowSettings(true)}
        onAttack={handleAttackClick}
        onRetreat={handleRetreatClick}
        retreatDisabled={retreatDisabled}
        onEndTurn={endTurn}
        setupMode={isSetup}
        onReady={handleReadyClick}
        readyDisabled={readyDisabled}
      />

      {showSettings && (
        <SettingsModal
          bgmMuted={bgmMuted}
          sfxMuted={sfxMuted}
          onToggleBGM={toggleBGM}
          onToggleSFX={toggleSFX}
          onReturnLobby={onReturnLobby}
          onClose={() => setShowSettings(false)}
        />
      )}

      <LogDrawer open={showLog} logs={gameState.logs} onClose={() => setShowLog(false)} />

      {showTurnTransition && !gameState.winner && (
        <TurnTransition isPlayer1Turn={isPlayer1Turn} onContinue={handleTurnTransitionClick} vsAI={vsAI} />
      )}

      {/* 對手手牌實體佔位 */}
      <div style={{ height: '40px', position: 'relative', zIndex: 30, flexShrink: 0 }}>
        <div className="hand-wrapper-top">
          <Hand hand={topPlayer.hand} isCurrentPlayer={false} drawnCardAnim={drawnCardAnim} onInspect={setInspectCard} />
        </div>
      </div>

      {/* 戰鬥區 */}
      <div
        ref={registerZone('board')}
        className=""
        style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', justifyContent: 'center', padding: '10px 0', gap: '20px', overflowY: 'auto', transition: 'filter 0.3s ease' }}
      >
        {faintAnim && (
          <div style={{ position: 'absolute', zIndex: 60, top: '50%', left: '50%', pointerEvents: 'none' }}>
            <div className={`faint-anim-wrapper ${faintAnim.isTopPlayer ? 'faint-top' : 'faint-bottom'}`}>
              <div style={{ transform: 'scale(0.7)' }}>
                <Card card={faintAnim.pokemon} isFaceDown={false} />
              </div>
            </div>
          </div>
        )}
        {attackAnim && (
          <div className="projectile-container">
            <div className={`projectile fx-${attackAnim.type} ${
              attackAnim.type === 'grass'
                ? (attackAnim.toTop ? 'anim-grass-up' : 'anim-grass-down')
                : (attackAnim.toTop ? 'anim-up' : 'anim-down')
            }`}></div>
          </div>
        )}

        {/* 對手牌區群組：靠中線上緣，標籤在下方 */}
        <div style={{ position: 'absolute', bottom: 'calc(50% + 8px)', right: '16px', zIndex: 5 }}>
          <PilePair
            deckCount={topPlayer.deck.length}
            discardTop={topPlayer.discardPile[topPlayer.discardPile.length - 1]}
            discardCount={topPlayer.discardPile.length}
            labelOnTop={false}
          />
        </div>

        {/* 玩家牌區群組：靠中線下緣，標籤在上方 */}
        <div style={{ position: 'absolute', top: 'calc(50% + 8px)', right: '16px', zIndex: 5 }}>
          <PilePair
            deckCount={bottomPlayer.deck.length}
            discardTop={bottomPlayer.discardPile[bottomPlayer.discardPile.length - 1]}
            discardCount={bottomPlayer.discardPile.length}
            labelOnTop={true}
          />
        </div>

        <Board
          activePokemon={topPlayer.activePokemon}
          bench={topPlayer.bench}
          isTopPlayer={true}
          faceDown={isSetup}
          damageTaken={damageAnim && damageAnim.isTopPlayer ? damageAnim.damage : null}
          onBenchClick={!isSetup && humanCanAct ? handleOpponentBenchClick : undefined}
          onInspect={setInspectCard}
          pendingAction={gameState.pendingAction}
        />
        <Board
          activePokemon={bottomPlayer.activePokemon}
          bench={bottomPlayer.bench}
          isTopPlayer={false}
          attackReady={attackReady}
          validZones={validDropZones}
          damageTaken={damageAnim && !damageAnim.isTopPlayer ? damageAnim.damage : null}
          onActiveClick={humanCanAct ? handleMyActiveClick : undefined}
          onBenchClick={humanCanAct ? handleMyBenchClick : undefined}
          onBenchPointerDragStart={humanCanAct && !gameState.pendingAction ? handleBenchPointerDragStart : undefined}
          registerZone={registerZone}
          dragState={dragState}
          onInspect={setInspectCard}
          pendingAction={gameState.pendingAction}
        />
      </div>

      {gameState.pendingAction && (
        <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'var(--theme-panel-dark)', color: 'var(--theme-text-main)', padding: '15px 30px',
          borderRadius: '12px', zIndex: 100, border: '2px solid var(--color-energy)',
          boxShadow: 'var(--theme-shadow)', textAlign: 'center'
        }}>
          <h2 style={{ margin: '0 0 10px 0', color: 'var(--color-energy)' }}>請選擇目標</h2>
          <p style={{ margin: 0 }}>
            {gameState.pendingAction.type === 'select_opponent_bench' && '請點擊對手備戰區的一隻寶可夢'}
            {gameState.pendingAction.type === 'select_my_bench' && '請點擊我方備戰區的一隻寶可夢'}
            {gameState.pendingAction.type === 'select_retreat_bench' && '請選擇要替換上場的備戰寶可夢'}
          </p>
          <button
            onClick={handleCancelPending}
            style={{ marginTop: '15px', padding: '5px 15px', borderRadius: '5px', background: 'var(--color-danger)', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            取消
          </button>
        </div>
      )}

      {/* 玩家手牌實體佔位 */}
      <div style={{ height: '50px', position: 'relative', zIndex: 40, flexShrink: 0 }}>
        <div className={`hand-wrapper-bottom ${selectedCard && !dragState.isDragging ? 'hand-active' : ''} ${dragState.isDragging ? 'is-dragging' : ''}`}>
          {selectedCard && (
            <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)',
                          background: 'var(--palette-player1)', padding: '8px 20px', borderRadius: '20px',
                          fontSize: '1rem', fontWeight: 'bold', pointerEvents: 'none', zIndex: 40,
                          color: 'white',
                          boxShadow: 'var(--theme-shadow)', whiteSpace: 'nowrap' }}>
              選中了：{selectedCard.name} (請點擊戰鬥區或備戰區放置)
            </div>
          )}
          <Hand
            hand={bottomPlayer.hand}
            isCurrentPlayer={true}
            onCardClick={humanCanAct ? handleHandCardClick : undefined}
            onPointerDragStart={humanCanAct ? handlePointerDragStart : undefined}
            dragState={dragState}
            drawnCardAnim={drawnCardAnim}
            onInspect={setInspectCard}
          />
        </div>
      </div>

      {showDeckSearch && (
        <DeckSearchModal
          deck={deckSearchCards}
          onPick={handlePickFromDeck}
          onCancel={handleCancelDeckSearch}
        />
      )}

      {coinFlip && (
        <CoinFlipScreen
          firstPlayer={coinFlip.firstPlayer}
          firstPlayerLabel={coinFlip.firstPlayerLabel}
          onDone={handleCoinFlipDone}
        />
      )}

      {/* 結算階段一：VICTORY / DEFEAT 大字演出（不卸載 arena） */}
      {gameOverStage === 'cinematic' && (() => {
        const humanWon = gameState.winner === 'player1';
        const text = vsAI
          ? (humanWon ? 'VICTORY' : 'DEFEAT')
          : `玩家 ${humanWon ? '1' : '2'} 獲勝`;
        const color = vsAI
          ? (humanWon ? 'var(--color-energy)' : 'var(--color-danger)')
          : (humanWon ? 'var(--palette-player1)' : 'var(--palette-player2)');
        return (
          <div className="game-over-cinematic">
            <div className="game-over-banner" style={{ color }}>{text}</div>
          </div>
        );
      })()}

      {/* 結算階段二：結算面板（檢視模式下隱藏） */}
      {gameOverStage === 'panel' && !showReviewMode && (
        <GameOverPanel
          winner={gameState.winner}
          winReason={gameState.winReason}
          vsAI={vsAI}
          onRematch={onReturnLobby}
          onReview={() => setShowReviewMode(true)}
          onShowLog={() => { setShowReviewMode(true); setShowLog(true); }}
        />
      )}

      {/* 結算階段三：檢視模式下的返回結算選單按鈕 */}
      {gameOverStage === 'panel' && showReviewMode && (
        <button className="game-over-review-exit" onClick={() => { setShowReviewMode(false); setShowLog(false); }}>
          ⬅ 返回結算選單
        </button>
      )}

      {/* 拖曳浮層 - 最上層 */}
      <DragOverlay dragState={dragState} />

      {/* 卡牌檢視器 */}
      <CardInspectModal card={inspectCard} onClose={() => setInspectCard(null)} />
    </div>
  );
};

export default GameArena;
