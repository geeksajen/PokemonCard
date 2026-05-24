import React from 'react';
import { useThemeStore } from '../store';

function ThemeToggle({ style }) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      className="btn-ghost"
      onClick={toggleTheme}
      title={isDark ? '切換為淺色主題' : '切換為深色主題'}
      aria-label="切換主題"
      style={{ padding: '6px 12px', fontSize: '1.1rem', lineHeight: 1, ...style }}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}

export default ThemeToggle;
