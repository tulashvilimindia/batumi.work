/**
 * SavedJobsPage - Cyberpunk Neon Edition
 * Page for displaying saved/bookmarked jobs with neon styling
 */

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bookmark, Trash2, Sparkles, Database } from 'lucide-react';
import { cn } from '@/lib';
import { Button, EmptyState } from '@/components/ui';
import { JobTable } from '@/components/job';
import { useSavedJobsStore } from '@/stores';
import type { Language } from '@/components/ui';

// Translations
const translations = {
  ge: {
    title: 'შენახული ვაკანსიები',
    subtitle: 'თქვენი შენახული ვაკანსიების სია',
    jobsCount: 'შენახული ვაკანსია',
    clearAll: 'ყველას წაშლა',
    confirmClear: 'დარწმუნებული ხართ?',
    emptyTitle: 'შენახული ვაკანსიები არ არის',
    emptyDescription: 'შეინახეთ ვაკანსიები მოგვიანებით სანახავად',
    browseJobs: 'ვაკანსიების ნახვა',
  },
  en: {
    title: 'Saved Jobs',
    subtitle: 'Your bookmarked job listings',
    jobsCount: 'saved jobs',
    clearAll: 'Clear All',
    confirmClear: 'Are you sure?',
    emptyTitle: 'No Saved Jobs',
    emptyDescription: 'Save jobs to view them later',
    browseJobs: 'Browse Jobs',
  },
};

export function SavedJobsPage() {
  const { lang = 'ge' } = useParams<{ lang: Language }>();
  const locale = lang === 'en' ? 'en' : 'ge';
  const t = translations[locale];

  const { savedJobs, clearAll } = useSavedJobsStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);

  const handleClearClick = () => {
    if (showConfirm) {
      clearAll();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  const jobCount = savedJobs.length;

  return (
    <div className={cn('space-y-6')}>
      {/* Header Card */}
      <div
        className="relative rounded-2xl p-6 md:p-8 overflow-hidden"
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
        style={{
          background: 'rgba(15, 15, 25, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          boxShadow: isHeaderHovered
            ? '0 0 40px rgba(139, 92, 246, 0.2), inset 0 0 40px rgba(139, 92, 246, 0.05)'
            : '0 0 20px rgba(139, 92, 246, 0.1)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, transparent 50%, rgba(0, 245, 255, 0.05) 100%)',
          }}
        />

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-6 h-[2px]" style={{ background: '#8B5CF6', boxShadow: '0 0 10px rgba(139, 92, 246, 0.8)' }} />
        <div className="absolute top-0 left-0 w-[2px] h-6" style={{ background: '#8B5CF6', boxShadow: '0 0 10px rgba(139, 92, 246, 0.8)' }} />
        <div className="absolute top-0 right-0 w-6 h-[2px]" style={{ background: '#00F5FF', boxShadow: '0 0 10px rgba(0, 245, 255, 0.8)' }} />
        <div className="absolute top-0 right-0 w-[2px] h-6" style={{ background: '#00F5FF', boxShadow: '0 0 10px rgba(0, 245, 255, 0.8)' }} />
        <div className="absolute bottom-0 left-0 w-6 h-[2px]" style={{ background: '#FF006E', boxShadow: '0 0 10px rgba(255, 0, 110, 0.8)' }} />
        <div className="absolute bottom-0 left-0 w-[2px] h-6" style={{ background: '#FF006E', boxShadow: '0 0 10px rgba(255, 0, 110, 0.8)' }} />
        <div className="absolute bottom-0 right-0 w-6 h-[2px]" style={{ background: '#39FF14', boxShadow: '0 0 10px rgba(57, 255, 20, 0.8)' }} />
        <div className="absolute bottom-0 right-0 w-[2px] h-6" style={{ background: '#39FF14', boxShadow: '0 0 10px rgba(57, 255, 20, 0.8)' }} />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className="p-3 rounded-xl"
              style={{
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)',
              }}
            >
              <Bookmark
                size={28}
                style={{
                  color: '#8B5CF6',
                  filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))',
                }}
              />
            </div>

            <div>
              <h1
                className="text-xl md:text-2xl font-bold flex items-center gap-2"
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  color: '#F0F0F5',
                }}
              >
                {t.title}
                <Sparkles
                  size={18}
                  style={{
                    color: '#FFE600',
                    filter: 'drop-shadow(0 0 5px rgba(255, 230, 0, 0.6))',
                  }}
                />
              </h1>
              <p
                className="text-sm mt-1"
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  color: '#A0A0B0',
                }}
              >
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Clear All Button */}
          {jobCount > 0 && (
            <button
              onClick={handleClearClick}
              className="relative inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold tracking-wider uppercase transition-all duration-300"
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '12px',
                background: showConfirm
                  ? 'rgba(255, 0, 110, 0.2)'
                  : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${showConfirm ? 'rgba(255, 0, 110, 0.6)' : 'rgba(255, 255, 255, 0.1)'}`,
                color: showConfirm ? '#FF006E' : '#A0A0B0',
                boxShadow: showConfirm ? '0 0 20px rgba(255, 0, 110, 0.3)' : 'none',
              }}
            >
              <Trash2 size={16} />
              {showConfirm ? t.confirmClear : t.clearAll}
            </button>
          )}
        </div>
      </div>

      {/* Jobs Count */}
      {jobCount > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{
            background: 'rgba(15, 15, 25, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <Database
            size={16}
            style={{
              color: '#00F5FF',
              filter: 'drop-shadow(0 0 5px rgba(0, 245, 255, 0.5))',
            }}
          />
          <p
            className="text-sm font-medium"
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              color: '#A0A0B0',
            }}
          >
            <span
              style={{
                color: '#00F5FF',
                textShadow: '0 0 10px rgba(0, 245, 255, 0.5)',
              }}
            >
              {jobCount}
            </span>{' '}
            {t.jobsCount}
          </p>
        </div>
      )}

      {/* Saved Jobs Table or Empty State */}
      {jobCount > 0 ? (
        <JobTable jobs={savedJobs} />
      ) : (
        <div className="relative">
          <EmptyState
            icon={<Bookmark size={32} />}
            title={t.emptyTitle}
            description={t.emptyDescription}
          />

          {/* Custom styled browse link */}
          <div className="text-center mt-6">
            <Link
              to={`/${lang}`}
              className="relative inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold tracking-wider uppercase transition-all duration-300 hover:scale-105"
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '14px',
                background: 'linear-gradient(135deg, rgba(0, 245, 255, 0.15), rgba(139, 92, 246, 0.15))',
                border: '1px solid rgba(0, 245, 255, 0.4)',
                color: '#00F5FF',
                boxShadow: '0 0 20px rgba(0, 245, 255, 0.2)',
                textShadow: '0 0 10px rgba(0, 245, 255, 0.5)',
              }}
            >
              {t.browseJobs}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default SavedJobsPage;
