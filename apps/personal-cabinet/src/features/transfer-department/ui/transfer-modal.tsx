import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'

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
import { CalendarIcon, Building2, ArrowRight, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

const transferRequestSchema = z.object({
  transferType: z.string().min(1, 'Выберите тип перевода'),
  currentDepartment: z.string().min(1, 'Укажите текущий департамент'),
  targetDepartment: z.string().min(1, 'Выберите целевой департамент'),
  targetPosition: z.string().min(1, 'Выберите целевую позицию'),
  effectiveDate: z.date({
    required_error: 'Выберите дату вступления в должность'
  }),
  reason: z.string().min(20, 'Укажите подробную причину перевода'),
  qualifications: z.string().min(10, 'Опишите ваши квалификации'),
  experience: z.string().min(10, 'Опишите ваш опыт работы'),
  additionalInfo: z.string().optional()
}).refine((data) => data.targetDepartment !== data.currentDepartment, {
  message: 'Целевой департамент должен отличаться от текущего',
  path: ['targetDepartment']
})

type TransferRequestFormData = z.infer<typeof transferRequestSchema>

interface TransferModalProps {
  children?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const transferTypes = [
  { id: 'department', name: 'Перевод в другой департамент', description: 'Смена департамента' },
  { id: 'division', name: 'Перевод в подразделение', description: 'Смена подразделения в рамках департамента' },
  { id: 'position', name: 'Повышение в должности', description: 'Повышение в рамках департамента' },
  { id: 'lateral', name: 'Горизонтальный перевод', description: 'Перевод на равнозначную должность' }
]

const departments = [
  { id: 'police', name: 'Полиция', icon: '👮', description: 'Правоохранительные органы' },
  { id: 'ems', name: 'Скорая помощь', icon: '🚑', description: 'Медицинская служба' },
  { id: 'fire', name: 'Пожарная служба', icon: '🚒', description: 'Пожарная охрана' },
  { id: 'admin', name: 'Администрация', icon: '🏛️', description: 'Административные функции' },
  { id: 'dispatch', name: 'Диспетчерская служба', icon: '📞', description: 'Координация и диспетчеризация' },
  { id: 'investigation', name: 'Следственный отдел', icon: '🔍', description: 'Расследование преступлений' }
]

const positions = {
  police: [
    { id: 'officer', name: 'Офицер полиции', level: 1 },
    { id: 'detective', name: 'Детектив', level: 2 },
    { id: 'sergeant', name: 'Сержант', level: 2 },
    { id: 'lieutenant', name: 'Лейтенант', level: 3 },
    { id: 'captain', name: 'Капитан', level: 3 },
    { id: 'commander', name: 'Командир', level: 4 }
  ],
  ems: [
    { id: 'paramedic', name: 'Парамедик', level: 1 },
    { id: 'nurse', name: 'Медсестра', level: 1 },
    { id: 'doctor', name: 'Врач', level: 2 },
    { id: 'surgeon', name: 'Хирург', level: 3 },
    { id: 'chief_doctor', name: 'Главный врач', level: 4 }
  ],
  fire: [
    { id: 'firefighter', name: 'Пожарный', level: 1 },
    { id: 'lieutenant', name: 'Лейтенант', level: 2 },
    { id: 'captain', name: 'Капитан', level: 3 },
    { id: 'chief', name: 'Начальник', level: 4 }
  ],
  admin: [
    { id: 'assistant', name: 'Ассистент', level: 1 },
    { id: 'coordinator', name: 'Координатор', level: 2 },
    { id: 'manager', name: 'Менеджер', level: 3 },
    { id: 'director', name: 'Директор', level: 4 }
  ],
  dispatch: [
    { id: 'dispatcher', name: 'Диспетчер', level: 1 },
    { id: 'senior_dispatcher', name: 'Старший диспетчер', level: 2 },
    { id: 'supervisor', name: 'Супервайзер', level: 3 }
  ],
  investigation: [
    { id: 'investigator', name: 'Следователь', level: 1 },
    { id: 'senior_investigator', name: 'Старший следователь', level: 2 },
    { id: 'lead_investigator', name: 'Ведущий следователь', level: 3 }
  ]
}

const mockTransferHistory = [
  {
    id: '1',
    type: 'department',
    fromDepartment: 'police',
    toDepartment: 'investigation',
    fromPosition: 'officer',
    toPosition: 'investigator',
    status: 'approved',
    effectiveDate: '2024-02-01',
    reason: 'Желание развиваться в области расследований'
  },
  {
    id: '2',
    type: 'position',
    fromDepartment: 'ems',
    toDepartment: 'ems',
    fromPosition: 'paramedic',
    toPosition: 'doctor',
    status: 'pending',
    effectiveDate: '2024-04-01',
    reason: 'Повышение квалификации и получение медицинского образования'
  }
]

export function TransferModal({ children, isOpen, onOpenChange }: TransferModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'request' | 'history'>('request')
  const open = typeof isOpen === 'boolean' ? isOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const { toast } = useToast()
  const queryClient = useQueryClient()


  const form = useForm<TransferRequestFormData>({
    resolver: zodResolver(transferRequestSchema),
    defaultValues: {
      transferType: '',
      currentDepartment: 'police', // Текущий департамент пользователя
      targetDepartment: '',
      targetPosition: '',
      effectiveDate: undefined,
      reason: '',
      qualifications: '',
      experience: '',
      additionalInfo: ''
    }
  })

  const mutation = useMutation({
    mutationFn: async (data: TransferRequestFormData) => {
      // Здесь будет API вызов для создания заявки на перевод
      console.log('Создание заявки на перевод:', data)
      return { success: true, id: 'transfer_' + Date.now() }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/transfer-requests'] })
      toast({
        title: 'Заявка отправлена!',
        description: `Ваша заявка на перевод #${data.id} успешно отправлена.`
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

  const onSubmit = (data: TransferRequestFormData) => {
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


  const selectedTargetDepartment = form.watch('targetDepartment')
  const availablePositions = selectedTargetDepartment ? positions[selectedTargetDepartment as keyof typeof positions] || [] : []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Building2 className="h-4 w-4 mr-2" />
            Заявка на перевод
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Перевод между департаментами
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
            История переводов
          </Button>
        </div>

        {/* Request Form */}
        {activeTab === 'request' && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Новая заявка на перевод</CardTitle>
                  <CardDescription>
                    Заполните форму для подачи заявки на перевод
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="transferType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Тип перевода *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите тип перевода" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {transferTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{type.name}</span>
                                  <Badge variant="outline" className="ml-2">
                                    {type.description}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="currentDepartment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Текущий департамент *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Текущий департамент" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                  <div className="flex items-center gap-2">
                                    <span>{dept.icon}</span>
                                    <span>{dept.name}</span>
                                  </div>
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
                      name="targetDepartment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Целевой департамент *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите целевой департамент" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departments
                                .filter(dept => dept.id !== form.getValues('currentDepartment'))
                                .map((dept) => (
                                  <SelectItem key={dept.id} value={dept.id}>
                                    <div className="flex items-center gap-2">
                                      <span>{dept.icon}</span>
                                      <span>{dept.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {selectedTargetDepartment && (
                    <FormField
                      control={form.control}
                      name="targetPosition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Целевая позиция *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите целевую позицию" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availablePositions.map((pos) => (
                                <SelectItem key={pos.id} value={pos.id}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{pos.name}</span>
                                    <Badge variant="outline" className="ml-2">
                                      Уровень {pos.level}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="effectiveDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Дата вступления в должность *</FormLabel>
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
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Причина перевода *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Подробно опишите причину перевода..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="qualifications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Квалификации *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Опишите ваши квалификации для новой должности..."
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
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Опыт работы *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Опишите ваш опыт работы, релевантный для новой должности..."
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
                <CardTitle>История переводов</CardTitle>
                <CardDescription>
                  Ваши предыдущие заявки на перевод
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTransferHistory.map((transfer) => (
                    <div key={transfer.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(transfer.status)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium">
                              {transferTypes.find(tt => tt.id === transfer.type)?.name || 'Неизвестный тип'}
                            </span>
                            {getStatusBadge(transfer.status)}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>
                              {departments.find(d => d.id === transfer.fromDepartment)?.name} - {departments.find(d => d.id === transfer.toDepartment)?.name}
                            </span>
                            <ArrowRight className="h-4 w-4" />
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(new Date(transfer.effectiveDate), 'dd.MM.yyyy', { locale: ru })}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {transfer.reason}
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