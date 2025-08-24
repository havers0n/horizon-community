import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { LifeBuoy } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateSupportTicket, useCreateComplaint } from '@/entities/support-ticket';
import type { CreateComplaintDto } from '@/shared/api/cabinet-service';

// Validation schemas
const supportTicketSchema = z.object({
  p_title: z.string().min(5, 'Заголовок должен содержать не менее 5 символов'),
  p_initial_message: z.string().min(10, 'Сообщение должно содержать не менее 10 символов'),
});

const complaintSchema = z.object({
  incident_date: z.string().min(1, 'Дата инцидента обязательна'),
  title: z.string().min(5, 'Заголовок должен содержать не менее 5 символов'),
  type: z.string().min(1, 'Тип жалобы обязателен'),
  participants: z.string().min(1, 'Участники инцидента обязательны'),
  description: z.string().min(10, 'Описание должно содержать не менее 10 символов'),
  evidence: z.string().optional(),
});

type SupportTicketForm = z.infer<typeof supportTicketSchema>;
type ComplaintForm = z.infer<typeof complaintSchema>;

const complaintTypes = [
  { value: 'Игровая', label: 'Игровая' },
  { value: 'Административная', label: 'Административная' },
  { value: 'Другое', label: 'Другое' },
];

export const SupportButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('support');
  
  // React Query mutation hooks
  const createSupportTicketMutation = useCreateSupportTicket();
  const createComplaintMutation = useCreateComplaint();

  const supportForm = useForm<SupportTicketForm>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      p_title: '',
      p_initial_message: '',
    },
  });

  const complaintForm = useForm<ComplaintForm>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      incident_date: '',
      title: '',
      type: '',
      participants: '',
      description: '',
      evidence: '',
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

  const onComplaintSubmit = async (data: ComplaintForm) => {
    // Format the data for the API
    const complaintData: CreateComplaintDto = {
      p_incident_date: new Date(data.incident_date).toISOString(),
      p_title: data.title,
      p_type: data.type,
      p_participants: data.participants.split(',').map(p => p.trim()).filter(p => p.length > 0),
      p_description: data.description,
      p_evidence: data.evidence || '',
    };

    createComplaintMutation.mutate(complaintData, {
      onSuccess: () => {
        complaintForm.reset();
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="support">Служба поддержки</TabsTrigger>
            <TabsTrigger value="complaint">Подать жалобу</TabsTrigger>
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

          <TabsContent value="complaint" className="space-y-4">
            <form onSubmit={complaintForm.handleSubmit(onComplaintSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="incident-date">Дата инцидента</Label>
                <Input
                  id="incident-date"
                  type="datetime-local"
                  {...complaintForm.register('incident_date')}
                />
                {complaintForm.formState.errors.incident_date && (
                  <p className="text-sm text-destructive">{complaintForm.formState.errors.incident_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="complaint-title">Заголовок жалобы</Label>
                <Input
                  id="complaint-title"
                  placeholder="Кратко опишите суть жалобы"
                  {...complaintForm.register('title')}
                />
                {complaintForm.formState.errors.title && (
                  <p className="text-sm text-destructive">{complaintForm.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="complaint-type">Тип жалобы</Label>
                <Controller
                  name="type"
                  control={complaintForm.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип жалобы" />
                      </SelectTrigger>
                      <SelectContent>
                        {complaintTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {complaintForm.formState.errors.type && (
                  <p className="text-sm text-destructive">{complaintForm.formState.errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="participants">Участники инцидента</Label>
                <Input
                  id="participants"
                  placeholder="Укажите участников через запятую (ник1, ник2, ник3)"
                  {...complaintForm.register('participants')}
                />
                {complaintForm.formState.errors.participants && (
                  <p className="text-sm text-destructive">{complaintForm.formState.errors.participants.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="complaint-description">Подробное описание</Label>
                <Textarea
                  id="complaint-description"
                  placeholder="Опишите инцидент подробно..."
                  className="min-h-[120px]"
                  {...complaintForm.register('description')}
                />
                {complaintForm.formState.errors.description && (
                  <p className="text-sm text-destructive">{complaintForm.formState.errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="evidence">Доказательства (необязательно)</Label>
                <Textarea
                  id="evidence"
                  placeholder="Ссылки на скриншоты, видео или другие доказательства..."
                  className="min-h-[80px]"
                  {...complaintForm.register('evidence')}
                />
                {complaintForm.formState.errors.evidence && (
                  <p className="text-sm text-destructive">{complaintForm.formState.errors.evidence.message}</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={createComplaintMutation.isPending}>
                  {createComplaintMutation.isPending ? 'Отправляем...' : 'Подать жалобу'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};