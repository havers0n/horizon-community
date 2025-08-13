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
import { UserPlus } from 'lucide-react'
import type { Database } from '@roleplay-identity/db-types'
import { apiClient } from '@/shared/api/api-client'
import type { ApiResponse } from '@/shared/api/api-client'
import { useSession } from '@/shared/contexts/SessionContext'

const entryCadetApplicationSchema = z.object({
  fullName: z.string().min(5, 'Укажите полные ФИО'),
  birthDate: z.string().min(1, 'Укажите дату рождения'),
  departmentId: z.string().uuid('Выберите департамент'),
  departmentUnderstanding: z.string().min(10, 'Опишите, чем занимается департамент'),
  motivation: z.string().min(10, 'Опишите вашу мотивацию'),
  hasMicrophone: z.enum(['yes', 'no']),
  pcMeetsRequirements: z.enum(['yes', 'no']),
  pcRequirementsLink: z.string().url('Укажите корректную ссылку'),
  source: z.string().min(2, 'Укажите источник'),
  inOtherCommunitiesNow: z.enum(['yes', 'no']),
  beenInOtherFivemCommunities: z.enum(['yes', 'no']),
})

type EntryCadetApplicationFormData = z.infer<typeof entryCadetApplicationSchema>

interface EntryApplicationModalProps {
  children?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

type Department = Database['public']['Functions']['get_all_departments']['Returns'][number]

// positions removed: cadet entry form не выбирает позицию

export function EntryApplicationModal({ children, isOpen, onOpenChange }: EntryApplicationModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = typeof isOpen === 'boolean' ? isOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { refetch: refetchSession } = useSession()

  // Загрузка департаментов из публичного API через стандартизованный сервисный клиент
  const { data: departments } = useQuery<Department[]>({
    queryKey: ['public', 'departments'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Department[]>>('/public/departments')
      if (!response.success) {
        throw new Error(response.message || 'Не удалось загрузить департаменты')
      }
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })
  const form = useForm<EntryCadetApplicationFormData>({
    resolver: zodResolver(entryCadetApplicationSchema),
    defaultValues: {
      fullName: '',
      birthDate: '',
      departmentId: '' as any,
      departmentUnderstanding: '',
      motivation: '',
      pcRequirementsLink: '',
      source: '',
    } as any,
  })

  const mutation = useMutation({
    mutationFn: async (data: EntryCadetApplicationFormData) => {
      const toBool = (v: 'yes' | 'no') => v === 'yes'
      const payload = {
        type: 'entry',
        target_department_id: data.departmentId,
        data: {
          full_name: data.fullName,
          birth_date: data.birthDate,
          department_understanding: data.departmentUnderstanding,
          motivation: data.motivation,
          has_microphone: toBool(data.hasMicrophone),
          pc_meets_requirements: toBool(data.pcMeetsRequirements),
          pc_requirements_link: data.pcRequirementsLink,
          source: data.source,
          in_other_communities_now: toBool(data.inOtherCommunitiesNow),
          been_in_other_fivem_communities: toBool(data.beenInOtherFivemCommunities),
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
    },
    onError: (err: any) => {
      toast({
        title: 'Ошибка',
        description: err?.message || 'Не удалось отправить заявку. Попробуйте еще раз.',
        variant: 'destructive'
      })
    }
  })

  const onSubmit = (data: EntryCadetApplicationFormData) => {
    mutation.mutate(data)
  }
  // watching to keep controlled select synced (value used implicitly by react-hook-form)
  form.watch('departmentId')

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
            Заявка на вступление как кадет
          </DialogTitle>
        </DialogHeader>
        

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Личная информация и вопросы
                </CardTitle>
                <CardDescription>
                  Заполните все поля. Ответы будут использованы для рассмотрения вашей заявки как кадета.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ваше ФИО *</FormLabel>
                        <FormControl>
                          <Input placeholder="Иванов Иван Иванович" {...field} />
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

                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>В какой департамент вы хотите вступить? *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите департамент" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments?.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.full_name || dept.name}
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
                  name="departmentUnderstanding"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Чем занимается данный департамент по вашему мнению? *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Опишите, какие задачи выполняет департамент..." className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="motivation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Почему вы хотите вступить именно в этот департамент? *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Опишите вашу мотивацию..." className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="hasMicrophone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Присутствует ли у вас исправный микрофон? *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите ответ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="yes">Да</SelectItem>
                            <SelectItem value="no">Нет</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pcMeetsRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Соответствует ли ваш ПК системным требованиям FiveM? *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите ответ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="yes">Да</SelectItem>
                            <SelectItem value="no">Нет</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="pcRequirementsLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ссылка на системные характеристики вашего ПК *</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://example.com/your-pc-specs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Откуда вы узнали про нас? *</FormLabel>
                      <FormControl>
                        <Input placeholder="Discord, VK, друзья, YouTube и т.д." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="inOtherCommunitiesNow"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Состоите ли вы в других сообществах на данный момент? *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите ответ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="yes">Да</SelectItem>
                            <SelectItem value="no">Нет</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="beenInOtherFivemCommunities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Состояли ли вы в других FiveM-сообществах ранее? *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите ответ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="yes">Да</SelectItem>
                            <SelectItem value="no">Нет</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Отправка...' : 'Отправить заявку'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Отмена
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 