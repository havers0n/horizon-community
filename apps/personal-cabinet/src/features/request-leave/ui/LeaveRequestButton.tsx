import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarDays } from 'lucide-react';
import { 
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from '../../../shared/ui';
import { useCreateLeaveRequest, type CreateLeaveRequestDto } from '../../../entities/leave';

// Схема валидации с помощью Zod
const leaveRequestSchema = z.object({
  p_start_date: z
    .string()
    .min(1, 'Дата начала отпуска обязательна')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'Дата начала не может быть в прошлом'),
  
  p_end_date: z
    .string()
    .min(1, 'Дата окончания отпуска обязательна'),
  
  p_reason: z
    .string()
    .min(10, 'Причина должна содержать минимум 10 символов')
    .max(500, 'Причина не может превышать 500 символов'),
}).refine((data) => {
  const startDate = new Date(data.p_start_date);
  const endDate = new Date(data.p_end_date);
  return endDate >= startDate;
}, {
  message: 'Дата окончания отпуска не может быть раньше даты начала',
  path: ['p_end_date'],
});

type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

export const LeaveRequestButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const createLeaveRequest = useCreateLeaveRequest();

  const form = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      p_start_date: '',
      p_end_date: '',
      p_reason: '',
    },
  });

  const onSubmit = async (data: LeaveRequestFormData) => {
    try {
      await createLeaveRequest.mutateAsync(data);
      // При успешной отправке форма сбрасывается и модальное окно закрывается
      form.reset();
      setIsOpen(false);
    } catch (error) {
      // Ошибка обрабатывается в хуке useCreateLeaveRequest
      console.error('Failed to submit leave request:', error);
    }
  };

  const handleClose = () => {
    if (!createLeaveRequest.isPending) {
      setIsOpen(false);
      form.reset();
    }
  };

  // Вычисляем минимальную дату (сегодня)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="h-auto p-3 flex flex-col items-center justify-center space-y-1 text-xs w-full"
        >
          <CalendarDays className="w-4 h-4" />
          <span className="text-center">✈ Отпуск</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]" onPointerDownOutside={(e) => {
        if (createLeaveRequest.isPending) {
          e.preventDefault();
        }
      }}>
        <DialogHeader>
          <DialogTitle>Заявка на отпуск</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="p_start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дата начала отпуска</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      min={today}
                      disabled={createLeaveRequest.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="p_end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дата окончания отпуска</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      min={form.watch('p_start_date') || today}
                      disabled={createLeaveRequest.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="p_reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Причина отпуска</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Укажите причину вашего отпуска (минимум 10 символов)"
                      disabled={createLeaveRequest.isPending}
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createLeaveRequest.isPending}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                isLoading={createLeaveRequest.isPending}
                disabled={createLeaveRequest.isPending}
              >
                {createLeaveRequest.isPending ? 'Отправка...' : 'Подать заявку'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};