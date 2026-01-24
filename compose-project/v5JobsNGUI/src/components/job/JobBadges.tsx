/**
 * JobBadges Component
 * Displays conditional badges for job listings (NEW, VIP, Salary, Remote)
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui';
import { isRecent } from '@/lib/date';
import type { Job } from '@/types';

export interface JobBadgesProps {
  /** Job data */
  job: Job;
  /** Badge size */
  size?: 'sm' | 'md';
  /** Additional className */
  className?: string;
}

/**
 * Combined badges display for job listings
 * Shows NEW, VIP, Salary, and Remote badges based on job properties
 */
export function JobBadges({ job, size = 'sm', className }: JobBadgesProps) {
  const isNew = isRecent(job.published_at, 48); // NEW if published within 48 hours
  const hasAnyBadge = isNew || job.is_vip || job.has_salary || job.is_remote;

  if (!hasAnyBadge) {
    return null;
  }

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {isNew && (
        <Badge variant="new" size={size}>
          NEW
        </Badge>
      )}
      {job.is_vip && (
        <Badge variant="vip" size={size}>
          VIP
        </Badge>
      )}
      {job.has_salary && (
        <Badge variant="salary" size={size}>
          &#8382;
        </Badge>
      )}
      {job.is_remote && (
        <Badge variant="remote" size={size}>
          Remote
        </Badge>
      )}
    </span>
  );
}

export default JobBadges;
