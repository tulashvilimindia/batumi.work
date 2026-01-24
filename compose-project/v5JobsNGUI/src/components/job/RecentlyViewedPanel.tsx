/**
 * RecentlyViewedPanel Component - V5 Feature
 * Dropdown panel showing recently viewed jobs
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Clock, X, Trash2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRecentViewsStore } from '@/stores';
import { formatDateShort } from '@/lib/date';
import type { Language } from '@/components/ui';

const translations = {
  ge: {
    title: 'ბოლოს ნანახი',
    empty: 'ჯერ არ გინახავთ ვაკანსიები',
    clearAll: 'გასუფთავება',
    viewAll: 'ყველა',
  },
  en: {
    title: 'Recently Viewed',
    empty: 'No recently viewed jobs',
    clearAll: 'Clear all',
    viewAll: 'View all',
  },
};

export interface RecentlyViewedPanelProps {
  className?: string;
}

export function RecentlyViewedPanel({ className }: RecentlyViewedPanelProps) {
  const { lang = 'ge' } = useParams<{ lang: Language }>();
  const locale = lang === 'en' ? 'en' : 'ge';
  const t = translations[locale];

  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { recentJobs, clearAll } = useRecentViewsStore();
  const hasRecentJobs = recentJobs.length > 0;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleClearAll = () => {
    clearAll();
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)} ref={panelRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative flex items-center justify-center',
          'w-9 h-9 rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-[#D4A574]',
          'hover:scale-105'
        )}
        style={{
          background: hasRecentJobs
            ? 'linear-gradient(135deg, #6B4423, #8B5A2B)'
            : 'rgba(107, 68, 35, 0.3)',
          border: '2px solid #D4A574',
          boxShadow: '2px 2px 0 #3D2914',
        }}
        aria-label={t.title}
      >
        <Clock size={16} style={{ color: '#F5E6D3' }} />
        {hasRecentJobs && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold"
            style={{
              background: '#8B2635',
              color: '#F5E6D3',
              border: '1px solid #D4A574',
            }}
          >
            {recentJobs.length}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="fixed md:absolute top-20 md:top-full left-4 right-4 md:left-auto md:right-0 md:mt-2 md:w-80 rounded-lg shadow-xl z-50"
          style={{
            background: '#FFFAF5',
            border: '2px solid #D4A574',
            boxShadow: '4px 4px 0 #3D2914',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid rgba(212, 165, 116, 0.5)' }}
          >
            <h3
              className="font-semibold text-sm"
              style={{ fontFamily: 'Playfair Display, serif', color: '#3D2914' }}
            >
              {t.title}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-[rgba(139,38,53,0.1)] transition-colors"
            >
              <X size={16} style={{ color: '#8B2635' }} />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {hasRecentJobs ? (
              <div className="py-2">
                {recentJobs.slice(0, 5).map((job) => {
                  const title = lang === 'en' ? job.title_en : job.title_ge;
                  return (
                    <Link
                      key={job.id}
                      to={`/${lang}/job/${job.external_id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-start gap-3 px-4 py-2 hover:bg-[rgba(212,165,116,0.1)] transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium line-clamp-1"
                          style={{ color: '#3D2914' }}
                        >
                          {title}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: '#8B6B4B' }}
                        >
                          {job.company_name}
                        </p>
                      </div>
                      <span
                        className="text-[10px] shrink-0"
                        style={{ color: '#8B6B4B' }}
                      >
                        {formatDateShort(job.published_at, locale)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Clock size={32} className="mx-auto mb-2 opacity-30" style={{ color: '#6B4423' }} />
                <p className="text-sm" style={{ color: '#8B6B4B' }}>
                  {t.empty}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {hasRecentJobs && (
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderTop: '1px solid rgba(212, 165, 116, 0.5)' }}
            >
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 text-xs transition-colors hover:opacity-70"
                style={{ color: '#8B2635' }}
              >
                <Trash2 size={12} />
                {t.clearAll}
              </button>
              <Link
                to={`/${lang}/saved`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: '#2D5A3D' }}
              >
                {t.viewAll}
                <ChevronRight size={12} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RecentlyViewedPanel;
