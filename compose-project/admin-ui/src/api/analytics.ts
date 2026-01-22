import apiClient from './client'
import type { AnalyticsDashboard, AnalyticsFilters, FilterOptions } from '@/types'

export async function getAnalyticsDashboard(filters: AnalyticsFilters = {}): Promise<AnalyticsDashboard> {
  const params = new URLSearchParams()

  if (filters.date_from) params.append('date_from', filters.date_from)
  if (filters.date_to) params.append('date_to', filters.date_to)
  if (filters.categories?.length) params.append('categories', filters.categories.join(','))
  if (filters.regions?.length) params.append('regions', filters.regions.join(','))
  if (filters.employment_types?.length) params.append('employment_types', filters.employment_types.join(','))
  if (filters.has_salary !== undefined) params.append('has_salary', String(filters.has_salary))
  if (filters.is_vip !== undefined) params.append('is_vip', String(filters.is_vip))
  if (filters.source) params.append('source', filters.source)

  const { data } = await apiClient.get(`/analytics/dashboard-v2?${params.toString()}`)
  return data
}

export async function getFilterOptions(): Promise<FilterOptions> {
  const { data } = await apiClient.get('/analytics/filters')
  return data
}

export async function exportAnalytics(filters: AnalyticsFilters = {}): Promise<Blob> {
  const params = new URLSearchParams()

  if (filters.date_from) params.append('date_from', filters.date_from)
  if (filters.date_to) params.append('date_to', filters.date_to)
  if (filters.categories?.length) params.append('categories', filters.categories.join(','))
  if (filters.regions?.length) params.append('regions', filters.regions.join(','))

  const { data } = await apiClient.get(`/analytics/export?${params.toString()}`, {
    responseType: 'blob',
  })
  return data
}
