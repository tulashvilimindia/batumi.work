import apiClient from './client'
import type { TableStats, QueryResult } from '@/types'

export async function getTableStats(): Promise<TableStats[]> {
  const { data } = await apiClient.get('/database/stats')
  return data
}

export async function getTables(): Promise<TableStats[]> {
  const { data } = await apiClient.get('/database/tables')
  return data
}

export async function runVacuum(): Promise<{ message: string }> {
  const { data } = await apiClient.post('/database/vacuum')
  return data
}

export async function executeQuery(query: string): Promise<QueryResult> {
  const { data } = await apiClient.post('/database/query', { query })
  return data
}
