import { useQuery } from '@tanstack/react-query'
import { getAnalyticsDashboard, getFilterOptions, exportAnalytics } from '@/api/analytics'
import type { AnalyticsFilters } from '@/types'

export function useAnalyticsDashboard(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: ['analytics', 'dashboard', filters],
    queryFn: () => getAnalyticsDashboard(filters),
  })
}

export function useFilterOptions() {
  return useQuery({
    queryKey: ['analytics', 'filters'],
    queryFn: getFilterOptions,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })
}

export function useExportAnalytics() {
  const handleExport = async (filters: AnalyticsFilters = {}) => {
    const blob = await exportAnalytics(filters)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return { exportAnalytics: handleExport }
}
