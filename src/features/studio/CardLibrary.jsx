import React, { useState } from 'react';
import Card from '../battle/Card';
import { CardTypes } from '../../models/cards';

// 類型篩選（訓練家同時涵蓋 item，與 DeckList 分組一致）
const TYPE_FILTERS = [
  { key: CardTypes.POKEMON, label: '寶可夢', icon: '🐾' },
  { key: CardTypes.TRAINER, label: '訓練家', icon: '👤' },
  { key: CardTypes.ENERGY,  label: '能量',   icon: '⚡' },
];

// 能量屬性篩選：以對應的 --palette-element-* token 上色的圓形圖示
const ELEMENT_FILTERS = [
  { key: 'fire',     label: '火', color: 'var(--palette-element-1)' },
  { key: 'water',    label: '水', color: 'var(--palette-element-2)' },
  { key: 'grass',    label: '草', color: 'var(--palette-element-3)' },
  { key: 'electric', label: '電', color: 'var(--palette-element-4)' },
  { key: 'psychic',  label: '超', color: 'var(--palette-element-5)' },
  { key: 'fighting', label: '鬥', color: 'var(--palette-element-6)' },
  { key: 'normal',   label: '無', color: 'var(--palette-element-neutral)' },
];

const toggle = (arr, value) =>
  arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

const CardLibrary = ({ allCards, onAddCard, onInspectCard, deckCount }) => {
  // 多選篩選（空陣列＝不限）。屬性與類型以 AND 組合，達成「所見即所搜」。
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedElements, setSelectedElements] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const matchType = (card) =>
    selectedTypes.length === 0 ||
    selectedTypes.some((t) =>
      t === CardTypes.TRAINER
        ? card.type === CardTypes.TRAINER || card.type === CardTypes.ITEM
        : card.type === t
    );

  // 選了屬性時，僅顯示帶該屬性的卡（寶可夢/能量）；無屬性卡（訓練家/物品）會被排除
  const matchElement = (card) =>
    selectedElements.length === 0 ||
    (!!card.energyType && selectedElements.includes(card.energyType));

  const matchSearch = (card) =>
    !searchQuery || card.name.toLowerCase().includes(searchQuery.toLowerCase());

  const filteredCards = allCards.filter(
    (card) => matchType(card) && matchElement(card) && matchSearch(card)
  );

  const hasActiveFilter = selectedTypes.length > 0 || selectedElements.length > 0;

  return (
    <div className="card-library">
      <div className="library-filters">
        <input
          type="text"
          className="lib-search-input"
          placeholder="搜尋卡牌名稱..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* 類型圖示按鈕（多選） */}
        <div className="lib-filter-group">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t.key}
              className={`lib-type-btn ${selectedTypes.includes(t.key) ? 'active' : ''}`}
              onClick={() => setSelectedTypes((prev) => toggle(prev, t.key))}
              title={t.label}
            >
              <span className="lib-type-icon">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        <div className="lib-filter-divider" />

        {/* 能量屬性圓形圖示（多選） */}
        <div className="lib-filter-group">
          {ELEMENT_FILTERS.map((el) => (
            <button
              key={el.key}
              className={`lib-energy-btn ${selectedElements.includes(el.key) ? 'active' : ''}`}
              style={{ background: el.color }}
              onClick={() => setSelectedElements((prev) => toggle(prev, el.key))}
              title={el.label}
            >
              {el.label}
            </button>
          ))}
        </div>

        {hasActiveFilter && (
          <button
            className="lib-filter-clear"
            onClick={() => { setSelectedTypes([]); setSelectedElements([]); }}
          >
            ✕ 清除篩選
          </button>
        )}
      </div>

      <div className="library-grid">
        {filteredCards.map((card) => {
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
          <div style={{ color: 'var(--theme-text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
            沒有找到符合條件的卡牌
          </div>
        )}
      </div>
    </div>
  );
};

export default CardLibrary;
