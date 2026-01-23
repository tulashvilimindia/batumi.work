/**
 * useJob Hook
 * TanStack Query hook for fetching a single job detail
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchJob, ApiError } from '@/api';
import type { JobDetail } from '@/types';

/**
 * Hook return type
 */
export interface UseJobReturn {
  data: JobDetail | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
  isNotFound: boolean;
}

/**
 * Fetch single job details by ID
 *
 * @param id - Job ID to fetch (pass undefined or null to disable)
 * @returns Query result with job data, loading, and error states
 *
 * @example
 * // Fetch job by ID
 * const { data, isLoading, isError } = useJob(12345);
 *
 * // Conditional fetch (only when ID is available)
 * const { id } = useParams();
 * const { data } = useJob(id ? parseInt(id) : undefined);
 *
 * // Access job details
 * if (data) {
 *   console.log(data.title_ge);
 *   console.log(data.body_ge); // Full description
 * }
 */
export function useJob(id: number | undefined | null): UseJobReturn {
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.jobs.detail(id ?? 0),
    queryFn: () => fetchJob(id!),
    enabled: !!id && id > 0, // Only fetch when valid ID provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (error instanceof ApiError && error.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Check if error is a 404 Not Found
  const isNotFound =
    error instanceof ApiError && error.status === 404;

  return {
    data,
    isLoading: isLoading && !!id,
    isError,
    error: error as Error | null,
    isFetching,
    isNotFound,
  };
}

/**
 * Type guard to check if job data is loaded
 */
export function hasJobData(
  result: UseJobReturn
): result is UseJobReturn & { data: JobDetail } {
  return result.data !== undefined;
}
