import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCardStore } from '../../store';
import { cardRepository } from '../../api/CardRepository';
import { CardTypes } from '../../models/cards';
import '../../studio.css';

function DeckListPage() {
  const navigate = useNavigate();
  const { decks, deleteDeck } = useCardStore();
  const allCards = useMemo(() => cardRepository.getAllCards(), []);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const resolveCover = (deck) => {
    const coverId =
      deck.coverCardId ||
      deck.cardIds.find((id) => {
        const c = allCards.find((card) => card.id === id);
        return c && c.type === CardTypes.POKEMON;
      });
    const cover = coverId ? allCards.find((c) => c.id === coverId) : null;
    return cover ? cover.image : null;
  };

  return (
    <div className="deck-list-page">
      <div className="deck-list-page-header">
        <h1>卡牌工坊 <span>/ 我的牌組</span></h1>
      </div>

      <div className="deck-grid">
        <div className="deck-card create-new" onClick={() => navigate('/studio/new')}>
          <div className="create-new-icon">➕</div>
          <div className="create-new-label">建立新牌組</div>
        </div>

        {decks.map((deck) => {
          const coverUrl = resolveCover(deck);
          const isFull = deck.cardIds.length === 27;
          return (
            <div
              key={deck.deckId}
              className="deck-card"
              onClick={() => navigate(`/studio/edit/${deck.deckId}`)}
            >
              <div
                className="deck-card-cover"
                style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : undefined}
              >
                {!coverUrl && <span className="deck-card-cover-placeholder">🂠</span>}
              </div>
              <div className="deck-card-info">
                <div className="deck-card-name">{deck.deckName}</div>
                <div className={`deck-card-count ${isFull ? 'full' : 'partial'}`}>
                  {deck.cardIds.length} / 27 張
                </div>
              </div>
              <div className="deck-card-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="deck-card-btn edit"
                  onClick={() => navigate(`/studio/edit/${deck.deckId}`)}
                >
                  編輯
                </button>
                <button
                  className="deck-card-btn delete"
                  onClick={() => setConfirmDeleteId(deck.deckId)}
                >
                  刪除
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {confirmDeleteId !== null && (
        <div className="studio-modal-overlay">
          <div className="studio-modal">
            <h2>刪除牌組</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>
              確定要刪除「{decks.find((d) => d.deckId === confirmDeleteId)?.deckName}」嗎？此操作無法復原。
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                className="studio-modal-btn cancel"
                onClick={() => setConfirmDeleteId(null)}
              >
                取消
              </button>
              <button
                className="studio-modal-btn danger"
                onClick={() => {
                  deleteDeck(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
              >
                確定刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeckListPage;
