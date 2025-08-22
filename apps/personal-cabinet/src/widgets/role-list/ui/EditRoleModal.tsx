import React, { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import { useToast } from '@/shared/ui/use-toast';
import { roleManagementApi, type Role, type UpdateRoleData } from '@/shared/api/role-management';

const editRoleSchema = z.object({
  display_name: z
    .string()
    .min(1, 'Отображаемое имя обязательно')
    .max(100, 'Отображаемое имя не должно превышать 100 символов'),
  description: z
    .string()
    .max(500, 'Описание не должно превышать 500 символов')
    .optional(),
});

type EditRoleFormData = z.infer<typeof editRoleSchema>;

interface EditRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
  onSuccess: () => void;
}

export function EditRoleModal({ open, onOpenChange, role, onSuccess }: EditRoleModalProps) {
  const { toast } = useToast();

  const form = useForm<EditRoleFormData>({
    resolver: zodResolver(editRoleSchema),
    defaultValues: {
      display_name: role.display_name,
      description: role.description || '',
    },
  });

  // Update form values when role changes
  useEffect(() => {
    form.reset({
      display_name: role.display_name,
      description: role.description || '',
    });
  }, [role, form]);

  const updateRoleMutation = useMutation({
    mutationFn: (data: UpdateRoleData) => roleManagementApi.updateRole(role.id, data),
    onSuccess: () => {
      toast({
        title: 'Роль обновлена',
        description: 'Информация о роли успешно обновлена.',
      });
      onSuccess();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка обновления роли',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: EditRoleFormData) => {
    updateRoleMutation.mutate({
      display_name: data.display_name,
      description: data.description || undefined,
    });
  };

  const handleClose = () => {
    if (!updateRoleMutation.isPending) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать роль</DialogTitle>
          <DialogDescription>
            Изменить информацию о роли "{role.display_name}".
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role_name">Имя роли (только чтение)</Label>
            <Input
              id="role_name"
              value={role.name}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Системное имя роли не может быть изменено.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name">Отображаемое имя *</Label>
            <Input
              id="display_name"
              placeholder="Управляющий пользователями"
              {...form.register('display_name')}
              disabled={updateRoleMutation.isPending}
            />
            {form.formState.errors.display_name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.display_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              placeholder="Роль для управления пользователями системы..."
              rows={3}
              {...form.register('description')}
              disabled={updateRoleMutation.isPending}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateRoleMutation.isPending}
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}