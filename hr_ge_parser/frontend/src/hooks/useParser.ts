import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parserApi } from '@/api/endpoints';
import type { RunType } from '@/types';

// ============================================================
// QUERY KEYS
// ============================================================

export const parserKeys = {
  all: ['parser'] as const,
  status: () => [...parserKeys.all, 'status'] as const,
  history: (page: number) => [...parserKeys.all, 'history', page] as const,
};

// ============================================================
// HOOKS
// ============================================================

export function useParserStatus() {
  return useQuery({
    queryKey: parserKeys.status(),
    queryFn: () => parserApi.getStatus(),
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
  });
}

export function useParserHistory(page: number = 1) {
  return useQuery({
    queryKey: parserKeys.history(page),
    queryFn: () => parserApi.getHistory(page),
    staleTime: 30 * 1000,
  });
}

export function useTriggerParser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (runType: RunType) => parserApi.triggerRun(runType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parserKeys.status() });
      queryClient.invalidateQueries({ queryKey: parserKeys.all });
    },
  });
}
