// Application constants
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://batumi.work/api/v1';

export const DEFAULT_LANGUAGE =
  (import.meta.env.VITE_DEFAULT_LANGUAGE as 'ge' | 'en') || 'ge';

export const ANALYTICS_ENABLED =
  import.meta.env.VITE_ANALYTICS_ENABLED === 'true';

// Pagination
export const DEFAULT_PAGE_SIZE = 30;

// Date formats
export const DATE_FORMAT_SHORT = 'dd MMM';
export const DATE_FORMAT_LONG = 'dd MMMM yyyy';

// Job badge thresholds
export const NEW_JOB_HOURS = 48; // Jobs newer than 48 hours get NEW badge
