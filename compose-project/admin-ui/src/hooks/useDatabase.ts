import { useQuery, useMutation } from '@tanstack/react-query'
import { getTables, getTableDetails, executeQuery } from '@/api/database'

export function useTables() {
  return useQuery({
    queryKey: ['database', 'tables'],
    queryFn: getTables,
  })
}

export function useTableDetails(tableName: string) {
  return useQuery({
    queryKey: ['database', 'tables', tableName],
    queryFn: () => getTableDetails(tableName),
    enabled: !!tableName,
  })
}

export function useExecuteQuery() {
  return useMutation({
    mutationFn: ({ query, limit = 100 }: { query: string; limit?: number }) => executeQuery(query, limit),
  })
}
