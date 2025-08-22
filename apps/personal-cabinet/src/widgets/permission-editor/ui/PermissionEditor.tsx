import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import { Badge } from '@/shared/ui/badge';
import { Shield, ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/collapsible';
import { cn } from '@/shared/lib/utils';
import { useToast } from '@/shared/ui/use-toast';
import { supabase } from '@/shared/lib/supabase';
import { roleManagementApi, type Permission } from '@/shared/api/role-management';
import { useState } from 'react';

interface PermissionGroup {
  category: string;
  permissions: Permission[];
}

interface PermissionEditorProps {
  selectedRoleId?: string | null;
  className?: string;
}

export function PermissionEditor({ selectedRoleId, className }: PermissionEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['admin', 'applications', 'gallery']));

  // Fetch all permissions
  const {
    data: allPermissions = [],
    isLoading: isLoadingPermissions,
  } = useQuery({
    queryKey: ['permissions'],
    queryFn: roleManagementApi.getAllPermissions,
  });

  // Fetch role permissions (only when role is selected)
  const {
    data: rolePermissions = [],
    isLoading: isLoadingRolePermissions,
  } = useQuery({
    queryKey: ['role-permissions', selectedRoleId],
    queryFn: async () => {
      if (!selectedRoleId) return [];
      
      const { data, error } = await supabase.rpc('get_role_permissions', {
        p_role_id: selectedRoleId,
      });

      if (error) {
        toast({
          title: 'Ошибка загрузки разрешений',
          description: `Ошибка загрузки пермишенов: ${error.message}`,
          variant: 'destructive',
        });
        return [];
      }
      return data; // Return raw data as is
    },
    // Transform the data from array of objects to array of strings
    select: (data) => {
      // Transform array of objects to array of permission IDs
      if (!Array.isArray(data)) return [];
      return data.map((item: { permission_id: string }) => item.permission_id);
    },
    enabled: !!selectedRoleId,
    initialData: [], // Set initial data as empty array
  });

  // Group permissions by category
  const permissionGroups = useMemo((): PermissionGroup[] => {
    const groups = new Map<string, Permission[]>();
    
    allPermissions.forEach((permission) => {
      const category = permission.code.split('.')[0] || 'other';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(permission);
    });

    return Array.from(groups.entries())
      .map(([category, permissions]) => ({
        category,
        permissions: permissions.sort((a, b) => a.code.localeCompare(b.code)),
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [allPermissions]);

  // Optimize permission checking by creating a Set for instant access
  const assignedPermissionIds = useMemo(() => {
    // Debug: Log the role permissions data structure
    console.log('%c[PermissionEditor] Transformed Role Permissions Data:', 'color: cyan; font-weight: bold;', {
      selectedRoleId,
      rolePermissions,
      type: typeof rolePermissions,
      isArray: Array.isArray(rolePermissions),
      length: rolePermissions?.length || 0,
      sampleData: rolePermissions?.slice(0, 3) // Show first 3 items as sample
    });
    
    return new Set(rolePermissions || []);
  }, [rolePermissions, selectedRoleId]);

  // Grant permission mutation
  const grantPermissionMutation = useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) =>
      roleManagementApi.grantPermissionToRole(roleId, permissionId),
    onMutate: async ({ permissionId }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['role-permissions', selectedRoleId] });
      const previousPermissions = queryClient.getQueryData<string[]>(['role-permissions', selectedRoleId]);
      
      // Update with transformed data (array of strings)
      queryClient.setQueryData<string[]>(['role-permissions', selectedRoleId], (old = []) => {
        return [...old, permissionId];
      });

      return { previousPermissions };
    },
    onError: (error, variables, context) => {
      // Revert optimistic update
      queryClient.setQueryData(['role-permissions', selectedRoleId], context?.previousPermissions);
      toast({
        title: 'Ошибка предоставления разрешения',
        description: error instanceof Error ? error.message : 'Неизвестная ошибка',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions', selectedRoleId] });
    },
  });

  // Revoke permission mutation
  const revokePermissionMutation = useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) =>
      roleManagementApi.revokePermissionFromRole(roleId, permissionId),
    onMutate: async ({ permissionId }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['role-permissions', selectedRoleId] });
      const previousPermissions = queryClient.getQueryData<string[]>(['role-permissions', selectedRoleId]);
      
      // Update with transformed data (array of strings)
      queryClient.setQueryData<string[]>(['role-permissions', selectedRoleId], (old = []) => {
        return old.filter(id => id !== permissionId);
      });

      return { previousPermissions };
    },
    onError: (error, variables, context) => {
      // Revert optimistic update
      queryClient.setQueryData(['role-permissions', selectedRoleId], context?.previousPermissions);
      toast({
        title: 'Ошибка отзыва разрешения',
        description: error instanceof Error ? error.message : 'Неизвестная ошибка',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions', selectedRoleId] });
    },
  });

  // Handle permission toggle
  const handlePermissionToggle = (permissionId: string, isChecked: boolean) => {
    if (!selectedRoleId) return;

    if (isChecked) {
      grantPermissionMutation.mutate({ roleId: selectedRoleId, permissionId });
    } else {
      revokePermissionMutation.mutate({ roleId: selectedRoleId, permissionId });
    }
  };

  // No role selected
  if (!selectedRoleId) {
    return (
      <div className={cn('space-y-4', className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Управление разрешениями
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Выберите роль</h3>
              <p>Выберите роль из списка слева, чтобы настроить её разрешения.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoadingPermissions || isLoadingRolePermissions) {
    return (
      <div className={cn('space-y-4', className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Управление разрешениями
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Загрузка разрешений...
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
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Управление разрешениями
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Настройте разрешения для выбранной роли. Изменения применяются мгновенно.
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {permissionGroups.map((group) => {
            const isOpen = openGroups.has(group.category);
            const checkedCount = group.permissions.filter(p => 
              assignedPermissionIds.has(p.id)
            ).length;

            return (
              <Collapsible key={group.category} open={isOpen} onOpenChange={(open) => {
                if (open) {
                  setOpenGroups(prev => new Set([...prev, group.category]));
                } else {
                  setOpenGroups(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(group.category);
                    return newSet;
                  });
                }
              }}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-medium capitalize">
                      {group.category}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {checkedCount}/{group.permissions.length}
                    </Badge>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="pt-2">
                  <div className="pl-6 space-y-2">
                    {group.permissions.map((permission) => {
                      const isChecked = assignedPermissionIds.has(permission.id);
                      const isLoading = 
                        grantPermissionMutation.isPending || 
                        revokePermissionMutation.isPending;

                      return (
                        <div
                          key={permission.id}
                          className="flex items-start gap-3 p-2 rounded border hover:bg-accent/50 transition-colors"
                        >
                          <Checkbox
                            id={permission.id}
                            checked={isChecked}
                            onCheckedChange={(checked) => 
                              handlePermissionToggle(permission.id, !!checked)
                            }
                            disabled={isLoading}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <label
                              htmlFor={permission.id}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {permission.display_name}
                            </label>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs font-mono">
                                {permission.code}
                              </Badge>
                            </div>
                            {permission.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {permission.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}

          {permissionGroups.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Разрешения не найдены
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}