import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getParserSources, getParserRuns, triggerParser, getParserStatus } from '@/api/parser'

export function useParserSources() {
  return useQuery({
    queryKey: ['parser', 'sources'],
    queryFn: getParserSources,
  })
}

export function useParserRuns(limit: number = 20) {
  return useQuery({
    queryKey: ['parser', 'runs', limit],
    queryFn: () => getParserRuns(limit),
    refetchInterval: 10000, // Refresh every 10 seconds
  })
}

export function useParserStatus() {
  return useQuery({
    queryKey: ['parser', 'status'],
    queryFn: getParserStatus,
    refetchInterval: 5000, // Refresh every 5 seconds when parser might be running
  })
}

export function useTriggerParser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (source?: string) => triggerParser(source),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parser'] })
    },
  })
}
