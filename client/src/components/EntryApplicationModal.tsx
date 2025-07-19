import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCheckLimit } from "@/hooks/useCheckLimit";
import { Plus, User, Building, Calendar, Mic, Monitor, Link, Users, History } from "lucide-react";
import { entryApplicationSchema, type EntryApplicationData } from "@shared/schema";

interface EntryApplicationModalProps {
  children?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EntryApplicationModal({ children, isOpen, onOpenChange }: EntryApplicationModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = typeof isOpen === 'boolean' ? isOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Проверяем лимиты заявок
  const { isLimitReached, isLoading: isLimitLoading, reason: limitReason, refetch: refetchLimits } = useCheckLimit('entry');

  // Отладочная информация
  console.log('🔍 EntryApplicationModal - Состояние лимитов:', {
    isLimitReached,
    isLimitLoading,
    limitReason
  });

  // Функция для принудительного обновления лимитов
  const handleRefreshLimits = () => {
    console.log('🔄 Принудительное обновление лимитов...');
    refetchLimits();
  };

  // Получаем список департаментов
  const { data: departments = [] } = useQuery<any[]>({
    queryKey: ['/api/departments'],
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
      // Обновляем лимиты после успешной отправки заявки
      refetchLimits();
      toast({
        title: "Заявка подана",
        description: "Ваша заявка на вступление успешно отправлена на рассмотрение"
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить заявку",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: EntryApplicationData) => {
    mutation.mutate(data);
  };

  const sourceOptions = [
    { value: "discord", label: "Discord" },
    { value: "vk", label: "ВКонтакте" },
    { value: "friend", label: "От друзей" },
    { value: "advertisement", label: "Реклама" },
    { value: "other", label: "Другое" }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <div className="w-full">
            <Button 
              className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              disabled={isLimitLoading || isLimitReached}
              title={isLimitReached ? limitReason : ''}
            >
              <div className="flex items-center space-x-3">
                <Plus className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-gray-900">
                  {isLimitLoading ? 'Проверка лимитов...' : 
                   isLimitReached ? 'Лимит заявок исчерпан' : 
                   'Подать заявку на вступление'}
                </span>
              </div>
            </Button>
            
            {/* Показываем дополнительную информацию и кнопку обновления */}
            {isLimitReached && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-yellow-800">
                    {limitReason || 'Лимит заявок исчерпан'}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefreshLimits}
                    disabled={isLimitLoading}
                    className="text-xs h-6 px-2"
                  >
                    {isLimitLoading ? (
                      <div className="flex items-center space-x-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                        <span>Обновление...</span>
                      </div>
                    ) : (
                      'Обновить'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Заявка на вступление в сообщество</span>
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Личная информация */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Личная информация</span>
              </h3>
              
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ФИО *</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите ваше полное имя" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Дата рождения *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Выбор департамента */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <span>Выбор департамента</span>
              </h3>
              
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Департамент *</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Чем занимается выбранный департамент? *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Опишите функции и задачи департамента..." 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Мотивация */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Мотивация</h3>
              
              <FormField
                control={form.control}
                name="motivation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Почему вы хотите вступить в сообщество? *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Расскажите о ваших целях и мотивации..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Технические требования */}
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
                      <FormLabel className="flex items-center space-x-2">
                        <Mic className="h-4 w-4" />
                        <span>У вас есть микрофон? *</span>
                      </FormLabel>
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
                      <FormLabel>
                        Ваш компьютер соответствует системным требованиям? *
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="systemRequirementsLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Link className="h-4 w-4" />
                      <span>Ссылка на системные требования *</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="url" 
                        placeholder="https://example.com/requirements" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Информация о сообществе */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Информация о сообществе</span>
              </h3>
              
              <FormField
                control={form.control}
                name="sourceOfInformation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Откуда вы узнали о сообществе? *</FormLabel>
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
                      <FormLabel>
                        Состоите ли вы в других игровых сообществах? *
                      </FormLabel>
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
                      <FormLabel className="flex items-center space-x-2">
                        <History className="h-4 w-4" />
                        <span>Состояли ли ранее в других сообществах? *</span>
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="otherCommunitiesDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Детали о других сообществах</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Если да, расскажите о вашем опыте..." 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Кнопки */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Отправка...' : 'Отправить заявку'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 