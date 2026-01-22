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
export interface ParserRegion {
  id: string
  name_en: string
  name_ge: string
  slug: string
  enabled: boolean
  display_order: number
}

export interface ParserCategory {
  id: string
  name_en: string
  name_ge: string
  slug: string
}

export interface ParserConfig {
  regions: ParserRegion[]
  categories: ParserCategory[]
  sources: string[]
}

export interface ParseJobProgress {
  total: number
  processed: number
  successful: number
  failed: number
  skipped: number
  new: number
  updated: number
  percentage: number
}

export interface ParseJobCurrent {
  region?: string
  category?: string
  page?: number
  item?: string
}

export interface ParseJobTiming {
  created_at?: string
  started_at?: string
  paused_at?: string
  resumed_at?: string
  completed_at?: string
  pause_duration_seconds: number
}

export interface ParseJobControls {
  should_pause: boolean
  should_stop: boolean
  can_pause: boolean
  can_resume: boolean
  can_stop: boolean
  can_restart: boolean
}

export interface ParseJob {
  id: string
  batch_id?: string
  job_type: string
  source: string
  status: 'pending' | 'running' | 'paused' | 'stopping' | 'completed' | 'failed' | 'cancelled'
  config?: Record<string, unknown>
  scope: {
    region?: string
    category?: string
  }
  progress: ParseJobProgress
  current: ParseJobCurrent
  timing: ParseJobTiming
  error_message?: string
  triggered_by?: string
  controls: ParseJobControls
}

export interface ParserProgress {
  running: boolean
  jobs: ParseJob[]
}

export interface ParserStats {
  total_jobs: number
  total_regions: number
  total_categories: number
  parsed_today: number
  last_parsed?: string
  by_region: Array<{ name_en: string; name_ge: string; slug: string; count: number }>
  by_category: Array<{ name_en: string; name_ge: string; slug: string; count: number }>
  by_source: Array<{ source: string; count: number }>
  parse_jobs_7d: {
    total: number
    completed: number
    failed: number
    running: number
    new_items: number
    updated_items: number
    skipped_items: number
    failed_items: number
  }
  skip_reasons_7d: Array<{ reason: string; count: number }>
}

// Analytics types
export interface DashboardSummary {
  total_jobs: number
  active_jobs: number
  new_in_period: number
  with_salary: number
  vip_jobs: number
  avg_salary_min?: number
  avg_salary_max?: number
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

export interface FilterOption {
  value: string
  label: string
  label_ge?: string
  count: number
}

export interface FilterOptions {
  categories: FilterOption[]
  regions: FilterOption[]
  employment_types: FilterOption[]
  remote_types: FilterOption[]
  sources: FilterOption[]
  date_range: {
    min_date?: string
    max_date?: string
  }
}

export interface TimeSeriesPoint {
  date: string
  count: number
}

export interface BreakdownItem {
  name: string
  name_ge?: string
  slug?: string
  count: number
  percentage: number
}

export interface SalaryHistogramBin {
  range: string
  min_val: number
  max_val: number
  count: number
}

export interface SalaryCategoryItem {
  name: string
  avg_min: number
  avg_max: number
  count: number
}

export interface AnalyticsDashboard {
  summary: DashboardSummary
  time_series: TimeSeriesPoint[]
  by_category: BreakdownItem[]
  by_region: BreakdownItem[]
  by_employment: BreakdownItem[]
  by_remote: BreakdownItem[]
  salary_histogram: SalaryHistogramBin[]
  salary_by_category: SalaryCategoryItem[]
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
export interface TableInfo {
  name: string
  row_count: number
}

export interface TableDetails {
  name: string
  columns: Array<{
    name: string
    type: string
    nullable: boolean
    default?: string
  }>
  row_count: number
  sample_rows: Record<string, unknown>[]
}

export interface QueryResult {
  columns: string[]
  rows: Record<string, unknown>[]
  row_count: number
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
  service?: string
  version?: string
  database?: 'connected' | 'disconnected'
}

// Dashboard
export interface DashboardData {
  stats: {
    total_jobs: number
    active_jobs: number
    jobs_today: number
    jobs_with_salary: number
    total_regions: number
    total_categories: number
  }
  by_region: Array<{ name_en: string; name_ge: string; count: number }>
  by_category: Array<{ name_en: string; name_ge: string; count: number }>
  parser: {
    last_run?: string
  }
  backup: {
    count: number
    last_backup?: string
  }
  timestamp: string
}
