import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      isLoggedIn: false,
      currentUser: null,

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
      storage: typeof window !== 'undefined' ? localStorage : undefined,
    }
  )
);
