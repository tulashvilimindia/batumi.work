/**
 * useJobs Hook
 * TanStack Query hook for fetching paginated job listings
 */

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { queryKeys, fetchJobs } from '@/api';
import type { JobFilters, JobsResponse } from '@/types';

/**
 * Hook return type
 */
export interface UseJobsReturn {
  data: JobsResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
  isPlaceholderData: boolean;
}

/**
 * Fetch paginated job listings with filters
 *
 * @param filters - Job filters (page, category, search, etc.)
 * @returns Query result with jobs data, loading, and error states
 *
 * @example
 * // Basic usage
 * const { data, isLoading, isError } = useJobs({ page: 1 });
 *
 * // With filters
 * const { data } = useJobs({
 *   q: 'developer',
 *   category: 'it-programming',
 *   has_salary: true,
 *   page: 1
 * });
 *
 * // Access jobs
 * if (data) {
 *   console.log(`Found ${data.total} jobs`);
 *   data.items.forEach(job => console.log(job.title_ge));
 * }
 */
export function useJobs(filters: JobFilters = {}): UseJobsReturn {
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    isPlaceholderData,
  } = useQuery({
    queryKey: queryKeys.jobs.list(filters),
    queryFn: () => fetchJobs(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    placeholderData: keepPreviousData, // Keep previous data while fetching new page
  });

  return {
    data,
    isLoading,
    isError,
    error: error as Error | null,
    isFetching,
    isPlaceholderData,
  };
}

/**
 * Type guard to check if jobs data is loaded
 */
export function hasJobsData(
  result: UseJobsReturn
): result is UseJobsReturn & { data: JobsResponse } {
  return result.data !== undefined;
}
