import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRightLeft } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Checkbox,
} from '../../../shared/ui';
import { 
  useAvailableTransferDepartments, 
  useCreateTransferRequest, 
  type CreateTransferRequestDto 
} from '../../../entities/transfer-request';

// Схема валидации с помощью Zod
const transferRequestSchema = z.object({
  p_target_department_id: z
    .string()
    .min(1, 'Выбор департамента обязателен'),
  
  p_reason: z
    .string()
    .min(10, 'Причина должна содержать минимум 10 символов')
    .max(1000, 'Причина не может превышать 1000 символов'),

  agreement_checkbox: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Необходимо подтвердить согласие с документацией'
    }),
});

type TransferRequestFormData = z.infer<typeof transferRequestSchema>;

export const RequestTransferButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: departments = [], isLoading: isDepartmentsLoading } = useAvailableTransferDepartments();
  const createTransferRequest = useCreateTransferRequest();

  const form = useForm<TransferRequestFormData>({
    resolver: zodResolver(transferRequestSchema),
    defaultValues: {
      p_target_department_id: '',
      p_reason: '',
    },
  });

  const onSubmit = async (data: TransferRequestFormData) => {
    try {
      // Убираем чекбокс из данных для отправки на сервер
      const { agreement_checkbox, ...requestData } = data;
      await createTransferRequest.mutateAsync(requestData);
      
      // При успешной отправке форма сбрасывается и модальное окно закрывается
      form.reset();
      setIsOpen(false);
    } catch (error) {
      // Ошибка обрабатывается в хуке useCreateTransferRequest
      console.error('Failed to submit transfer request:', error);
    }
  };

  const handleClose = () => {
    if (!createTransferRequest.isPending) {
      setIsOpen(false);
      form.reset();
    }
  };

  const isFormValid = form.formState.isValid;
  const isSubmitting = createTransferRequest.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="h-auto p-3 flex flex-col items-center justify-center space-y-1 text-xs w-full"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span className="text-center">🔄 Перевод</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent 
        className="sm:max-w-[500px]" 
        onPointerDownOutside={(e) => {
          if (isSubmitting) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Заявка на перевод в другой департамент</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="p_target_department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Целевой департамент</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting || isDepartmentsLoading}
                    >
                      <SelectTrigger>
                        <SelectValue 
                          placeholder={
                            isDepartmentsLoading 
                              ? "Загрузка департаментов..." 
                              : "Выберите департамент для перевода"
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))}
                        {departments.length === 0 && !isDepartmentsLoading && (
                          <SelectItem value="no-departments" disabled>
                            Нет доступных департаментов
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
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
                  <FormLabel>Причина запроса на перевод</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Опишите причину вашего запроса на перевод в другой департамент. Укажите, как это может способствовать вашему профессиональному развитию и какой опыт вы можете принести в новый департамент (минимум 10 символов)"
                      disabled={isSubmitting}
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="agreement_checkbox"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal">
                      Я ознакомился с документацией по переводу между департаментами и понимаю все требования и процедуры
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};