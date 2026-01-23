/**
 * API Module Index
 * Re-exports all API functions and utilities
 */

// Query client
export { queryClient } from './queryClient';

// Query keys
export { queryKeys } from './queryKeys';
export type {
  JobsListKey,
  JobDetailKey,
  CategoriesListKey,
  RegionsListKey,
} from './queryKeys';

// API client utilities
export { API_BASE_URL, ApiError, fetchApi, get, post } from './client';

// Jobs API
export {
  fetchJobs,
  fetchJob,
  getJobTitle,
  getCategoryName,
  getRegionName,
  formatSalary,
} from './jobs';

// Categories API
export {
  fetchCategories,
  findCategoryBySlug,
  findCategoryByCid,
  getCategoryNameLocalized,
  sortCategoriesByCount,
  sortCategoriesByName,
} from './categories';

// Regions API
export {
  fetchRegions,
  findRegionBySlug,
  findRegionByLid,
  getRegionNameLocalized,
  sortRegionsByCount,
  sortRegionsByName,
  REGION_SLUGS,
  isRemoteRegion,
} from './regions';

// Analytics API
export {
  trackEvent,
  trackPageView,
  trackJobView,
  trackSearch,
  trackShare,
  trackSave,
  trackFilterChange,
  trackLanguageChange,
  trackThemeChange,
  getSessionId,
} from './analytics';
export type { AnalyticsEvent, AnalyticsEventType } from './analytics';
