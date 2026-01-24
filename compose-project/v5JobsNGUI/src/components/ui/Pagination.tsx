/**
 * Pagination Component - Adjarian Folk Edition
 * Traditional styled page navigation with warm colors
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
          <FolkPaginationButton
            onClick={() => canGoPrevious && onPageChange(currentPage - 1)}
            disabled={!canGoPrevious}
            aria-label="Go to previous page"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </FolkPaginationButton>
        </li>

        {/* Page numbers */}
        {pages.map((page) => {
          if (page === 'ellipsis-start' || page === 'ellipsis-end') {
            return (
              <li key={page} aria-hidden="true">
                <span
                  className="flex items-center justify-center w-10 h-10"
                  style={{ color: '#8B6B4B' }}
                >
                  <MoreHorizontal size={18} />
                </span>
              </li>
            );
          }

          const isCurrentPage = page === currentPage;

          return (
            <li key={page}>
              <FolkPaginationButton
                onClick={() => onPageChange(page)}
                isActive={isCurrentPage}
                aria-label={`Go to page ${page}`}
                aria-current={isCurrentPage ? 'page' : undefined}
              >
                {page}
              </FolkPaginationButton>
            </li>
          );
        })}

        {/* Next button */}
        <li>
          <FolkPaginationButton
            onClick={() => canGoNext && onPageChange(currentPage + 1)}
            disabled={!canGoNext}
            aria-label="Go to next page"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </FolkPaginationButton>
        </li>
      </ul>
    </nav>
  );
}

interface FolkPaginationButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
  'aria-label'?: string;
  'aria-current'?: 'page' | undefined;
}

function FolkPaginationButton({
  children,
  onClick,
  disabled = false,
  isActive = false,
  ...props
}: FolkPaginationButtonProps) {
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
        'text-sm font-semibold',
        'rounded-lg',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-[#D4A574]',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
      style={{
        fontFamily: 'Source Sans Pro, sans-serif',
        background: isActive
          ? 'linear-gradient(135deg, #8B2635, #A83C4B)'
          : isHovered && !disabled
          ? 'rgba(212, 165, 116, 0.2)'
          : '#FFFAF5',
        border: isActive
          ? '2px solid #D4A574'
          : `2px solid ${isHovered && !disabled ? '#D4A574' : '#C4A484'}`,
        color: isActive ? '#F5E6D3' : isHovered && !disabled ? '#8B2635' : '#6B4423',
        boxShadow: isActive
          ? '3px 3px 0 #3D2914'
          : isHovered && !disabled
          ? '2px 2px 0 #3D2914'
          : 'none',
        transform: (isActive || (isHovered && !disabled)) ? 'translate(-1px, -1px)' : 'translate(0, 0)',
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
      <FolkPaginationButton
        onClick={() => canGoPrevious && onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        aria-label="Go to previous page"
      >
        <ChevronLeft size={20} aria-hidden="true" />
      </FolkPaginationButton>

      <span
        className="text-sm tracking-wide"
        style={{
          fontFamily: 'Source Sans Pro, sans-serif',
          color: '#6B4423',
        }}
      >
        <span style={{ color: '#8B2635', fontWeight: 600 }}>{currentPage}</span>
        <span style={{ color: '#8B6B4B' }} className="mx-1">/</span>
        <span>{totalPages}</span>
      </span>

      <FolkPaginationButton
        onClick={() => canGoNext && onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        aria-label="Go to next page"
      >
        <ChevronRight size={20} aria-hidden="true" />
      </FolkPaginationButton>
    </nav>
  );
}

export default Pagination;
