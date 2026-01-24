/**
 * RecentViews Store - V5 Feature
 * Track last 10 viewed jobs with localStorage persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Job } from '@/types';

const MAX_RECENT_VIEWS = 10;
const STORAGE_KEY = 'v5-recent-views';

interface RecentViewsState {
  recentJobs: Job[];
}

interface RecentViewsActions {
  addView: (job: Job) => void;
  removeView: (id: string) => void;
  clearAll: () => void;
  getRecentJobs: () => Job[];
}

type RecentViewsStore = RecentViewsState & RecentViewsActions;

export const useRecentViewsStore = create<RecentViewsStore>()(
  persist(
    (set, get) => ({
      recentJobs: [],

      addView: (job: Job) => {
        const { recentJobs } = get();

        // Remove if already exists (will be moved to front)
        const filtered = recentJobs.filter((j) => j.id !== job.id);

        // Add to front, limit to max
        const updated = [job, ...filtered].slice(0, MAX_RECENT_VIEWS);

        set({ recentJobs: updated });
      },

      removeView: (id: string) => {
        set((state) => ({
          recentJobs: state.recentJobs.filter((j) => j.id !== id),
        }));
      },

      clearAll: () => {
        set({ recentJobs: [] });
      },

      getRecentJobs: () => get().recentJobs,
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Selector hooks
export const useRecentJobs = () => useRecentViewsStore((state) => state.recentJobs);
export const useRecentJobsCount = () => useRecentViewsStore((state) => state.recentJobs.length);
