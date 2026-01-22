import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getParserConfig, getParseJobs, triggerParser, getParserProgress, getParserStats, controlJob } from '@/api/parser'

export function useParserConfig() {
  return useQuery({
    queryKey: ['parser', 'config'],
    queryFn: getParserConfig,
  })
}

export function useParseJobs(limit: number = 20) {
  return useQuery({
    queryKey: ['parser', 'jobs', limit],
    queryFn: () => getParseJobs(limit),
    refetchInterval: 10000, // Refresh every 10 seconds
  })
}

export function useParserProgress() {
  return useQuery({
    queryKey: ['parser', 'progress'],
    queryFn: getParserProgress,
    refetchInterval: 3000, // Refresh every 3 seconds when parser might be running
  })
}

export function useParserStats() {
  return useQuery({
    queryKey: ['parser', 'stats'],
    queryFn: getParserStats,
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

export function useControlJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ jobId, action }: { jobId: string; action: 'pause' | 'resume' | 'stop' | 'cancel' | 'restart' }) =>
      controlJob(jobId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parser'] })
    },
  })
}
