import {cn} from '@nlabs/utils';
import {ChevronLeft} from 'lucide-react';

import type {ButtonHTMLAttributes, ReactNode} from 'react';

export type PaginationVariant = 'centered' | 'simple';
export type PaginationResultLabel = 'items' | 'results';

export interface PaginationProps {
  readonly className?: string;
  readonly currentPage: number;
  readonly pageSize?: number;
  readonly nextLabel?: string;
  readonly onPageChange?: (page: number) => void;
  readonly pageLabel?: (page: number) => string;
  readonly previousLabel?: string;
  readonly resultLabel?: PaginationResultLabel;
  readonly showLabels?: boolean;
  readonly siblingCount?: number;
  readonly totalItems?: number;
  readonly totalPages: number;
  readonly variant?: PaginationVariant;
}

const clampPage = (page: number, totalPages: number) => Math.min(Math.max(page, 1), Math.max(totalPages, 1));

const createRange = (start: number, end: number) =>
  Array.from({length: end - start + 1}, (_, index) => start + index);

const getPaginationItems = (currentPage: number, totalPages: number, siblingCount: number) => {
  if(totalPages <= 0) {
    return [];
  }

  const safeCurrentPage = clampPage(currentPage, totalPages);
  const totalPageNumbers = siblingCount + 5;

  if(totalPages <= totalPageNumbers) {
    return createRange(1, totalPages).map((page) => ({page, type: 'page'} as const));
  }

  const leftSiblingIndex = Math.max(safeCurrentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(safeCurrentPage + siblingCount, totalPages);
  const shouldShowLeftEllipsis = leftSiblingIndex > 2;
  const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

  if(!shouldShowLeftEllipsis) {
    const leftRange = createRange(1, 3 + siblingCount * 2);
    return [
      ...leftRange.map((page) => ({page, type: 'page'} as const)),
      {id: 'ellipsis-right', type: 'ellipsis'} as const,
      {page: totalPages, type: 'page'} as const
    ];
  }

  if(!shouldShowRightEllipsis) {
    const rightRange = createRange(totalPages - (2 + siblingCount * 2), totalPages);
    return [
      {page: 1, type: 'page'} as const,
      {id: 'ellipsis-left', type: 'ellipsis'} as const,
      ...rightRange.map((page) => ({page, type: 'page'} as const))
    ];
  }

  const middleRange = createRange(leftSiblingIndex, rightSiblingIndex);
  return [
    {page: 1, type: 'page'} as const,
    {id: 'ellipsis-left', type: 'ellipsis'} as const,
    ...middleRange.map((page) => ({page, type: 'page'} as const)),
    {id: 'ellipsis-right', type: 'ellipsis'} as const,
    {page: totalPages, type: 'page'} as const
  ];
};

const buttonBaseClasses = [
  'cursor-pointer',
  'inline-flex',
  'items-center',
  'text-sm',
  'font-medium',
  'transition-colors',
  'disabled:pointer-events-none',
  'disabled:opacity-50'
].join(' ');

const PaginationButton = ({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {readonly children: ReactNode}) => (
  <button
    className={cn(buttonBaseClasses, className)}
    type="button"
    {...props}
  >
    {children}
  </button>
);

export const Pagination = ({
  className,
  currentPage,
  pageSize = 10,
  nextLabel = 'Next',
  onPageChange,
  pageLabel = (page) => page.toString(),
  previousLabel = 'Previous',
  resultLabel = 'results',
  showLabels = true,
  siblingCount = 1,
  totalItems,
  totalPages,
  variant = 'simple'
}: PaginationProps) => {
  const safeCurrentPage = clampPage(currentPage, totalPages);
  const safeTotalItems = totalItems ?? totalPages * pageSize;
  const rangeStart = safeTotalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safeCurrentPage * pageSize, safeTotalItems);
  const isPreviousDisabled = safeCurrentPage <= 1;
  const isNextDisabled = safeCurrentPage >= totalPages;

  const handlePageChange = (page: number) => {
    if(page === safeCurrentPage || page < 1 || page > totalPages) {
      return;
    }

    onPageChange?.(page);
  };

  if(totalPages <= 1) {
    return null;
  }

  if(variant === 'centered') {
    return (
      <nav
        aria-label="Pagination"
        className={cn(
          'flex items-center justify-between border-t border-gray-200 px-4 sm:px-0 dark:border-white/10',
          className
        )}
      >
        <div className="-mt-px flex w-0 flex-1">
          <PaginationButton
            aria-label={previousLabel}
            className="border-t-2 border-transparent pt-4 pr-1 text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-white/20 dark:hover:text-gray-200"
            disabled={isPreviousDisabled}
            onClick={() => handlePageChange(safeCurrentPage - 1)}
          >
            <ChevronLeft aria-hidden="true" className="mr-3 size-5 text-gray-400 dark:text-gray-500" />
            {showLabels ? previousLabel : <span className="sr-only">{previousLabel}</span>}
          </PaginationButton>
        </div>

        <div className="hidden md:-mt-px md:flex">
          {getPaginationItems(safeCurrentPage, totalPages, siblingCount).map((item) => item.type === 'ellipsis' ? (
            <span
              key={item.id}
              className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 dark:text-gray-400"
            >
              ...
            </span>
          ) : (
            <PaginationButton
              key={item.page}
              aria-current={item.page === safeCurrentPage ? 'page' : undefined}
              aria-label={pageLabel(item.page)}
              className={cn(
                'border-t-2 px-4 pt-4',
                item.page === safeCurrentPage
                  ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-white/20 dark:hover:text-gray-200'
              )}
              onClick={() => handlePageChange(item.page)}
            >
              {item.page}
            </PaginationButton>
          ))}
        </div>

        <div className="-mt-px flex w-0 flex-1 justify-end">
          <PaginationButton
            aria-label={nextLabel}
            className="border-t-2 border-transparent pt-4 pl-1 text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-white/20 dark:hover:text-gray-200"
            disabled={isNextDisabled}
            onClick={() => handlePageChange(safeCurrentPage + 1)}
          >
            {showLabels ? nextLabel : <span className="sr-only">{nextLabel}</span>}
            <ChevronLeft aria-hidden="true" className="ml-3 size-5 rotate-180 text-gray-400 dark:text-gray-500" />
          </PaginationButton>
        </div>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        'flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 dark:border-white/10 dark:bg-transparent',
        className
      )}
    >
      <div className="hidden sm:block">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Showing <span className="font-medium">{rangeStart}</span> to <span className="font-medium">{rangeEnd}</span> of{' '}
          <span className="font-medium">{safeTotalItems}</span> {resultLabel}
        </p>
      </div>

      <div className="flex flex-1 justify-between sm:justify-end">
        <PaginationButton
          aria-label={previousLabel}
          className="relative rounded-md bg-white px-3 py-2 font-semibold text-gray-700 inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-gray-200 dark:inset-ring-white/5 dark:hover:bg-white/20"
          disabled={isPreviousDisabled}
          onClick={() => handlePageChange(safeCurrentPage - 1)}
        >
          {previousLabel}
        </PaginationButton>
        <PaginationButton
          aria-label={nextLabel}
          className="relative ml-3 rounded-md bg-white px-3 py-2 font-semibold text-gray-700 inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-gray-200 dark:inset-ring-white/5 dark:hover:bg-white/20"
          disabled={isNextDisabled}
          onClick={() => handlePageChange(safeCurrentPage + 1)}
        >
          {nextLabel}
        </PaginationButton>
      </div>
    </nav>
  );
};
