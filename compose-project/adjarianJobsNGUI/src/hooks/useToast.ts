import { useState, useCallback } from 'react';
import type { ToastProps } from '../components/ui/Toast';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem extends Omit<ToastProps, 'onClose'> {
  id: string;
}

interface UseToastReturn {
  /** Current list of toasts */
  toasts: ToastItem[];
  /** Show a toast with full options */
  show: (props: Omit<ToastItem, 'id'>) => void;
  /** Show a success toast */
  success: (message: string, options?: Partial<Omit<ToastItem, 'id' | 'message' | 'type'>>) => void;
  /** Show an error toast */
  error: (message: string, options?: Partial<Omit<ToastItem, 'id' | 'message' | 'type'>>) => void;
  /** Show a warning toast */
  warning: (message: string, options?: Partial<Omit<ToastItem, 'id' | 'message' | 'type'>>) => void;
  /** Show an info toast */
  info: (message: string, options?: Partial<Omit<ToastItem, 'id' | 'message' | 'type'>>) => void;
  /** Remove a specific toast by id */
  remove: (id: string) => void;
  /** Remove all toasts */
  clear: () => void;
}

let toastCounter = 0;

/**
 * Hook for managing toast notifications
 *
 * @example
 * const { toasts, success, error, remove } = useToast();
 *
 * // Show a success toast
 * success('Job saved successfully!');
 *
 * // Show an error toast
 * error('Failed to load jobs');
 *
 * // Show a toast with action
 * show({
 *   message: 'Job saved',
 *   type: 'success',
 *   action: {
 *     label: 'View saved',
 *     onClick: () => navigate('/saved'),
 *   },
 * });
 *
 * // Render toasts
 * <ToastContainer toasts={toasts} onRemove={remove} />
 */
export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const generateId = useCallback(() => {
    toastCounter += 1;
    return `toast-${toastCounter}-${Date.now()}`;
  }, []);

  const show = useCallback(
    (props: Omit<ToastItem, 'id'>) => {
      const id = generateId();
      const newToast: ToastItem = {
        id,
        duration: 4000,
        type: 'info',
        ...props,
      };
      setToasts((prev) => [...prev, newToast]);
    },
    [generateId]
  );

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clear = useCallback(() => {
    setToasts([]);
  }, []);

  const createTypeMethod = useCallback(
    (type: ToastType) =>
      (message: string, options?: Partial<Omit<ToastItem, 'id' | 'message' | 'type'>>) => {
        show({ message, type, ...options });
      },
    [show]
  );

  return {
    toasts,
    show,
    success: createTypeMethod('success'),
    error: createTypeMethod('error'),
    warning: createTypeMethod('warning'),
    info: createTypeMethod('info'),
    remove,
    clear,
  };
}

export default useToast;
