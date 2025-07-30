import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/shared/ui/atoms/Button';
import { Input } from '@/shared/ui/atoms/Input';
import { SearchBar } from '@/shared/ui/molecules/SearchBar';
import { StatusBadge } from '@/shared/ui/molecules/StatusBadge';
import { cn } from '@/shared/lib/utils';

export interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  className?: string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  sortable = true,
  pagination = true,
  pageSize = 10,
  className,
  onRowClick,
  emptyMessage = "Нет данных для отображения",
  loading = false,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Фильтрация данных
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    
    return data.filter(row =>
      columns.some(column => {
        const value = row[column.key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      })
    );
  }, [data, columns, searchQuery]);

  // Сортировка данных
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortable) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection, sortable]);

  // Пагинация
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, pagination, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (column: keyof T) => {
    if (!sortable) return;
    
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: keyof T) => {
    if (!sortable || sortColumn !== column) {
      return <ChevronsUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const renderCell = (row: T, column: Column<T>) => {
    const value = row[column.key];
    
    if (column.render) {
      return column.render(value, row);
    }
    
    // Автоматическое определение типа данных для рендеринга
    if (typeof value === 'boolean') {
      return <StatusBadge status={value ? 'active' : 'inactive'} />;
    }
    
    if (typeof value === 'string' && value.includes('status')) {
      return <StatusBadge status="info" label={value} />;
    }
    
    return String(value || '');
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Поиск */}
      {searchable && (
        <div className="flex justify-between items-center">
          <SearchBar
            placeholder="Поиск по таблице..."
            onSearch={setSearchQuery}
            className="max-w-md"
          />
          <p className="text-sm text-muted-foreground">
            Найдено: {filteredData.length} из {data.length}
          </p>
        </div>
      )}

      {/* Таблица */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      "px-4 py-3 text-left text-sm font-medium text-muted-foreground",
                      column.sortable && sortable && "cursor-pointer hover:bg-muted/75",
                      column.width
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.header}</span>
                      {column.sortable && sortable && getSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={cn(
                      "hover:bg-muted/50 transition-colors",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className="px-4 py-3 text-sm"
                      >
                        {renderCell(row, column)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Пагинация */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Страница {currentPage} из {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Назад
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Вперед
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 
