/**
 * useRegions Hook
 * TanStack Query hook for fetching all regions/locations
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchRegions } from '@/api';
import type { Region } from '@/types';

/**
 * Hook return type
 */
export interface UseRegionsReturn {
  data: Region[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
}

/**
 * Fetch all regions/locations
 *
 * Regions are cached for 1 hour since they rarely change.
 * This hook is typically called once on app load or component mount.
 *
 * @param includeCount - Whether to include job counts per region (default: true)
 * @returns Query result with regions data, loading, and error states
 *
 * @example
 * // Basic usage
 * const { data: regions, isLoading } = useRegions();
 *
 * // Use in dropdown
 * if (regions) {
 *   return (
 *     <select>
 *       {regions.map(region => (
 *         <option key={region.id} value={region.slug}>
 *           {region.name_ge} ({region.job_count})
 *         </option>
 *       ))}
 *     </select>
 *   );
 * }
 */
export function useRegions(includeCount: boolean = true): UseRegionsReturn {
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.regions.list(),
    queryFn: () => fetchRegions(includeCount),
    staleTime: 60 * 60 * 1000, // 1 hour - regions rarely change
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  return {
    data,
    isLoading,
    isError,
    error: error as Error | null,
    isFetching,
  };
}

/**
 * Type guard to check if regions data is loaded
 */
export function hasRegionsData(
  result: UseRegionsReturn
): result is UseRegionsReturn & { data: Region[] } {
  return result.data !== undefined;
}
