import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Button,
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
  useAvailableJointDepartments, 
  useCreateJointPositionRequest, 
  type CreateJointPositionRequestDto 
} from '../../../entities/joint-position';

// Схема валидации с помощью Zod
const jointPositionRequestSchema = z.object({
  p_secondary_department_id: z
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

type JointPositionRequestFormData = z.infer<typeof jointPositionRequestSchema>;

interface RequestJointPositionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const RequestJointPositionForm = ({ onSuccess, onCancel }: RequestJointPositionFormProps) => {
  const { data: departments = [], isLoading: isDepartmentsLoading } = useAvailableJointDepartments();
  const createJointPositionRequest = useCreateJointPositionRequest();

  const form = useForm<JointPositionRequestFormData>({
    resolver: zodResolver(jointPositionRequestSchema),
    defaultValues: {
      p_secondary_department_id: '',
      p_reason: '',
    },
  });

  const onSubmit = async (data: JointPositionRequestFormData) => {
    try {
      // Убираем чекбокс из данных для отправки на сервер
      const { agreement_checkbox, ...requestData } = data;
      await createJointPositionRequest.mutateAsync(requestData);
      
      // При успешной отправке форма сбрасывается и модальное окно закрывается
      form.reset();
      onSuccess();
    } catch (error) {
      // Ошибка обрабатывается в хуке useCreateJointPositionRequest
      console.error('Failed to submit joint position request:', error);
    }
  };

  const isFormValid = form.formState.isValid;
  const isSubmitting = createJointPositionRequest.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="p_secondary_department_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Департамент для совмещения</FormLabel>
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
                          : "Выберите департамент"
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
              <FormLabel>Причина запроса на совмещение</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Опишите причину вашего запроса на совмещение должности. Укажите, как это может принести пользу организации и какой у вас опыт в данной области (минимум 10 символов)"
                  disabled={isSubmitting}
                  rows={4}
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
                  Я ознакомился с документацией по совмещению должностей и понимаю все требования и обязанности
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
            onClick={onCancel}
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
  );
};