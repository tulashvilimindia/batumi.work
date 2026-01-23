/**
 * useTrackJobView Hook
 * Tracks when a job detail is viewed
 */
import { useEffect, useRef } from 'react';
import { trackJobView } from '@/api/analytics';
import type { Job } from '@/types/api';

export interface UseTrackJobViewOptions {
  /** Job ID to track */
  jobId: number | null | undefined;
  /** Job data (optional, for additional context) */
  job?: Job | null;
  /** Skip tracking */
  skip?: boolean;
  /** Delay before tracking (ms) - to ensure intentional view */
  delay?: number;
}

/**
 * Hook to track job detail views
 * Only tracks once per job ID per component lifecycle
 *
 * @param options - Configuration options
 *
 * @example
 * // Basic usage
 * useTrackJobView({ jobId: params.id });
 *
 * // With job data for context
 * useTrackJobView({
 *   jobId: job?.id,
 *   job: job,
 *   skip: isLoading
 * });
 *
 * // With delay to ensure intentional view
 * useTrackJobView({ jobId: job.id, delay: 1000 });
 */
export function useTrackJobView(options: UseTrackJobViewOptions): void {
  const { jobId, job, skip = false, delay = 0 } = options;

  // Track which job IDs we've already tracked
  const trackedJobsRef = useRef<Set<number>>(new Set());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any pending timeout on unmount or jobId change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [jobId]);

  useEffect(() => {
    // Skip if conditions not met
    if (skip || !jobId || typeof jobId !== 'number') {
      return;
    }

    // Skip if already tracked this job
    if (trackedJobsRef.current.has(jobId)) {
      return;
    }

    const track = () => {
      // Double check we haven't tracked while waiting
      if (trackedJobsRef.current.has(jobId)) {
        return;
      }

      // Mark as tracked
      trackedJobsRef.current.add(jobId);

      // Build additional data from job if available
      const additionalData: Record<string, unknown> = {};

      if (job) {
        if (job.category_slug) additionalData.category = job.category_slug;
        if (job.company_name) additionalData.company = job.company_name;
        if (job.is_vip) additionalData.is_vip = true;
        if (job.has_salary) additionalData.has_salary = true;
        if (job.source_name) additionalData.source = job.source_name;
      }

      trackJobView(jobId, additionalData);
    };

    if (delay > 0) {
      timeoutRef.current = setTimeout(track, delay);
    } else {
      track();
    }
  }, [jobId, job, skip, delay]);
}

/**
 * Track a job view imperatively (not as a hook)
 * Useful for tracking from event handlers
 *
 * @param jobId - Job ID
 * @param job - Optional job data for context
 *
 * @example
 * const handleJobClick = (job: Job) => {
 *   trackJobViewOnce(job.id, job);
 *   navigate(`/job/${job.id}`);
 * };
 */
const trackedJobs = new Set<number>();

export function trackJobViewOnce(jobId: number, job?: Job | null): void {
  if (trackedJobs.has(jobId)) return;

  trackedJobs.add(jobId);

  const additionalData: Record<string, unknown> = {};

  if (job) {
    if (job.category_slug) additionalData.category = job.category_slug;
    if (job.company_name) additionalData.company = job.company_name;
    if (job.is_vip) additionalData.is_vip = true;
    if (job.has_salary) additionalData.has_salary = true;
  }

  trackJobView(jobId, additionalData);
}

export default useTrackJobView;
