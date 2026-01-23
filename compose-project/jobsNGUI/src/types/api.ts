/**
 * API Types
 * TypeScript interfaces for all API responses and requests
 * Based on API_CONTRACT.md specification
 */

// =============================================================================
// JOB TYPES
// =============================================================================

/**
 * Job listing item (summary view)
 */
export interface Job {
  id: number;
  title_ge: string;
  title_en: string;
  company_name: string;
  location: string;
  category_slug: string;
  category_name_ge: string;
  category_name_en: string;
  region_slug: string;
  region_name_ge: string;
  region_name_en: string;
  salary_min: number | null;
  salary_max: number | null;
  has_salary: boolean;
  is_vip: boolean;
  is_remote: boolean;
  published_at: string; // ISO 8601 datetime
  deadline: string | null; // ISO 8601 datetime
  source_name: string;
  source_url: string;
  created_at: string;
  updated_at: string;
}

/**
 * Job detail (full view with body content)
 */
export interface JobDetail extends Job {
  body_ge: string; // Full description in Georgian (HTML)
  body_en: string; // Full description in English (HTML)
  external_id: string; // Original source ID
  views_count: number;
}

/**
 * Paginated jobs response
 */
export interface JobsResponse {
  items: Job[];
  total: number;
  pages: number;
  page: number;
  page_size: number;
}

// =============================================================================
// CATEGORY TYPES
// =============================================================================

/**
 * Job category
 */
export interface Category {
  id: number;
  slug: string;
  name_ge: string;
  name_en: string;
  jobsge_cid: number; // jobs.ge category ID
  job_count?: number; // Optional: active jobs count
}

// =============================================================================
// REGION TYPES
// =============================================================================

/**
 * Region/location
 */
export interface Region {
  id: number;
  slug: string;
  name_ge: string;
  name_en: string;
  jobsge_lid: number; // jobs.ge location ID
  job_count?: number; // Optional: active jobs count
}

// =============================================================================
// FILTER TYPES
// =============================================================================

/**
 * Job filters for list endpoint
 */
export interface JobFilters {
  q?: string; // Search query
  category?: string; // Category slug
  region?: string; // Region slug
  lid?: number; // Location ID (jobs.ge)
  cid?: number; // Category ID (jobs.ge)
  has_salary?: boolean; // Filter jobs with salary
  status?: string; // Job status (default: "active")
  page?: number; // Page number (default: 1)
  page_size?: number; // Items per page (default: 30, max: 100)
  sort?: string; // Sort field (prefix - for desc)
}

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

/**
 * Analytics event types
 */
export type AnalyticsEventType =
  | 'page_view'
  | 'job_view'
  | 'search'
  | 'job_click'
  | 'share'
  | 'save';

/**
 * Analytics event data based on event type
 */
export interface AnalyticsEventData {
  page_view: {
    url: string;
    title: string;
  };
  job_view: {
    job_id: number;
  };
  search: {
    query: string;
    category?: string;
    region?: string;
    results_count: number;
  };
  job_click: {
    job_id: number;
    position: number;
  };
  share: {
    platform: string;
    job_id: number;
  };
  save: {
    job_id: number;
  };
}

/**
 * Analytics event payload
 */
export interface AnalyticsEvent<T extends AnalyticsEventType = AnalyticsEventType> {
  event: T;
  session_id: string;
  timestamp: string; // ISO 8601 datetime
  language: 'ge' | 'en';
  referrer?: string;
  data?: T extends keyof AnalyticsEventData ? AnalyticsEventData[T] : Record<string, unknown>;
}

/**
 * Analytics track response
 */
export interface AnalyticsResponse {
  status: 'ok';
}

// =============================================================================
// STATS TYPES
// =============================================================================

/**
 * Public statistics
 */
export interface Stats {
  total_jobs: number;
  active_jobs: number;
  jobs_by_category: Record<string, number>;
  jobs_by_region: Record<string, number>;
  jobs_with_salary: number;
  last_updated: string;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

/**
 * Standard API error response
 */
export interface ErrorResponse {
  detail: string;
  code?: string;
  field?: string; // For validation errors
}

// =============================================================================
// LANGUAGE TYPES
// =============================================================================

/**
 * Supported languages
 */
export type Language = 'ge' | 'en';

/**
 * Helper type for bilingual fields
 */
export interface BilingualText {
  ge: string;
  en: string;
}
