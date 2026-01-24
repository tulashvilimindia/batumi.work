/**
 * SavedJobs Store
 * Zustand store for managing saved/bookmarked jobs with localStorage persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Job } from '@/types';

/**
 * Store state interface
 */
interface SavedJobsState {
  /** Array of saved jobs */
  savedJobs: Job[];
  /** Set of saved job IDs for quick lookup */
  savedIds: Set<string>;
}

/**
 * Store actions interface
 */
interface SavedJobsActions {
  /** Save a job */
  saveJob: (job: Job) => void;
  /** Remove a saved job by ID */
  unsaveJob: (id: string) => void;
  /** Toggle save status of a job */
  toggleSave: (job: Job) => void;
  /** Check if a job is saved */
  isSaved: (id: string) => boolean;
  /** Clear all saved jobs */
  clearAll: () => void;
}

/**
 * Combined store type
 */
type SavedJobsStore = SavedJobsState & SavedJobsActions;

/**
 * Local storage key
 */
const STORAGE_KEY = 'v5-saved-jobs';

/**
 * Custom storage adapter to handle Set serialization
 */
const storage = createJSONStorage<SavedJobsState>(() => ({
  getItem: (name: string) => {
    const value = localStorage.getItem(name);
    if (!value) return null;

    try {
      const parsed = JSON.parse(value);
      // Reconstruct Set from array
      if (parsed.state && Array.isArray(parsed.state.savedIds)) {
        parsed.state.savedIds = new Set(parsed.state.savedIds);
      }
      return JSON.stringify(parsed);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      const parsed = JSON.parse(value);
      // Convert Set to array for storage
      if (parsed.state && parsed.state.savedIds instanceof Set) {
        parsed.state.savedIds = Array.from(parsed.state.savedIds);
      }
      localStorage.setItem(name, JSON.stringify(parsed));
    } catch {
      // Ignore storage errors
    }
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
}));

/**
 * Saved jobs store with localStorage persistence
 *
 * @example
 * // Save a job
 * useSavedJobsStore.getState().saveJob(job);
 *
 * // Check if saved
 * const isSaved = useSavedJobsStore.getState().isSaved(jobId);
 *
 * // Toggle save
 * useSavedJobsStore.getState().toggleSave(job);
 *
 * // Use in component
 * const { savedJobs, toggleSave, isSaved } = useSavedJobsStore();
 */
export const useSavedJobsStore = create<SavedJobsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      savedJobs: [],
      savedIds: new Set<string>(),

      // Actions
      saveJob: (job: Job) => {
        const state = get();
        if (state.savedIds.has(job.id)) {
          return; // Already saved
        }

        set({
          savedJobs: [job, ...state.savedJobs],
          savedIds: new Set([job.id, ...state.savedIds]),
        });
      },

      unsaveJob: (id: string) => {
        const state = get();
        if (!state.savedIds.has(id)) {
          return; // Not saved
        }

        const newIds = new Set(state.savedIds);
        newIds.delete(id);

        set({
          savedJobs: state.savedJobs.filter((job) => job.id !== id),
          savedIds: newIds,
        });
      },

      toggleSave: (job: Job) => {
        const state = get();
        if (state.savedIds.has(job.id)) {
          state.unsaveJob(job.id);
        } else {
          state.saveJob(job);
        }
      },

      isSaved: (id: string) => {
        return get().savedIds.has(id);
      },

      clearAll: () => {
        set({
          savedJobs: [],
          savedIds: new Set<string>(),
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage,
      // Only persist saved jobs and IDs
      partialize: (state) => ({
        savedJobs: state.savedJobs,
        savedIds: state.savedIds,
      }),
      // Merge function to handle hydration
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<SavedJobsState> | undefined;
        return {
          ...currentState,
          savedJobs: persisted?.savedJobs ?? [],
          savedIds: persisted?.savedIds instanceof Set
            ? persisted.savedIds
            : new Set(Array.isArray(persisted?.savedIds) ? persisted.savedIds : []),
        };
      },
    }
  )
);

// Selector hooks for common patterns
export const useSavedJobs = () => useSavedJobsStore((state) => state.savedJobs);
export const useSavedJobIds = () => useSavedJobsStore((state) => state.savedIds);
export const useIsSaved = (id: string) => useSavedJobsStore((state) => state.isSaved(id));
