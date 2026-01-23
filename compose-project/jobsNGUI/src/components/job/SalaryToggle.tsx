/**
 * SalaryToggle Component
 * Checkbox to filter jobs showing salary only
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Language } from '@/components/ui';

export interface SalaryToggleProps {
  /** Whether salary filter is enabled */
  checked: boolean;
  /** Change handler */
  onChange: (checked: boolean) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Additional className */
  className?: string;
}

// Translations
const translations = {
  ge: {
    withSalaryOnly: 'მხოლოდ ხელფასით',
  },
  en: {
    withSalaryOnly: 'With Salary Only',
  },
};

/**
 * SalaryToggle renders a checkbox for filtering jobs with salary information
 */
export function SalaryToggle({
  checked,
  onChange,
  disabled = false,
  className,
}: SalaryToggleProps) {
  const { lang = 'ge' } = useParams<{ lang: Language }>();
  const locale = lang === 'en' ? 'en' : 'ge';
  const t = translations[locale];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <label
      className={cn(
        'inline-flex items-center gap-2',
        'cursor-pointer',
        'select-none',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="sr-only peer"
          aria-label={t.withSalaryOnly}
        />
        <div
          className={cn(
            'w-5 h-5',
            'rounded',
            'border-2',
            'transition-colors duration-150',
            // Unchecked state
            'border-[var(--color-border)]',
            'bg-[var(--color-surface)]',
            // Checked state
            'peer-checked:border-[var(--color-primary)]',
            'peer-checked:bg-[var(--color-primary)]',
            // Focus state
            'peer-focus-visible:ring-2',
            'peer-focus-visible:ring-[var(--color-primary)]',
            'peer-focus-visible:ring-opacity-50',
            'peer-focus-visible:ring-offset-2',
            // Hover state
            !disabled && 'hover:border-[var(--color-primary)]'
          )}
        />
        {checked && (
          <Check
            size={14}
            className={cn(
              'absolute top-1/2 left-1/2',
              '-translate-x-1/2 -translate-y-1/2',
              'text-white',
              'pointer-events-none'
            )}
            aria-hidden="true"
          />
        )}
      </div>
      <span
        className={cn(
          'text-sm',
          'text-[var(--color-text-primary)]',
          'whitespace-nowrap'
        )}
      >
        {t.withSalaryOnly}
      </span>
    </label>
  );
}

export default SalaryToggle;
