# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Start Vite dev server (browser)
npm run build:web     # Build for web
npm run build:electron  # Build and package as Windows Electron app (release/)
npm run lint          # Run ESLint
```

There are no unit tests configured in this project.

## Architecture

This is a local-multiplayer TCG engine built with React + Vite, packaged as an Electron desktop app. The engine is **decoupled from its content** — Pokémon is the default theme pack, but the game logic does not know about Pokémon. See [`spec/engine_theme_separation.md`](spec/engine_theme_separation.md).

**App flow:** `App.jsx` holds top-level state (`lobby` | `playing`). Lobby lets players pick deck themes; GameArena runs the game.

**Layer separation — this is the key design pattern:**

- `src/game/rules.js` — Pure game logic only. All functions take `(state, ...args)` and return `{ ok, state }` or `{ ok, error }`. Uses `structuredClone` for immutability. No React, no side effects, no audio.
- `src/hooks/useGameEngine.js` — Orchestration layer. Calls rules.js functions, applies results to React state, triggers sound effects, manages animation state (`damageAnim`, `attackAnim`, `faintAnim`, `drawnCardAnim`), and shows toasts. All game-related state lives here.
- `src/components/GameArena.jsx` — Renders the full arena by consuming `useGameEngine`. Holds only pure UI toggles (`showSettings`, `showLog`).
- `src/components/arena/` — Sub-components: `Board`, `HudOverlay`, `PilePair`, `SettingsModal`, `LogDrawer`, `TurnTransition`, `DeckSearchModal`, `WinnerScreen`.

**Data models (engine layer — theme-agnostic):**

- `src/models/cardTypes.js` — Engine enums (`CardTypes`, `EnergyTypes`). Standalone to avoid circular deps with theme packs.
- `src/models/cards.js` — Engine core: `newInstanceId`, `defaultInstantiate`, `setCardInstantiator`, `generateThemeDeck` algorithm, `RARITY_CONFIG`, `getCardRarity`. Re-exports `cardDatabase` and pack-specific data from the active theme pack.
- `src/models/gameState.js` — `createInitialGameState(p1Theme, p2Theme)` builds the initial state tree. Default themes are derived from `activePack.themeMap` so the engine works with any pack.

**Theme packs (content layer):**

- `src/themes/active.js` — selects which theme pack is loaded. Swap the import to re-skin the game.
- `src/themes/pokemon/` — the default Pokémon TCG pack (cards, theme→deck mapping, starter decks UI, HomePage ace showcase).
- `src/themes/fantasy/` — stub pack proving engine/content decoupling.
- See [`src/themes/README.md`](src/themes/README.md) for the pack contract.

**Visual theme system (CSS layer):**

- 4-layer token architecture in `src/index.css`: `--theme-*` (UI chrome, dark/light), `--palette-*` (player/element/card-class colors), `--page-*` (HomePage/SetupPage atmospheres).
- `src/store/useThemeStore.js` — Zustand store + persist for dark/light toggle.

**Turn-per-action limits:** `hasAttachedEnergyThisTurn` and `hasAttackedThisTurn` are boolean flags on `gameState`, reset by `endTurnState()` in rules.js.

**Win conditions (in `resolveKnockout`):** attacker's prizes reach 0, or opponent has no bench to promote after KO.

**Deck themes (Pokémon pack):** `fire`, `water`, `grass`, `electric` — each maps to a basic Pokémon, its Stage 1 evolution, and matching energy cards. Other packs may define different theme keys.

**Audio:** `src/utils/sounds.js` — Web Audio API sounds. BGM is muted by default; SFX is on. `AudioSettings.sfxMuted` is a module-level flag toggled by `useGameEngine`.
