import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/shared/lib/use-toast'
import { UserPlus, Building2, GraduationCap } from 'lucide-react'
import type { Database } from '@roleplay-identity/db-types'
import { apiClient } from '@/shared/api/api-client'
import { useSession } from '@/shared/contexts/SessionContext'

const entryApplicationSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
    lastName: z.string().min(2, 'Фамилия должна содержать минимум 2 символа'),
    email: z.string().email('Некорректный email'),
    phone: z.string().min(10, 'Некорректный номер телефона'),
    discord: z.string().optional(),
    age: z.number().min(18, 'Возраст должен быть не менее 18 лет'),
    city: z.string().min(2, 'Укажите город')
  }),
  departmentInfo: z.object({
    department: z.string().min(1, 'Выберите департамент'),
    position: z.string().min(1, 'Выберите позицию'),
    experience: z.string().min(10, 'Опишите ваш опыт работы'),
    motivation: z.string().min(20, 'Опишите вашу мотивацию'),
    availability: z.string().min(1, 'Укажите доступность'),
    timezone: z.string().min(1, 'Укажите часовой пояс')
  }),
  additionalInfo: z.object({
    previousExperience: z.string().optional(),
    skills: z.string().optional(),
    references: z.string().optional(),
    additionalNotes: z.string().optional()
  })
})

type EntryApplicationFormData = z.infer<typeof entryApplicationSchema>

interface EntryApplicationModalProps {
  children?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

type Department = Database['common']['Tables']['departments']['Row']

const positions = {
  police: [
    { id: 'officer', name: 'Офицер полиции' },
    { id: 'detective', name: 'Детектив' },
    { id: 'supervisor', name: 'Супервайзер' },
    { id: 'specialist', name: 'Специалист' }
  ],
  ems: [
    { id: 'paramedic', name: 'Парамедик' },
    { id: 'doctor', name: 'Врач' },
    { id: 'nurse', name: 'Медсестра' },
    { id: 'dispatcher', name: 'Диспетчер' }
  ],
  fire: [
    { id: 'firefighter', name: 'Пожарный' },
    { id: 'lieutenant', name: 'Лейтенант' },
    { id: 'captain', name: 'Капитан' },
    { id: 'chief', name: 'Начальник' }
  ],
  admin: [
    { id: 'manager', name: 'Менеджер' },
    { id: 'coordinator', name: 'Координатор' },
    { id: 'assistant', name: 'Ассистент' },
    { id: 'director', name: 'Директор' }
  ]
}

export function EntryApplicationModal({ children, isOpen, onOpenChange }: EntryApplicationModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const open = typeof isOpen === 'boolean' ? isOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { refetch: refetchSession } = useSession()

  // Загрузка департаментов из публичного API
  const { data: departments } = useQuery<{ success: boolean; data: Department[]; count?: number } | null>({
    queryKey: ['public', 'departments'],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: Department[]; count?: number }>('/public/departments')
      return res
    },
    staleTime: 5 * 60 * 1000,
  })


  const form = useForm<EntryApplicationFormData>({
    resolver: zodResolver(entryApplicationSchema),
    defaultValues: {
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        discord: '',
        age: 18,
        city: ''
      },
      departmentInfo: {
        department: '',
        position: '',
        experience: '',
        motivation: '',
        availability: '',
        timezone: ''
      },
      additionalInfo: {
        previousExperience: '',
        skills: '',
        references: '',
        additionalNotes: ''
      }
    }
  })

  const mutation = useMutation({
    mutationFn: async (data: EntryApplicationFormData) => {
      const payload = {
        type: 'entry',
        data: {
          personalInfo: data.personalInfo,
          departmentInfo: data.departmentInfo,
          additionalInfo: data.additionalInfo,
        },
      }
      const created = await apiClient.post<any>('/applications', payload)
      return created
    },
    onSuccess: async () => {
      toast({
        title: 'Заявка отправлена!',
        description: 'Ваша заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.'
      })
      await refetchSession()
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'data'] })
      setOpen(false)
      form.reset()
      setCurrentStep(1)
    },
    onError: (err: any) => {
      toast({
        title: 'Ошибка',
        description: err?.message || 'Не удалось отправить заявку. Попробуйте еще раз.',
        variant: 'destructive'
      })
    }
  })

  const onSubmit = (data: EntryApplicationFormData) => {
    mutation.mutate(data)
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const selectedDepartment = form.watch('departmentInfo.department')
  const availablePositions = selectedDepartment ? positions[selectedDepartment as keyof typeof positions] || [] : []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Подать заявку на вступление
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Заявка на вступление в организацию
          </DialogTitle>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  step < currentStep ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Личная информация
                  </CardTitle>
                  <CardDescription>
                    Заполните ваши личные данные для обработки заявки
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="personalInfo.firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Имя *</FormLabel>
                          <FormControl>
                            <Input placeholder="Введите имя" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="personalInfo.lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Фамилия *</FormLabel>
                          <FormControl>
                            <Input placeholder="Введите фамилию" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="personalInfo.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="example@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="personalInfo.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Телефон *</FormLabel>
                          <FormControl>
                            <Input placeholder="+7 (999) 123-45-67" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="personalInfo.discord"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discord (необязательно)</FormLabel>
                          <FormControl>
                            <Input placeholder="username#1234" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="personalInfo.age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Возраст *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="18" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 18)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="personalInfo.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Город *</FormLabel>
                        <FormControl>
                          <Input placeholder="Москва" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 2: Department Information */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Информация о департаменте
                  </CardTitle>
                  <CardDescription>
                    Выберите департамент и позицию, на которую хотите подать заявку
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="departmentInfo.department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Департамент *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите департамент" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                        {departments?.data?.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                <div className="flex items-center gap-2">
                                  <span>{/* no icon in schema */}</span>
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

                  {selectedDepartment && (
                    <FormField
                      control={form.control}
                      name="departmentInfo.position"
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
                              {availablePositions.map((pos) => (
                                <SelectItem key={pos.id} value={pos.id}>
                                  {pos.name}
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
                    name="departmentInfo.experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Опыт работы *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Опишите ваш опыт работы в данной сфере..."
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
                    name="departmentInfo.motivation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Мотивация *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Почему вы хотите присоединиться к нашей организации?"
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="departmentInfo.availability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Доступность *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите доступность" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="full-time">Полный день</SelectItem>
                              <SelectItem value="part-time">Частичная занятость</SelectItem>
                              <SelectItem value="weekends">Только выходные</SelectItem>
                              <SelectItem value="flexible">Гибкий график</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="departmentInfo.timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Часовой пояс *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите часовой пояс" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="UTC+3">UTC+3 (Москва)</SelectItem>
                              <SelectItem value="UTC+4">UTC+4 (Самара)</SelectItem>
                              <SelectItem value="UTC+5">UTC+5 (Екатеринбург)</SelectItem>
                              <SelectItem value="UTC+7">UTC+7 (Новосибирск)</SelectItem>
                              <SelectItem value="UTC+8">UTC+8 (Иркутск)</SelectItem>
                              <SelectItem value="UTC+9">UTC+9 (Якутск)</SelectItem>
                              <SelectItem value="UTC+10">UTC+10 (Владивосток)</SelectItem>
                              <SelectItem value="UTC+11">UTC+11 (Магадан)</SelectItem>
                              <SelectItem value="UTC+12">UTC+12 (Камчатка)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Additional Information */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Дополнительная информация
                  </CardTitle>
                  <CardDescription>
                    Предоставьте дополнительную информацию о себе (необязательно)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="additionalInfo.previousExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Предыдущий опыт</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Опишите ваш предыдущий опыт работы в подобных организациях..."
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
                    name="additionalInfo.skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Навыки и умения</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Перечислите ваши навыки, которые могут быть полезны в работе..."
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
                    name="additionalInfo.references"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Рекомендации</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Укажите контакты людей, которые могут дать вам рекомендацию..."
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
                    name="additionalInfo.additionalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Дополнительные заметки</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Любая дополнительная информация, которую вы хотите сообщить..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Назад
              </Button>
              
              <div className="flex gap-2">
                {currentStep < 3 ? (
                  <Button type="button" onClick={nextStep}>
                    Далее
                  </Button>
                ) : (
                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Отправка...' : 'Отправить заявку'}
                  </Button>
                )}
                
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 