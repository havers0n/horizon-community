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
import { CalendarIcon, Handshake, Clock, AlertCircle, CheckCircle, XCircle, Plus, Search } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

const jointPositionSchema = z.object({
  type: z.string().min(1, 'Выберите тип совместной позиции'),
  primaryDepartment: z.string().min(1, 'Выберите основной департамент'),
  secondaryDepartment: z.string().min(1, 'Выберите дополнительный департамент'),
  position: z.string().min(1, 'Выберите позицию'),
  startDate: z.date({
    required_error: 'Выберите дату начала'
  }),
  endDate: z.date({
    required_error: 'Выберите дату окончания'
  }),
  reason: z.string().min(20, 'Укажите подробную причину'),
  responsibilities: z.string().min(10, 'Опишите обязанности'),
  timeAllocation: z.string().min(1, 'Укажите распределение времени'),
  additionalInfo: z.string().optional()
}).refine((data) => data.endDate > data.startDate, {
  message: 'Дата окончания должна быть позже даты начала',
  path: ['endDate']
}).refine((data) => data.primaryDepartment !== data.secondaryDepartment, {
  message: 'Основной и дополнительный департаменты должны отличаться',
  path: ['secondaryDepartment']
})

type JointPositionFormData = z.infer<typeof jointPositionSchema>

interface JointModalProps {
  children?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const jointPositionTypes = [
  { id: 'cross_dept', name: 'Междепартаментная позиция', description: 'Работа в двух департаментах' },
  { id: 'temporary', name: 'Временная позиция', description: 'Временное совмещение должностей' },
  { id: 'project', name: 'Проектная позиция', description: 'Работа над совместным проектом' },
  { id: 'training', name: 'Обучающая позиция', description: 'Обучение в другом департаменте' },
  { id: 'consulting', name: 'Консультационная позиция', description: 'Консультации для другого департамента' }
]

const departments = [
  { id: 'police', name: 'Полиция', icon: '👮', description: 'Правоохранительные органы' },
  { id: 'ems', name: 'Скорая помощь', icon: '🚑', description: 'Медицинская служба' },
  { id: 'fire', name: 'Пожарная служба', icon: '🚒', description: 'Пожарная охрана' },
  { id: 'admin', name: 'Администрация', icon: '🏛️', description: 'Административные функции' },
  { id: 'dispatch', name: 'Диспетчерская служба', icon: '📞', description: 'Координация и диспетчеризация' },
  { id: 'investigation', name: 'Следственный отдел', icon: '🔍', description: 'Расследование преступлений' }
]

const positions = [
  { id: 'coordinator', name: 'Координатор', description: 'Координация между департаментами' },
  { id: 'liaison', name: 'Связной', description: 'Связь между департаментами' },
  { id: 'consultant', name: 'Консультант', description: 'Консультационная поддержка' },
  { id: 'trainer', name: 'Тренер', description: 'Обучение персонала' },
  { id: 'specialist', name: 'Специалист', description: 'Специализированная работа' },
  { id: 'manager', name: 'Менеджер', description: 'Управление проектами' }
]

const timeAllocations = [
  { id: '50_50', name: '50% / 50%', description: 'Равное распределение времени' },
  { id: '70_30', name: '70% / 30%', description: 'Основное время в первичном департаменте' },
  { id: '80_20', name: '80% / 20%', description: 'Большая часть времени в первичном департаменте' },
  { id: '60_40', name: '60% / 40%', description: 'Больше времени в первичном департаменте' },
  { id: 'flexible', name: 'Гибкое расписание', description: 'Гибкое распределение времени' }
]

const mockJointPositions = [
  {
    id: '1',
    type: 'cross_dept',
    primaryDepartment: 'police',
    secondaryDepartment: 'investigation',
    position: 'coordinator',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    timeAllocation: '70_30',
    reason: 'Координация расследований между полицией и следственным отделом'
  },
  {
    id: '2',
    type: 'training',
    primaryDepartment: 'ems',
    secondaryDepartment: 'fire',
    position: 'trainer',
    startDate: '2024-03-01',
    endDate: '2024-06-30',
    status: 'pending',
    timeAllocation: '60_40',
    reason: 'Обучение пожарных основам первой медицинской помощи'
  }
]

export function JointModal({ children, isOpen, onOpenChange }: JointModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'request' | 'positions' | 'search'>('request')
  const [searchQuery, setSearchQuery] = useState('')
  const open = typeof isOpen === 'boolean' ? isOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const { toast } = useToast()
  const queryClient = useQueryClient()


  const form = useForm<JointPositionFormData>({
    resolver: zodResolver(jointPositionSchema),
    defaultValues: {
      type: '',
      primaryDepartment: 'police', // Текущий департамент пользователя
      secondaryDepartment: '',
      position: '',
      startDate: undefined,
      endDate: undefined,
      reason: '',
      responsibilities: '',
      timeAllocation: '',
      additionalInfo: ''
    }
  })

  const mutation = useMutation({
    mutationFn: async (data: JointPositionFormData) => {
      // Здесь будет API вызов для создания совместной позиции
      console.log('Создание совместной позиции:', data)
      return { success: true, id: 'joint_' + Date.now() }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/joint-positions'] })
      toast({
        title: 'Заявка отправлена!',
        description: `Ваша заявка на совместную позицию #${data.id} успешно отправлена.`
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

  const onSubmit = (data: JointPositionFormData) => {
    mutation.mutate(data)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Активна</Badge>
      case 'pending':
        return <Badge variant="secondary">На рассмотрении</Badge>
      case 'completed':
        return <Badge variant="outline">Завершена</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Отменена</Badge>
      default:
        return <Badge variant="outline">Неизвестно</Badge>
    }
  }

  const selectedPrimaryDepartment = form.watch('primaryDepartment')

  const filteredPositions = mockJointPositions.filter(position => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      position.reason.toLowerCase().includes(query) ||
      departments.find(d => d.id === position.primaryDepartment)?.name.toLowerCase().includes(query) ||
      departments.find(d => d.id === position.secondaryDepartment)?.name.toLowerCase().includes(query)
    )
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Handshake className="h-4 w-4 mr-2" />
            Совместные позиции
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5" />
            Управление совместными позициями
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
            variant={activeTab === 'positions' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('positions')}
            className="flex-1"
          >
            Мои позиции
          </Button>
          <Button
            variant={activeTab === 'search' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('search')}
            className="flex-1"
          >
            Поиск
          </Button>
        </div>

        {/* Request Form */}
        {activeTab === 'request' && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Новая совместная позиция</CardTitle>
                  <CardDescription>
                    Заполните форму для создания совместной позиции
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Тип совместной позиции *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите тип позиции" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {jointPositionTypes.map((type) => (
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
                      name="primaryDepartment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Основной департамент *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Основной департамент" />
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
                      name="secondaryDepartment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Дополнительный департамент *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Дополнительный департамент" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departments
                                .filter(dept => dept.id !== selectedPrimaryDepartment)
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

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Позиция *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите позицию" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {positions.map((pos) => (
                              <SelectItem key={pos.id} value={pos.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{pos.name}</span>
                                  <Badge variant="outline" className="ml-2">
                                    {pos.description}
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
                    name="timeAllocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Распределение времени *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите распределение времени" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeAllocations.map((allocation) => (
                              <SelectItem key={allocation.id} value={allocation.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{allocation.name}</span>
                                  <Badge variant="outline" className="ml-2">
                                    {allocation.description}
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

                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Причина создания позиции *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Подробно опишите причину создания совместной позиции..."
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
                    name="responsibilities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Обязанности *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Опишите обязанности в рамках совместной позиции..."
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

        {/* My Positions */}
        {activeTab === 'positions' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Мои совместные позиции</CardTitle>
                <CardDescription>
                  Ваши активные и завершенные совместные позиции
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockJointPositions.map((position) => (
                    <div key={position.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(position.status)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium">
                              {jointPositionTypes.find(jt => jt.id === position.type)?.name || 'Неизвестный тип'}
                            </span>
                            {getStatusBadge(position.status)}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>
                              {departments.find(d => d.id === position.primaryDepartment)?.name} ↔ {departments.find(d => d.id === position.secondaryDepartment)?.name}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(new Date(position.startDate), 'dd.MM.yyyy', { locale: ru })} - {format(new Date(position.endDate), 'dd.MM.yyyy', { locale: ru })}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {position.reason}
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

        {/* Search */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Поиск совместных позиций</CardTitle>
                <CardDescription>
                  Найдите доступные совместные позиции в организации
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Поиск по департаментам, причинам..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Создать
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {filteredPositions.map((position) => (
                      <div key={position.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(position.status)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium">
                                {jointPositionTypes.find(jt => jt.id === position.type)?.name || 'Неизвестный тип'}
                              </span>
                              {getStatusBadge(position.status)}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <span>
                                {departments.find(d => d.id === position.primaryDepartment)?.name} ↔ {departments.find(d => d.id === position.secondaryDepartment)?.name}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(new Date(position.startDate), 'dd.MM.yyyy', { locale: ru })} - {format(new Date(position.endDate), 'dd.MM.yyyy', { locale: ru })}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {position.reason}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Подать заявку
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 