import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import { Skeleton } from '@/shared/ui/skeleton';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Input } from '@/shared/ui/input';
import { Search, User, Shield, AlertCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { userManagementApi, roleManagementApi, type UserWithRoles } from '@/shared/api';
import { useToast } from '@/shared/ui/use-toast';

interface ManageUserRolesModalProps {
  user: UserWithRoles;
  open: boolean;
  onClose: () => void;
}

export function ManageUserRolesModal({ user, open, onClose }: ManageUserRolesModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize selected roles when modal opens
  useEffect(() => {
    if (open && user) {
      setSelectedRoleIds(user.roles.map(role => role.id));
    }
  }, [open, user]);

  // Fetch all available roles
  const {
    data: allRoles = [],
    isLoading: isLoadingRoles,
    error: rolesError,
  } = useQuery({
    queryKey: ['all-roles'],
    queryFn: roleManagementApi.getAllRoles,
    enabled: open, // Only fetch when modal is open
  });

  // Update user roles mutation
  const updateRolesMutation = useMutation({
    mutationFn: async (newRoleIds: string[]) => {
      const currentRoleIds = user.roles.map(role => role.id);
      await userManagementApi.updateUserRoles(user.id, currentRoleIds, newRoleIds);
    },
    onSuccess: () => {
      // Invalidate users query to refresh the table
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast({
        title: 'Роли обновлены',
        description: `Роли пользователя ${user.username} успешно обновлены.`,
      });
      onClose();
    },
    onError: (error) => {
      console.error('Error updating user roles:', error);
      toast({
        title: 'Ошибка',
        description: `Не удалось обновить роли: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        variant: 'destructive',
      });
    },
  });

  // Handle role selection
  const handleRoleToggle = (roleId: string) => {
    setSelectedRoleIds(prev => 
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  // Handle save
  const handleSave = () => {
    updateRolesMutation.mutate(selectedRoleIds);
  };

  // Handle modal close
  const handleClose = () => {
    if (!updateRolesMutation.isPending) {
      onClose();
      // Reset search and selected roles
      setSearchQuery('');
      setSelectedRoleIds([]);
    }
  };

  // Filter roles based on search query
  const filteredRoles = allRoles.filter(role =>
    role.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate changes
  const currentRoleIds = user.roles.map(role => role.id);
  const rolesToAdd = selectedRoleIds.filter(id => !currentRoleIds.includes(id));
  const rolesToRemove = currentRoleIds.filter(id => !selectedRoleIds.includes(id));
  const hasChanges = rolesToAdd.length > 0 || rolesToRemove.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Управление ролями для: {user.username}
          </DialogTitle>
          <DialogDescription>
            Выберите роли, которые должны быть назначены пользователю. 
            Изменения будут применены после нажатия кнопки "Сохранить".
          </DialogDescription>
        </DialogHeader>

        {/* User info */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <div className="flex-1">
            <div className="font-medium">{user.username}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
          <div className="text-sm text-muted-foreground">
            Текущих ролей: {user.roles.length}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск ролей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Roles list */}
        <div className="flex-1 min-h-0">
          {isLoadingRoles ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : rolesError ? (
            <div className="flex items-center gap-2 p-4 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>Ошибка загрузки ролей: {rolesError instanceof Error ? rolesError.message : 'Неизвестная ошибка'}</span>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="space-y-2 pr-4">
                {filteredRoles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'Роли не найдены' : 'Нет доступных ролей'}
                  </div>
                ) : (
                  filteredRoles.map((role) => (
                    <div
                      key={role.id}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                        selectedRoleIds.includes(role.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-accent'
                      )}
                      onClick={() => handleRoleToggle(role.id)}
                    >
                      <Checkbox
                        checked={selectedRoleIds.includes(role.id)}
                        onChange={() => handleRoleToggle(role.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{role.display_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {role.name}
                          </Badge>
                        </div>
                        {role.description && (
                          <p className="text-sm text-muted-foreground">
                            {role.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Changes preview */}
        {hasChanges && (
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="text-sm font-medium">Предварительный просмотр изменений:</div>
            {rolesToAdd.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600">Добавить:</span>
                <div className="flex flex-wrap gap-1">
                  {rolesToAdd.map(roleId => {
                    const role = allRoles.find(r => r.id === roleId);
                    return role ? (
                      <Badge key={roleId} variant="outline" className="text-xs text-green-600">
                        +{role.display_name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            {rolesToRemove.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600">Удалить:</span>
                <div className="flex flex-wrap gap-1">
                  {rolesToRemove.map(roleId => {
                    const role = user.roles.find(r => r.id === roleId);
                    return role ? (
                      <Badge key={roleId} variant="outline" className="text-xs text-red-600">
                        -{role.display_name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={updateRolesMutation.isPending}
          >
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateRolesMutation.isPending || isLoadingRoles}
          >
            {updateRolesMutation.isPending ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}