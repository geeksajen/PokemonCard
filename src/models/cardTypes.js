// ============================================================
//  Card Types & Element Slots — Engine Enums
//  獨立檔案以避免 models/cards.js ↔ themes/* 之間的循環引用問題。
//  此檔不應依賴任何 theme/pack 內容。
// ============================================================

// 卡片大類別
export const CardTypes = {
  POKEMON: 'pokemon',
  ENERGY:  'energy',
  TRAINER: 'trainer', // 支援者：每回合行動受限的強力效果
  ITEM:    'item'     // 物品：可自由使用的輔助道具
};

// 屬性槽（七槽 + 通用槽）
// 槽位 ID 雖然取了寶可夢風格的英文名，但對引擎而言只是不透明字串 key。
// 主題包可以重新映射 FIRE 為「火焰魔法」、ELECTRIC 為「閃電法術」等。
export const EnergyTypes = {
  FIRE:     'fire',
  WATER:    'water',
  GRASS:    'grass',
  ELECTRIC: 'electric',
  PSYCHIC:  'psychic',
  FIGHTING: 'fighting',
  NORMAL:   'normal'
};
