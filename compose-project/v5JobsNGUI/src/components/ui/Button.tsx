/**
 * Button Component - Adjarian Folk Edition
 * Traditional styled buttons with embroidery-like effects
 */

import React, { forwardRef, useState } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'folk-red' | 'folk-green' | 'folk-gold';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const sizeStyles = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

// Folk variant configurations
const folkVariants = {
  primary: {
    base: 'linear-gradient(135deg, #8B2635, #A83C4B)',
    hover: 'linear-gradient(135deg, #A83C4B, #8B2635)',
    shadow: '#3D2914',
    textColor: '#F5E6D3',
    border: '#D4A574',
  },
  secondary: {
    base: 'rgba(107, 68, 35, 0.1)',
    hover: 'rgba(107, 68, 35, 0.2)',
    shadow: 'transparent',
    textColor: '#6B4423',
    border: 'rgba(107, 68, 35, 0.3)',
  },
  ghost: {
    base: 'transparent',
    hover: 'rgba(212, 165, 116, 0.15)',
    shadow: 'transparent',
    textColor: '#6B4423',
    border: 'transparent',
  },
  outline: {
    base: 'transparent',
    hover: 'rgba(139, 38, 53, 0.1)',
    shadow: 'transparent',
    textColor: '#8B2635',
    border: '#8B2635',
  },
  danger: {
    base: 'linear-gradient(135deg, #8B2635, #6B1D29)',
    hover: 'linear-gradient(135deg, #6B1D29, #8B2635)',
    shadow: '#3D2914',
    textColor: '#F5E6D3',
    border: '#6B1D29',
  },
  'folk-red': {
    base: 'linear-gradient(135deg, #8B2635, #A83C4B)',
    hover: 'linear-gradient(135deg, #A83C4B, #B84455)',
    shadow: '#3D2914',
    textColor: '#F5E6D3',
    border: '#D4A574',
  },
  'folk-green': {
    base: 'linear-gradient(135deg, #2D5A3D, #3D7A5D)',
    hover: 'linear-gradient(135deg, #3D7A5D, #4A9D6D)',
    shadow: '#1A3D29',
    textColor: '#F5E6D3',
    border: '#4A9D6D',
  },
  'folk-gold': {
    base: 'linear-gradient(135deg, #D4A574, #E8B86D)',
    hover: 'linear-gradient(135deg, #E8B86D, #D4A574)',
    shadow: '#6B4423',
    textColor: '#3D2914',
    border: '#6B4423',
  },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const isDisabled = disabled || loading;
    const config = folkVariants[variant];

    const isPrimary = variant === 'primary' || variant === 'danger' ||
                     variant === 'folk-red' || variant === 'folk-green' || variant === 'folk-gold';
    const hasShadow = config.shadow !== 'transparent';

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'inline-flex items-center justify-center',
          'font-semibold tracking-wide',
          'rounded-lg',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4A574]',
          'active:scale-[0.98]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        style={{
          fontFamily: 'Source Sans Pro, sans-serif',
          background: isHovered && !isDisabled ? config.hover : config.base,
          color: config.textColor,
          border: `2px solid ${config.border}`,
          boxShadow: isDisabled
            ? 'none'
            : hasShadow
            ? isHovered
              ? `4px 4px 0 ${config.shadow}`
              : `3px 3px 0 ${config.shadow}`
            : 'none',
          transform: isHovered && !isDisabled && hasShadow
            ? 'translate(-1px, -1px)'
            : 'translate(0, 0)',
        }}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <FolkSpinner size={size} variant={variant} />
            <span className="sr-only">Loading...</span>
            {children && <span aria-hidden="true">{children}</span>}
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="shrink-0" aria-hidden="true">
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className="shrink-0" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

function FolkSpinner({
  size,
  variant,
}: {
  size: 'sm' | 'md' | 'lg';
  variant: keyof typeof folkVariants;
}) {
  const spinnerSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const isPrimary = variant === 'primary' || variant === 'danger' ||
                   variant === 'folk-red' || variant === 'folk-green';
  const color = isPrimary ? '#F5E6D3' : '#6B4423';

  return (
    <svg
      className={cn('animate-spin', spinnerSizes[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ color }}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default Button;
