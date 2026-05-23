import React from 'react';
import { useCardStore } from '../store';

function StudioPage() {
  const { customCards, addCustomCard } = useCardStore();

  const handleAddCard = () => {
    const newCard = {
      name: `Custom Card ${Date.now()}`,
      description: 'A custom card',
      cost: 1,
      type: 'Pokémon',
    };
    addCustomCard(newCard);
  };

  return (
    <div className="studio-page" style={{ padding: '2rem' }}>
      <h1>自訂卡牌工坊 (Card Studio)</h1>
      <button onClick={handleAddCard} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
        新增自訂卡牌
      </button>
      <div style={{ marginTop: '2rem' }}>
        <h2>我的自訂卡牌 ({customCards.length})</h2>
        <ul>
          {customCards.map((card) => (
            <li key={card.customId}>
              {card.name} - {card.type}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default StudioPage;
