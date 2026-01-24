import { clsx, type ClassValue } from 'clsx';

// ============================================================
// CLASS NAME UTILITY
// ============================================================

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

// ============================================================
// URL HELPERS
// ============================================================

export function buildUrl(path: string, params: Record<string, string | number>): string {
  let url = path;
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, String(value));
  });
  return url;
}

// ============================================================
// OBJECT HELPERS
// ============================================================

export function cleanParams<T extends Record<string, unknown>>(params: T): Partial<T> {
  const cleaned: Partial<T> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      (cleaned as Record<string, unknown>)[key] = value;
    }
  });
  return cleaned;
}

// ============================================================
// ARRAY HELPERS
// ============================================================

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

// ============================================================
// DEBOUNCE
// ============================================================

export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
