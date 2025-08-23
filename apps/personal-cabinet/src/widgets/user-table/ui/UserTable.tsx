import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Skeleton } from '@/shared/ui/skeleton';
import { Settings, Search, Users, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { userManagementApi, type UserWithRoles } from '@/shared/api/user-management';
import { PermissionGuard } from '@/shared/ui/permission-guard';

interface UserTableProps {
  onManageUser?: (user: UserWithRoles) => void;
  onManageCareer?: (user: UserWithRoles) => void;
  className?: string;
}

export function UserTable({ onManageUser, onManageCareer, className }: UserTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageLimit = 20;

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch users with roles
  const {
    data,
    isLoading,
    error,
  } = useQuery<UserWithRoles[]>({
    queryKey: ['users-with-roles', currentPage, pageLimit, debouncedSearchQuery],
    queryFn: async () => {
      // --- НАЧАЛО БЛОКА ЛОГИРОВАНИЯ ВЫЗОВА ---
      console.log(`%c[UserTable] useQuery queryFn triggered`, 'color: purple; font-weight: bold;', {
        currentPage,
        pageLimit,
        debouncedSearchQuery,
        'About to call': 'userManagementApi.getUsersWithRoles'
      });
      
      try {
        const result = await userManagementApi.getUsersWithRoles({
          page: currentPage,
          page_limit: pageLimit,
          search_query: debouncedSearchQuery,
        });
        
        console.log('%c[UserTable] useQuery result received:', 'color: green; font-weight: bold;', {
          result,
          'result type': typeof result,
          'is array': Array.isArray(result),
          'users count': Array.isArray(result) ? result.length : 'not array'
        });
        
        return result;
      } catch (queryError) {
        console.error('%c[UserTable] useQuery error:', 'color: red; font-weight: bold;', queryError);
        throw queryError;
      }
      // --- КОНЕЦ БЛОКА ЛОГИРОВАНИЯ ВЫЗОВА ---
    }
  });

  // Prepare data for rendering (must be before conditional returns)
  // We directly use `data` as array of users.
  // For total_count we'll need a separate query or RPC modification.
  // For now, we temporarily count by the length of received array.
  const users = data || [];
  const totalCount = data?.length || 0; // Temporary solution for pagination
  const totalPages = Math.ceil(totalCount / pageLimit);

  // Enhanced debugging for data processing
  React.useEffect(() => {
    if (data) {
      console.log('%c[UserTable] DETAILED DATA ANALYSIS:', 'color: purple; font-weight: bold; font-size: 14px;', {
        'raw data object': data,
        'data type': typeof data,
        'is array': Array.isArray(data),
        'data length': Array.isArray(data) ? data.length : 'not array',
        'data content': data,
        'processed users': users,
        'processed users length': users.length,
        'users === data': users === data,
        'totalCount': totalCount,
        'totalPages': totalPages
      });
    }
  }, [data, users, totalCount, totalPages]);

  // --- ALL LOGGING EFFECTS GROUPED TOGETHER ---
  // Component mount logging
  React.useEffect(() => {
    console.log('%c[UserTable] Component mounted/updated:', 'color: magenta; font-weight: bold;', {
      searchQuery,
      debouncedSearchQuery,
      currentPage,
      pageLimit,
      'onManageUser provided': !!onManageUser,
      className
    });
  }, []); // Empty dependency array for mount only

  // Reset to page 1 when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  // Query conditions logging
  React.useEffect(() => {
    console.log('%c[UserTable] Query conditions changed:', 'color: orange; font-weight: bold;', {
      currentPage,
      pageLimit,
      searchQuery,
      debouncedSearchQuery,
      'Query will trigger': true
    });
  }, [currentPage, pageLimit, debouncedSearchQuery]);
  
  // Data processing logging
  React.useEffect(() => {
    console.log('%c[UserTable] Data processing:', 'color: cyan; font-weight: bold;', {
      'raw data': data,
      'processed users': users,
      'users length': users.length,
      totalPages,
      totalCount,
      isLoading,
      'has error': !!error,
      'error details': error
    });
  }, [data, users, totalPages, totalCount, isLoading, error]);
  
  // Query success tracking
  React.useEffect(() => {
    if (data && !isLoading) {
      console.log('%c[UserTable] Query SUCCESS - Data received:', 'color: green; font-weight: bold;', data);
    }
  }, [data, isLoading]);
  
  // Query error tracking
  React.useEffect(() => {
    if (error) {
      console.error('%c[UserTable] Query ERROR:', 'color: red; font-weight: bold;', error);
    }
  }, [error]);
  // --- END OF LOGGING EFFECTS ---

  // Handle page navigation
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Handle manage user button click
  const handleManageUser = (user: UserWithRoles) => {
    onManageUser?.(user);
  };

  // Handle manage career button click
  const handleManageCareer = (user: UserWithRoles) => {
    onManageCareer?.(user);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state
  if (isLoading && !data) {
    return (
      <div className={cn('space-y-4', className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Пользователи системы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn('space-y-4', className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Пользователи системы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-destructive">
              Ошибка загрузки пользователей: {error instanceof Error ? error.message : 'Неизвестная ошибка'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Пользователи системы
              <Badge variant="outline" className="ml-2">
                {totalCount}
              </Badge>
            </CardTitle>
          </div>
          
          {/* Search Input */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по имени или email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {debouncedSearchQuery ? 'Пользователи не найдены' : 'Нет пользователей в системе'}
            </div>
          ) : (
            <>
              {/* Users Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Роли</TableHead>
                      <TableHead>Дата регистрации</TableHead>
                      <TableHead>Последний вход</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: UserWithRoles) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.username}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles && user.roles.length > 0 ? (
                              user.roles.map((role: any) => (
                                <Badge key={role.id} variant="secondary" className="text-xs">
                                  {role.display_name}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Без ролей
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(user.created_at)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Никогда'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleManageUser(user)}
                              className="h-8 w-8 p-0"
                              title="Управлять ролями"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            
                            <PermissionGuard permission="memberships.manage">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleManageCareer(user)}
                                className="h-8 w-8 p-0"
                                title="Управлять карьерой"
                              >
                                <TrendingUp className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Страница {currentPage} из {totalPages} (всего: {totalCount})
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1 || isLoading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNumber)}
                            disabled={isLoading}
                            className="h-8 w-8 p-0"
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages || isLoading}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Loading overlay for subsequent pages */}
          {isLoading && data && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <div className="text-sm text-muted-foreground">Загрузка...</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}