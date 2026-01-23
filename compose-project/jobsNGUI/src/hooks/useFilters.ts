/**
 * useFilters Hook
 * Syncs job filters with URL search parameters
 */

import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
import type { JobFilters } from '@/types';

/**
 * Hook return type
 */
export interface UseFiltersReturn {
  filters: JobFilters;
  setFilters: (newFilters: Partial<JobFilters>) => void;
  setFilter: <K extends keyof JobFilters>(key: K, value: JobFilters[K]) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

/**
 * Default values for filters (not included in URL)
 */
const FILTER_DEFAULTS = {
  page: 1,
  page_size: 30,
  sort: '-published_at',
  status: 'active',
} as const;

/**
 * Parse URL search params into JobFilters object
 */
function parseFiltersFromParams(params: URLSearchParams): JobFilters {
  const filters: JobFilters = {};

  // String filters
  const q = params.get('q');
  if (q) filters.q = q;

  const category = params.get('category');
  if (category) filters.category = category;

  const region = params.get('region');
  if (region) filters.region = region;

  const sort = params.get('sort');
  if (sort) filters.sort = sort;

  const status = params.get('status');
  if (status) filters.status = status;

  // Number filters
  const page = params.get('page');
  if (page) filters.page = parseInt(page, 10);

  const pageSize = params.get('page_size');
  if (pageSize) filters.page_size = parseInt(pageSize, 10);

  const lid = params.get('lid');
  if (lid) filters.lid = parseInt(lid, 10);

  const cid = params.get('cid');
  if (cid) filters.cid = parseInt(cid, 10);

  // Boolean filters
  const hasSalary = params.get('has_salary');
  if (hasSalary === 'true') filters.has_salary = true;
  else if (hasSalary === 'false') filters.has_salary = false;

  return filters;
}

/**
 * Sync job filters with URL search parameters
 *
 * Keeps filter state in the URL for bookmarking, sharing, and browser history.
 * Automatically resets page to 1 when other filters change.
 *
 * @returns Filter state and methods to update/clear filters
 *
 * @example
 * // Basic usage
 * const { filters, setFilters, clearFilters, hasActiveFilters } = useFilters();
 *
 * // Update single filter
 * setFilter('category', 'it-programming');
 *
 * // Update multiple filters
 * setFilters({ q: 'developer', has_salary: true });
 *
 * // Clear all filters
 * clearFilters();
 *
 * // Use filters in query
 * const { data } = useJobs(filters);
 */
export function useFilters(): UseFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse current filters from URL
  const filters = useMemo(() => {
    const parsed = parseFiltersFromParams(searchParams);
    return {
      ...parsed,
      page: parsed.page ?? FILTER_DEFAULTS.page,
      page_size: parsed.page_size ?? FILTER_DEFAULTS.page_size,
    };
  }, [searchParams]);

  // Update filters in URL
  const setFilters = useCallback(
    (newFilters: Partial<JobFilters>) => {
      setSearchParams(
        (prevParams) => {
          const params = new URLSearchParams(prevParams);
          const currentFilters = parseFiltersFromParams(params);

          // Merge new filters
          const merged = { ...currentFilters, ...newFilters };

          // Reset page when non-page filters change
          const isPageChange = 'page' in newFilters && Object.keys(newFilters).length === 1;
          if (!isPageChange && !('page' in newFilters)) {
            merged.page = 1;
          }

          // Build new params, omitting defaults
          const newParams = new URLSearchParams();

          Object.entries(merged).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') {
              return;
            }

            // Skip defaults
            if (key === 'page' && value === FILTER_DEFAULTS.page) return;
            if (key === 'page_size' && value === FILTER_DEFAULTS.page_size) return;
            if (key === 'sort' && value === FILTER_DEFAULTS.sort) return;
            if (key === 'status' && value === FILTER_DEFAULTS.status) return;
            if (key === 'has_salary' && value === false) return;

            newParams.set(key, String(value));
          });

          return newParams;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // Update single filter
  const setFilter = useCallback(
    <K extends keyof JobFilters>(key: K, value: JobFilters[K]) => {
      setFilters({ [key]: value });
    },
    [setFilters]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  // Check if any non-default filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.q ||
      filters.category ||
      filters.region ||
      filters.lid ||
      filters.cid ||
      filters.has_salary
    );
  }, [filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return [
      filters.q,
      filters.category,
      filters.region,
      filters.lid,
      filters.cid,
      filters.has_salary,
    ].filter(Boolean).length;
  }, [filters]);

  return {
    filters,
    setFilters,
    setFilter,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
  };
}
