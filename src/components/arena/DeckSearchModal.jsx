import React from 'react';
import Card from '../Card';
import { CardTypes } from '../../models/cards';

// 精靈球：從牌庫挑選一張寶可夢
const DeckSearchModal = ({ deck, onPick, onCancel }) => {
  const pokemons = deck.filter((c) => c.type === CardTypes.POKEMON);
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '80%', maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto' }}>
        <h2 style={{ marginBottom: '20px' }}>從牌庫選擇一張寶可夢</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {pokemons.map((card) => (
            <div
              key={card.instanceId}
              onClick={() => onPick(card)}
              style={{ cursor: 'pointer', transform: 'scale(0.8)', transformOrigin: 'top left', width: '120px', height: '168px' }}
            >
              <Card card={card} />
            </div>
          ))}
          {pokemons.length === 0 && (
            <div style={{ padding: '2rem' }}>牌庫中已經沒有寶可夢卡了！</div>
          )}
        </div>
        <button
          onClick={onCancel}
          style={{ display: 'block', width: '100%', marginTop: '20px', padding: '12px', background: 'var(--color-danger)', fontSize: '1.1rem' }}
        >
          取消 / 關閉
        </button>
      </div>
    </div>
  );
};

export default DeckSearchModal;
