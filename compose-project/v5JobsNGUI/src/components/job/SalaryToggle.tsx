/**
 * SalaryToggle Component - Adjarian Folk Edition
 * Warm styled checkbox with traditional colors
 */

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Language } from '@/components/ui';

export interface SalaryToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
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

export function SalaryToggle({
  checked,
  onChange,
  disabled = false,
  className,
}: SalaryToggleProps) {
  const { lang = 'ge' } = useParams<{ lang: Language }>();
  const locale = lang === 'en' ? 'en' : 'ge';
  const t = translations[locale];
  const [isHovered, setIsHovered] = useState(false);

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
        'inline-flex items-center gap-3',
        'cursor-pointer',
        'select-none',
        'px-4 py-2',
        'rounded-lg',
        'transition-all duration-200',
        disabled && 'opacity-40 cursor-not-allowed',
        className
      )}
      style={{
        background: checked
          ? 'rgba(45, 90, 61, 0.15)'
          : isHovered
          ? 'rgba(45, 90, 61, 0.08)'
          : 'transparent',
        border: `1px solid ${checked ? 'rgba(45, 90, 61, 0.5)' : isHovered ? 'rgba(45, 90, 61, 0.3)' : 'rgba(196, 164, 132, 0.3)'}`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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

        {/* Custom checkbox */}
        <div
          className={cn(
            'w-5 h-5',
            'rounded-md',
            'transition-all duration-200',
            'flex items-center justify-center'
          )}
          style={{
            background: checked
              ? 'linear-gradient(135deg, #2D5A3D, #3D7A5D)'
              : '#FFFAF5',
            border: checked
              ? '2px solid #2D5A3D'
              : '2px solid #C4A484',
            boxShadow: checked
              ? '1px 1px 0 #3D2914'
              : 'none',
          }}
        >
          {checked && (
            <Check
              size={14}
              style={{ color: '#F5E6D3' }}
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {/* Label with icon */}
      <div className="flex items-center gap-2">
        <Coins
          size={16}
          style={{
            color: checked ? '#2D5A3D' : '#8B6B4B',
          }}
        />
        <span
          className="text-sm tracking-wide whitespace-nowrap"
          style={{
            fontFamily: 'Source Sans Pro, sans-serif',
            color: checked ? '#2D5A3D' : isHovered ? '#3D2914' : '#6B4423',
            fontWeight: checked ? 600 : 400,
          }}
        >
          {t.withSalaryOnly}
        </span>
      </div>
    </label>
  );
}

export default SalaryToggle;
