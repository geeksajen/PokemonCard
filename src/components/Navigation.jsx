import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store';

function Navigation() {
  const { isLoggedIn, currentUser, logout } = useAuthStore();

  return (
    <nav className="main-nav">
      <div className="main-nav-links">
        <Link to="/">🏠 大廳</Link>
        {isLoggedIn && (
          <>
            <Link to="/studio">🎨 卡牌工坊</Link>
            <Link to="/profile">👤 會員中心</Link>
          </>
        )}
      </div>
      <div className="main-nav-right">
        {isLoggedIn ? (
          <>
            <span className="main-nav-user">歡迎 {currentUser?.username}</span>
            <button className="btn-ghost" onClick={() => logout()} style={{ padding: '6px 16px', fontSize: '0.9rem' }}>
              登出
            </button>
          </>
        ) : (
          <Link to="/login">
            <button className="btn-ghost" style={{ padding: '6px 16px', fontSize: '0.9rem' }}>登入</button>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navigation;
