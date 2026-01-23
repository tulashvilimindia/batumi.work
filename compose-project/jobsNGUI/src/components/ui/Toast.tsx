import React, { useEffect, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
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

const typeStyles = {
  success: {
    container: 'border-[var(--color-success)]',
    icon: 'text-[var(--color-success)]',
    Icon: CheckCircle,
  },
  error: {
    container: 'border-[var(--color-error)]',
    icon: 'text-[var(--color-error)]',
    Icon: AlertCircle,
  },
  warning: {
    container: 'border-[var(--color-warning)]',
    icon: 'text-[var(--color-warning)]',
    Icon: AlertTriangle,
  },
  info: {
    container: 'border-[var(--color-info)]',
    icon: 'text-[var(--color-info)]',
    Icon: Info,
  },
};

/**
 * Individual Toast notification component
 */
export function Toast({
  id,
  message,
  type = 'info',
  duration = 4000,
  action,
  onClose,
}: ToastProps) {
  const { container: containerStyle, icon: iconStyle, Icon } = typeStyles[type];

  const handleClose = useCallback(() => {
    onClose(id);
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
        'flex items-start gap-3',
        'w-full max-w-sm p-4',
        'bg-[var(--color-surface)]',
        'border-l-4 rounded shadow-lg',
        'animate-in slide-in-from-bottom-2 fade-in duration-300',
        containerStyle
      )}
    >
      <Icon
        size={20}
        className={cn('shrink-0 mt-0.5', iconStyle)}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--color-text-primary)]">{message}</p>
        {action && (
          <button
            type="button"
            onClick={() => {
              action.onClick();
              handleClose();
            }}
            className={cn(
              'mt-2 text-sm font-medium',
              'text-[var(--color-primary)]',
              'hover:text-[var(--color-primary-hover)]',
              'focus:outline-none focus-visible:underline'
            )}
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={handleClose}
        className={cn(
          'shrink-0 p-1 rounded',
          'text-[var(--color-text-tertiary)]',
          'hover:text-[var(--color-text-primary)]',
          'hover:bg-[var(--color-surface-hover)]',
          'focus:outline-none focus-visible:ring-2',
          'focus-visible:ring-[var(--color-primary)]',
          'transition-colors'
        )}
        aria-label="Dismiss notification"
      >
        <X size={16} aria-hidden="true" />
      </button>
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
        'flex flex-col gap-2',
        'pointer-events-none',
        positionStyles[position]
      )}
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onClose={onRemove} />
        </div>
      ))}
    </div>
  );
}

export default Toast;
