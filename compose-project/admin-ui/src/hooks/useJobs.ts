import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  updateJobStatus,
  getCategories,
  getRegions,
} from '@/api/jobs'
import type { JobCreate } from '@/types'

interface JobFilters {
  page?: number
  page_size?: number
  status?: string
  category?: string
  region?: string
  q?: string
  has_salary?: boolean
  is_vip?: boolean
}

export function useJobs(filters: JobFilters = {}) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => getJobs(filters),
  })
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => getJob(id),
    enabled: !!id,
  })
}

export function useCreateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (job: JobCreate) => createJob(job),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

export function useUpdateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, job }: { id: string; job: Partial<JobCreate> }) =>
      updateJob(id, job),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

export function useDeleteJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

export function useUpdateJobStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateJobStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1, // Only retry once on failure
    retryDelay: 1000,
  })
}

export function useRegions() {
  return useQuery({
    queryKey: ['regions'],
    queryFn: getRegions,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1, // Only retry once on failure
    retryDelay: 1000,
  })
}
