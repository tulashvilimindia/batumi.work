import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '@/api/endpoints';
import type { JobFilters } from '@/types';

// ============================================================
// QUERY KEYS
// ============================================================

export const jobsKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobsKeys.all, 'list'] as const,
  list: (filters: JobFilters) => [...jobsKeys.lists(), filters] as const,
  details: () => [...jobsKeys.all, 'detail'] as const,
  detail: (id: number) => [...jobsKeys.details(), id] as const,
  latest: (limit: number) => [...jobsKeys.all, 'latest', limit] as const,
  search: (query: string, page: number) => [...jobsKeys.all, 'search', query, page] as const,
};

// ============================================================
// HOOKS
// ============================================================

export function useJobs(filters: JobFilters = {}) {
  return useQuery({
    queryKey: jobsKeys.list(filters),
    queryFn: () => jobsApi.getJobs(filters),
    staleTime: 60 * 1000,
  });
}

export function useJob(id: number) {
  return useQuery({
    queryKey: jobsKeys.detail(id),
    queryFn: () => jobsApi.getJob(id),
    enabled: !!id,
  });
}

export function useLatestJobs(limit: number = 10) {
  return useQuery({
    queryKey: jobsKeys.latest(limit),
    queryFn: () => jobsApi.getLatestJobs(limit),
    staleTime: 30 * 1000,
  });
}

export function useSearchJobs(query: string, page: number = 1) {
  return useQuery({
    queryKey: jobsKeys.search(query, page),
    queryFn: () => jobsApi.searchJobs(query, page),
    enabled: query.length > 0,
  });
}
