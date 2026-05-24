// ============================================================
//  Active Theme Pack
//  目前載入哪一個主題包。換主題只要改這一個 import。
//  未來若需 runtime 切換，可加入 usePackStore 並讓此檔讀 store。
// ============================================================
import pokemonPack from './pokemon';

export const activePack = pokemonPack;
