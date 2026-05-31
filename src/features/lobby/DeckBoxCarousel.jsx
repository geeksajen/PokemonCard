import React from 'react';
import './lobby.css';

// 立體「牌盒」輪播選擇器（取代純文字列表）。
// options：[{ id, name, boxColor, emoji }]；selectedId / onSelect 由父層控制。
// 以 CSS perspective + rotateY 做 coverflow：選中者置中放大、盒蓋微掀，兩側傾斜淡出。
const DeckBoxCarousel = ({ options, selectedId, onSelect }) => {
  if (!options || options.length === 0) return null;
  const index = Math.max(0, options.findIndex((o) => o.id === selectedId));
  const go = (dir) => {
    const next = (index + dir + options.length) % options.length;
    onSelect(options[next].id);
  };

  return (
    <div className="deckbox-carousel">
      <button className="deckbox-arrow" onClick={() => go(-1)} aria-label="上一個牌組">‹</button>

      <div className="deckbox-stage">
        {options.map((o, i) => {
          const offset = i - index;
          if (Math.abs(offset) > 2) return null; // 只渲染鄰近 ±2
          const isActive = offset === 0;
          return (
            <div
              key={o.id}
              className={`deckbox ${isActive ? 'active' : ''}`}
              onClick={() => onSelect(o.id)}
              style={{
                transform: `translateX(${offset * 58}%) rotateY(${offset * -38}deg) scale(${isActive ? 1 : 0.82})`,
                opacity: Math.abs(offset) > 1 ? 0.35 : isActive ? 1 : 0.65,
                zIndex: 10 - Math.abs(offset),
                filter: isActive ? 'none' : 'brightness(0.7)',
              }}
            >
              <div className="deckbox-face" style={{ background: o.boxColor }}>
                <div className="deckbox-lid" />
                <span className="deckbox-emoji">{o.emoji}</span>
                <span className="deckbox-name">{o.name}</span>
              </div>
            </div>
          );
        })}
      </div>

      <button className="deckbox-arrow" onClick={() => go(1)} aria-label="下一個牌組">›</button>
    </div>
  );
};

export default DeckBoxCarousel;
