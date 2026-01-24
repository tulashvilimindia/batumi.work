/**
 * RecentSearches Store - V5 Feature
 * Track last 5 search queries with localStorage persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const MAX_RECENT_SEARCHES = 5;
const STORAGE_KEY = 'v5-recent-searches';

interface RecentSearchesState {
  recentSearches: string[];
}

interface RecentSearchesActions {
  addSearch: (query: string) => void;
  removeSearch: (query: string) => void;
  clearAll: () => void;
}

type RecentSearchesStore = RecentSearchesState & RecentSearchesActions;

export const useRecentSearchesStore = create<RecentSearchesStore>()(
  persist(
    (set, get) => ({
      recentSearches: [],

      addSearch: (query: string) => {
        const trimmed = query.trim();
        if (!trimmed || trimmed.length < 2) return;

        const { recentSearches } = get();

        // Remove if already exists (will be moved to front)
        const filtered = recentSearches.filter(
          (s) => s.toLowerCase() !== trimmed.toLowerCase()
        );

        // Add to front, limit to max
        const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);

        set({ recentSearches: updated });
      },

      removeSearch: (query: string) => {
        set((state) => ({
          recentSearches: state.recentSearches.filter(
            (s) => s.toLowerCase() !== query.toLowerCase()
          ),
        }));
      },

      clearAll: () => {
        set({ recentSearches: [] });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Selector hooks
export const useRecentSearches = () =>
  useRecentSearchesStore((state) => state.recentSearches);
