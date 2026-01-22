import apiClient from './client'
import type { LogEntry } from '@/types'

interface ServiceInfo {
  name: string
  container: string
  status: string
  running: boolean
}

interface LogFilters {
  service?: string
  level?: string
  search?: string
  limit?: number
}

export async function getLogs(filters: LogFilters = {}): Promise<LogEntry[]> {
  // If no service specified, return empty array
  if (!filters.service) {
    return []
  }

  const params = new URLSearchParams()
  if (filters.limit) params.append('tail', String(filters.limit))

  const { data } = await apiClient.get(`/logs/${filters.service}?${params.toString()}`)

  // Parse log lines into LogEntry format
  const entries: LogEntry[] = (data.lines || []).map((line: string) => {
    // Parse timestamp and message from Docker log format
    // Format: 2026-01-22T14:30:00.000Z message here
    const match = line.match(/^(\d{4}-\d{2}-\d{2}T[\d:.]+Z?)\s+(.*)$/)
    if (match) {
      const message = match[2]
      // Try to detect log level from message
      let level: 'debug' | 'info' | 'warning' | 'error' = 'info'
      if (message.toLowerCase().includes('error') || message.toLowerCase().includes('exception')) {
        level = 'error'
      } else if (message.toLowerCase().includes('warn')) {
        level = 'warning'
      } else if (message.toLowerCase().includes('debug')) {
        level = 'debug'
      }

      return {
        timestamp: match[1],
        level,
        message: message,
        service: filters.service,
      }
    }
    return {
      timestamp: new Date().toISOString(),
      level: 'info' as const,
      message: line,
      service: filters.service,
    }
  })

  // Filter by level if specified
  if (filters.level) {
    return entries.filter(e => e.level === filters.level)
  }

  // Filter by search if specified
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    return entries.filter(e => e.message.toLowerCase().includes(searchLower))
  }

  return entries
}

export async function getServices(): Promise<string[]> {
  const { data } = await apiClient.get('/logs/services')
  if (!data.available) {
    return []
  }
  return (data.services || [])
    .filter((s: ServiceInfo) => s.running)
    .map((s: ServiceInfo) => s.name)
}
