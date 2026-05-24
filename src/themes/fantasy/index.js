import { packMeta } from './pack.meta';
import { cardDatabase } from './cards';
import { themeMap, buildComposition } from './decks';
import { starterDecks, customDeckColor } from './starter-decks';
import { aceShowcase, defaultAceKey } from './ace-showcase';

const fantasyPack = {
  ...packMeta,
  cardDatabase,
  themeMap,
  buildComposition,
  starterDecks,
  customDeckColor,
  aceShowcase,
  defaultAceKey,
};

export default fantasyPack;
