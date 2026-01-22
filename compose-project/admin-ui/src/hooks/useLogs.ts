import { useQuery } from '@tanstack/react-query'
import { getLogs, getServices } from '@/api/logs'

interface LogFilters {
  service?: string
  level?: string
  search?: string
  limit?: number
}

export function useLogs(filters: LogFilters = {}, autoRefresh: boolean = false) {
  return useQuery({
    queryKey: ['logs', filters],
    queryFn: () => getLogs(filters),
    refetchInterval: autoRefresh ? 5000 : false, // Refresh every 5 seconds if auto-refresh enabled
    enabled: !!filters.service, // Only fetch when service is selected
    retry: 1,
  })
}

export function useServices() {
  return useQuery({
    queryKey: ['logs', 'services'],
    queryFn: getServices,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })
}
