// ============================================================
// DASHBOARD STATS
// ============================================================

export interface DashboardStats {
  total_jobs: number;
  total_companies: number;
  active_jobs: number;
  expired_jobs: number;
  jobs_with_salary: number;
  remote_jobs: number;
  student_jobs: number;
  last_updated: string | null;
}

// ============================================================
// LOCATION STATS
// ============================================================

export interface LocationStat {
  location: string;
  count: number;
  percentage?: number;
}

export type LocationStatsResponse = LocationStat[];

// ============================================================
// INDUSTRY STATS
// ============================================================

export interface IndustryStat {
  industry: string;
  count: number;
  percentage: number;
}

export interface IndustryStatsResponse {
  data: IndustryStat[];
  total: number;
}

// ============================================================
// SALARY STATS
// ============================================================

export interface SalaryStats {
  avg_salary_from: number | null;
  avg_salary_to: number | null;
  min_salary: number | null;
  max_salary: number | null;
  jobs_with_salary: number;
}
