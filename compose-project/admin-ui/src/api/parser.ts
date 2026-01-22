import apiClient from './client'
import type { ParserConfig, ParseJob, ParserProgress, ParserStats } from '@/types'

export async function getParserConfig(): Promise<ParserConfig> {
  const { data } = await apiClient.get('/parser/config')
  return data
}

export async function getParseJobs(limit: number = 20): Promise<{ jobs: ParseJob[]; total: number }> {
  const { data } = await apiClient.get(`/parser/jobs?limit=${limit}`)
  return data
}

export async function triggerParser(source?: string): Promise<{ success: boolean; message: string; job_id?: string }> {
  const { data } = await apiClient.post('/parser/trigger', { source: source || 'jobs.ge' })
  return data
}

export async function getParserProgress(): Promise<ParserProgress> {
  const { data } = await apiClient.get('/parser/progress')
  return data
}

export async function getParserStats(): Promise<ParserStats> {
  const { data } = await apiClient.get('/parser/stats')
  return data
}

export async function controlJob(jobId: string, action: 'pause' | 'resume' | 'stop' | 'cancel' | 'restart'): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.post(`/parser/jobs/${jobId}/control`, { action })
  return data
}
