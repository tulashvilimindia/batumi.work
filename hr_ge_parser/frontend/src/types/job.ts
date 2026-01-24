import type { PaginationMeta } from './common';
import type { Company } from './company';

// ============================================================
// BASE TYPES
// ============================================================

export interface Job {
  id: number;
  external_id: number;
  title: string;
  title_en: string | null;
  description: string | null;
  company: Company | null;
  company_id: number | null;
  slug: string | null;
  publish_date: string | null;
  deadline_date: string | null;
  renewal_date: string | null;
  salary_from: number | null;
  salary_to: number | null;
  salary_currency: string;
  show_salary: boolean;
  is_with_bonus: boolean;
  is_work_from_home: boolean;
  is_suitable_for_student: boolean;
  employment_type: string | null;
  work_schedule: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_name: string | null;
  hide_contact_person: boolean;
  is_expired: boolean;
  is_priority: boolean;
  application_method: number | null;
  languages: string[] | null;
  addresses: string[] | null;
  benefits: string[] | null;
  driving_licenses: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  last_scraped_at: string | null;
}

// ============================================================
// API TYPES
// ============================================================

export interface JobFilters {
  page?: number;
  per_page?: number;
  search?: string;
  company_id?: number;
  is_expired?: boolean;
  is_work_from_home?: boolean;
  is_suitable_for_student?: boolean;
  salary_min?: number;
  salary_max?: number;
  location?: string;
  sort_by?: 'publish_date' | 'deadline_date' | 'salary_from' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface JobsResponse {
  data: Job[];
  meta: PaginationMeta;
}

// ============================================================
// UI TYPES
// ============================================================

export interface JobTableColumn {
  key: keyof Job | string;
  label: string;
  sortable?: boolean;
  width?: string;
}
