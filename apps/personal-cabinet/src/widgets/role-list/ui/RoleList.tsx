import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { roleManagementApi, type Role } from '@/shared/api/role-management';
import { CreateRoleModal } from './CreateRoleModal';
import { EditRoleModal } from './EditRoleModal';
import { DeleteRoleModal } from './DeleteRoleModal';

interface RoleListProps {
  selectedRoleId?: string | null;
  onSelectRole: (roleId: string) => void;
  className?: string;
}

export function RoleList({ selectedRoleId, onSelectRole, className }: RoleListProps) {
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  // Fetch all roles
  const {
    data: roles = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['roles'],
    queryFn: roleManagementApi.getAllRoles,
  });

  // Auto-select the first role when roles are loaded and no role is selected
  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      onSelectRole(roles[0].id);
    }
    // If the selected role no longer exists (e.g., was deleted), select the first available role
    else if (roles.length > 0 && selectedRoleId && !roles.find(role => role.id === selectedRoleId)) {
      onSelectRole(roles[0].id);
    }
  }, [roles, selectedRoleId, onSelectRole]);

  // Handle role selection
  const handleRoleClick = (roleId: string) => {
    onSelectRole(roleId);
  };

  // Handle edit role
  const handleEditRole = (role: Role, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent role selection
    setEditingRole(role);
    setEditModalOpen(true);
  };

  // Handle delete role
  const handleDeleteRole = (role: Role, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent role selection
    setDeletingRole(role);
    setDeleteModalOpen(true);
  };

  // Success handler for mutations
  const handleMutationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['roles'] });
    // Note: The useEffect will handle re-selecting appropriate role after data refresh
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Роли системы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Загрузка ролей...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('space-y-4', className)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Роли системы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-destructive">
              Ошибка загрузки ролей: {error instanceof Error ? error.message : 'Неизвестная ошибка'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className={cn('space-y-4', className)}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Роли системы
              </CardTitle>
              <Button 
                onClick={() => setCreateModalOpen(true)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Создать роль
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {roles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Роли не найдены
              </div>
            ) : (
              roles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => handleRoleClick(role.id)}
                  className={cn(
                    'group relative p-3 rounded-lg border cursor-pointer transition-all',
                    'hover:border-primary hover:bg-accent',
                    selectedRoleId === role.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-background'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={cn(
                          'font-medium truncate',
                          selectedRoleId === role.id ? 'text-primary' : 'text-foreground'
                        )}>
                          {role.display_name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {role.name}
                        </Badge>
                      </div>
                      {role.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {role.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleEditRole(role, e)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteRole(role, e)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CreateRoleModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={handleMutationSuccess}
      />

      {editingRole && (
        <EditRoleModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          role={editingRole}
          onSuccess={handleMutationSuccess}
        />
      )}

      {deletingRole && (
        <DeleteRoleModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          role={deletingRole}
          onSuccess={handleMutationSuccess}
        />
      )}
    </>
  );
}