import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCardStore = create(
  persist(
    (set) => ({
      customCards: [],
      decks: [],
      selectedDeckId: null, // 玩家當前選定的出戰牌組（大廳王牌看板/牌盒輪播用）

      setSelectedDeck: (deckId) => set({ selectedDeckId: deckId }),

      addCustomCard: (card) =>
        set((state) => ({
          customCards: [...state.customCards, { ...card, customId: Date.now() }],
        })),

      updateCustomCard: (customId, updates) =>
        set((state) => ({
          customCards: state.customCards.map((card) =>
            card.customId === customId ? { ...card, ...updates } : card
          ),
        })),

      deleteCustomCard: (customId) =>
        set((state) => ({
          customCards: state.customCards.filter((card) => card.customId !== customId),
        })),

      createDeck: (deckName, cardIds, deckId = Date.now(), coverCardId = null) =>
        set((state) => ({
          decks: [
            ...state.decks,
            {
              deckId,
              deckName,
              cardIds,
              coverCardId,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateDeck: (deckId, deckName, cardIds, coverCardId = null) =>
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.deckId === deckId ? { ...deck, deckName, cardIds, coverCardId } : deck
          ),
        })),

      deleteDeck: (deckId) =>
        set((state) => ({
          decks: state.decks.filter((deck) => deck.deckId !== deckId),
        })),

      getCustomCardsCount: () => (state) => state.customCards.length,
      getDecksCount: () => (state) => state.decks.length,
    }),
    {
      name: 'card-storage',
    }
  )
);
