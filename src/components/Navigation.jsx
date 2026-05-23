import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store';

function Navigation() {
  const { isLoggedIn, currentUser, logout } = useAuthStore();

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: '#f0f0f0',
      borderBottom: '1px solid #ccc',
    }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>🏠 大廳</Link>
        {isLoggedIn && (
          <>
            <Link to="/studio" style={{ textDecoration: 'none' }}>🎨 卡牌工坊</Link>
            <Link to="/profile" style={{ textDecoration: 'none' }}>👤 會員中心</Link>
          </>
        )}
      </div>
      <div>
        {isLoggedIn ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>歡迎 {currentUser?.username}</span>
            <button
              onClick={() => logout()}
              style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
            >
              登出
            </button>
          </div>
        ) : (
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>登入</button>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navigation;
