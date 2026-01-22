// Job types
export interface Job {
  id: string
  external_id: string
  title_ge: string
  title_en?: string
  body_ge?: string
  body_en?: string
  company_name?: string
  location?: string
  category_id: string
  category?: Category
  region_id?: string
  region?: Region
  jobsge_cid?: number
  jobsge_lid?: number
  status: 'active' | 'inactive' | 'expired' | 'pending_review'
  has_salary: boolean
  salary_min?: number
  salary_max?: number
  salary_currency?: string
  is_vip: boolean
  views_count: number
  source_url?: string
  deadline_at?: string
  created_at: string
  updated_at: string
  first_seen_at?: string
  last_seen_at?: string
}

export interface JobCreate {
  title_ge: string
  title_en?: string
  body_ge: string
  body_en?: string
  company_name?: string
  location?: string
  category_id: string
  region_id?: string
  has_salary?: boolean
  salary_min?: number
  salary_max?: number
  salary_currency?: string
  is_vip?: boolean
  deadline_at?: string
  status?: string
}

// Category types
export interface Category {
  id: string
  name_ge: string
  name_en: string
  slug: string
  jobsge_cid?: number
  is_active: boolean
  job_count?: number
}

// Region types
export interface Region {
  id: string
  name_ge: string
  name_en: string
  slug: string
  jobsge_lid?: number
  is_active: boolean
  job_count?: number
}

// Parser types
export interface ParserSource {
  id: string
  name: string
  slug: string
  is_enabled: boolean
  last_run_at?: string
  total_jobs_parsed: number
}

export interface ParserRun {
  id: string
  source: string
  started_at: string
  finished_at?: string
  status: 'running' | 'completed' | 'failed'
  jobs_found: number
  jobs_created: number
  jobs_updated: number
  errors?: string[]
}

// Analytics types
export interface DashboardStats {
  total_jobs: number
  active_jobs: number
  inactive_jobs: number
  jobs_with_salary: number
  total_views: number
  avg_salary?: number
}

export interface AnalyticsFilters {
  date_from?: string
  date_to?: string
  categories?: string[]
  regions?: string[]
  employment_types?: string[]
  has_salary?: boolean
  is_vip?: boolean
  source?: string
}

export interface FilterOptions {
  categories: Array<{ slug: string; name: string; count: number }>
  regions: Array<{ slug: string; lid: number; name: string; count: number }>
  employment_types: Array<{ value: string; label: string; count: number }>
  sources: Array<{ value: string; label: string; count: number }>
}

export interface TimeSeriesPoint {
  date: string
  count: number
}

export interface CategoryBreakdown {
  slug: string
  name: string
  count: number
  percentage: number
}

export interface RegionBreakdown {
  slug: string
  lid: number
  name: string
  count: number
  percentage: number
}

export interface AnalyticsDashboard {
  summary: DashboardStats
  time_series: TimeSeriesPoint[]
  by_category: CategoryBreakdown[]
  by_region: RegionBreakdown[]
  salary_distribution: {
    histogram: Array<{ range: string; count: number }>
    by_category: Array<{ name: string; avg_salary: number }>
  }
}

// Backup types
export interface Backup {
  filename: string
  size_bytes: number
  size_mb: number
  created_at: string
  type: 'daily' | 'weekly' | 'manual'
}

export interface BackupStatus {
  last_backup?: string
  last_backup_size_mb?: number
  backup_count_daily: number
  backup_count_weekly: number
  backup_count_manual: number
  total_size_mb: number
  health: 'healthy' | 'warning' | 'error'
  next_scheduled?: string
}

// Database types
export interface TableStats {
  name: string
  row_count: number
  size_bytes: number
  size_pretty: string
}

export interface QueryResult {
  columns: string[]
  rows: Record<string, unknown>[]
  row_count: number
  execution_time_ms: number
}

// Logs types
export interface LogEntry {
  timestamp: string
  level: 'debug' | 'info' | 'warning' | 'error'
  message: string
  service?: string
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    page_size: number
    total: number
    total_pages: number
  }
}

// Health
export interface HealthStatus {
  status: 'healthy' | 'unhealthy'
  database: 'connected' | 'disconnected'
  version?: string
  uptime?: string
}
