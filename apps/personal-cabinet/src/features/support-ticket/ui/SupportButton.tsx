import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import { LifeBuoy } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateSupportTicket } from '@/entities/support-ticket';

// Validation schemas - упрощаем для поддержки, игнорируем priority
const supportTicketSchema = z.object({
  p_title: z.string().min(5, 'Заголовок должен содержать не менее 5 символов'),
  p_initial_message: z.string().min(10, 'Сообщение должно содержать не менее 10 символов'),
});

type SupportTicketForm = z.infer<typeof supportTicketSchema>;

export const SupportButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('support');
  
  // React Query mutation hook
  const createSupportTicketMutation = useCreateSupportTicket();

  const supportForm = useForm<SupportTicketForm>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      p_title: '',
      p_initial_message: '',
    },
  });

  const onSupportSubmit = async (data: SupportTicketForm) => {
    createSupportTicketMutation.mutate(data, {
      onSuccess: () => {
        supportForm.reset();
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-auto p-3 flex flex-col items-center justify-center space-y-1 text-xs"
        >
          <LifeBuoy className="w-4 h-4" />
          <span className="text-center">Поддержка / Жалобы</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Обращение в службу поддержки</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="support">Служба поддержки</TabsTrigger>
          </TabsList>
          
          <TabsContent value="support" className="space-y-4">
            <form onSubmit={supportForm.handleSubmit(onSupportSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="support-title">Заголовок</Label>
                <Input
                  id="support-title"
                  placeholder="Кратко опишите проблему"
                  {...supportForm.register('p_title')}
                />
                {supportForm.formState.errors.p_title && (
                  <p className="text-sm text-destructive">{supportForm.formState.errors.p_title.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="support-message">Подробное описание</Label>
                <Textarea
                  id="support-message"
                  placeholder="Опишите проблему подробно..."
                  className="min-h-[120px]"
                  {...supportForm.register('p_initial_message')}
                />
                {supportForm.formState.errors.p_initial_message && (
                  <p className="text-sm text-destructive">{supportForm.formState.errors.p_initial_message.message}</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={createSupportTicketMutation.isPending}>
                  {createSupportTicketMutation.isPending ? 'Отправляем...' : 'Отправить тикет'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};