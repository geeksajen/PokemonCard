import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCardStore } from '../../store';
import { cardRepository } from '../../api/CardRepository';
import { CardTypes } from '../../models/cards';
import { decodeDeck } from '../../utils/deckCode';
import '../../studio.css';

function DeckListPage() {
  const navigate = useNavigate();
  const { decks, deleteDeck, createDeck } = useCardStore();
  const allCards = useMemo(() => cardRepository.getAllCards(), []);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // 一鍵複製：以原牌組內容建立「(原名) - 副本」，供安心微調實驗
  const handleDuplicate = (deck) => {
    createDeck(`${deck.deckName} - 副本`, [...deck.cardIds], Date.now(), deck.coverCardId);
    showToast(`已複製「${deck.deckName}」`);
  };

  // 從分享代碼匯入：解析後僅保留目前卡庫存在的卡，建立新牌組並進入編輯
  const handleImport = () => {
    const code = window.prompt('貼上牌組分享代碼：');
    if (!code) return;
    const decoded = decodeDeck(code);
    if (!decoded) {
      showToast('無效的牌組代碼！');
      return;
    }
    const validIds = decoded.cardIds.filter((id) => allCards.some((c) => c.id === id));
    if (validIds.length === 0) {
      showToast('代碼中沒有可用的卡牌！');
      return;
    }
    const newId = Date.now();
    createDeck(`${decoded.name} (匯入)`, validIds, newId, null);
    navigate(`/studio/edit/${newId}`);
  };

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
      {toast && <div className="studio-toast">{toast}</div>}

      <div className="deck-list-page-header">
        <h1>卡牌工坊 <span>/ 我的牌組</span></h1>
      </div>

      <div className="deck-grid">
        <div className="deck-card create-new" onClick={() => navigate('/studio/new')}>
          <div className="create-new-icon">➕</div>
          <div className="create-new-label">建立新牌組</div>
        </div>

        <div className="deck-card create-new" onClick={handleImport}>
          <div className="create-new-icon">📥</div>
          <div className="create-new-label">從代碼匯入</div>
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
                  className="deck-card-btn duplicate"
                  onClick={() => handleDuplicate(deck)}
                  title="複製為副本"
                >
                  複製
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
