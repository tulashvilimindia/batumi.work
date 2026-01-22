import { useQuery } from '@tanstack/react-query'
import { getDashboardStats, getHealthStatus } from '@/api/dashboard'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
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
