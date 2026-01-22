import apiClient from './client'
import type { Job, JobCreate, PaginatedResponse, Category, Region } from '@/types'

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

export async function getJobs(filters: JobFilters = {}): Promise<PaginatedResponse<Job>> {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value))
    }
  })

  const { data } = await apiClient.get(`/jobs?${params.toString()}`)
  return data
}

export async function getJob(id: string): Promise<Job> {
  const { data } = await apiClient.get(`/jobs/${id}`)
  return data
}

export async function createJob(job: JobCreate): Promise<Job> {
  const { data } = await apiClient.post('/jobs', job)
  return data
}

export async function updateJob(id: string, job: Partial<JobCreate>): Promise<Job> {
  const { data } = await apiClient.put(`/jobs/${id}`, job)
  return data
}

export async function deleteJob(id: string): Promise<void> {
  await apiClient.delete(`/jobs/${id}`)
}

export async function updateJobStatus(id: string, status: string): Promise<Job> {
  const { data } = await apiClient.patch(`/jobs/${id}/status`, { status })
  return data
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get('/categories')
  return data.data || data
}

export async function getRegions(): Promise<Region[]> {
  const { data } = await apiClient.get('/regions')
  return data.data || data
}
