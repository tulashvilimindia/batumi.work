import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface PaginationProps {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Number of pages to show around the current page */
  siblingsCount?: number;
  /** Additional className */
  className?: string;
}

/**
 * Generate an array of page numbers to display
 * Shows first, last, current, and surrounding pages with ellipsis for gaps
 */
function getPageNumbers(
  currentPage: number,
  totalPages: number,
  siblingsCount: number
): (number | 'ellipsis-start' | 'ellipsis-end')[] {
  const totalPageNumbers = siblingsCount * 2 + 5; // siblings + first + last + current + 2 ellipsis

  // If we can show all pages
  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingsCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingsCount, totalPages);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];

  // Always show first page
  pages.push(1);

  // Left ellipsis
  if (showLeftEllipsis) {
    pages.push('ellipsis-start');
  } else if (leftSiblingIndex > 1) {
    // Show page 2 if no ellipsis but gap exists
    pages.push(2);
  }

  // Sibling pages and current
  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
    if (i !== 1 && i !== totalPages) {
      pages.push(i);
    }
  }

  // Right ellipsis
  if (showRightEllipsis) {
    pages.push('ellipsis-end');
  } else if (rightSiblingIndex < totalPages) {
    // Show second to last if no ellipsis but gap exists
    if (rightSiblingIndex < totalPages - 1) {
      pages.push(totalPages - 1);
    }
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

/**
 * Pagination component with page numbers, ellipsis, and prev/next buttons
 * Fully accessible with keyboard navigation
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingsCount = 1,
  className,
}: PaginationProps) {
  const pages = useMemo(
    () => getPageNumbers(currentPage, totalPages, siblingsCount),
    [currentPage, totalPages, siblingsCount]
  );

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onPageChange(currentPage + 1);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, page: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onPageChange(page);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  const buttonBaseStyles = cn(
    'flex items-center justify-center',
    'min-w-[40px] h-10 px-3',
    'text-sm font-medium',
    'rounded',
    'border border-[var(--color-border)]',
    'bg-[var(--color-surface)]',
    'transition-colors duration-200',
    'focus:outline-none focus-visible:ring-2',
    'focus-visible:ring-[var(--color-primary)]',
    'focus-visible:ring-offset-2'
  );

  return (
    <nav
      className={cn('flex justify-center', className)}
      aria-label="Pagination"
    >
      <ul className="flex items-center gap-1.5" role="list">
        {/* Previous button */}
        <li>
          <button
            type="button"
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            aria-label="Go to previous page"
            className={cn(
              buttonBaseStyles,
              'text-[var(--color-text-primary)]',
              'hover:bg-[var(--color-surface-hover)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'disabled:hover:bg-[var(--color-surface)]'
            )}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
        </li>

        {/* Page numbers */}
        {pages.map((page, index) => {
          if (page === 'ellipsis-start' || page === 'ellipsis-end') {
            return (
              <li key={page} aria-hidden="true">
                <span
                  className={cn(
                    buttonBaseStyles,
                    'border-transparent',
                    'bg-transparent',
                    'text-[var(--color-text-tertiary)]',
                    'cursor-default'
                  )}
                >
                  <MoreHorizontal size={18} />
                </span>
              </li>
            );
          }

          const isCurrentPage = page === currentPage;

          return (
            <li key={page}>
              <button
                type="button"
                onClick={() => onPageChange(page)}
                onKeyDown={(e) => handleKeyDown(e, page)}
                aria-label={`Go to page ${page}`}
                aria-current={isCurrentPage ? 'page' : undefined}
                className={cn(
                  buttonBaseStyles,
                  isCurrentPage
                    ? [
                        'bg-[var(--color-primary)]',
                        'border-[var(--color-primary)]',
                        'text-white',
                        'hover:bg-[var(--color-primary-hover)]',
                      ]
                    : [
                        'text-[var(--color-text-primary)]',
                        'hover:bg-[var(--color-surface-hover)]',
                      ]
                )}
              >
                {page}
              </button>
            </li>
          );
        })}

        {/* Next button */}
        <li>
          <button
            type="button"
            onClick={handleNext}
            disabled={!canGoNext}
            aria-label="Go to next page"
            className={cn(
              buttonBaseStyles,
              'text-[var(--color-text-primary)]',
              'hover:bg-[var(--color-surface-hover)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'disabled:hover:bg-[var(--color-surface)]'
            )}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  );
}

/**
 * Simplified mobile pagination showing only prev/next with page info
 */
export function MobilePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  if (totalPages <= 1) {
    return null;
  }

  const buttonStyles = cn(
    'flex items-center justify-center',
    'w-10 h-10',
    'rounded',
    'border border-[var(--color-border)]',
    'bg-[var(--color-surface)]',
    'text-[var(--color-text-primary)]',
    'transition-colors duration-200',
    'hover:bg-[var(--color-surface-hover)]',
    'focus:outline-none focus-visible:ring-2',
    'focus-visible:ring-[var(--color-primary)]',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  );

  return (
    <nav
      className={cn('flex items-center justify-center gap-4', className)}
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => canGoPrevious && onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        aria-label="Go to previous page"
        className={buttonStyles}
      >
        <ChevronLeft size={20} aria-hidden="true" />
      </button>

      <span className="text-sm text-[var(--color-text-secondary)]">
        Page {currentPage} of {totalPages}
      </span>

      <button
        type="button"
        onClick={() => canGoNext && onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        aria-label="Go to next page"
        className={buttonStyles}
      >
        <ChevronRight size={20} aria-hidden="true" />
      </button>
    </nav>
  );
}

export default Pagination;
