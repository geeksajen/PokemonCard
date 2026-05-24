import React, { useState, useEffect, useMemo } from 'react';
import { useCardStore } from '../store';
import { cardRepository } from '../api/CardRepository';
import CardLibrary from '../features/studio/CardLibrary';
import DeckList from '../features/studio/DeckList';
import CardInspectModal from '../features/battle/CardInspectModal';
import '../studio.css';

function StudioPage() {
  const { decks, createDeck, updateDeck } = useCardStore();
  const [deckCards, setDeckCards] = useState([]);
  const [coverCardId, setCoverCardId] = useState(null);
  const [inspectCard, setInspectCard] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch all available cards
  const allCards = useMemo(() => cardRepository.getAllCards(), []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddCard = (card) => {
    if (deckCards.length >= 27) {
      showToast('牌組已滿 27 張！');
      return;
    }

    // Check same card limit (max 4, except basic energy)
    // For simplicity, we check if it's not energy
    if (card.type !== 'Energy') {
      const sameCardCount = deckCards.filter(c => c.id === card.id).length;
      if (sameCardCount >= 4) {
        showToast('同名卡牌（非基本能量）最多只能放 4 張！');
        return;
      }
    }

    setDeckCards(prev => [...prev, card]);
    if (!coverCardId && card.type === 'Pokémon') {
      setCoverCardId(card.id);
    }
  };

  const handleRemoveCard = (cardId) => {
    setDeckCards(prev => {
      const idx = prev.findIndex(c => c.id === cardId);
      if (idx !== -1) {
        const newDeck = [...prev];
        newDeck.splice(idx, 1);
        return newDeck;
      }
      return prev;
    });
  };

  const handleClear = () => {
    if (window.confirm('確定要清空當前牌組嗎？')) {
      setDeckCards([]);
    }
  };

  const handleSave = () => {
    if (deckCards.length !== 27) return;

    // TODO: Let user name the deck. For now, use a default name or prompt.
    const deckName = prompt('請為您的牌組命名：', '我的新牌組');
    if (!deckName) return;

    const cardIds = deckCards.map(c => c.id);
    createDeck(deckName, cardIds);
    showToast('牌組儲存成功！');
  };

  const coverCard = coverCardId ? allCards.find(c => c.id === coverCardId) : null;
  const coverImageUrl = coverCard ? coverCard.imageUrl : '';

  return (
    <div className="studio-container">
      {toastMessage && (
        <div style={{ position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)', background: '#ef4444', color: 'white', padding: '10px 20px', borderRadius: '8px', zIndex: 100, fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', animation: 'slideInFast 0.3s' }}>
          {toastMessage}
        </div>
      )}

      <CardLibrary 
        allCards={allCards} 
        onAddCard={handleAddCard} 
        onInspectCard={setInspectCard} 
        deckCount={deckCards.length}
      />
      
      <DeckList 
        deckCards={deckCards} 
        onRemoveCard={handleRemoveCard} 
        onSave={handleSave} 
        onClear={handleClear}
        onCoverSelect={setCoverCardId}
        coverCardId={coverCardId}
      />

      {/* Cover Background */}
      {coverImageUrl && (
        <div 
          className="deck-cover-bg" 
          style={{ backgroundImage: `url(${coverImageUrl})` }} 
        />
      )}

      {/* Card Inspector Modal */}
      <CardInspectModal card={inspectCard} onClose={() => setInspectCard(null)} />
    </div>
  );
}

export default StudioPage;
