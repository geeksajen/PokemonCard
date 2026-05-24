import React, { useState } from 'react';
import { CardTypes } from '../../models/cards';

const DeckList = ({ deckCards, onRemoveCard, onSave, onClear, onCoverSelect, coverCardId }) => {
  const totalCount = deckCards.length;
  
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
            onClick={() => onRemoveCard(card.id)}
            onContextMenu={(e) => { e.preventDefault(); onCoverSelect(card.id); }}
          >
            <div className="item-info">
              <span className="item-count">x{card.count}</span>
              <span>{card.name}</span>
            </div>
            {coverCardId === card.id && <span style={{ fontSize: '0.8rem', color: '#fbbf24' }}>★ 封面</span>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="deck-builder-panel">
      <div className="deck-header">
        <h2 className="deck-count">{totalCount} <span>/ 27 張</span></h2>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>右鍵點擊清單內的卡牌可設為封面圖</p>
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
