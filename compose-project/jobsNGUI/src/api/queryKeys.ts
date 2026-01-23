/**
 * Query Keys
 * Centralized query key management for TanStack Query
 *
 * Following the factory pattern for type-safe, hierarchical query keys
 */

import type { JobFilters } from '@/types';

export const queryKeys = {
  // Jobs queries
  jobs: {
    all: ['jobs'] as const,
    lists: () => [...queryKeys.jobs.all, 'list'] as const,
    list: (filters: JobFilters) => [...queryKeys.jobs.lists(), filters] as const,
    details: () => [...queryKeys.jobs.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.jobs.details(), id] as const,
  },

  // Categories queries
  categories: {
    all: ['categories'] as const,
    list: () => [...queryKeys.categories.all, 'list'] as const,
  },

  // Regions queries
  regions: {
    all: ['regions'] as const,
    list: () => [...queryKeys.regions.all, 'list'] as const,
  },

  // Stats queries (optional)
  stats: {
    all: ['stats'] as const,
    summary: () => [...queryKeys.stats.all, 'summary'] as const,
  },
};

/**
 * Type helper for query key types
 */
export type JobsListKey = ReturnType<typeof queryKeys.jobs.list>;
export type JobDetailKey = ReturnType<typeof queryKeys.jobs.detail>;
export type CategoriesListKey = ReturnType<typeof queryKeys.categories.list>;
export type RegionsListKey = ReturnType<typeof queryKeys.regions.list>;
