/**
 * Analytics Client
 * Tracks user interactions and events
 */
import { API_BASE_URL } from './client';

/**
 * Event types for analytics tracking
 */
export type AnalyticsEventType =
  | 'page_view'
  | 'job_view'
  | 'search'
  | 'share'
  | 'save'
  | 'filter_change'
  | 'language_change'
  | 'theme_change';

/**
 * Analytics event payload
 */
export interface AnalyticsEvent {
  /** Event type identifier */
  event: AnalyticsEventType;
  /** Unique session identifier */
  session_id: string;
  /** ISO timestamp */
  timestamp: string;
  /** Current language (ge/en) */
  language?: string;
  /** Current page URL */
  url?: string;
  /** Additional event-specific data */
  data?: Record<string, unknown>;
}

/**
 * Generate or retrieve session ID from sessionStorage
 */
function getSessionId(): string {
  const STORAGE_KEY = 'analytics_session_id';
  let sessionId = sessionStorage.getItem(STORAGE_KEY);

  if (!sessionId) {
    sessionId = crypto.randomUUID?.() || generateFallbackUUID();
    sessionStorage.setItem(STORAGE_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Fallback UUID generator for browsers without crypto.randomUUID
 */
function generateFallbackUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get current language from URL or localStorage
 */
function getCurrentLanguage(): string {
  const pathMatch = window.location.pathname.match(/^\/(ge|en)(\/|$)/);
  if (pathMatch) {
    return pathMatch[1];
  }
  return localStorage.getItem('i18nextLng') || 'ge';
}

/**
 * Track an analytics event
 * Non-blocking - errors are caught and logged
 *
 * @param event - The analytics event to track
 * @returns Promise that resolves when tracking is complete
 *
 * @example
 * trackEvent({
 *   event: 'page_view',
 *   session_id: getSessionId(),
 *   timestamp: new Date().toISOString(),
 *   url: '/ge/',
 * });
 */
export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  try {
    // Use sendBeacon for non-blocking tracking (fire and forget)
    const payload = JSON.stringify(event);

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(`${API_BASE_URL}/analytics/track`, blob);
    } else {
      // Fallback to fetch with keepalive
      await fetch(`${API_BASE_URL}/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      });
    }
  } catch (error) {
    // Silently log errors - analytics should never break the app
    console.warn('Analytics tracking failed:', error);
  }
}

/**
 * Create and track a page view event
 *
 * @param title - Page title
 * @param additionalData - Additional data to include
 */
export function trackPageView(title?: string, additionalData?: Record<string, unknown>): void {
  trackEvent({
    event: 'page_view',
    session_id: getSessionId(),
    timestamp: new Date().toISOString(),
    language: getCurrentLanguage(),
    url: window.location.pathname + window.location.search,
    data: {
      title: title || document.title,
      referrer: document.referrer || undefined,
      ...additionalData,
    },
  });
}

/**
 * Create and track a job view event
 *
 * @param jobId - The job ID being viewed
 * @param additionalData - Additional data (category, company, etc.)
 */
export function trackJobView(jobId: number, additionalData?: Record<string, unknown>): void {
  trackEvent({
    event: 'job_view',
    session_id: getSessionId(),
    timestamp: new Date().toISOString(),
    language: getCurrentLanguage(),
    url: window.location.pathname + window.location.search,
    data: {
      job_id: jobId,
      ...additionalData,
    },
  });
}

/**
 * Create and track a search event
 *
 * @param query - Search query string
 * @param resultsCount - Number of results found
 * @param filters - Applied filters
 */
export function trackSearch(
  query: string,
  resultsCount: number,
  filters?: Record<string, string | number | boolean | undefined>
): void {
  trackEvent({
    event: 'search',
    session_id: getSessionId(),
    timestamp: new Date().toISOString(),
    language: getCurrentLanguage(),
    url: window.location.pathname + window.location.search,
    data: {
      query,
      results_count: resultsCount,
      filters,
    },
  });
}

/**
 * Create and track a share event
 *
 * @param platform - Share platform (facebook, telegram, etc.)
 * @param jobId - Job being shared (optional)
 * @param success - Whether share was successful
 */
export function trackShare(
  platform: string,
  jobId?: number,
  success: boolean = true
): void {
  trackEvent({
    event: 'share',
    session_id: getSessionId(),
    timestamp: new Date().toISOString(),
    language: getCurrentLanguage(),
    url: window.location.pathname + window.location.search,
    data: {
      platform,
      job_id: jobId,
      success,
    },
  });
}

/**
 * Create and track a save/unsave job event
 *
 * @param jobId - Job being saved
 * @param saved - Whether job was saved (true) or unsaved (false)
 */
export function trackSave(jobId: number, saved: boolean): void {
  trackEvent({
    event: 'save',
    session_id: getSessionId(),
    timestamp: new Date().toISOString(),
    language: getCurrentLanguage(),
    data: {
      job_id: jobId,
      action: saved ? 'save' : 'unsave',
    },
  });
}

/**
 * Create and track a filter change event
 *
 * @param filterType - Type of filter changed
 * @param value - New filter value
 */
export function trackFilterChange(
  filterType: string,
  value: string | number | boolean | undefined
): void {
  trackEvent({
    event: 'filter_change',
    session_id: getSessionId(),
    timestamp: new Date().toISOString(),
    language: getCurrentLanguage(),
    url: window.location.pathname + window.location.search,
    data: {
      filter_type: filterType,
      value,
    },
  });
}

/**
 * Create and track a language change event
 *
 * @param newLanguage - New language code
 * @param previousLanguage - Previous language code
 */
export function trackLanguageChange(newLanguage: string, previousLanguage?: string): void {
  trackEvent({
    event: 'language_change',
    session_id: getSessionId(),
    timestamp: new Date().toISOString(),
    language: newLanguage,
    data: {
      new_language: newLanguage,
      previous_language: previousLanguage,
    },
  });
}

/**
 * Create and track a theme change event
 *
 * @param newTheme - New theme (light/dark/system)
 * @param previousTheme - Previous theme
 */
export function trackThemeChange(newTheme: string, previousTheme?: string): void {
  trackEvent({
    event: 'theme_change',
    session_id: getSessionId(),
    timestamp: new Date().toISOString(),
    language: getCurrentLanguage(),
    data: {
      new_theme: newTheme,
      previous_theme: previousTheme,
    },
  });
}

// Export session ID getter for external use
export { getSessionId };
