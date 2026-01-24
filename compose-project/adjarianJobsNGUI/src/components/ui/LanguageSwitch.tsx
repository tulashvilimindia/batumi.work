/**
 * LanguageSwitch Component - Adjarian Folk Edition
 * Toggle between Georgian and English with warm folk styling
 */

import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

export type Language = 'ge' | 'en';

export interface LanguageSwitchProps {
  /** Current language */
  value: Language;
  /** Change handler */
  onChange: (language: Language) => void;
  /** Compact mode for mobile */
  compact?: boolean;
  /** Additional className */
  className?: string;
}

const LANGUAGE_STORAGE_KEY = 'jobsngui-language';

/**
 * Folk-styled language switch component
 */
export function LanguageSwitch({
  value,
  onChange,
  compact = false,
  className,
}: LanguageSwitchProps) {
  const [isHovered, setIsHovered] = useState<Language | null>(null);

  // Update document lang attribute when language changes
  useEffect(() => {
    const langCode = value === 'ge' ? 'ka' : 'en';
    document.documentElement.lang = langCode;

    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, value);
    } catch {
      // Ignore storage errors
    }
  }, [value]);

  const handleLanguageChange = (language: Language) => {
    if (language !== value) {
      onChange(language);
    }
  };

  const getButtonStyle = (lang: Language) => {
    const isActive = value === lang;
    const isHoveredButton = isHovered === lang;

    // Folk theme colors
    const colors = {
      ge: { color: '#8B2635', bg: 'rgba(139, 38, 53, 0.15)' }, // Folk red
      en: { color: '#2D5A3D', bg: 'rgba(45, 90, 61, 0.15)' },  // Folk green
    };

    const { color, bg } = colors[lang];

    return {
      background: isActive
        ? `linear-gradient(135deg, ${color}, ${lang === 'ge' ? '#A83C4B' : '#3D7A5D'})`
        : isHoveredButton
          ? bg
          : 'transparent',
      color: isActive ? '#F5E6D3' : isHoveredButton ? color : '#8B6B4B',
      boxShadow: isActive
        ? '1px 1px 0 #3D2914'
        : 'none',
    };
  };

  return (
    <div
      role="radiogroup"
      aria-label="Select language"
      className={cn(
        'inline-flex rounded-lg overflow-hidden',
        className
      )}
      style={{
        background: 'rgba(61, 41, 20, 0.3)',
        border: '1px solid rgba(212, 165, 116, 0.4)',
        padding: '2px',
      }}
    >
      <button
        type="button"
        role="radio"
        aria-checked={value === 'ge'}
        onClick={() => handleLanguageChange('ge')}
        onMouseEnter={() => setIsHovered('ge')}
        onMouseLeave={() => setIsHovered(null)}
        className={cn(
          'relative',
          compact ? 'px-2 py-1' : 'px-3 py-1.5',
          'text-xs font-semibold tracking-wide uppercase',
          'transition-all duration-200',
          'focus:outline-none focus:ring-1 focus:ring-[#D4A574]',
          'rounded-l-md'
        )}
        style={{
          fontFamily: 'Source Sans Pro, sans-serif',
          ...getButtonStyle('ge'),
        }}
      >
        <span className="relative z-10">GE</span>
      </button>

      {/* Divider */}
      <div
        className="w-[1px] my-1"
        style={{
          background: 'rgba(212, 165, 116, 0.3)',
        }}
      />

      <button
        type="button"
        role="radio"
        aria-checked={value === 'en'}
        onClick={() => handleLanguageChange('en')}
        onMouseEnter={() => setIsHovered('en')}
        onMouseLeave={() => setIsHovered(null)}
        className={cn(
          'relative',
          compact ? 'px-2 py-1' : 'px-3 py-1.5',
          'text-xs font-semibold tracking-wide uppercase',
          'transition-all duration-200',
          'focus:outline-none focus:ring-1 focus:ring-[#D4A574]',
          'rounded-r-md'
        )}
        style={{
          fontFamily: 'Source Sans Pro, sans-serif',
          ...getButtonStyle('en'),
        }}
      >
        <span className="relative z-10">EN</span>
      </button>
    </div>
  );
}

/**
 * Get initial language from localStorage or browser preference
 */
export function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'ge' || stored === 'en') {
      return stored;
    }
  } catch {
    // Ignore storage errors
  }

  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('ka') || browserLang.startsWith('ge')) {
      return 'ge';
    }
  }

  return 'ge';
}

export default LanguageSwitch;
