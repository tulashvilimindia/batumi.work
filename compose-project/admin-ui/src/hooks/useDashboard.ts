import { useQuery } from '@tanstack/react-query'
import { getDashboardData, getHealthStatus } from '@/api/dashboard'

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
    refetchInterval: 30000, // Refresh every 30 seconds
  })
}

export function useHealthStatus() {
  return useQuery({
    queryKey: ['health'],
    queryFn: getHealthStatus,
    refetchInterval: 10000, // Refresh every 10 seconds
  })
}
