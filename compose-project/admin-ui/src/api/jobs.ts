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

interface JobApiItem {
  id: string
  title_ge: string
  title_en?: string
  company_name?: string
  location?: string
  status: string
  category?: string
  region?: string
  has_salary: boolean
  salary_min?: number
  salary_max?: number
  published_at?: string
  created_at: string
  parsed_from?: string
}

export async function getJobs(filters: JobFilters = {}): Promise<PaginatedResponse<Job>> {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value))
    }
  })

  const { data } = await apiClient.get(`/jobs?${params.toString()}`)

  // Map API response to match frontend type
  return {
    data: (data.items || []).map((item: JobApiItem) => ({
      id: item.id,
      external_id: item.id,
      title_ge: item.title_ge,
      title_en: item.title_en,
      company_name: item.company_name,
      location: item.location,
      status: item.status as 'active' | 'inactive' | 'expired' | 'pending_review',
      category: item.category ? { name_en: item.category, name_ge: '', slug: '', id: '', is_active: true } : undefined,
      region: item.region ? { name_en: item.region, name_ge: '', slug: '', id: '', is_active: true } : undefined,
      has_salary: item.has_salary,
      salary_min: item.salary_min,
      salary_max: item.salary_max,
      is_vip: false,
      views_count: 0,
      created_at: item.created_at,
      updated_at: item.created_at,
      source_url: item.parsed_from ? `https://jobs.ge` : undefined,
    })),
    meta: {
      page: data.page || 1,
      page_size: data.page_size || 20,
      total: data.total || 0,
      total_pages: data.pages || 1,
    },
  }
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
