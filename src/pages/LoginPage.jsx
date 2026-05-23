import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';

function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuthStore();
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    if (isLogin) {
      login(username);
    } else {
      register(username);
    }

    navigate('/');
  };

  return (
    <div className="login-page" style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>{isLogin ? '登入' : '註冊'}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="使用者名稱"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ display: 'block', width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        <button
          type="submit"
          style={{
            display: 'block',
            width: '100%',
            padding: '0.5rem',
            marginBottom: '1rem',
            cursor: 'pointer',
          }}
        >
          {isLogin ? '登入' : '註冊'}
        </button>
      </form>
      <button
        onClick={() => setIsLogin(!isLogin)}
        style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'blue' }}
      >
        {isLogin ? '還沒有帳戶？註冊' : '已有帳戶？登入'}
      </button>
    </div>
  );
}

export default LoginPage;
