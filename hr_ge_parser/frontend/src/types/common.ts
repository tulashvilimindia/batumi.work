// ============================================================
// PAGINATION TYPES
// ============================================================

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ============================================================
// API TYPES
// ============================================================

export interface ApiError {
  detail: string;
  status_code?: number;
}

// ============================================================
// FILTER TYPES
// ============================================================

export interface SortConfig {
  field: string;
  order: 'asc' | 'desc';
}

// ============================================================
// UI TYPES
// ============================================================

export type Variant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'default';

export type Size = 'sm' | 'md' | 'lg';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, item: T) => React.ReactNode;
}
