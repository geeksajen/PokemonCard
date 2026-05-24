import React, { useState } from 'react';
import Card from '../battle/Card';
import { CardTypes } from '../../models/cards';

const ELEMENTS = ['fire', 'water', 'grass', 'electric', 'psychic', 'fighting', 'normal'];
const TYPES = [CardTypes.POKEMON, CardTypes.TRAINER, CardTypes.ENERGY];

const CardLibrary = ({ allCards, onAddCard, onInspectCard, deckCount }) => {
  const [filterElement, setFilterElement] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCards = allCards.filter(card => {
    // 屬性篩選只適用於有 energyType 的卡（寶可夢、能量）
    const hasElement = card.type === CardTypes.POKEMON || card.type === CardTypes.ENERGY;
    if (filterElement && hasElement && card.energyType !== filterElement) return false;
    if (filterType) {
      // 「訓練家」按鈕同時涵蓋支援者(trainer)與物品(item)，與 DeckList 分組一致
      const matchType = filterType === CardTypes.TRAINER
        ? (card.type === CardTypes.TRAINER || card.type === CardTypes.ITEM)
        : card.type === filterType;
      if (!matchType) return false;
    }
    if (searchQuery && !card.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="card-library">
      <div className="library-filters">
        <input 
          type="text" 
          placeholder="搜尋卡牌名稱..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.5)', color: 'white' }}
        />
        <button 
          className={`filter-btn ${!filterType ? 'active' : ''}`}
          onClick={() => setFilterType(null)}
        >全部類型</button>
        {TYPES.map(type => (
          <button 
            key={type}
            className={`filter-btn ${filterType === type ? 'active' : ''}`}
            onClick={() => setFilterType(filterType === type ? null : type)}
          >
            {type === CardTypes.POKEMON ? '寶可夢' : type === CardTypes.TRAINER ? '訓練家' : '能量'}
          </button>
        ))}
        <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 5px' }}></div>
        {ELEMENTS.map(el => (
          <button 
            key={el}
            className={`filter-btn ${filterElement === el ? 'active' : ''}`}
            onClick={() => setFilterElement(filterElement === el ? null : el)}
          >
            {el === 'fire' ? '火' : el === 'water' ? '水' : el === 'grass' ? '草' : el === 'electric' ? '電' : el === 'psychic' ? '超' : el === 'fighting' ? '鬥' : '無'}
          </button>
        ))}
      </div>

      <div className="library-grid">
        {filteredCards.map(card => {
          const isDisabled = deckCount >= 27;
          return (
            <div 
              key={card.id} 
              className={`library-card-wrapper ${isDisabled ? 'disabled' : ''}`}
              onClick={() => !isDisabled && onAddCard(card)}
              onContextMenu={(e) => { e.preventDefault(); onInspectCard(card); }}
            >
              <Card card={card} isFaceDown={false} />
            </div>
          );
        })}
        {filteredCards.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.5)', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
            沒有找到符合條件的卡牌
          </div>
        )}
      </div>
    </div>
  );
};

export default CardLibrary;
