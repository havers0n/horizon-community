import React from 'react';
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
import { roleManagementApi, type CreateRoleData } from '@/shared/api/role-management';

const createRoleSchema = z.object({
  name: z
    .string()
    .min(1, 'Имя роли обязательно')
    .max(50, 'Имя роли не должно превышать 50 символов')
    .regex(/^[a-z_]+$/, 'Имя роли должно содержать только строчные буквы и подчеркивания'),
  display_name: z
    .string()
    .min(1, 'Отображаемое имя обязательно')
    .max(100, 'Отображаемое имя не должно превышать 100 символов'),
  description: z
    .string()
    .max(500, 'Описание не должно превышать 500 символов')
    .optional(),
});

type CreateRoleFormData = z.infer<typeof createRoleSchema>;

interface CreateRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateRoleModal({ open, onOpenChange, onSuccess }: CreateRoleModalProps) {
  const { toast } = useToast();

  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: '',
      display_name: '',
      description: '',
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: (data: CreateRoleData) => roleManagementApi.createRole(data),
    onSuccess: () => {
      toast({
        title: 'Роль создана',
        description: 'Новая роль успешно создана.',
      });
      onSuccess();
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Ошибка создания роли',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateRoleFormData) => {
    createRoleMutation.mutate({
      name: data.name,
      display_name: data.display_name,
      description: data.description || undefined,
    });
  };

  const handleClose = () => {
    if (!createRoleMutation.isPending) {
      onOpenChange(false);
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Создать новую роль</DialogTitle>
          <DialogDescription>
            Создайте новую роль для управления доступом пользователей.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Имя роли *</Label>
            <Input
              id="name"
              placeholder="user_manager"
              {...form.register('name')}
              disabled={createRoleMutation.isPending}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Используется в системе для идентификации роли. Только строчные буквы и подчеркивания.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name">Отображаемое имя *</Label>
            <Input
              id="display_name"
              placeholder="Управляющий пользователями"
              {...form.register('display_name')}
              disabled={createRoleMutation.isPending}
            />
            {form.formState.errors.display_name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.display_name.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Название роли, которое видят пользователи.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              placeholder="Роль для управления пользователями системы..."
              rows={3}
              {...form.register('description')}
              disabled={createRoleMutation.isPending}
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
              disabled={createRoleMutation.isPending}
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={createRoleMutation.isPending}
            >
              {createRoleMutation.isPending ? 'Создание...' : 'Создать роль'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}