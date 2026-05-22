import React, { useState } from 'react';
import Board from './Board';
import Hand from './Hand';
import Card from './Card';
import PilePair from './arena/PilePair';
import HudOverlay from './arena/HudOverlay';
import SettingsModal from './arena/SettingsModal';
import LogDrawer from './arena/LogDrawer';
import TurnTransition from './arena/TurnTransition';
import DeckSearchModal from './arena/DeckSearchModal';
import WinnerScreen from './arena/WinnerScreen';
import { useGameEngine } from '../hooks/useGameEngine';

const GameArena = ({ p1Theme, p2Theme, vsAI = false, onReturnLobby }) => {
  const engine = useGameEngine(p1Theme, p2Theme, vsAI);

  // 純 UI 開關，與遊戲邏輯無關，留在此處管理
  const [showSettings, setShowSettings] = useState(false);
  const [showLog, setShowLog] = useState(false);

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
    isDragging,
    bgmMuted,
    sfxMuted,
    showDeckSearch,
    deckSearchCards,
    attackAnim,
    drawnCardAnim,
    faintAnim,
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
  } = engine;

  if (gameState.winner) {
    return <WinnerScreen winner={gameState.winner} vsAI={vsAI} onReturnLobby={onReturnLobby} />;
  }

  const isPlayer1Turn = currentPlayerId === 'player1';
  // 單人模式：人類(player1)固定在下方、AI(player2)固定在上方。雙人熱座沿用翻轉。
  const topPlayer = vsAI
    ? gameState.players.player2
    : (isPlayer1Turn ? gameState.players.player2 : gameState.players.player1);
  const bottomPlayer = vsAI
    ? gameState.players.player1
    : (isPlayer1Turn ? gameState.players.player1 : gameState.players.player2);

  // 是否允許下方玩家操作（雙人模式恆為真；單人模式僅限人類回合）
  const humanCanAct = !vsAI || isPlayer1Turn;
  const topLabel = vsAI ? '🤖 電腦' : (isPlayer1Turn ? '玩家 2' : '玩家 1');
  const bottomLabel = vsAI ? '玩家 1' : (isPlayer1Turn ? '玩家 1' : '玩家 2');
  const turnText = humanCanAct ? '你的回合' : '對手回合中…';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
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
        onEndTurn={endTurn}
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
        <TurnTransition isPlayer1Turn={isPlayer1Turn} onContinue={handleTurnTransitionClick} />
      )}

      {/* 對手手牌實體佔位 */}
      <div style={{ height: '40px', position: 'relative', zIndex: 30, flexShrink: 0 }}>
        <div className="hand-wrapper-top">
          <Hand hand={topPlayer.hand} isCurrentPlayer={false} drawnCardAnim={drawnCardAnim} />
        </div>
      </div>

      {/* 戰鬥區 */}
      <div
        style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', justifyContent: 'center', padding: '10px 0', gap: '20px', overflowY: 'auto' }}
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={humanCanAct ? handleDropBoard : (e) => e.preventDefault()}
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
            <div className={`projectile fx-${attackAnim.type} ${attackAnim.type === 'grass' ? 'anim-grass-up' : 'anim-up'}`}></div>
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
          damageTaken={damageAnim ? damageAnim.damage : null}
        />
        <Board
          activePokemon={bottomPlayer.activePokemon}
          bench={bottomPlayer.bench}
          isTopPlayer={false}
          onActiveClick={humanCanAct ? handleMyActiveClick : undefined}
          onBenchClick={humanCanAct ? handleMyBenchClick : undefined}
          onDropActive={humanCanAct ? handleDropActive : undefined}
          onDropBench={humanCanAct ? handleDropBench : undefined}
          onDragStartBench={humanCanAct ? handleDragStartBench : undefined}
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
            onCardClick={humanCanAct ? handleHandCardClick : undefined}
            onDragStart={humanCanAct ? handleDragStart : undefined}
            onDragEnd={handleDragEnd}
            drawnCardAnim={drawnCardAnim}
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
    </div>
  );
};

export default GameArena;
