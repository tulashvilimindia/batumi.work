/**
 * Jobs API
 * Functions for fetching job listings and details
 */

import { get } from './client';
import type { Job, JobDetail, JobsResponse, JobFilters } from '@/types';

/**
 * Fetch paginated list of jobs with optional filters
 *
 * @param filters - Optional filters for the job list
 * @returns Promise resolving to paginated jobs response
 *
 * @example
 * // Fetch first page with default filters
 * const jobs = await fetchJobs({ page: 1 });
 *
 * // Fetch with search query and category filter
 * const jobs = await fetchJobs({
 *   q: 'developer',
 *   category: 'it-programming',
 *   has_salary: true
 * });
 */
export async function fetchJobs(filters: JobFilters = {}): Promise<JobsResponse> {
  const params: Record<string, string | number | boolean | undefined> = {
    page: filters.page ?? 1,
    page_size: filters.page_size ?? 30,
    status: filters.status ?? 'active',
  };

  // Add optional filters
  if (filters.q) {
    params.q = filters.q;
  }
  if (filters.category) {
    params.category = filters.category;
  }
  if (filters.lid !== undefined) {
    params.lid = filters.lid;
  }
  if (filters.cid !== undefined) {
    params.cid = filters.cid;
  }
  if (filters.has_salary !== undefined) {
    params.has_salary = filters.has_salary;
  }
  if (filters.sort) {
    params.sort = filters.sort;
  }
  if (filters.region) {
    params.region = filters.region;
  }

  return get<JobsResponse>('/jobs', params);
}

/**
 * Fetch a single job by ID
 *
 * @param id - The job ID (UUID string) to fetch
 * @returns Promise resolving to job detail
 * @throws ApiError with status 404 if job not found
 *
 * @example
 * const job = await fetchJob('94a8a69e-0435-4587-aa4d-7f655897c7a3');
 * console.log(job.title_ge, job.body_ge);
 */
export async function fetchJob(id: string): Promise<JobDetail> {
  return get<JobDetail>(`/jobs/${id}`);
}

/**
 * Helper to get localized title based on language
 */
export function getJobTitle(job: Job | JobDetail, language: 'ge' | 'en'): string {
  return language === 'en' && job.title_en ? job.title_en : job.title_ge;
}

/**
 * Helper to get localized category name
 */
export function getCategoryName(job: Job | JobDetail, language: 'ge' | 'en'): string {
  // Handle nested category object or flat fields
  if (job.category) {
    return language === 'en' ? job.category.name_en : job.category.name_ge;
  }
  return (language === 'en' && job.category_name_en
    ? job.category_name_en
    : job.category_name_ge) || '';
}

/**
 * Helper to get localized region name
 */
export function getRegionName(job: Job | JobDetail, language: 'ge' | 'en'): string {
  // Handle nested region object or flat fields
  if (job.region) {
    return language === 'en' ? job.region.name_en : job.region.name_ge;
  }
  return (language === 'en' && job.region_name_en
    ? job.region_name_en
    : job.region_name_ge) || '';
}

/**
 * Helper to format salary range
 */
export function formatSalary(job: Job | JobDetail): string | null {
  if (!job.has_salary) return null;

  const { salary_min, salary_max } = job;

  if (salary_min && salary_max) {
    if (salary_min === salary_max) {
      return `${salary_min} GEL`;
    }
    return `${salary_min} - ${salary_max} GEL`;
  }

  if (salary_min) {
    return `${salary_min}+ GEL`;
  }

  if (salary_max) {
    return `up to ${salary_max} GEL`;
  }

  return null;
}
