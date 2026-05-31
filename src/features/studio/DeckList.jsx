import React, { useState } from 'react';
import { CardTypes } from '../../models/cards';

const DECK_MAX = 27;
const DRAG_FROM_LIBRARY = 'application/x-pk-from-library';
const DRAG_FROM_DECK = 'application/x-pk-from-deck';

const DeckList = ({ deckCards, onRemoveCard, onSave, onClear, onAutoBuild, onCoverSelect, coverCardId, onDropAddCard }) => {
  const totalCount = deckCards.length;

  // 拖曳加入：庫存卡拖到此面板放開 → 加入牌組
  const [dropActive, setDropActive] = useState(false);
  const handleDeckDragOver = (e) => {
    if (!e.dataTransfer.types.includes(DRAG_FROM_LIBRARY)) return;
    e.preventDefault();
    setDropActive(true);
  };
  const handleDeckDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDropActive(false);
  };
  const handleDeckDrop = (e) => {
    const cardId = e.dataTransfer.getData(DRAG_FROM_LIBRARY);
    setDropActive(false);
    if (cardId && onDropAddCard) onDropAddCard(cardId);
  };

  // Group cards by ID to show counts
  const groupedCards = deckCards.reduce((acc, card) => {
    if (!acc[card.id]) {
      acc[card.id] = { ...card, count: 0 };
    }
    acc[card.id].count += 1;
    return acc;
  }, {});

  const uniqueCards = Object.values(groupedCards);

  const pokemons = uniqueCards.filter(c => c.type === CardTypes.POKEMON);
  const trainers = uniqueCards.filter(c => c.type === CardTypes.TRAINER || c.type === CardTypes.ITEM);
  const energies = uniqueCards.filter(c => c.type === CardTypes.ENERGY);

  // 構成統計（依實際張數，非種類數）。基礎寶可夢＝寶可夢且無 evolvesFrom，供開局防呆。
  const pokemonCount = deckCards.filter(c => c.type === CardTypes.POKEMON).length;
  const trainerCount = deckCards.filter(c => c.type === CardTypes.TRAINER || c.type === CardTypes.ITEM).length;
  const energyCount = deckCards.filter(c => c.type === CardTypes.ENERGY).length;
  const basicCount = deckCards.filter(c => c.type === CardTypes.POKEMON && !c.evolvesFrom).length;
  const pct = (n) => `${(n / DECK_MAX) * 100}%`;

  const renderGroup = (title, cards) => {
    if (cards.length === 0) return null;
    return (
      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '4px' }}>
          {title} ({cards.reduce((sum, c) => sum + c.count, 0)})
        </h3>
        {cards.map(card => (
          <div
            key={card.id}
            className="deck-list-item"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(DRAG_FROM_DECK, card.id);
              e.dataTransfer.effectAllowed = 'move';
            }}
            onClick={() => onRemoveCard(card.id)}
            onContextMenu={(e) => { e.preventDefault(); onCoverSelect(card.id); }}
          >
            <div className="item-info">
              <span className={`item-count ${card.type !== CardTypes.ENERGY && card.count >= 4 ? 'maxed' : ''}`}>×{card.count}</span>
              <span>{card.name}</span>
            </div>
            {coverCardId === card.id && <span style={{ fontSize: '0.8rem', color: '#fbbf24' }}>★ 封面</span>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`deck-builder-panel ${dropActive ? 'studio-drop-active' : ''}`}
      onDragOver={handleDeckDragOver}
      onDragLeave={handleDeckDragLeave}
      onDrop={handleDeckDrop}
    >
      <div className="deck-header">
        <h2 className="deck-count">{totalCount} <span>/ 27 張</span></h2>

        {/* 構成比例進度條（依 27 張為滿格，區塊寬度即時伸縮） */}
        <div className="deck-analytics">
          <div className="deck-comp-bar">
            <div className="comp-seg comp-pokemon" style={{ width: pct(pokemonCount) }} />
            <div className="comp-seg comp-trainer" style={{ width: pct(trainerCount) }} />
            <div className="comp-seg comp-energy" style={{ width: pct(energyCount) }} />
          </div>
          <div className="deck-comp-legend">
            <span className="comp-legend-item"><i className="comp-dot comp-pokemon" />寶可夢 {pokemonCount}</span>
            <span className="comp-legend-item"><i className="comp-dot comp-trainer" />訓練家 {trainerCount}</span>
            <span className="comp-legend-item"><i className="comp-dot comp-energy" />能量 {energyCount}</span>
            {basicCount === 0 && (
              <span className="deck-comp-warning" title="必須至少包含一張基礎寶可夢">!</span>
            )}
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--theme-text-muted)' }}>右鍵點擊清單內的卡牌可設為封面圖</p>
      </div>

      <div className="deck-list">
        {renderGroup('寶可夢', pokemons)}
        {renderGroup('訓練家', trainers)}
        {renderGroup('能量', energies)}
        {totalCount === 0 && (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', marginTop: '40px' }}>
            從左側點擊卡牌加入牌組
          </div>
        )}
      </div>

      <div className="deck-actions">
        <button className="deck-action-btn clear" onClick={onClear}>清空</button>
        <button 
          className="deck-action-btn" 
          onClick={onAutoBuild}
          style={{ background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)', color: 'white' }}
        >
          ✨ 智能組牌
        </button>
        <button 
          className="deck-action-btn save" 
          onClick={onSave}
          disabled={totalCount !== 27}
        >
          {totalCount === 27 ? '儲存牌組' : `還缺 ${27 - totalCount} 張`}
        </button>
      </div>
    </div>
  );
};

export default DeckList;
