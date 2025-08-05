import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Calendar } from '@/shared/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/shared/lib/use-toast'
import { CalendarIcon, CalendarDays, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

const leaveRequestSchema = z.object({
  type: z.string().min(1, 'Выберите тип отпуска'),
  startDate: z.date({
    required_error: 'Выберите дату начала отпуска'
  }),
  endDate: z.date({
    required_error: 'Выберите дату окончания отпуска'
  }),
  reason: z.string().min(10, 'Укажите причину отпуска'),
  emergencyContact: z.string().min(1, 'Укажите контакт для экстренной связи'),
  additionalInfo: z.string().optional()
}).refine((data) => data.endDate > data.startDate, {
  message: 'Дата окончания должна быть позже даты начала',
  path: ['endDate']
})

type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>

interface LeaveModalProps {
  children?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const leaveTypes = [
  { id: 'annual', name: 'Ежегодный отпуск', description: 'Плановый отпуск', days: 28 },
  { id: 'sick', name: 'Больничный', description: 'По состоянию здоровья', days: 0 },
  { id: 'unpaid', name: 'Отпуск без содержания', description: 'За свой счет', days: 0 },
  { id: 'maternity', name: 'Декретный отпуск', description: 'По беременности и родам', days: 140 },
  { id: 'study', name: 'Учебный отпуск', description: 'Для обучения', days: 0 },
  { id: 'other', name: 'Другой', description: 'Иные причины', days: 0 }
]

const mockLeaveHistory = [
  {
    id: '1',
    type: 'annual',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    status: 'approved',
    reason: 'Плановый отпуск',
    days: 32
  },
  {
    id: '2',
    type: 'sick',
    startDate: '2024-03-10',
    endDate: '2024-03-15',
    status: 'approved',
    reason: 'ОРВИ',
    days: 6
  },
  {
    id: '3',
    type: 'unpaid',
    startDate: '2024-05-20',
    endDate: '2024-05-25',
    status: 'pending',
    reason: 'Семейные обстоятельства',
    days: 6
  }
]

export function LeaveModal({ children, isOpen, onOpenChange }: LeaveModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'request' | 'history'>('request')
  const open = typeof isOpen === 'boolean' ? isOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const { toast } = useToast()
  const queryClient = useQueryClient()


  const form = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      type: '',
      startDate: undefined,
      endDate: undefined,
      reason: '',
      emergencyContact: '',
      additionalInfo: ''
    }
  })

  const mutation = useMutation({
    mutationFn: async (data: LeaveRequestFormData) => {
      // Здесь будет API вызов для создания заявки на отпуск
      console.log('Создание заявки на отпуск:', data)
      return { success: true, id: 'leave_' + Date.now() }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/leave-requests'] })
      toast({
        title: 'Заявка отправлена!',
        description: `Ваша заявка на отпуск #${data.id} успешно отправлена.`
      })
      setOpen(false)
      form.reset()
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить заявку. Попробуйте еще раз.',
        variant: 'destructive'
      })
    }
  })

  const onSubmit = (data: LeaveRequestFormData) => {
    mutation.mutate(data)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }



  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Одобрено</Badge>
      case 'pending':
        return <Badge variant="secondary">На рассмотрении</Badge>
      case 'rejected':
        return <Badge variant="destructive">Отклонено</Badge>
      default:
        return <Badge variant="outline">Неизвестно</Badge>
    }
  }

  const selectedType = form.watch('type')
  const selectedLeaveType = leaveTypes.find(lt => lt.id === selectedType)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <CalendarDays className="h-4 w-4 mr-2" />
            Заявка на отпуск
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Управление отпусками
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <Button
            variant={activeTab === 'request' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('request')}
            className="flex-1"
          >
            Новая заявка
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('history')}
            className="flex-1"
          >
            История отпусков
          </Button>
        </div>

        {/* Request Form */}
        {activeTab === 'request' && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Новая заявка на отпуск</CardTitle>
                  <CardDescription>
                    Заполните форму для подачи заявки на отпуск
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Тип отпуска *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите тип отпуска" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {leaveTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{type.name}</span>
                                  {type.days > 0 && (
                                    <Badge variant="outline" className="ml-2">
                                      {type.days} дн.
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedLeaveType && (
                          <p className="text-sm text-muted-foreground">
                            {selectedLeaveType.description}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Дата начала *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? (
                                    format(field.value, 'PPP', { locale: ru })
                                  ) : (
                                    <span>Выберите дату</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
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
                        <FormItem>
                          <FormLabel>Дата окончания *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? (
                                    format(field.value, 'PPP', { locale: ru })
                                  ) : (
                                    <span>Выберите дату</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => {
                                  const startDate = form.getValues('startDate')
                                  return startDate ? date <= startDate : date < new Date()
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Причина отпуска *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Укажите причину отпуска..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Контакт для экстренной связи *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+7 (999) 123-45-67 или email@example.com"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Дополнительная информация</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Любая дополнительная информация..."
                            className="min-h-[60px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Отправка...' : 'Отправить заявку'}
                </Button>
              </div>
            </form>
          </Form>
        )}

        {/* History */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>История отпусков</CardTitle>
                <CardDescription>
                  Ваши предыдущие заявки на отпуск
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockLeaveHistory.map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(leave.status)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {leaveTypes.find(lt => lt.id === leave.type)?.name || 'Неизвестный тип'}
                            </span>
                            {getStatusBadge(leave.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(leave.startDate), 'dd.MM.yyyy', { locale: ru })} - {format(new Date(leave.endDate), 'dd.MM.yyyy', { locale: ru })} ({leave.days} дней)
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {leave.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 