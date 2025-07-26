import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Building2, Users, FileText, AlertCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Department } from "@shared/schema";
import { useCheckLimit } from "@/hooks/useCheckLimit";
import { useTranslation } from "react-i18next";

const jointApplicationSchema = z.object({
  type: z.enum(["joint_primary", "joint_secondary"]),
  secondaryDepartmentId: z.number().min(1, "Выберите департамент для совмещения"),
  reason: z.string().min(20, "Обоснование должно содержать минимум 20 символов"),
  agreesToDocumentation: z.boolean().refine(val => val === true, {
    message: "Необходимо согласиться с документацией департамента"
  }),
  additionalInfo: z.string().optional(),
});

type JointFormData = z.infer<typeof jointApplicationSchema>;

interface JointModalProps {
  children?: React.ReactNode;
}

export function JointModal({ children }: JointModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Проверяем лимиты заявок
  const { isLimitReached, isLoading: isLimitLoading, reason: limitReason } = useCheckLimit('joint');

  // Получаем список департаментов
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['/api/departments']
  });

  // Получаем текущего пользователя для определения основного департамента
  const { data: currentUser } = useQuery<any>({
    queryKey: ['/api/auth/me']
  });

  // Получаем активные совмещения пользователя
  const { data: activeJoints = [] } = useQuery<any[]>({
    queryKey: ['/api/joint-positions'],
    enabled: !!currentUser
  });

  const form = useForm<JointFormData>({
    resolver: zodResolver(jointApplicationSchema),
    defaultValues: {
      type: "joint_secondary",
      reason: "",
      additionalInfo: "",
      agreesToDocumentation: false
    }
  });

  const jointType = form.watch("type");
  const secondaryDepartmentId = form.watch("secondaryDepartmentId");

  const submitMutation = useMutation({
    mutationFn: async (data: JointFormData) => {
      const applicationData = {
        type: data.type,
        data: {
          secondaryDepartmentId: data.secondaryDepartmentId,
          reason: data.reason,
          additionalInfo: data.additionalInfo,
          agreesToDocumentation: data.agreesToDocumentation,
          jointType: data.type === "joint_primary" ? "Primary Joint" : "Secondary Joint"
        }
      };

      const response = await apiRequest('POST', '/api/applications', applicationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/joint-positions'] });
      setIsOpen(false);
      form.reset();
      toast({
        title: t('joint.success', 'Joint application submitted'),
        description: t('joint.success_desc', 'Your application has been sent for administrative review.')
      });
    },
    onError: (error: any) => {
      toast({
        title: t('joint.error', 'Error'),
        description: error.message || t('joint.error_desc', 'Failed to submit joint application'),
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: JointFormData) => {
    submitMutation.mutate(data);
  };

  const getJointTypeDescription = (type: string) => {
    switch (type) {
      case "joint_primary":
        return "Основное совмещение - приоритетная работа в выбранном департаменте";
      case "joint_secondary":
        return "Дополнительное совмещение - работа в свободное время";
      default:
        return "";
    }
  };

  const getSelectedDepartment = () => {
    return departments.find(dept => dept.id === secondaryDepartmentId);
  };

  const hasActiveJoint = activeJoints.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors" disabled={hasActiveJoint}>
            <div className="flex items-center space-x-3">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{t('dashboard.joint_application', 'Submit Joint Application')}</span>
            </div>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t('dashboard.joint_application', 'Submit Joint Application')}
          </DialogTitle>
          <DialogDescription>
            {t('joint.description', 'Submit an application to work in an additional department.')}
          </DialogDescription>
        </DialogHeader>

        {/* Предупреждение о лимитах */}
        {isLimitReached && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="space-y-1">
                <div className="font-medium text-red-800">Лимит заявок исчерпан</div>
                <p className="text-sm text-red-700">{limitReason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Предупреждение о существующих совмещениях */}
        {hasActiveJoint && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="space-y-1">
                <div className="font-medium text-yellow-800">Активное совмещение</div>
                <p className="text-sm text-yellow-700">
                  У вас уже есть активное совмещение. Для подачи новой заявки необходимо сначала снять текущее совмещение.
                </p>
              </div>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Тип совмещения */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип совмещения</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="joint_secondary" id="joint_secondary" />
                        <Label htmlFor="joint_secondary" className="flex-1">
                          <div className="font-medium">Дополнительное совмещение</div>
                          <div className="text-sm text-muted-foreground">
                            Работа в свободное время от основного департамента
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="joint_primary" id="joint_primary" />
                        <Label htmlFor="joint_primary" className="flex-1">
                          <div className="font-medium">Основное совмещение</div>
                          <div className="text-sm text-muted-foreground">
                            Приоритетная работа в выбранном департаменте
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    {getJointTypeDescription(jointType)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Выбор департамента */}
            <FormField
              control={form.control}
              name="secondaryDepartmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Департамент для совмещения</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите департамент" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments
                        .filter(dept => dept.id !== currentUser?.departmentId) // Исключаем основной департамент
                        .map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{dept.name}</span>
                              <span className="text-xs text-muted-foreground">{dept.fullName}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Выберите департамент, в котором хотите работать по совмещению
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Информация о выбранном департаменте */}
            {getSelectedDepartment() && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Информация о департаменте</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Название: </span>
                    <span className="text-blue-600">{getSelectedDepartment()?.fullName}</span>
                  </div>
                  {getSelectedDepartment()?.description && (
                    <div>
                      <span className="text-blue-700 font-medium">Описание: </span>
                      <span className="text-blue-600">{getSelectedDepartment()?.description}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Обоснование */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Обоснование необходимости совмещения</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Опишите, почему вам необходимо совмещение в данном департаменте..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Подробно объясните причины, по которым вы хотите работать в этом департаменте по совмещению
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Дополнительная информация */}
            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дополнительная информация (необязательно)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Любая дополнительная информация, которая может быть полезна при рассмотрении заявки..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Укажите дополнительную информацию, если считаете необходимым
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Согласие с документацией */}
            <FormField
              control={form.control}
              name="agreesToDocumentation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium">
                      Я согласен с документацией и правилами департамента
                    </FormLabel>
                    <FormDescription className="text-xs">
                      Подтверждаю, что ознакомлен с документацией выбранного департамента и обязуюсь соблюдать все правила и процедуры
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Информация о политике совмещений */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 text-gray-600 mt-0.5" />
                <div className="space-y-2">
                  <div className="font-medium text-gray-800">Политика совмещений:</div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Разрешено только одно активное совмещение одновременно</li>
                    <li>• Совмещение возможно только с согласия администрации</li>
                    <li>• Необходимо соблюдать правила и процедуры обоих департаментов</li>
                    <li>• Совмещение может быть отозвано в любое время</li>
                    <li>• Приоритет отдается основному департаменту</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={submitMutation.isPending || isLimitReached || hasActiveJoint}
              >
                {submitMutation.isPending ? 'Отправка...' : 'Подать заявку'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 