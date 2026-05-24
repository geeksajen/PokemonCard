// ============================================================
//  Pokemon Theme Pack — Aggregate Export
//  此檔將 pack 的所有資料彙整成單一 default export，
//  方便 src/themes/active.js 一鍵載入。
// ============================================================
import { packMeta } from './pack.meta';
import { cardDatabase } from './cards';
import { themeMap, buildComposition } from './decks';
import { starterDecks, customDeckColor } from './starter-decks';
import { aceShowcase, defaultAceKey } from './ace-showcase';

const pokemonPack = {
  ...packMeta,
  cardDatabase,
  themeMap,
  buildComposition,
  starterDecks,
  customDeckColor,
  aceShowcase,
  defaultAceKey,
};

export default pokemonPack;
