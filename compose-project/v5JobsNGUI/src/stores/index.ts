// Stores barrel export - V5 Enhanced

// Theme store
export { useThemeStore } from './themeStore';
export type { Theme, ResolvedTheme } from './themeStore';

// Saved Jobs store
export {
  useSavedJobsStore,
  useSavedJobs,
  useSavedJobIds,
  useIsSaved,
} from './savedJobsStore';

// Recent Views store (V5)
export {
  useRecentViewsStore,
  useRecentJobs,
  useRecentJobsCount,
} from './recentViewsStore';

// Recent Searches store (V5)
export {
  useRecentSearchesStore,
  useRecentSearches,
} from './recentSearchesStore';
