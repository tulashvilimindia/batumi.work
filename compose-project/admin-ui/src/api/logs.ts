import apiClient from './client'
import type { LogEntry } from '@/types'

interface LogFilters {
  service?: string
  level?: string
  search?: string
  limit?: number
}

export async function getLogs(filters: LogFilters = {}): Promise<LogEntry[]> {
  const params = new URLSearchParams()

  if (filters.service) params.append('service', filters.service)
  if (filters.level) params.append('level', filters.level)
  if (filters.search) params.append('search', filters.search)
  if (filters.limit) params.append('limit', String(filters.limit))

  const { data } = await apiClient.get(`/logs?${params.toString()}`)
  return data
}

export async function getServices(): Promise<string[]> {
  const { data } = await apiClient.get('/logs/services')
  return data
}
