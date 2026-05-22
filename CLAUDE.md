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

This is a local-multiplayer Pokémon card game built with React + Vite, packaged as an Electron desktop app.

**App flow:** `App.jsx` holds top-level state (`lobby` | `playing`). Lobby lets players pick deck themes; GameArena runs the game.

**Layer separation — this is the key design pattern:**

- `src/game/rules.js` — Pure game logic only. All functions take `(state, ...args)` and return `{ ok, state }` or `{ ok, error }`. Uses `structuredClone` for immutability. No React, no side effects, no audio.
- `src/hooks/useGameEngine.js` — Orchestration layer. Calls rules.js functions, applies results to React state, triggers sound effects, manages animation state (`damageAnim`, `attackAnim`, `faintAnim`, `drawnCardAnim`), and shows toasts. All game-related state lives here.
- `src/components/GameArena.jsx` — Renders the full arena by consuming `useGameEngine`. Holds only pure UI toggles (`showSettings`, `showLog`).
- `src/components/arena/` — Sub-components: `Board`, `HudOverlay`, `PilePair`, `SettingsModal`, `LogDrawer`, `TurnTransition`, `DeckSearchModal`, `WinnerScreen`.

**Data models:**

- `src/models/cards.js` — `cardDatabase` (static card definitions), `generateThemeDeck(theme)` produces a 20-card shuffled deck. Each card instance gets a unique `instanceId` at deck generation time.
- `src/models/gameState.js` — `createInitialGameState(p1Theme, p2Theme)` builds the initial state tree: `{ turn, currentPlayer, winner, hasAttachedEnergyThisTurn, hasAttackedThisTurn, logs, players: { player1, player2 } }`. Each player has `deck`, `hand`, `activePokemon`, `bench` (max 3), `discardPile`, `prizes` (starts at 3).

**Turn-per-action limits:** `hasAttachedEnergyThisTurn` and `hasAttackedThisTurn` are boolean flags on `gameState`, reset by `endTurnState()` in rules.js.

**Win conditions (in `resolveKnockout`):** attacker's prizes reach 0, or opponent has no bench to promote after KO.

**Deck themes:** `fire`, `water`, `grass`, `electric` — each maps to a basic Pokémon, its Stage 1 evolution, and matching energy cards.

**Audio:** `src/utils/sounds.js` — Web Audio API sounds. BGM is muted by default; SFX is on. `AudioSettings.sfxMuted` is a module-level flag toggled by `useGameEngine`.
