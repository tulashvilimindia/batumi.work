/**
 * JobRow Component - Adjarian Folk Edition
 * Mobile-first design with clear hierarchy
 */

import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatDateShort } from '@/lib/date';
import { isRecent } from '@/lib/date';
import type { Job } from '@/types';
import type { Language } from '@/components/ui';

export interface JobRowProps {
  job: Job;
  onClick?: (job: Job) => void;
  className?: string;
}

export function JobRow({ job, onClick, className }: JobRowProps) {
  const { lang = 'ge' } = useParams<{ lang: Language }>();
  const locale = lang === 'en' ? 'en' : 'ge';
  const [isHovered, setIsHovered] = useState(false);

  const title = lang === 'en' ? job.title_en : job.title_ge;
  const publishedDate = formatDateShort(job.published_at, locale);
  const deadlineDate = job.deadline_at ? formatDateShort(job.deadline_at, locale) : null;
  const isNew = isRecent(job.published_at, 48);

  const handleClick = () => {
    onClick?.(job);
  };

  return (
    <tr
      className={cn(
        'group relative transition-all duration-200',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered
          ? 'linear-gradient(90deg, rgba(212, 165, 116, 0.1), transparent)'
          : 'transparent',
      }}
    >
      {/* Main Content Column - Full width on mobile */}
      <td
        className="p-3 md:p-4 relative"
        style={{
          borderBottom: '1px solid rgba(196, 164, 132, 0.3)',
        }}
      >
        {/* VIP indicator - left border */}
        {job.is_vip && (
          <div
            className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
            style={{ background: 'linear-gradient(180deg, #D4A574, #E8B86D)' }}
          />
        )}

        {/* Mobile Layout - Stacked with badges on right */}
        <div className="md:hidden">
          <div className="flex items-start justify-between gap-2">
            {/* Left: Title & Company */}
            <div className="flex-1 min-w-0">
              <Link
                to={`/${lang}/job/${job.external_id}`}
                onClick={handleClick}
                className="block font-medium text-sm leading-tight line-clamp-2"
                style={{
                  fontFamily: 'Source Sans Pro, sans-serif',
                  color: job.is_vip ? '#6B4423' : '#3D2914',
                }}
              >
                {title}
              </Link>
              <div
                className="mt-1 text-sm truncate"
                style={{
                  fontFamily: 'Source Sans Pro, sans-serif',
                  color: '#6B4423',
                }}
              >
                {job.company_name}
              </div>
            </div>

            {/* Right: Compact Badges */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              {/* Badge row */}
              <div className="flex items-center gap-1">
                {isNew && (
                  <span
                    className="px-1.5 py-0.5 text-[9px] font-bold rounded"
                    style={{
                      background: 'linear-gradient(135deg, #8B2635, #A83C4B)',
                      color: '#F5E6D3',
                    }}
                  >
                    NEW
                  </span>
                )}
                {job.has_salary && (
                  <span
                    className="w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded"
                    style={{
                      background: 'rgba(45, 90, 61, 0.15)',
                      color: '#2D5A3D',
                      border: '1px solid rgba(45, 90, 61, 0.3)',
                    }}
                  >
                    ₾
                  </span>
                )}
                {job.is_remote && (
                  <span
                    className="w-5 h-5 flex items-center justify-center text-[9px] rounded"
                    style={{
                      background: 'rgba(46, 107, 138, 0.15)',
                      color: '#2E6B8A',
                      border: '1px solid rgba(46, 107, 138, 0.3)',
                    }}
                  >
                    🏠
                  </span>
                )}
              </div>
              {/* Date */}
              <span
                className="text-[10px]"
                style={{
                  fontFamily: 'Source Sans Pro, sans-serif',
                  color: '#8B6B4B',
                }}
              >
                {publishedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Original with inline badges */}
        <div className="hidden md:block">
          <div className="flex items-center gap-2">
            <Link
              to={`/${lang}/job/${job.external_id}`}
              onClick={handleClick}
              className="font-medium transition-colors duration-200"
              style={{
                fontFamily: 'Source Sans Pro, sans-serif',
                color: job.is_vip
                  ? '#8B6B2B'
                  : isHovered
                  ? '#8B2635'
                  : '#3D2914',
              }}
            >
              {title}
            </Link>
            {/* Desktop badges - inline */}
            <span className="inline-flex items-center gap-1">
              {isNew && (
                <span
                  className="px-2 py-0.5 text-[10px] font-semibold rounded-md"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139, 38, 53, 0.2), rgba(168, 60, 75, 0.2))',
                    color: '#8B2635',
                    border: '1.5px solid #A83C4B',
                  }}
                >
                  NEW
                </span>
              )}
              {job.is_vip && (
                <span
                  className="px-2 py-0.5 text-[10px] font-semibold rounded-md"
                  style={{
                    background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.3), rgba(232, 184, 109, 0.3))',
                    color: '#6B4423',
                    border: '1.5px solid #D4A574',
                  }}
                >
                  VIP
                </span>
              )}
              {job.has_salary && (
                <span
                  className="px-2 py-0.5 text-[10px] font-semibold rounded-md"
                  style={{
                    background: 'linear-gradient(135deg, rgba(45, 90, 61, 0.2), rgba(74, 157, 109, 0.2))',
                    color: '#2D5A3D',
                    border: '1.5px solid #3D7A5D',
                  }}
                >
                  ₾
                </span>
              )}
              {job.is_remote && (
                <span
                  className="px-2 py-0.5 text-[10px] font-semibold rounded-md"
                  style={{
                    background: 'rgba(46, 107, 138, 0.15)',
                    color: '#2E6B8A',
                    border: '1.5px solid rgba(46, 107, 138, 0.5)',
                  }}
                >
                  Remote
                </span>
              )}
            </span>
          </div>
        </div>
      </td>

      {/* Company Column - Desktop only */}
      <td
        className="p-4 hidden md:table-cell"
        style={{
          borderBottom: '1px solid rgba(196, 164, 132, 0.3)',
        }}
      >
        <span
          className="text-sm transition-colors duration-200"
          style={{
            fontFamily: 'Source Sans Pro, sans-serif',
            color: isHovered ? '#2D5A3D' : '#6B4423',
          }}
        >
          {job.company_name}
        </span>
      </td>

      {/* Published Date Column - Desktop only */}
      <td
        className="p-4 hidden md:table-cell"
        style={{
          borderBottom: '1px solid rgba(196, 164, 132, 0.3)',
        }}
      >
        <span
          className="text-sm"
          style={{
            fontFamily: 'Source Sans Pro, sans-serif',
            color: '#8B6B4B',
          }}
        >
          {publishedDate}
        </span>
      </td>

      {/* Deadline Column - Desktop only */}
      <td
        className="p-4 hidden md:table-cell"
        style={{
          borderBottom: '1px solid rgba(196, 164, 132, 0.3)',
        }}
      >
        <span
          className="text-sm"
          style={{
            fontFamily: 'Source Sans Pro, sans-serif',
            color: deadlineDate ? '#8B2635' : '#8B6B4B',
            fontWeight: deadlineDate ? 500 : 400,
          }}
        >
          {deadlineDate || '-'}
        </span>
      </td>
    </tr>
  );
}

export default JobRow;
