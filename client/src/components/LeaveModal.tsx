import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, AlertTriangle, Plane } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, addDays } from "date-fns";
import { ru } from "date-fns/locale";

const leaveSchema = z.object({
  leaveType: z.enum(["vacation", "sick", "personal", "emergency", "medical", "maternity", "bereavement"]),
  startDate: z.date({
    required_error: "Start date is required"
  }),
  endDate: z.date({
    required_error: "End date is required"
  }),
  reason: z.string().min(5, "Please provide a reason (minimum 5 characters)"),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  coverageArrangements: z.string().optional(),
  isPartialDay: z.boolean().default(false),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  additionalNotes: z.string().optional(),
}).refine((data) => {
  return data.endDate >= data.startDate;
}, {
  message: "End date must be after start date",
  path: ["endDate"]
}).refine((data) => {
  if (data.isPartialDay) {
    return data.startTime && data.endTime;
  }
  return true;
}, {
  message: "Start and end times are required for partial day leave",
  path: ["startTime"]
});

type LeaveFormData = z.infer<typeof leaveSchema>;

interface LeaveModalProps {
  children?: React.ReactNode;
  defaultStartDate?: Date;
  defaultEndDate?: Date;
  onSubmit?: () => void;
}

const leaveTypes = [
  { value: "vacation", label: "Отпуск", description: "Плановый отдых и восстановление" },
  { value: "sick", label: "Больничный", description: "Болезнь или восстановление после болезни" },
  { value: "personal", label: "Личный", description: "Личные дела и встречи" },
  { value: "emergency", label: "Экстренный", description: "Неожиданные срочные ситуации" },
  { value: "medical", label: "Медицинский", description: "Длительное лечение или операция" },
  { value: "maternity", label: "Декретный", description: "Рождение ребёнка или усыновление" },
  { value: "bereavement", label: "Траурный", description: "Потеря члена семьи или близкого человека" }
];

export function LeaveModal({ children, defaultStartDate, defaultEndDate, onSubmit }: LeaveModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      isPartialDay: false,
      reason: "",
      additionalNotes: "",
      startDate: defaultStartDate,
      endDate: defaultEndDate
    }
  });

  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const isPartialDay = form.watch("isPartialDay");
  const leaveType = form.watch("leaveType");

  const submitMutation = useMutation({
    mutationFn: async (data: LeaveFormData) => {
      const applicationData = {
        type: "leave",
        data: {
          leaveType: data.leaveType,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
          reason: data.reason,
          emergencyContact: data.emergencyContact,
          emergencyPhone: data.emergencyPhone,
          coverageArrangements: data.coverageArrangements,
          isPartialDay: data.isPartialDay,
          startTime: data.startTime,
          endTime: data.endTime,
          additionalNotes: data.additionalNotes,
          totalDays: calculateTotalDays()
        }
      };

      const response = await apiRequest('POST', '/api/applications', applicationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      setIsOpen(false);
      form.reset();
      toast({
        title: "Заявка на отпуск отправлена",
        description: "Ваша заявка на отпуск отправлена на рассмотрение."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить заявку на отпуск",
        variant: "destructive"
      });
    }
  });

  const calculateTotalDays = () => {
    if (!startDate || !endDate) return 0;
    if (isPartialDay) return 0.5;
    return differenceInDays(endDate, startDate) + 1;
  };

  const onSubmitForm = (data: LeaveFormData) => {
    submitMutation.mutate(data);
    if (onSubmit) onSubmit();
  };

  const getLeaveTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      vacation: "bg-blue-100 text-blue-800",
      sick: "bg-red-100 text-red-800",
      personal: "bg-purple-100 text-purple-800",
      emergency: "bg-orange-100 text-orange-800",
      medical: "bg-green-100 text-green-800",
      maternity: "bg-pink-100 text-pink-800",
      bereavement: "bg-gray-100 text-gray-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const isEmergencyType = ["emergency", "sick", "bereavement"].includes(leaveType);
  const totalDays = calculateTotalDays();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plane className="h-4 w-4" />
            Запросить отпуск
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Заявка на отпуск
          </DialogTitle>
          <DialogDescription>
            Отправьте заявку на освобождение от служебных обязанностей.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-6">
            {/* Leave Type */}
            <FormField
              control={form.control}
              name="leaveType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип отпуска</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип отпуска" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{type.label}</span>
                            <span className="text-xs text-muted-foreground">{type.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Partial Day Option */}
            <FormField
              control={form.control}
              name="isPartialDay"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Частичный день отпуска
                    </FormLabel>
                    <FormDescription>
                      Отметьте, если вам нужен отпуск только на часть дня (например, утренний приём у врача)
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Date Selection */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Дата начала</FormLabel>
                    <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ru })
                            ) : (
                              <span>Выберите дату начала</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setStartCalendarOpen(false);
                          }}
                          disabled={(date) => {
                            // Allow emergency/sick leave to be retroactive
                            if (isEmergencyType) return false;
                            return date < new Date();
                          }}
                          initialFocus
                          locale={ru}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Дата окончания</FormLabel>
                    <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ru })
                            ) : (
                              <span>Выберите дату окончания</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setEndCalendarOpen(false);
                          }}
                          disabled={(date) => {
                            if (isEmergencyType) return false;
                            return date < (startDate || new Date());
                          }}
                          initialFocus
                          locale={ru}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Time Selection for Partial Days */}
            {isPartialDay && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Время начала</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Время окончания</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Duration Display */}
            {startDate && endDate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                                      <span className="font-medium text-blue-800">Продолжительность отпуска</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-blue-700">Всего дней: </span>
                    <Badge className={`${getLeaveTypeColor(leaveType || "")}`}>
                      {totalDays} {totalDays === 1 ? 'день' : totalDays < 5 ? 'дня' : 'дней'}
                    </Badge>
                  </div>
                  <div className="text-blue-600">
                    С {format(startDate, "EEEE, d MMMM yyyy", { locale: ru })} по {format(endDate, "EEEE, d MMMM yyyy", { locale: ru })}
                  </div>
                </div>
              </div>
            )}

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Причина отпуска</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Пожалуйста, укажите причину вашего отпуска..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Укажите подробности, почему вам необходим этот отпуск.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Emergency Contact (for extended leave) */}
            {totalDays > 5 && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Экстренный контакт</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Имя контактного лица"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Для длительных отпусков (5+ дней)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Телефон экстренного контакта</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Номер телефона"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Coverage Arrangements */}
            <FormField
              control={form.control}
              name="coverageArrangements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Организация замещения</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Опишите, как будут выполняться ваши обязанности во время вашего отсутствия..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Укажите, кто будет выполнять ваши обязанности и как будет организована передача дел.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Notes */}
            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дополнительные сведения (необязательно)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Любая дополнительная информация..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Important Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-medium text-yellow-800">Напоминания о правилах отпуска:</div>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Подавайте заявки на отпуск минимум за 5 дней</li>
                    <li>• Экстренные и больничные отпуска можно подавать задним числом</li>
                    <li>• Максимум 2 заявки на отпуск в месяц</li>
                    <li>• Требуется одобрение супервайзера</li>
                    <li>• Длительные отпуска (7+ дней) могут требовать дополнительных документов</li>
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
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? 'Отправка...' : 'Отправить заявку на отпуск'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}