/**
 * Button Component - Cyberpunk Neon Edition
 * Glowing buttons with neon gradients and hover effects
 */

import React, { forwardRef, useState } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button style variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'neon-cyan' | 'neon-pink' | 'neon-purple';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Show loading spinner */
  loading?: boolean;
  /** Make button full width */
  fullWidth?: boolean;
  /** Icon to show on the left */
  leftIcon?: React.ReactNode;
  /** Icon to show on the right */
  rightIcon?: React.ReactNode;
}

const sizeStyles = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

// Neon variant configurations
const neonVariants = {
  primary: {
    base: 'linear-gradient(135deg, #00F5FF, #FF006E)',
    hover: 'linear-gradient(135deg, #00F5FF, #8B5CF6)',
    glow: 'rgba(0, 245, 255, 0.5)',
    hoverGlow: 'rgba(0, 245, 255, 0.7)',
  },
  secondary: {
    base: 'rgba(255, 255, 255, 0.05)',
    hover: 'rgba(255, 255, 255, 0.1)',
    glow: 'rgba(255, 255, 255, 0.1)',
    hoverGlow: 'rgba(255, 255, 255, 0.2)',
    border: 'rgba(255, 255, 255, 0.1)',
    borderHover: 'rgba(0, 245, 255, 0.3)',
  },
  ghost: {
    base: 'transparent',
    hover: 'rgba(0, 245, 255, 0.1)',
    glow: 'none',
    hoverGlow: 'rgba(0, 245, 255, 0.2)',
  },
  outline: {
    base: 'transparent',
    hover: 'rgba(0, 245, 255, 0.1)',
    glow: 'rgba(0, 245, 255, 0.2)',
    hoverGlow: 'rgba(0, 245, 255, 0.4)',
    border: 'rgba(0, 245, 255, 0.5)',
    borderHover: '#00F5FF',
  },
  danger: {
    base: 'linear-gradient(135deg, #FF006E, #FF4444)',
    hover: 'linear-gradient(135deg, #FF4444, #FF006E)',
    glow: 'rgba(255, 0, 110, 0.4)',
    hoverGlow: 'rgba(255, 0, 110, 0.6)',
  },
  'neon-cyan': {
    base: 'rgba(0, 245, 255, 0.1)',
    hover: 'rgba(0, 245, 255, 0.2)',
    glow: 'rgba(0, 245, 255, 0.3)',
    hoverGlow: 'rgba(0, 245, 255, 0.5)',
    border: 'rgba(0, 245, 255, 0.5)',
    borderHover: '#00F5FF',
    textColor: '#00F5FF',
  },
  'neon-pink': {
    base: 'rgba(255, 0, 110, 0.1)',
    hover: 'rgba(255, 0, 110, 0.2)',
    glow: 'rgba(255, 0, 110, 0.3)',
    hoverGlow: 'rgba(255, 0, 110, 0.5)',
    border: 'rgba(255, 0, 110, 0.5)',
    borderHover: '#FF006E',
    textColor: '#FF006E',
  },
  'neon-purple': {
    base: 'rgba(139, 92, 246, 0.1)',
    hover: 'rgba(139, 92, 246, 0.2)',
    glow: 'rgba(139, 92, 246, 0.3)',
    hoverGlow: 'rgba(139, 92, 246, 0.5)',
    border: 'rgba(139, 92, 246, 0.5)',
    borderHover: '#8B5CF6',
    textColor: '#8B5CF6',
  },
};

/**
 * Cyberpunk Button component with neon glow effects
 */
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
    const config = neonVariants[variant];

    const isPrimaryOrDanger = variant === 'primary' || variant === 'danger';
    const hasCustomBorder = 'border' in config;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'inline-flex items-center justify-center',
          'font-semibold tracking-wider uppercase',
          'rounded-lg',
          'transition-all duration-300',
          'focus:outline-none',
          'active:scale-[0.98]',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        style={{
          fontFamily: 'Rajdhani, sans-serif',
          background: isHovered && !isDisabled ? config.hover : config.base,
          color: isPrimaryOrDanger
            ? 'white'
            : ('textColor' in config ? config.textColor : '#E0E0E8'),
          border: hasCustomBorder
            ? `1px solid ${isHovered && !isDisabled ? config.borderHover : config.border}`
            : 'none',
          boxShadow: isDisabled
            ? 'none'
            : isHovered
            ? `0 0 25px ${config.hoverGlow}, 0 0 50px ${config.hoverGlow}`
            : `0 0 15px ${config.glow}`,
          textShadow: isPrimaryOrDanger || isHovered
            ? '0 0 10px currentColor'
            : 'none',
          transform: isHovered && !isDisabled ? 'translateY(-2px)' : 'translateY(0)',
        }}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <NeonSpinner size={size} variant={variant} />
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

/** Internal neon loading spinner for Button component */
function NeonSpinner({
  size,
  variant,
}: {
  size: 'sm' | 'md' | 'lg';
  variant: keyof typeof neonVariants;
}) {
  const spinnerSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const isPrimaryOrDanger = variant === 'primary' || variant === 'danger';
  const color = isPrimaryOrDanger
    ? '#ffffff'
    : 'textColor' in neonVariants[variant]
    ? neonVariants[variant].textColor
    : '#00F5FF';

  return (
    <svg
      className={cn('animate-spin', spinnerSizes[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{
        filter: `drop-shadow(0 0 5px ${color})`,
      }}
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
