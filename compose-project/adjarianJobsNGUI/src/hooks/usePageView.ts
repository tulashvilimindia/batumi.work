/**
 * usePageView Hook
 * Tracks page views on route changes
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/api/analytics';

export interface UsePageViewOptions {
  /** Page title (defaults to document.title) */
  title?: string;
  /** Whether to track on initial mount */
  trackOnMount?: boolean;
  /** Whether to track on route changes */
  trackOnChange?: boolean;
  /** Additional data to include with the event */
  additionalData?: Record<string, unknown>;
  /** Skip tracking entirely */
  skip?: boolean;
}

/**
 * Hook to track page views automatically on route changes
 *
 * @param options - Configuration options
 *
 * @example
 * // Basic usage - tracks on mount and route changes
 * usePageView();
 *
 * // With custom title
 * usePageView({ title: 'Job Details' });
 *
 * // Skip tracking conditionally
 * usePageView({ skip: !isLoggedIn });
 *
 * // With additional data
 * usePageView({
 *   title: 'Search Results',
 *   additionalData: { query: searchQuery, count: results.length }
 * });
 */
export function usePageView(options: UsePageViewOptions = {}): void {
  const {
    title,
    trackOnMount = true,
    trackOnChange = true,
    additionalData,
    skip = false,
  } = options;

  const location = useLocation();
  const previousPathRef = useRef<string | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (skip) return;

    const currentPath = location.pathname + location.search;
    const previousPath = previousPathRef.current;
    const isMount = isFirstRender.current;

    isFirstRender.current = false;

    // Determine if we should track
    const shouldTrack =
      (isMount && trackOnMount) ||
      (!isMount && trackOnChange && previousPath !== currentPath);

    if (shouldTrack) {
      trackPageView(title, additionalData);
    }

    // Update previous path
    previousPathRef.current = currentPath;
  }, [location.pathname, location.search, title, trackOnMount, trackOnChange, additionalData, skip]);
}

/**
 * Hook to track a specific page view once
 * Useful for tracking a page view with specific data
 *
 * @param title - Page title
 * @param data - Additional data
 *
 * @example
 * useTrackPageOnce('Home Page', { featured_jobs: 5 });
 */
export function useTrackPageOnce(title: string, data?: Record<string, unknown>): void {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      hasTracked.current = true;
      trackPageView(title, data);
    }
  }, [title, data]);
}

export default usePageView;
