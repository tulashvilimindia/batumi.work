/**
 * LanguageSwitch Component - Cyberpunk Neon Edition
 * Toggle between Georgian and English with neon effects
 */

import { useEffect, useState } from 'react';
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
 * Cyberpunk language switch component with neon glow effects
 */
export function LanguageSwitch({
  value,
  onChange,
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

    const colors = {
      ge: { color: '#FF006E', glow: 'rgba(255, 0, 110, 0.5)' },
      en: { color: '#00F5FF', glow: 'rgba(0, 245, 255, 0.5)' },
    };

    const { color, glow } = colors[lang];

    return {
      background: isActive
        ? `linear-gradient(135deg, ${color}40, ${color}20)`
        : isHoveredButton
          ? 'rgba(255, 255, 255, 0.05)'
          : 'transparent',
      color: isActive ? color : isHoveredButton ? '#E0E0E8' : '#A0A0B0',
      borderColor: isActive ? `${color}80` : 'rgba(255, 255, 255, 0.1)',
      boxShadow: isActive
        ? `0 0 15px ${glow}, inset 0 0 10px ${glow}`
        : 'none',
      textShadow: isActive ? `0 0 10px ${glow}` : 'none',
    };
  };

  return (
    <div
      role="radiogroup"
      aria-label="Select language"
      className={cn(
        'inline-flex rounded-xl overflow-hidden relative',
        className
      )}
      style={{
        background: 'rgba(10, 10, 20, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '2px',
      }}
    >
      {/* Animated background glow */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.3), transparent 70%)',
        }}
      />

      <button
        type="button"
        role="radio"
        aria-checked={value === 'ge'}
        onClick={() => handleLanguageChange('ge')}
        onMouseEnter={() => setIsHovered('ge')}
        onMouseLeave={() => setIsHovered(null)}
        className={cn(
          'relative px-4 py-2',
          'text-xs font-bold tracking-[0.15em] uppercase',
          'transition-all duration-300',
          'focus:outline-none',
          'rounded-l-lg'
        )}
        style={{
          fontFamily: 'Rajdhani, sans-serif',
          ...getButtonStyle('ge'),
        }}
      >
        <span className="relative z-10">GE</span>
        {value === 'ge' && (
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px]"
            style={{
              background: '#FF006E',
              boxShadow: '0 0 8px rgba(255, 0, 110, 0.8)',
            }}
          />
        )}
      </button>

      {/* Divider */}
      <div
        className="w-[1px] my-1"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(139, 92, 246, 0.5), transparent)',
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
          'relative px-4 py-2',
          'text-xs font-bold tracking-[0.15em] uppercase',
          'transition-all duration-300',
          'focus:outline-none',
          'rounded-r-lg'
        )}
        style={{
          fontFamily: 'Rajdhani, sans-serif',
          ...getButtonStyle('en'),
        }}
      >
        <span className="relative z-10">EN</span>
        {value === 'en' && (
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px]"
            style={{
              background: '#00F5FF',
              boxShadow: '0 0 8px rgba(0, 245, 255, 0.8)',
            }}
          />
        )}
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
