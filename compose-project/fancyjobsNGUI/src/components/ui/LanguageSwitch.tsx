import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';

export type Language = 'ge' | 'en';

export interface LanguageSwitchProps {
  /** Current language */
  value: Language;
  /** Change handler */
  onChange: (language: Language) => void;
  /** Additional className */
  className?: string;
}

const LANGUAGE_STORAGE_KEY = 'jobsngui-language';

/**
 * Language switch component for toggling between Georgian and English
 * Persists preference to localStorage and updates document lang attribute
 */
export function LanguageSwitch({
  value,
  onChange,
  className,
}: LanguageSwitchProps) {
  // Update document lang attribute when language changes
  useEffect(() => {
    // Map 'ge' to 'ka' for proper ISO 639-1 code
    const langCode = value === 'ge' ? 'ka' : 'en';
    document.documentElement.lang = langCode;

    // Persist to localStorage
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, value);
    } catch {
      // Ignore storage errors (private browsing, etc.)
    }
  }, [value]);

  const handleLanguageChange = (language: Language) => {
    if (language !== value) {
      onChange(language);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Select language"
      className={cn('inline-flex rounded overflow-hidden', className)}
    >
      <button
        type="button"
        role="radio"
        aria-checked={value === 'ge'}
        onClick={() => handleLanguageChange('ge')}
        className={cn(
          'px-3 py-1.5',
          'text-xs font-medium',
          'transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2',
          'focus-visible:ring-[var(--color-primary)]',
          'focus-visible:ring-inset',
          value === 'ge'
            ? [
                'bg-[var(--color-primary)]',
                'text-white',
              ]
            : [
                'bg-[var(--color-surface)]',
                'text-[var(--color-text-secondary)]',
                'hover:bg-[var(--color-surface-hover)]',
                'border border-[var(--color-border)]',
                'border-r-0',
              ]
        )}
      >
        GE
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === 'en'}
        onClick={() => handleLanguageChange('en')}
        className={cn(
          'px-3 py-1.5',
          'text-xs font-medium',
          'transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2',
          'focus-visible:ring-[var(--color-primary)]',
          'focus-visible:ring-inset',
          value === 'en'
            ? [
                'bg-[var(--color-primary)]',
                'text-white',
              ]
            : [
                'bg-[var(--color-surface)]',
                'text-[var(--color-text-secondary)]',
                'hover:bg-[var(--color-surface-hover)]',
                'border border-[var(--color-border)]',
              ]
        )}
      >
        EN
      </button>
    </div>
  );
}

/**
 * Get initial language from localStorage or browser preference
 */
export function getInitialLanguage(): Language {
  // Try localStorage first
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'ge' || stored === 'en') {
      return stored;
    }
  } catch {
    // Ignore storage errors
  }

  // Fall back to browser language
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('ka') || browserLang.startsWith('ge')) {
      return 'ge';
    }
  }

  // Default to Georgian
  return 'ge';
}

export default LanguageSwitch;
