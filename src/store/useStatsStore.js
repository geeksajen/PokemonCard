import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 生涯戰績（持久化）：勝/負/總場、各屬性使用次數、近期歷史紀錄。
// recordResult 於每場對戰結束時呼叫一次（由 BattlePage 注入）。
export const useStatsStore = create(
  persist(
    (set) => ({
      wins: 0,
      losses: 0,
      games: 0,
      elementCounts: {}, // energyType -> 使用場數（用於「最愛屬性徽章」）
      history: [],       // [{ result, element, opponent, winReason, at }]，新→舊，上限 50

      recordResult: ({ won, element = null, opponent = '對手', winReason = null }) =>
        set((s) => {
          const elementCounts = { ...s.elementCounts };
          if (element) elementCounts[element] = (elementCounts[element] || 0) + 1;
          const entry = { result: won ? 'win' : 'loss', element, opponent, winReason, at: Date.now() };
          return {
            wins: s.wins + (won ? 1 : 0),
            losses: s.losses + (won ? 0 : 1),
            games: s.games + 1,
            elementCounts,
            history: [entry, ...s.history].slice(0, 50),
          };
        }),

      resetStats: () =>
        set({ wins: 0, losses: 0, games: 0, elementCounts: {}, history: [] }),
    }),
    {
      name: 'stats-storage',
    }
  )
);
