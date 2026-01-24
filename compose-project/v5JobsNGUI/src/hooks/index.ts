/**
 * Custom Hooks Index
 * Re-exports all custom hooks
 */

// Data fetching hooks
export { useJobs, hasJobsData } from './useJobs';
export type { UseJobsReturn } from './useJobs';

export { useJob, hasJobData } from './useJob';
export type { UseJobReturn } from './useJob';

export { useCategories, hasCategoriesData } from './useCategories';
export type { UseCategoriesReturn } from './useCategories';

export { useRegions, hasRegionsData } from './useRegions';
export type { UseRegionsReturn } from './useRegions';

// Filter hooks
export { useFilters } from './useFilters';
export type { UseFiltersReturn } from './useFilters';

// Utility hooks
export { useDebounce, useDebouncedCallback, useDebouncedState } from './useDebounce';

// Toast hook
export { useToast } from './useToast';
export type { ToastItem } from './useToast';

// Analytics hooks
export { usePageView, useTrackPageOnce } from './usePageView';
export type { UsePageViewOptions } from './usePageView';

export { useTrackJobView, trackJobViewOnce } from './useTrackJobView';
export type { UseTrackJobViewOptions } from './useTrackJobView';
