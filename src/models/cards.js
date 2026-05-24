// ============================================================
//  Card Engine (theme-agnostic)
//  此檔只放：型別 enum、實例 id 產生器、稀有度設定、組牌演算法。
//  寶可夢專屬內容已遷移至 src/themes/pokemon/，由 src/themes/active.js
//  決定當前載入哪一個主題包。換主題 = 改 active.js 一行。
// ============================================================
import { CardTypes, EnergyTypes } from './cardTypes';
import { activePack } from '../themes/active';

// 對外維持原本 import 路徑能 work（向後相容）
export { CardTypes, EnergyTypes };

// ---- 實例 ID 產生器 -------------------------------------------------------
// 全域單調遞增計數器，避免同一 tick 內 Date.now() 重複導致 instanceId 碰撞
let _instanceSeq = 0;
export const newInstanceId = (prefix) => `${prefix}-${++_instanceSeq}`;

// ---- 卡牌資料庫（來自 active pack）---------------------------------------
export const cardDatabase = activePack.cardDatabase;

// ---- 卡片實例化 -----------------------------------------------------------
const defaultInstantiate = (cardId) => {
  const card = cardDatabase[cardId];
  return {
    ...card,
    instanceId: newInstanceId(cardId),
    ...(card.type === CardTypes.POKEMON && { attachedEnergy: [], currentHp: card.maxHp })
  };
};

let customInstantiator = null;

export const setCardInstantiator = (instantiator) => {
  customInstantiator = instantiator;
};

const getInstantiator = () => customInstantiator || defaultInstantiate;

// ---- 主題牌組產生 ---------------------------------------------------------
// 演算法是引擎共通的：拿主題對應的卡片組成清單，依數量實例化、洗牌。
// 「組成清單」由 active pack 提供（themeMap + buildComposition）。
export const generateThemeDeck = (theme) => {
  const themeEntry =
    activePack.themeMap[theme] ||
    activePack.themeMap[Object.keys(activePack.themeMap)[0]];
  const composition = activePack.buildComposition(themeEntry);
  const deck = [];
  const instantiator = getInstantiator();
  for (const { id, count } of composition) {
    for (let i = 0; i < count; i++) deck.push(instantiator(id));
  }
  return deck.sort(() => Math.random() - 0.5);
};

// ---- 稀有度設定表 ---------------------------------------------------------
// 集中管理卡牌的所有視覺稀有度屬性。
// 新增稀有度等級：在此加一筆，Card.jsx / CardInspectModal.jsx 自動生效。
// 欄位說明：
//   background    — 卡面主漸層（null → Card.jsx 改用 getEnergyColor）
//   border        — 卡框邊線
//   badge         — Card.jsx 右側角標（null = 不顯示；basic 不顯示角標）
//   stageBadge    — CardInspectModal 的階段標籤（Pokemon 限定；null = 非 Pokemon）
//   cardShadow    — Card.jsx 的 box-shadow（normal / selected 兩態）
//   inspectShadow — CardInspectModal 外框光暈
//   foil          — 是否啟用閃卡反光（Pretask 3 / Feature ① 預留旗標）
// 色彩全部走 --palette-class-* tokens；rgba 變體用 color-mix() 合成。
// 主題包只需覆寫 :root 的 --palette-class-* token，這份設定就會跟著換皮。
const RARITY_CONFIG = {
  basic: {
    background:    'var(--palette-class-basic)',
    border:        'none',
    badge:         null,
    stageBadge:    { label: '基礎',     gradient: 'linear-gradient(90deg, #64748b, #94a3b8)', textShadow: 'none' },
    cardShadow:    { normal: 'var(--card-shadow)', selected: 'var(--card-shadow-hover)' },
    inspectShadow: 'var(--theme-shadow)',
    foil:          false,
  },
  stage1: {
    background:    'var(--palette-class-stage1)',
    border:        '1px solid color-mix(in srgb, var(--palette-class-stage1-accent) 50%, transparent)',
    badge:         { label: '進化', background: 'var(--palette-class-stage1-accent)', color: '#000', textShadow: 'none' },
    stageBadge:    { label: '一階進化', gradient: 'linear-gradient(90deg, var(--palette-class-stage1-mid), var(--palette-class-stage1-accent))', textShadow: 'none' },
    cardShadow:    {
      normal:   'inset 0 0 10px color-mix(in srgb, var(--palette-class-stage1-accent) 40%, transparent)',
      selected: '0 0 20px color-mix(in srgb, var(--palette-class-stage1-accent) 60%, transparent)',
    },
    inspectShadow: '0 0 30px color-mix(in srgb, var(--palette-class-stage1-accent) 50%, transparent), var(--theme-shadow)',
    foil:          true,
  },
  stage2: {
    background:    'var(--palette-class-stage2)',
    border:        '2px solid color-mix(in srgb, var(--palette-class-stage2-accent) 80%, transparent)',
    badge:         {
      label: '二階',
      background: 'linear-gradient(90deg, var(--palette-class-stage2-accent2), var(--palette-class-stage2-accent))',
      color: '#000',
      textShadow: '0 0 2px rgba(255,255,255,0.8)',
    },
    stageBadge:    {
      label: '二階進化',
      gradient: 'linear-gradient(90deg, var(--palette-class-stage2-accent2), var(--palette-class-stage2-accent))',
      textShadow: '0 0 3px rgba(255,255,255,0.6)',
    },
    cardShadow:    {
      normal:   'inset 0 0 15px color-mix(in srgb, var(--palette-class-stage2-accent2) 60%, transparent)',
      selected: '0 0 25px color-mix(in srgb, var(--palette-class-stage2-accent2) 80%, transparent), 0 0 10px color-mix(in srgb, var(--palette-class-stage2-accent) 60%, transparent)',
    },
    inspectShadow: '0 0 40px color-mix(in srgb, var(--palette-class-stage2-accent2) 60%, transparent), 0 0 80px color-mix(in srgb, var(--palette-class-stage2-accent) 30%, transparent), var(--theme-shadow)',
    foil:          true,
  },
  energy: {
    background:    null,
    border:        'none',
    badge:         null,
    stageBadge:    null,
    cardShadow:    { normal: 'var(--card-shadow)', selected: 'var(--card-shadow-hover)' },
    inspectShadow: 'var(--theme-shadow)',
    foil:          false,
  },
  trainer: {
    background:    'var(--palette-class-trainer)',
    border:        'none',
    badge:         null,
    stageBadge:    null,
    cardShadow:    { normal: 'var(--card-shadow)', selected: 'var(--card-shadow-hover)' },
    inspectShadow: 'var(--theme-shadow)',
    foil:          false,
  },
  item: {
    background:    'var(--palette-class-item)',
    border:        'none',
    badge:         null,
    stageBadge:    null,
    cardShadow:    { normal: 'var(--card-shadow)', selected: 'var(--card-shadow-hover)' },
    inspectShadow: 'var(--theme-shadow)',
    foil:          false,
  },
};

// 回傳指定卡牌的稀有度設定物件（唯一查詢入口）。
// 未來若新增卡種或分級，只需更新 RARITY_CONFIG 與這裡的分派邏輯。
export const getCardRarity = (card) => {
  if (!card)                          return RARITY_CONFIG.basic;
  if (card.type === CardTypes.ENERGY)  return RARITY_CONFIG.energy;
  if (card.type === CardTypes.TRAINER) return RARITY_CONFIG.trainer;
  if (card.type === CardTypes.ITEM)    return RARITY_CONFIG.item;
  if (card.stage === 2)                return RARITY_CONFIG.stage2;
  if (card.stage === 1)                return RARITY_CONFIG.stage1;
  return RARITY_CONFIG.basic;
};
