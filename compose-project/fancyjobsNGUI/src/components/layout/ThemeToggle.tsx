/**
 * ThemeToggle Component - Cyberpunk Neon Edition
 * Cycle through themes with neon glow effects
 */

import { useState } from 'react';
import { Sun, Moon, Monitor, Zap } from 'lucide-react';
import { useThemeStore, type Theme } from '@/stores';
import { cn } from '@/lib';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

const themeConfig: Record<
  Theme,
  {
    Icon: typeof Sun;
    label: string;
    color: string;
    glow: string;
  }
> = {
  light: {
    Icon: Sun,
    label: 'Light',
    color: '#FFE600',
    glow: 'rgba(255, 230, 0, 0.5)',
  },
  dark: {
    Icon: Moon,
    label: 'Dark',
    color: '#8B5CF6',
    glow: 'rgba(139, 92, 246, 0.5)',
  },
  system: {
    Icon: Monitor,
    label: 'System',
    color: '#00F5FF',
    glow: 'rgba(0, 245, 255, 0.5)',
  },
};

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore();
  const [isHovered, setIsHovered] = useState(false);

  const config = themeConfig[theme];
  const { Icon, label, color, glow } = config;

  return (
    <button
      onClick={toggleTheme}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative flex items-center gap-2 p-2.5 rounded-xl',
        'transition-all duration-300',
        'focus:outline-none',
        className
      )}
      style={{
        background: isHovered
          ? `${color}15`
          : 'rgba(255, 255, 255, 0.03)',
        border: `1px solid ${isHovered ? `${color}60` : 'rgba(255, 255, 255, 0.1)'}`,
        boxShadow: isHovered
          ? `0 0 20px ${glow}, inset 0 0 15px ${glow}`
          : 'none',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
      }}
      aria-label={`Current theme: ${label}. Click to change theme.`}
      title={`Theme: ${label}`}
    >
      {/* Background glow pulse */}
      {isHovered && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${color}20, transparent 70%)`,
            animation: 'pulse-glow 2s ease-in-out infinite',
          }}
        />
      )}

      {/* Icon with neon effect */}
      <span
        className="relative flex items-center justify-center w-5 h-5 transition-all duration-300"
        style={{
          color: isHovered ? color : '#A0A0B0',
          filter: isHovered ? `drop-shadow(0 0 8px ${glow})` : 'none',
        }}
      >
        <Icon size={18} aria-hidden="true" />
      </span>

      {/* Label with neon text */}
      {showLabel && (
        <span
          className="text-xs font-bold tracking-[0.1em] uppercase transition-all duration-300"
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            color: isHovered ? color : '#A0A0B0',
            textShadow: isHovered ? `0 0 10px ${glow}` : 'none',
          }}
        >
          {label}
        </span>
      )}

      {/* Electricity spark indicator */}
      <div
        className="absolute -top-1 -right-1 w-2 h-2 rounded-full transition-opacity duration-300"
        style={{
          background: color,
          boxShadow: `0 0 6px ${glow}`,
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* Corner accents on hover */}
      {isHovered && (
        <>
          <div
            className="absolute top-0 left-0 w-2 h-[1px]"
            style={{ background: color, boxShadow: `0 0 4px ${glow}` }}
          />
          <div
            className="absolute top-0 left-0 w-[1px] h-2"
            style={{ background: color, boxShadow: `0 0 4px ${glow}` }}
          />
          <div
            className="absolute bottom-0 right-0 w-2 h-[1px]"
            style={{ background: color, boxShadow: `0 0 4px ${glow}` }}
          />
          <div
            className="absolute bottom-0 right-0 w-[1px] h-2"
            style={{ background: color, boxShadow: `0 0 4px ${glow}` }}
          />
        </>
      )}
    </button>
  );
}
