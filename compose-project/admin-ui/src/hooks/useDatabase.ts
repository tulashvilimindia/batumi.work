import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTableStats, getTables, runVacuum, executeQuery } from '@/api/database'

export function useTableStats() {
  return useQuery({
    queryKey: ['database', 'stats'],
    queryFn: getTableStats,
  })
}

export function useTables() {
  return useQuery({
    queryKey: ['database', 'tables'],
    queryFn: getTables,
  })
}

export function useVacuum() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: runVacuum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['database'] })
    },
  })
}

export function useExecuteQuery() {
  return useMutation({
    mutationFn: (query: string) => executeQuery(query),
  })
}
