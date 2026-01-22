import apiClient from './client'
import type { TableInfo, QueryResult } from '@/types'

export async function getTables(): Promise<{ tables: TableInfo[] }> {
  const { data } = await apiClient.get('/database/tables')
  return data
}

export async function getTableDetails(tableName: string): Promise<{
  name: string
  columns: Array<{ name: string; type: string; nullable: boolean; default?: string }>
  row_count: number
  sample_rows: Record<string, unknown>[]
}> {
  const { data } = await apiClient.get(`/database/tables/${tableName}`)
  return data
}

export async function executeQuery(query: string, limit: number = 100): Promise<QueryResult> {
  const { data } = await apiClient.post('/database/query', { sql: query, limit })
  return data
}
