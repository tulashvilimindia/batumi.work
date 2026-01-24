import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/api/endpoints';

// ============================================================
// QUERY KEYS
// ============================================================

export const statsKeys = {
  all: ['stats'] as const,
  dashboard: () => [...statsKeys.all, 'dashboard'] as const,
  locations: () => [...statsKeys.all, 'locations'] as const,
  salary: () => [...statsKeys.all, 'salary'] as const,
};

// ============================================================
// HOOKS
// ============================================================

export function useDashboardStats() {
  return useQuery({
    queryKey: statsKeys.dashboard(),
    queryFn: () => statsApi.getDashboardStats(),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useLocationStats() {
  return useQuery({
    queryKey: statsKeys.locations(),
    queryFn: () => statsApi.getLocationStats(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSalaryStats() {
  return useQuery({
    queryKey: statsKeys.salary(),
    queryFn: () => statsApi.getSalaryStats(),
    staleTime: 5 * 60 * 1000,
  });
}
