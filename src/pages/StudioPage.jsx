import React, { useState, useMemo } from 'react';
import { useCardStore } from '../store';
import { cardRepository } from '../api/CardRepository';
import { CardTypes } from '../models/cards';
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
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [currentDeckId, setCurrentDeckId] = useState(null);

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

    // 同名卡上限 4 張，基本能量不受此限
    if (card.type !== CardTypes.ENERGY) {
      const sameCardCount = deckCards.filter(c => c.id === card.id).length;
      if (sameCardCount >= 4) {
        showToast('同名卡牌（非基本能量）最多只能放 4 張！');
        return;
      }
    }

    setDeckCards(prev => [...prev, card]);
    if (!coverCardId && card.type === CardTypes.POKEMON) {
      setCoverCardId(card.id);
    }
  };

  const handleRemoveCard = (cardId) => {
    const idx = deckCards.findIndex(c => c.id === cardId);
    if (idx === -1) return;
    const newDeck = [...deckCards];
    newDeck.splice(idx, 1);
    setDeckCards(newDeck);
    // 若封面卡已不在牌組中，改指向剩餘的第一隻寶可夢，否則清除
    if (coverCardId && !newDeck.some(c => c.id === coverCardId)) {
      const fallback = newDeck.find(c => c.type === CardTypes.POKEMON);
      setCoverCardId(fallback ? fallback.id : null);
    }
  };

  const handleClear = () => {
    if (window.confirm('確定要清空當前牌組嗎？')) {
      setDeckCards([]);
      setCurrentDeckId(null);
    }
  };

  const handleLoadDeck = (deck) => {
    const loadedCards = deck.cardIds.map(id => allCards.find(c => c.id === id)).filter(Boolean);
    setDeckCards(loadedCards);
    setCurrentDeckId(deck.deckId);
    setShowLoadModal(false);
    showToast(`已讀取牌組：${deck.deckName}`);
  };

  const handleAutoBuild = () => {
    if (deckCards.length > 0) {
      if (!window.confirm('智能組牌會清空目前的牌組，確定要繼續嗎？')) return;
    }
    
    // 智能組牌視為全新的一副牌
    setCurrentDeckId(null);

    const deckTypes = [
      {
        type: 'fire',
        energy: 'e-fire',
        chain: ['p-001', 'p-001', 'p-001', 'p-001', 'p-001-ev1', 'p-001-ev1', 'p-001-ev1', 'p-001-ev2', 'p-001-ev2']
      },
      {
        type: 'water',
        energy: 'e-water',
        chain: ['p-002', 'p-002', 'p-002', 'p-002', 'p-002-ev1', 'p-002-ev1', 'p-002-ev1', 'p-002-ev2', 'p-002-ev2']
      },
      {
        type: 'grass',
        energy: 'e-grass',
        chain: ['p-003', 'p-003', 'p-003', 'p-003', 'p-003-ev1', 'p-003-ev1', 'p-003-ev1', 'p-003-ev2', 'p-003-ev2']
      }
    ];

    const randomTheme = deckTypes[Math.floor(Math.random() * deckTypes.length)];
    
    // 組裝：9 張主軸寶可夢 + 1 張卡比獸 + 12 張基本能量 + 5 張好用的道具/支援者
    const targetCardIds = [
      ...randomTheme.chain,
      'p-143', // 1x 卡比獸
      ...Array(12).fill(randomTheme.energy), // 12x 基本能量
      't-pokeball', 't-pokeball', // 2x 精靈球
      't-prof', // 1x 大木博士
      't-boss', // 1x 老大的指令
      't-potion' // 1x 傷藥
    ];

    const newDeck = targetCardIds.map(id => allCards.find(c => c.id === id)).filter(Boolean);
    
    setDeckCards(newDeck);
    setCoverCardId(randomTheme.chain[randomTheme.chain.length - 1]); // 用最高階進化當封面
    showToast(`已為您智能組裝一套完整的【${randomTheme.type === 'fire' ? '火' : randomTheme.type === 'water' ? '水' : '草'}】屬性牌組！`);
  };

  const handleSave = () => {
    if (deckCards.length !== 27) return;
    // 牌組至少需要一隻基礎寶可夢，否則對戰時無法放置戰鬥區寶可夢
    const hasBasicPokemon = deckCards.some(c => c.type === CardTypes.POKEMON && !c.evolvesFrom);
    if (!hasBasicPokemon) {
      showToast('牌組至少需要一隻基礎寶可夢！');
      return;
    }
    const defaultName = currentDeckId
      ? decks.find(d => d.deckId === currentDeckId)?.deckName || '我的新牌組'
      : '我的新牌組';
    setSaveName(defaultName);
    setShowSaveModal(true);
  };

  const confirmSave = () => {
    const deckName = saveName.trim();
    if (!deckName) return;

    const cardIds = deckCards.map(c => c.id);
    if (currentDeckId) {
      updateDeck(currentDeckId, deckName, cardIds);
    } else {
      const newDeckId = Date.now();
      createDeck(deckName, cardIds, newDeckId);
      setCurrentDeckId(newDeckId);
    }
    setShowSaveModal(false);
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

      {showLoadModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#1f2937', padding: '20px', borderRadius: '12px', width: '400px', maxWidth: '90%', color: 'white' }}>
            <h2 style={{ marginTop: 0 }}>讀取牌組</h2>
            {decks.length === 0 ? (
              <p style={{ color: 'gray' }}>您尚未儲存任何牌組。</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                {decks.map(deck => (
                  <button 
                    key={deck.deckId} 
                    onClick={() => handleLoadDeck(deck)}
                    style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', cursor: 'pointer', textAlign: 'left' }}
                  >
                    {deck.deckName} ({deck.cardIds.length} 張)
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setShowLoadModal(false)} style={{ marginTop: '20px', width: '100%', padding: '10px', background: 'transparent', color: 'white', border: '1px solid gray', borderRadius: '8px', cursor: 'pointer' }}>取消</button>
          </div>
        </div>
      )}

      {showSaveModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#1f2937', padding: '20px', borderRadius: '12px', width: '400px', maxWidth: '90%', color: 'white' }}>
            <h2 style={{ marginTop: 0 }}>儲存牌組</h2>
            <input
              autoFocus
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') confirmSave(); }}
              placeholder="請為您的牌組命名"
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem' }}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowSaveModal(false)} style={{ flex: 1, padding: '10px', background: 'transparent', color: 'white', border: '1px solid gray', borderRadius: '8px', cursor: 'pointer' }}>取消</button>
              <button onClick={confirmSave} disabled={!saveName.trim()} style={{ flex: 1, padding: '10px', background: saveName.trim() ? '#22c55e' : 'gray', color: 'white', border: 'none', borderRadius: '8px', cursor: saveName.trim() ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>確定儲存</button>
            </div>
          </div>
        </div>
      )}

      <CardLibrary
        allCards={allCards}
        onAddCard={handleAddCard} 
        onInspectCard={setInspectCard} 
        deckCount={deckCards.length}
      />
      
      <div style={{ flex: 4, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '10px', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => setShowLoadModal(true)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}>
            📁 讀取牌組
          </button>
        </div>
        <DeckList 
          deckCards={deckCards} 
          onRemoveCard={handleRemoveCard} 
          onSave={handleSave} 
          onClear={handleClear}
          onAutoBuild={handleAutoBuild}
          onCoverSelect={setCoverCardId}
          coverCardId={coverCardId}
        />
      </div>

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
