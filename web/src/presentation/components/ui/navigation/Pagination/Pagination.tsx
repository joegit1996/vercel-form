import React from 'react';
import { cn } from '../../../../../application/utils/cn';
import { Button } from '../../core/Button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
  disabled?: boolean;
}

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  ({ 
    currentPage,
    totalPages,
    onPageChange,
    className,
    size = 'md',
    variant = 'default',
    showFirstLast = true,
    showPrevNext = true,
    showPageNumbers = true,
    maxVisiblePages = 7,
    disabled = false,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'h-8 min-w-[2rem] text-xs',
      md: 'h-10 min-w-[2.5rem] text-sm',
      lg: 'h-12 min-w-[3rem] text-base'
    };

    const getButtonVariant = () => {
      switch (variant) {
        case 'outline':
          return 'outline';
        case 'ghost':
          return 'ghost';
        default:
          return 'outline';
      }
    };

    const getVisiblePages = () => {
      if (totalPages <= maxVisiblePages) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      const halfVisible = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, currentPage - halfVisible);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);

      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      const pages = [];
      
      // Always show first page
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('ellipsis-start');
        }
      }

      // Add visible pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Always show last page
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('ellipsis-end');
        }
        pages.push(totalPages);
      }

      return pages;
    };

    const visiblePages = getVisiblePages();

    const handlePageChange = (page: number) => {
      if (disabled || page < 1 || page > totalPages || page === currentPage) {
        return;
      }
      onPageChange(page);
    };

    const renderPageButton = (page: number | string) => {
      if (typeof page === 'string' && page.startsWith('ellipsis')) {
        return (
          <div
            key={page}
            className={cn(
              'flex items-center justify-center',
              sizeClasses[size]
            )}
          >
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </div>
        );
      }

      const pageNumber = page as number;
      const isActive = pageNumber === currentPage;

      return (
        <Button
          key={pageNumber}
          variant={isActive ? 'primary' : getButtonVariant()}
          size={size}
          onClick={() => handlePageChange(pageNumber)}
          disabled={disabled}
          className={cn(
            sizeClasses[size],
            'px-0',
            isActive && 'pointer-events-none'
          )}
          aria-label={`Go to page ${pageNumber}`}
          aria-current={isActive ? 'page' : undefined}
        >
          {pageNumber}
        </Button>
      );
    };

    if (totalPages <= 1) {
      return null;
    }

    return (
      <nav
        ref={ref}
        role="navigation"
        aria-label="Pagination"
        className={cn('flex items-center justify-center space-x-1', className)}
        {...props}
      >
        {/* First Page Button */}
        {showFirstLast && (
          <Button
            variant={getButtonVariant()}
            size={size}
            onClick={() => handlePageChange(1)}
            disabled={disabled || currentPage === 1}
            className={sizeClasses[size]}
            aria-label="Go to first page"
          >
            First
          </Button>
        )}

        {/* Previous Page Button */}
        {showPrevNext && (
          <Button
            variant={getButtonVariant()}
            size={size}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={disabled || currentPage === 1}
            className={cn(sizeClasses[size], 'px-2')}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Page Numbers */}
        {showPageNumbers && (
          <div className="flex items-center space-x-1">
            {visiblePages.map((page) => renderPageButton(page))}
          </div>
        )}

        {/* Next Page Button */}
        {showPrevNext && (
          <Button
            variant={getButtonVariant()}
            size={size}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={disabled || currentPage === totalPages}
            className={cn(sizeClasses[size], 'px-2')}
            aria-label="Go to next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {/* Last Page Button */}
        {showFirstLast && (
          <Button
            variant={getButtonVariant()}
            size={size}
            onClick={() => handlePageChange(totalPages)}
            disabled={disabled || currentPage === totalPages}
            className={sizeClasses[size]}
            aria-label="Go to last page"
          >
            Last
          </Button>
        )}
      </nav>
    );
  }
);

Pagination.displayName = 'Pagination';

export { Pagination }; 