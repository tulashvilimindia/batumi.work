import apiClient from './client'
import type { ParserSource, ParserRun } from '@/types'

export async function getParserSources(): Promise<ParserSource[]> {
  const { data } = await apiClient.get('/parser/sources')
  return data
}

export async function getParserRuns(limit: number = 20): Promise<ParserRun[]> {
  const { data } = await apiClient.get(`/parser/runs?limit=${limit}`)
  return data
}

export async function triggerParser(source?: string): Promise<{ message: string }> {
  const { data } = await apiClient.post('/parser/trigger', { source })
  return data
}

export async function getParserStatus(): Promise<{
  is_running: boolean
  current_source?: string
  last_run?: ParserRun
}> {
  const { data } = await apiClient.get('/parser/status')
  return data
}
