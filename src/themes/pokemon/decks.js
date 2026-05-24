// ============================================================
//  Pokemon Theme Pack — Deck Composition
//  themeMap：每個主題的進化線與能量卡配對。
//  buildComposition：把 theme 物件轉成 [{ id, count }] 牌組組成。
//  generateThemeDeck 演算法本身住在 src/models/cards.js（引擎層），
//  此檔僅提供「主題→組成」的資料。
// ============================================================

export const themeMap = {
  fire:     { basic: 'p-001', ev1: 'p-001-ev1', ev2: 'p-001-ev2', energy: 'e-fire' },
  water:    { basic: 'p-002', ev1: 'p-002-ev1', ev2: 'p-002-ev2', energy: 'e-water' },
  grass:    { basic: 'p-003', ev1: 'p-003-ev1', ev2: 'p-003-ev2', energy: 'e-grass' },
  electric: { basic: 'p-004', ev1: 'p-004-ev1',                   energy: 'e-electric' },
  psychic:  { basic: 'p-150',                                     energy: 'e-psychic' },
  fighting: { basic: 'p-066',                                     energy: 'e-fighting' },
  normal:   { basic: 'p-143',                                     energy: 'e-normal' },
};

export const buildComposition = (t) => [
  { id: t.basic, count: t.ev1 ? 6 : 9 },
  ...(t.ev1 ? [{ id: t.ev1, count: 3 }] : []),
  ...(t.ev2 ? [{ id: t.ev2, count: 2 }] : []),
  { id: t.energy,        count: 6 },
  { id: 't-potion',      count: 1 },
  { id: 'i-hyperpotion', count: 1 },
  { id: 'i-switch',      count: 1 },
  { id: 't-pokeball',    count: 1 },
  { id: 'i-greatball',   count: 1 },
  { id: 't-prof',        count: 2 },
  { id: 'i-rarecandy',   count: 1 },
  { id: 'i-escaperope',  count: 1 },
  { id: 't-boss',        count: 1 },
];
