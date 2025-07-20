import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { useCheckLimit } from "@/hooks/useCheckLimit";
import { Plus, User, Building, Calendar, Mic, Monitor, Link, Users, History, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { entryApplicationSchema, type EntryApplicationData } from "@shared/schema";
import { useTranslation } from "react-i18next";

interface EntryApplicationModalProps {
  children?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const STEPS = [
  { title: "Личная информация", icon: User },
  { title: "Выбор департамента", icon: Building },
  { title: "Мотивация", icon: Users },
  { title: "Технические требования", icon: Monitor },
  { title: "Дополнительная информация", icon: History },
  { title: "Подтверждение", icon: Check }
];

export function EntryApplicationModal({ children, isOpen, onOpenChange }: EntryApplicationModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [departmentDescriptionValue, setDepartmentDescriptionValue] = useState(''); // Отдельное состояние
  const open = typeof isOpen === 'boolean' ? isOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t } = useTranslation();

  // Проверяем лимиты заявок
  const { isLimitReached = false, isLoading: isLimitLoading = false, reason: limitReason = '', refetch: refetchLimits } = useCheckLimit('entry');
  
  // Отладочная информация
  useEffect(() => {
    console.log('🔍 EntryApplicationModal - Состояние лимитов:', {
      isLimitReached,
      isLimitLoading,
      limitReason,
      user: !!user
    });
  }, [isLimitReached, isLimitLoading, limitReason, user]);

  const { data: departments = [] } = useQuery<any[]>({
    queryKey: ['/api/departments']
  });

  const form = useForm<EntryApplicationData>({
    resolver: zodResolver(entryApplicationSchema),
    defaultValues: {
      fullName: "",
      birthDate: "",
      departmentId: 0,
      departmentDescription: "",
      motivation: "",
      hasMicrophone: false,
      meetsSystemRequirements: false,
      systemRequirementsLink: "",
      sourceOfInformation: "",
      inOtherCommunities: false,
      wasInOtherCommunities: false,
      otherCommunitiesDetails: ""
    }
  });

  // Отладочная информация о значениях формы
  useEffect(() => {
    console.log('🔍 EntryApplicationModal - Текущий шаг:', currentStep);
    
    // Дополнительная отладка для шага 2
    if (currentStep === 2) {
      console.log('🔍 DEBUG Step 2 - Отдельное состояние departmentDescription:', departmentDescriptionValue);
      console.log('🔍 DEBUG Step 2 - birthDate:', form.getValues('birthDate'));
    }
  }, [currentStep]); // Убираем departmentDescriptionValue из зависимостей

  const mutation = useMutation({
    mutationFn: async (data: EntryApplicationData) => {
      const applicationData = {
        type: "entry",
        data: {
          ...data,
          submittedAt: new Date().toISOString()
        }
      };
      
      const response = await apiRequest('POST', '/api/applications', applicationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      if (refetchLimits) refetchLimits();
      toast({
        title: t('entry.success', 'Application submitted'),
        description: t('entry.success_desc', 'Your entry application has been successfully sent for review')
      });
      setOpen(false);
      form.reset();
      setCurrentStep(1);
    },
    onError: (error: any) => {
      toast({
        title: t('entry.error', 'Error'),
        description: error.message || t('entry.error_desc', 'Failed to submit application'),
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: EntryApplicationData) => {
    // Используем отдельное состояние для departmentDescription
    const finalData = {
      ...data,
      departmentDescription: departmentDescriptionValue
    };
    console.log('🔍 Отправка данных с отдельным состоянием:', finalData);
    mutation.mutate(finalData);
  };

  const handleNext = async () => {
    console.log('🔍 handleNext - Начало выполнения');
    
    // Определяем поля для валидации в зависимости от текущего шага
    let fieldsToValidate: (keyof EntryApplicationData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['fullName', 'birthDate'];
        break;
      case 2:
        fieldsToValidate = ['departmentId', 'departmentDescription'];
        break;
      case 3:
        fieldsToValidate = ['motivation'];
        break;
      case 4:
        fieldsToValidate = ['hasMicrophone', 'meetsSystemRequirements'];
        break;
      case 5:
        fieldsToValidate = ['sourceOfInformation', 'inOtherCommunities', 'wasInOtherCommunities'];
        break;
      default:
        break;
    }
    
    console.log('🔍 handleNext - Поля для валидации:', fieldsToValidate);
    
    // Валидируем только поля текущего шага
    const isValid = await form.trigger(fieldsToValidate);
    console.log('🔍 handleNext - Результат валидации:', isValid);
    
    if (isValid && currentStep < STEPS.length) {
      console.log('🔍 Переход к следующему шагу:', currentStep + 1);
      
      // Принудительно очищаем все поля следующего шага
      if (currentStep === 1) {
        // При переходе к шагу 2 очищаем поля департамента
        form.setValue('departmentId', 0);
        form.setValue('departmentDescription', '');
        // Очищаем отдельное состояние
        setDepartmentDescriptionValue('');
        // Принудительно обновляем состояние формы
        form.clearErrors(['departmentId', 'departmentDescription']);
        
        console.log('🔍 Очищены поля департамента');
      }
      
      setCurrentStep(currentStep + 1);
    } else {
      console.log('🔍 Валидация не прошла или это последний шаг');
      // Показываем ошибки валидации
      const errors = form.formState.errors;
      console.log('🔍 Ошибки валидации:', errors);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      console.log('🔍 Переход к предыдущему шагу:', currentStep - 1);
      
      // Очищаем значения полей текущего шага при переходе назад
      if (currentStep === 2) {
        // При переходе назад с шага 2 очищаем поля департамента
        form.setValue('departmentId', 0);
        form.setValue('departmentDescription', '');
        setDepartmentDescriptionValue('');
        console.log('🔍 Очищены поля департамента при переходе назад');
      }
      
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    console.log('🔍 Закрытие модального окна');
    setOpen(false);
    setCurrentStep(1);
    form.reset();
  };

  const handleOpen = () => {
    console.log('🔍 Открытие модального окна');
    
    // Принудительно очищаем все поля при открытии
    form.reset({
      fullName: "",
      birthDate: "",
      departmentId: 0,
      departmentDescription: "",
      motivation: "",
      hasMicrophone: false,
      meetsSystemRequirements: false,
      systemRequirementsLink: "",
      sourceOfInformation: "",
      inOtherCommunities: false,
      wasInOtherCommunities: false,
      otherCommunitiesDetails: ""
    });
    
    // Очищаем отдельное состояние
    setDepartmentDescriptionValue('');
    
    setCurrentStep(1);
    setOpen(true);
  };

  const sourceOptions = [
    { value: "discord", label: "Discord" },
    { value: "vk", label: "ВКонтакте" },
    { value: "friend", label: "От друзей" },
    { value: "advertisement", label: "Реклама" },
    { value: "other", label: "Другое" }
  ];

  const progress = (currentStep / STEPS.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Личная информация</span>
            </h3>
            
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem key="fullName-field">
                  <FormLabel>ФИО *</FormLabel>
                  <FormControl>
                    <Input 
                      key="fullName-input"
                      placeholder="Введите ваше полное имя" 
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => {
                // Временная отладка
                console.log('🔍 DEBUG birthDate render:', {
                  fieldValue: field.value,
                  fieldName: field.name,
                  currentStep
                });
                
                return (
                  <FormItem key="birthDate-field">
                    <FormLabel>Дата рождения *</FormLabel>
                    <FormControl>
                      <Input 
                        key="birthDate-input"
                        type="date" 
                        value={field.value || ""}
                        onChange={(e) => {
                          console.log('🔍 DEBUG birthDate onChange:', e.target.value);
                          field.onChange(e.target.value);
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <Building className="h-4 w-4" />
              <span>Выбор департамента</span>
            </h3>
            
            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem key="departmentId-field">
                  <FormLabel>Департамент *</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    value={field.value?.toString() || ""}
                  >
                    <FormControl>
                      <SelectTrigger key="departmentId-select">
                        <SelectValue placeholder="Выберите департамент..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="departmentDescription"
              render={({ field }) => {
                // Полностью игнорируем React Hook Form для этого поля
                // Используем только отдельное состояние
                
                // Временная отладка
                console.log('🔍 DEBUG departmentDescription render:', {
                  fieldValue: field.value,
                  separateState: departmentDescriptionValue,
                  currentStep
                });
                
                return (
                  <FormItem key="departmentDescription-field">
                    <FormLabel>Чем занимается выбранный департамент? *</FormLabel>
                    <FormControl>
                      <Textarea 
                        key={`departmentDescription-textarea-${currentStep}-${Date.now()}`}
                        placeholder="Опишите функции и задачи департамента..." 
                        className="min-h-[80px]"
                        value={departmentDescriptionValue}
                        onChange={(e) => {
                          console.log('🔍 DEBUG departmentDescription onChange:', e.target.value);
                          setDepartmentDescriptionValue(e.target.value);
                          // Синхронизируем с React Hook Form для валидации
                          field.onChange(e.target.value);
                        }}
                        onBlur={() => {
                          // Синхронизируем с React Hook Form при потере фокуса
                          field.onChange(departmentDescriptionValue);
                        }}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Мотивация</span>
            </h3>
            
            <FormField
              control={form.control}
              name="motivation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Почему вы хотите вступить именно в этот департамент? *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Расскажите о ваших мотивах и целях..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <Monitor className="h-4 w-4" />
              <span>Технические требования</span>
            </h3>
            
            <FormField
              control={form.control}
              name="hasMicrophone"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>У меня есть исправный микрофон *</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Микрофон необходим для игрового взаимодействия
                    </p>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="meetsSystemRequirements"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Мой ПК соответствует системным требованиям FiveM *</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Убедитесь, что ваш компьютер соответствует минимальным требованиям
                    </p>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="systemRequirementsLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ссылка на системные требования вашего ПК</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>Дополнительная информация</span>
            </h3>
            
            <FormField
              control={form.control}
              name="sourceOfInformation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Откуда вы узнали про нас? *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите источник..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sourceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="inOtherCommunities"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Состоите ли вы в других сообществах на данный момент?</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="wasInOtherCommunities"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Состояли ли вы в других FiveM-сообществах ранее?</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="otherCommunitiesDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Детали о других сообществах (если применимо)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Расскажите о вашем опыте в других сообществах..." 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center space-x-2">
              <Check className="h-4 w-4" />
              <span>Проверка данных</span>
            </h3>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <span className="font-medium">ФИО:</span> {form.watch('fullName')}
              </div>
              <div>
                <span className="font-medium">Дата рождения:</span> {form.watch('birthDate')}
              </div>
              <div>
                <span className="font-medium">Департамент:</span> {
                  departments.find(d => d.id === form.watch('departmentId'))?.name
                }
              </div>
              <div>
                <span className="font-medium">Микрофон:</span> {form.watch('hasMicrophone') ? 'Да' : 'Нет'}
              </div>
              <div>
                <span className="font-medium">Системные требования:</span> {form.watch('meetsSystemRequirements') ? 'Соответствует' : 'Не соответствует'}
              </div>
            </div>
            
            <p className="text-sm text-gray-600">
              Пожалуйста, проверьте все данные перед отправкой заявки. После отправки изменения будут невозможны.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {children ? (
        <Dialog open={open} onOpenChange={handleClose}>
          <DialogTrigger asChild>
            {children}
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Содержимое модального окна */}
          </DialogContent>
        </Dialog>
      ) : (
        <>
          <button 
            className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
            disabled={false}
            title={isLimitReached ? (limitReason || '') : ''}
            onClick={() => {
              console.log('🔍 Кнопка нажата!');
              setOpen(true);
            }}
          >
            <div className="flex items-center space-x-3">
              <Plus className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {t('entry.submit_application', 'Submit Entry Application')}
              </span>
            </div>
          </button>
          
          <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
      
            {/* Показываем информацию о лимитах отдельно */}
            {isLimitReached && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-yellow-800">
                    {limitReason || t('entry.limit_reached', 'Application limit reached')}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetchLimits && refetchLimits()}
                    disabled={isLimitLoading}
                    className="text-xs h-6 px-2"
                  >
                    {isLimitLoading ? (
                      <div className="flex items-center space-x-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                        <span>{t('entry.updating', 'Updating...')}</span>
                      </div>
                    ) : (
                      t('entry.refresh', 'Refresh')
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{t('entry.title', 'Community Entry Application')}</span>
              </DialogTitle>
              
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{t('entry.step', 'Step')} {currentStep} {t('entry.of', 'of')} {STEPS.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {renderStepContent()}
                
                {/* Navigation buttons */}
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentStep === 1}
                    className="flex items-center space-x-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>{t('entry.back', 'Back')}</span>
                  </Button>
                  
                  <div className="flex space-x-2">
                    {currentStep < STEPS.length ? (
                      <Button
                        type="button"
                        onClick={() => {
                          console.log('🔍 Кнопка "Далее" нажата!');
                          handleNext();
                        }}
                        className="flex items-center space-x-2"
                      >
                        <span>{t('entry.next', 'Next')}</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={mutation.isPending}
                        className="flex items-center space-x-2"
                      >
                        {mutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b border-current"></div>
                            <span>{t('entry.submitting', 'Submitting...')}</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            <span>{t('entry.submit', 'Submit Application')}</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        </>
      )}
    </>
  );
} 