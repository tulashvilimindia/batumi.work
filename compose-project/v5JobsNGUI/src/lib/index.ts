export { cn } from './utils';

// Date utilities
export {
  formatDate,
  formatDateShort,
  formatRelativeDate,
  formatJobDate,
  formatDeadline,
  isRecent,
  isPast,
  isFuture,
  getDaysUntilDeadline,
  // V5: Enhanced freshness
  getFreshnessLevel,
  getFreshnessLabel,
  FRESHNESS_LABELS,
} from './date';
export type { DateLocale, FreshnessLevel } from './date';
