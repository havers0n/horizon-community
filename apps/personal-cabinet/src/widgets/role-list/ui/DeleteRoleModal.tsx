import React from 'react';
import { useMutation } from '@tanstack/react-query';
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
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/shared/ui/use-toast';
import { roleManagementApi, type Role } from '@/shared/api/role-management';

interface DeleteRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
  onSuccess: () => void;
}

export function DeleteRoleModal({ open, onOpenChange, role, onSuccess }: DeleteRoleModalProps) {
  const { toast } = useToast();

  const deleteRoleMutation = useMutation({
    mutationFn: () => roleManagementApi.deleteRole(role.id),
    onSuccess: () => {
      toast({
        title: 'Роль удалена',
        description: `Роль "${role.display_name}" была успешно удалена.`,
      });
      onSuccess();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка удаления роли',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleDelete = () => {
    deleteRoleMutation.mutate();
  };

  const handleClose = () => {
    if (!deleteRoleMutation.isPending) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Удалить роль
          </DialogTitle>
          <DialogDescription>
            Это действие невозможно отменить. Роль будет безвозвратно удалена из системы.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="font-medium text-destructive">
                  Вы уверены, что хотите удалить эту роль?
                </p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Отображаемое имя:</span>
                    <span className="text-sm">{role.display_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Системное имя:</span>
                    <Badge variant="outline" className="text-xs">
                      {role.name}
                    </Badge>
                  </div>
                  {role.description && (
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium">Описание:</span>
                      <span className="text-sm text-muted-foreground">
                        {role.description}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Предупреждение:</p>
                <p>
                  Все пользователи с этой ролью потеряют связанные с ней права доступа.
                  Убедитесь, что это не нарушит работу системы.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={deleteRoleMutation.isPending}
          >
            Отмена
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteRoleMutation.isPending}
          >
            {deleteRoleMutation.isPending ? 'Удаление...' : 'Удалить роль'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}