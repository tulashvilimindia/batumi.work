import { useQuery } from '@tanstack/react-query';
import { companiesApi } from '@/api/endpoints';
import type { CompanyFilters } from '@/types';

// ============================================================
// QUERY KEYS
// ============================================================

export const companiesKeys = {
  all: ['companies'] as const,
  lists: () => [...companiesKeys.all, 'list'] as const,
  list: (filters: CompanyFilters) => [...companiesKeys.lists(), filters] as const,
  details: () => [...companiesKeys.all, 'detail'] as const,
  detail: (id: number) => [...companiesKeys.details(), id] as const,
  jobs: (id: number, page: number) => [...companiesKeys.detail(id), 'jobs', page] as const,
};

// ============================================================
// HOOKS
// ============================================================

export function useCompanies(filters: CompanyFilters = {}) {
  return useQuery({
    queryKey: companiesKeys.list(filters),
    queryFn: () => companiesApi.getCompanies(filters),
    staleTime: 60 * 1000,
  });
}

export function useCompany(id: number) {
  return useQuery({
    queryKey: companiesKeys.detail(id),
    queryFn: () => companiesApi.getCompany(id),
    enabled: !!id,
  });
}

export function useCompanyJobs(id: number, page: number = 1) {
  return useQuery({
    queryKey: companiesKeys.jobs(id, page),
    queryFn: () => companiesApi.getCompanyJobs(id, page),
    enabled: !!id,
  });
}
