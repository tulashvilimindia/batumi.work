import { type ReactNode } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { Spinner } from './Spinner';
import { EmptyState } from './EmptyState';

// ============================================================
// TYPES
// ============================================================

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, item: T, index: number) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  rowKey?: keyof T | ((item: T) => string | number);
  onRowClick?: (item: T) => void;
  className?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export function Table<T>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data found',
  sortField,
  sortOrder,
  onSort,
  rowKey = 'id' as keyof T,
  onRowClick,
  className = '',
}: TableProps<T>) {
  const getRowKey = (item: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(item);
    }
    return (item[rowKey] as string | number) ?? index;
  };

  const getValue = (item: T, key: string): unknown => {
    const keys = key.split('.');
    let value: unknown = item;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    return value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {columns.map((column) => (
              <th
                key={column.key}
                style={{ width: column.width }}
                className={cn(
                  'px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300',
                  column.sortable && 'cursor-pointer hover:text-gray-900 dark:hover:text-white'
                )}
                onClick={() => column.sortable && onSort?.(column.key)}
              >
                <div className="flex items-center gap-1">
                  {column.label}
                  {column.sortable && sortField === column.key && (
                    sortOrder === 'asc' ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={getRowKey(item, index)}
              onClick={() => onRowClick?.(item)}
              className={cn(
                'border-b border-gray-100 dark:border-gray-700/50 transition-colors',
                onRowClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50'
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400"
                >
                  {column.render
                    ? column.render(getValue(item, column.key), item, index)
                    : String(getValue(item, column.key) ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
