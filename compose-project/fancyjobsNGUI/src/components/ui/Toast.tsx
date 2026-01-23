/**
 * Toast Component - Cyberpunk Neon Edition
 * Notification toasts with neon glow effects
 */

import React, { useEffect, useCallback, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ToastProps {
  /** Unique toast identifier */
  id: string;
  /** Toast message */
  message: string;
  /** Toast type/variant */
  type?: 'success' | 'error' | 'warning' | 'info';
  /** Auto-dismiss duration in ms (0 to disable) */
  duration?: number;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Callback when toast is dismissed */
  onClose: (id: string) => void;
}

const typeConfig = {
  success: {
    Icon: CheckCircle,
    color: '#39FF14',
    glow: 'rgba(57, 255, 20, 0.5)',
    bgGlow: 'rgba(57, 255, 20, 0.1)',
    label: 'SUCCESS',
  },
  error: {
    Icon: AlertCircle,
    color: '#FF006E',
    glow: 'rgba(255, 0, 110, 0.5)',
    bgGlow: 'rgba(255, 0, 110, 0.1)',
    label: 'ERROR',
  },
  warning: {
    Icon: AlertTriangle,
    color: '#FFE600',
    glow: 'rgba(255, 230, 0, 0.5)',
    bgGlow: 'rgba(255, 230, 0, 0.1)',
    label: 'WARNING',
  },
  info: {
    Icon: Info,
    color: '#00F5FF',
    glow: 'rgba(0, 245, 255, 0.5)',
    bgGlow: 'rgba(0, 245, 255, 0.1)',
    label: 'INFO',
  },
};

/**
 * Cyberpunk Toast notification component
 */
export function Toast({
  id,
  message,
  type = 'info',
  duration = 4000,
  action,
  onClose,
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const config = typeConfig[type];
  const { Icon } = config;

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  }, [id, onClose]);

  // Auto-dismiss timer
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'relative flex items-start gap-4',
        'w-full max-w-sm p-4',
        'rounded-xl',
        'transition-all duration-300',
        isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
      )}
      style={{
        background: 'rgba(10, 10, 20, 0.95)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${config.color}40`,
        boxShadow: `0 0 30px ${config.bgGlow}, inset 0 0 30px ${config.bgGlow}`,
      }}
    >
      {/* Left accent line */}
      <div
        className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full"
        style={{
          background: config.color,
          boxShadow: `0 0 10px ${config.glow}`,
        }}
      />

      {/* Icon */}
      <div
        className="shrink-0 mt-0.5"
        style={{
          color: config.color,
          filter: `drop-shadow(0 0 8px ${config.glow})`,
        }}
      >
        <Icon size={20} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Type label */}
        <div
          className="text-[10px] font-bold tracking-[0.2em] mb-1"
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            color: config.color,
            textShadow: `0 0 10px ${config.glow}`,
          }}
        >
          {config.label}
        </div>

        {/* Message */}
        <p
          className="text-sm leading-relaxed"
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            color: '#E0E0E8',
          }}
        >
          {message}
        </p>

        {/* Action button */}
        {action && (
          <button
            type="button"
            onClick={() => {
              action.onClick();
              handleClose();
            }}
            className="mt-3 text-sm font-semibold tracking-wider uppercase transition-all duration-300"
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              color: config.color,
              textShadow: `0 0 10px ${config.glow}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            {action.label} →
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={handleClose}
        className="shrink-0 p-1.5 rounded-lg transition-all duration-300"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          color: '#A0A0B0',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 0, 110, 0.2)';
          e.currentTarget.style.color = '#FF006E';
          e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 0, 110, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.color = '#A0A0B0';
          e.currentTarget.style.boxShadow = 'none';
        }}
        aria-label="Dismiss notification"
      >
        <X size={14} aria-hidden="true" />
      </button>

      {/* Corner accent */}
      <div
        className="absolute top-0 right-0 w-4 h-[1px]"
        style={{ background: config.color, boxShadow: `0 0 5px ${config.glow}` }}
      />
      <div
        className="absolute top-0 right-0 w-[1px] h-4"
        style={{ background: config.color, boxShadow: `0 0 5px ${config.glow}` }}
      />
    </div>
  );
}

export interface ToastContainerProps {
  /** Array of toast items to render */
  toasts: Array<Omit<ToastProps, 'onClose'>>;
  /** Callback to remove a toast */
  onRemove: (id: string) => void;
  /** Position of the toast container */
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

const positionStyles = {
  'top-right': 'top-4 right-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

/**
 * Container component that renders toast notifications
 */
export function ToastContainer({
  toasts,
  onRemove,
  position = 'bottom-center',
}: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        'fixed z-50',
        'flex flex-col gap-3',
        'pointer-events-none',
        positionStyles[position]
      )}
      aria-label="Notifications"
    >
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="pointer-events-auto"
          style={{
            animation: `fade-in 0.3s ease forwards`,
            animationDelay: `${index * 0.1}s`,
          }}
        >
          <Toast {...toast} onClose={onRemove} />
        </div>
      ))}
    </div>
  );
}

export default Toast;
