/**
 * Pagination Component - Cyberpunk Neon Edition
 * Glowing page navigation with neon effects
 */

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingsCount?: number;
  className?: string;
}

function getPageNumbers(
  currentPage: number,
  totalPages: number,
  siblingsCount: number
): (number | 'ellipsis-start' | 'ellipsis-end')[] {
  const totalPageNumbers = siblingsCount * 2 + 5;

  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingsCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingsCount, totalPages);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];

  pages.push(1);

  if (showLeftEllipsis) {
    pages.push('ellipsis-start');
  } else if (leftSiblingIndex > 1) {
    pages.push(2);
  }

  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
    if (i !== 1 && i !== totalPages) {
      pages.push(i);
    }
  }

  if (showRightEllipsis) {
    pages.push('ellipsis-end');
  } else if (rightSiblingIndex < totalPages) {
    if (rightSiblingIndex < totalPages - 1) {
      pages.push(totalPages - 1);
    }
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

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

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className={cn('flex justify-center', className)}
      aria-label="Pagination"
    >
      <ul className="flex items-center gap-2" role="list">
        {/* Previous button */}
        <li>
          <PaginationButton
            onClick={() => canGoPrevious && onPageChange(currentPage - 1)}
            disabled={!canGoPrevious}
            aria-label="Go to previous page"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </PaginationButton>
        </li>

        {/* Page numbers */}
        {pages.map((page) => {
          if (page === 'ellipsis-start' || page === 'ellipsis-end') {
            return (
              <li key={page} aria-hidden="true">
                <span className="flex items-center justify-center w-10 h-10 text-text-tertiary">
                  <MoreHorizontal size={18} />
                </span>
              </li>
            );
          }

          const isCurrentPage = page === currentPage;

          return (
            <li key={page}>
              <PaginationButton
                onClick={() => onPageChange(page)}
                isActive={isCurrentPage}
                aria-label={`Go to page ${page}`}
                aria-current={isCurrentPage ? 'page' : undefined}
              >
                {page}
              </PaginationButton>
            </li>
          );
        })}

        {/* Next button */}
        <li>
          <PaginationButton
            onClick={() => canGoNext && onPageChange(currentPage + 1)}
            disabled={!canGoNext}
            aria-label="Go to next page"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </PaginationButton>
        </li>
      </ul>
    </nav>
  );
}

interface PaginationButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
  'aria-label'?: string;
  'aria-current'?: 'page' | undefined;
}

function PaginationButton({
  children,
  onClick,
  disabled = false,
  isActive = false,
  ...props
}: PaginationButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'flex items-center justify-center',
        'min-w-[40px] h-10 px-3',
        'text-sm font-semibold tracking-wider',
        'rounded-lg',
        'transition-all duration-300',
        'focus:outline-none',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
      style={{
        fontFamily: 'Rajdhani, sans-serif',
        background: isActive
          ? 'linear-gradient(135deg, #00F5FF, #FF006E)'
          : isHovered && !disabled
          ? 'rgba(0, 245, 255, 0.15)'
          : 'rgba(255, 255, 255, 0.03)',
        border: isActive
          ? 'none'
          : `1px solid ${isHovered && !disabled ? 'rgba(0, 245, 255, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
        color: isActive ? 'white' : isHovered && !disabled ? '#00F5FF' : '#A0A0B0',
        boxShadow: isActive
          ? '0 0 20px rgba(0, 245, 255, 0.5), 0 0 40px rgba(255, 0, 110, 0.3)'
          : isHovered && !disabled
          ? '0 0 15px rgba(0, 245, 255, 0.3)'
          : 'none',
        textShadow: isActive || (isHovered && !disabled) ? '0 0 10px currentColor' : 'none',
      }}
      {...props}
    >
      {children}
    </button>
  );
}

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

  return (
    <nav
      className={cn('flex items-center justify-center gap-4', className)}
      aria-label="Pagination"
    >
      <PaginationButton
        onClick={() => canGoPrevious && onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        aria-label="Go to previous page"
      >
        <ChevronLeft size={20} aria-hidden="true" />
      </PaginationButton>

      <span
        className="text-sm tracking-wider"
        style={{
          fontFamily: 'Rajdhani, sans-serif',
          color: '#00F5FF',
          textShadow: '0 0 10px rgba(0, 245, 255, 0.5)',
        }}
      >
        <span className="text-neon-pink">{currentPage}</span>
        <span className="text-text-tertiary mx-1">/</span>
        <span>{totalPages}</span>
      </span>

      <PaginationButton
        onClick={() => canGoNext && onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        aria-label="Go to next page"
      >
        <ChevronRight size={20} aria-hidden="true" />
      </PaginationButton>
    </nav>
  );
}

export default Pagination;
