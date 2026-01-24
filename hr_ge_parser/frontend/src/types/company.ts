import type { PaginationMeta } from './common';

// ============================================================
// BASE TYPES
// ============================================================

export interface Company {
  id: number;
  external_id: number;
  name: string;
  name_en: string | null;
  logo_url: string | null;
  thumbnail_url: string | null;
  cover_image_url: string | null;
  is_anonymous: boolean;
  is_blacklisted: boolean;
  status_id: number;
  job_count?: number;
  created_at: string | null;
  updated_at: string | null;
}

// ============================================================
// API TYPES
// ============================================================

export interface CompanyFilters {
  page?: number;
  per_page?: number;
  search?: string;
  is_anonymous?: boolean;
  sort_by?: 'name' | 'job_count' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface CompaniesResponse {
  data: Company[];
  meta: PaginationMeta;
}
