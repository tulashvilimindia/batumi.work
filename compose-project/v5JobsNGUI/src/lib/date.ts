/**
 * Date Formatting Utilities
 * Helper functions for formatting dates in Georgian and English
 */

/**
 * Supported locales
 */
export type DateLocale = 'ge' | 'en';

/**
 * Locale mapping to Intl locale strings
 */
const LOCALE_MAP: Record<DateLocale, string> = {
  ge: 'ka-GE',
  en: 'en-US',
};

/**
 * Format a date as a full date string
 *
 * @param date - Date to format (string, Date, or number)
 * @param locale - Locale ('ge' or 'en')
 * @returns Formatted date string (e.g., "20 იანვარი, 2026" or "January 20, 2026")
 *
 * @example
 * formatDate('2026-01-20T10:00:00Z', 'ge') // "20 იანვარი, 2026"
 * formatDate('2026-01-20T10:00:00Z', 'en') // "January 20, 2026"
 */
export function formatDate(
  date: string | Date | number,
  locale: DateLocale = 'ge'
): string {
  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  return dateObj.toLocaleDateString(LOCALE_MAP[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format a date in short format
 *
 * @param date - Date to format
 * @param locale - Locale ('ge' or 'en')
 * @returns Short date string (e.g., "20 იან" or "20 Jan")
 *
 * @example
 * formatDateShort('2026-01-20T10:00:00Z', 'ge') // "20 იან"
 * formatDateShort('2026-01-20T10:00:00Z', 'en') // "20 Jan"
 */
export function formatDateShort(
  date: string | Date | number,
  locale: DateLocale = 'ge'
): string {
  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  return dateObj.toLocaleDateString(LOCALE_MAP[locale], {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Relative time labels
 */
const RELATIVE_TIME_LABELS = {
  ge: {
    now: 'ახლახანს',
    minute: 'წუთის წინ',
    minutes: 'წუთის წინ',
    hour: 'საათის წინ',
    hours: 'საათის წინ',
    day: 'დღის წინ',
    days: 'დღის წინ',
    week: 'კვირის წინ',
    weeks: 'კვირის წინ',
  },
  en: {
    now: 'just now',
    minute: 'minute ago',
    minutes: 'minutes ago',
    hour: 'hour ago',
    hours: 'hours ago',
    day: 'day ago',
    days: 'days ago',
    week: 'week ago',
    weeks: 'weeks ago',
  },
};

/**
 * Format a date as relative time
 *
 * @param date - Date to format
 * @param locale - Locale ('ge' or 'en')
 * @returns Relative time string (e.g., "2 საათის წინ" or "2 hours ago")
 *
 * @example
 * // 2 hours ago
 * formatRelativeDate(new Date(Date.now() - 2 * 60 * 60 * 1000), 'en')
 * // "2 hours ago"
 */
export function formatRelativeDate(
  date: string | Date | number,
  locale: DateLocale = 'ge'
): string {
  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  const labels = RELATIVE_TIME_LABELS[locale];

  // Less than 1 minute
  if (diffSeconds < 60) {
    return labels.now;
  }

  // Less than 1 hour
  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? labels.minute : labels.minutes}`;
  }

  // Less than 1 day
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? labels.hour : labels.hours}`;
  }

  // Less than 1 week
  if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? labels.day : labels.days}`;
  }

  // Less than 4 weeks, show weeks
  if (diffWeeks < 4) {
    return `${diffWeeks} ${diffWeeks === 1 ? labels.week : labels.weeks}`;
  }

  // More than 4 weeks, show actual date
  return formatDateShort(date, locale);
}

/**
 * Check if a date is within X hours of now
 *
 * @param date - Date to check
 * @param hours - Number of hours (default: 48)
 * @returns True if date is within the specified hours
 *
 * @example
 * // Check if job was posted in last 48 hours (for "NEW" badge)
 * isRecent(job.published_at, 48)
 */
export function isRecent(date: string | Date | number, hours: number = 48): boolean {
  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return false;
  }

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  return diffHours <= hours && diffHours >= 0;
}

/**
 * Check if a date is in the past
 *
 * @param date - Date to check
 * @returns True if date is in the past
 *
 * @example
 * // Check if deadline has passed
 * isPast(job.deadline)
 */
export function isPast(date: string | Date | number | null): boolean {
  if (!date) return false;

  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return false;
  }

  return dateObj.getTime() < Date.now();
}

/**
 * Check if a date is in the future
 *
 * @param date - Date to check
 * @returns True if date is in the future
 *
 * @example
 * // Check if deadline is still valid
 * isFuture(job.deadline)
 */
export function isFuture(date: string | Date | number | null): boolean {
  if (!date) return false;

  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return false;
  }

  return dateObj.getTime() > Date.now();
}

/**
 * Format date for job listing
 * Shows relative time for recent, short date otherwise
 *
 * @param date - Date to format
 * @param locale - Locale
 * @returns Formatted string
 */
export function formatJobDate(
  date: string | Date | number,
  locale: DateLocale = 'ge'
): string {
  // Show relative time for jobs within last week
  if (isRecent(date, 24 * 7)) {
    return formatRelativeDate(date, locale);
  }

  return formatDateShort(date, locale);
}

/**
 * Format deadline date
 *
 * @param deadline - Deadline date
 * @param locale - Locale
 * @returns Formatted deadline or null if no deadline
 */
export function formatDeadline(
  deadline: string | Date | number | null,
  locale: DateLocale = 'ge'
): string | null {
  if (!deadline) return null;

  const dateObj = new Date(deadline);

  if (isNaN(dateObj.getTime())) {
    return null;
  }

  return formatDate(deadline, locale);
}

/**
 * Get days until deadline
 *
 * @param deadline - Deadline date
 * @returns Number of days, or null if no deadline
 */
export function getDaysUntilDeadline(deadline: string | Date | number | null): number | null {
  if (!deadline) return null;

  const dateObj = new Date(deadline);

  if (isNaN(dateObj.getTime())) {
    return null;
  }

  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

// V5 Enhanced Freshness Levels
export type FreshnessLevel = 'just-posted' | 'today' | 'new' | 'recent' | 'normal';

/**
 * Freshness labels for each level
 */
export const FRESHNESS_LABELS = {
  ge: {
    'just-posted': 'ახლახანს',
    'today': 'დღეს',
    'new': 'ახალი',
    'recent': 'ახალი',
    'normal': '',
  },
  en: {
    'just-posted': 'Just Posted',
    'today': 'Today',
    'new': 'New',
    'recent': 'Recent',
    'normal': '',
  },
};

/**
 * Get freshness level of a job posting (V5 Feature)
 *
 * @param date - Published date
 * @returns Freshness level
 *
 * - just-posted: < 2 hours
 * - today: < 24 hours
 * - new: < 48 hours
 * - recent: < 7 days
 * - normal: > 7 days
 */
export function getFreshnessLevel(date: string | Date | number): FreshnessLevel {
  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return 'normal';
  }

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 2) return 'just-posted';
  if (diffHours < 24) return 'today';
  if (diffHours < 48) return 'new';
  if (diffHours < 168) return 'recent'; // 7 days
  return 'normal';
}

/**
 * Get freshness label for display
 */
export function getFreshnessLabel(
  date: string | Date | number,
  locale: DateLocale = 'ge'
): string {
  const level = getFreshnessLevel(date);
  return FRESHNESS_LABELS[locale][level];
}
