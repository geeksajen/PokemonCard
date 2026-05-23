import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useCardStore } from '../store';

function ProfilePage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuthStore();
  const { decks } = useCardStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!currentUser) {
    return (
      <div style={{ padding: '2rem' }}>
        <p>請先登入</p>
        <button onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>
          前往登入
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page" style={{ padding: '2rem' }}>
      <h1>會員中心</h1>
      <div style={{ marginBottom: '2rem' }}>
        <h2>使用者資訊</h2>
        <p>名稱: {currentUser.username}</p>
        <p>ID: {currentUser.id}</p>
        <p>加入時間: {new Date(currentUser.createdAt).toLocaleDateString()}</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>牌組管理 ({decks.length})</h2>
        <ul>
          {decks.map((deck) => (
            <li key={deck.deckId}>
              {deck.deckName} - {deck.cardIds.length} 張卡牌
            </li>
          ))}
        </ul>
      </div>

      <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
        登出
      </button>
    </div>
  );
}

export default ProfilePage;
