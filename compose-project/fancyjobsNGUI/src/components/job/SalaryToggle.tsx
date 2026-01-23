/**
 * SalaryToggle Component - Cyberpunk Neon Edition
 * Glowing checkbox with neon effects
 */

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check, DollarSign } from 'lucide-react';
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
 * SalaryToggle - Cyberpunk styled salary filter checkbox
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
        'transition-all duration-300',
        disabled && 'opacity-40 cursor-not-allowed',
        className
      )}
      style={{
        background: checked
          ? 'rgba(57, 255, 20, 0.1)'
          : isHovered
          ? 'rgba(57, 255, 20, 0.05)'
          : 'transparent',
        border: `1px solid ${checked ? 'rgba(57, 255, 20, 0.5)' : isHovered ? 'rgba(57, 255, 20, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
        boxShadow: checked
          ? '0 0 15px rgba(57, 255, 20, 0.3)'
          : isHovered
          ? '0 0 10px rgba(57, 255, 20, 0.2)'
          : 'none',
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
            'rounded',
            'transition-all duration-300',
            'flex items-center justify-center'
          )}
          style={{
            background: checked
              ? 'linear-gradient(135deg, #39FF14, #00F5FF)'
              : 'rgba(10, 10, 20, 0.8)',
            border: checked
              ? 'none'
              : '1px solid rgba(57, 255, 20, 0.3)',
            boxShadow: checked
              ? '0 0 10px rgba(57, 255, 20, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.2)'
              : 'none',
          }}
        >
          {checked && (
            <Check
              size={14}
              className="text-white"
              style={{
                filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.8))',
              }}
              aria-hidden="true"
            />
          )}
        </div>
      </div>

      {/* Label with icon */}
      <div className="flex items-center gap-2">
        <DollarSign
          size={16}
          className={cn(
            'transition-all duration-300',
            checked ? 'text-neon-green' : 'text-text-tertiary'
          )}
          style={{
            filter: checked ? 'drop-shadow(0 0 5px #39FF14)' : 'none',
          }}
        />
        <span
          className={cn(
            'text-sm tracking-wider whitespace-nowrap',
            'transition-all duration-300'
          )}
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            color: checked ? '#39FF14' : isHovered ? '#E0E0E8' : '#A0A0B0',
            textShadow: checked ? '0 0 10px rgba(57, 255, 20, 0.5)' : 'none',
          }}
        >
          {t.withSalaryOnly}
        </span>
      </div>
    </label>
  );
}

export default SalaryToggle;
