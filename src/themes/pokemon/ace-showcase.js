// ============================================================
//  Pokemon Theme Pack — Ace Showcase (HomePage 主視覺)
//  HomePage 中央展示的當家寶可夢清單。
//  glow：角色背後光暈色（rgba）。
// ============================================================

export const aceShowcase = {
  fire:     { name: '噴火龍', image: '/images/charizard.png',  glow: 'rgba(239, 68, 68, 0.45)' },
  water:    { name: '水箭龜', image: '/images/blastoise.png',  glow: 'rgba(59, 130, 246, 0.45)' },
  grass:    { name: '妙蛙花', image: '/images/venusaur.png',   glow: 'rgba(34, 197, 94, 0.45)' },
  electric: { name: '雷丘',   image: '/images/raichu.png',     glow: 'rgba(234, 179, 8, 0.45)' },
};

// 預設顯示哪一隻
export const defaultAceKey = 'fire';
