// ============================================================
// ROUTE CONSTANTS
// ============================================================

export const ROUTES = {
  DASHBOARD: '/',
  JOBS: '/jobs',
  JOB_DETAIL: '/jobs/:id',
  COMPANIES: '/companies',
  COMPANY_DETAIL: '/companies/:id',
  ANALYTICS: '/analytics',
  PARSER: '/parser',
  PARSER_HISTORY: '/parser/history',
  SETTINGS: '/settings',
} as const;

// ============================================================
// NAVIGATION ITEMS
// ============================================================

export const NAV_ITEMS = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: ROUTES.JOBS, label: 'Jobs', icon: 'Briefcase' },
  { path: ROUTES.COMPANIES, label: 'Companies', icon: 'Building2' },
  { path: ROUTES.ANALYTICS, label: 'Analytics', icon: 'BarChart3' },
  { path: ROUTES.PARSER, label: 'Parser', icon: 'RefreshCw' },
  { path: ROUTES.SETTINGS, label: 'Settings', icon: 'Settings' },
] as const;

// ============================================================
// PAGINATION CONSTANTS
// ============================================================

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

// ============================================================
// PARSER CONSTANTS
// ============================================================

export const PARSER_STATUS_COLORS = {
  running: 'warning',
  completed: 'success',
  failed: 'danger',
} as const;

export const RUN_TYPE_LABELS = {
  full: 'Full Scrape',
  incremental: 'Incremental',
} as const;

// ============================================================
// UI CONSTANTS
// ============================================================

export const DEBOUNCE_DELAY = 300;
export const REFETCH_INTERVAL = 60000;
