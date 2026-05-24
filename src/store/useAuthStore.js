import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      isLoggedIn: true,
      currentUser: {
        id: 999,
        username: '測試玩家',
        createdAt: new Date().toISOString(),
      },

      login: (username) =>
        set({
          isLoggedIn: true,
          currentUser: {
            id: Date.now(),
            username,
            createdAt: new Date().toISOString(),
          },
        }),

      logout: () =>
        set({
          isLoggedIn: false,
          currentUser: null,
        }),

      register: (username) =>
        set({
          isLoggedIn: true,
          currentUser: {
            id: Date.now(),
            username,
            createdAt: new Date().toISOString(),
          },
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
