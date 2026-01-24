/**
 * useCategories Hook
 * TanStack Query hook for fetching all job categories
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchCategories } from '@/api';
import type { Category } from '@/types';

/**
 * Hook return type
 */
export interface UseCategoriesReturn {
  data: Category[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
}

/**
 * Fetch all job categories
 *
 * Categories are cached for 1 hour since they rarely change.
 * This hook is typically called once on app load or component mount.
 *
 * @param includeCount - Whether to include job counts per category (default: true)
 * @returns Query result with categories data, loading, and error states
 *
 * @example
 * // Basic usage
 * const { data: categories, isLoading } = useCategories();
 *
 * // Use in dropdown
 * if (categories) {
 *   return (
 *     <select>
 *       {categories.map(cat => (
 *         <option key={cat.id} value={cat.slug}>
 *           {cat.name_ge} ({cat.job_count})
 *         </option>
 *       ))}
 *     </select>
 *   );
 * }
 */
export function useCategories(includeCount: boolean = true): UseCategoriesReturn {
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => fetchCategories(includeCount),
    staleTime: 60 * 60 * 1000, // 1 hour - categories rarely change
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
 * Type guard to check if categories data is loaded
 */
export function hasCategoriesData(
  result: UseCategoriesReturn
): result is UseCategoriesReturn & { data: Category[] } {
  return result.data !== undefined;
}
