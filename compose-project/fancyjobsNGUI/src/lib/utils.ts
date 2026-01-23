import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function for merging Tailwind CSS classes with proper conflict resolution
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 *
 * @example
 * cn('px-2 py-1', 'p-4') // Returns 'p-4' (p-4 overrides px-2 py-1)
 * cn('text-red-500', condition && 'text-blue-500') // Conditional class
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
