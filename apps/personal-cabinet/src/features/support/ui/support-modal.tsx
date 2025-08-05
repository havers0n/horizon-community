import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/shared/lib/use-toast'
import { HelpCircle, MessageCircle, Phone, Mail } from 'lucide-react'

const supportSchema = z.object({
  category: z.string().min(1, 'Категория обязательна'),
  subject: z.string().min(5, 'Тема должна содержать минимум 5 символов'),
  description: z.string().min(20, 'Описание должно содержать минимум 20 символов'),
  priority: z.enum(['low', 'medium', 'high']),
  contactMethod: z.enum(['email', 'discord', 'phone']),
  contactInfo: z.string().min(1, 'Контактная информация обязательна')
})

type SupportFormData = z.infer<typeof supportSchema>

interface SupportModalProps {
  children?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SupportModal({ children, isOpen, onOpenChange }: SupportModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = typeof isOpen === 'boolean' ? isOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<SupportFormData>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      category: '',
      subject: '',
      description: '',
      priority: 'medium',
      contactMethod: 'email',
      contactInfo: ''
    }
  })

  const mutation = useMutation({
    mutationFn: async (data: SupportFormData) => {
      // Здесь будет API вызов для создания обращения в поддержку
      console.log('Создание обращения в поддержку:', data)
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support'] })
      toast({
        title: 'Обращение отправлено',
        description: 'Мы свяжемся с вами в ближайшее время'
      })
      setOpen(false)
      form.reset()
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить обращение',
        variant: 'destructive'
      })
    }
  })

  const onSubmit = (data: SupportFormData) => {
    mutation.mutate(data)
  }

  const getContactMethodIcon = (method: string) => {
    switch (method) {
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'discord':
        return <MessageCircle className="h-4 w-4" />
      case 'phone':
        return <Phone className="h-4 w-4" />
      default:
        return <Mail className="h-4 w-4" />
    }
  }

  const getContactMethodLabel = (method: string) => {
    switch (method) {
      case 'email':
        return 'Email адрес'
      case 'discord':
        return 'Discord username'
      case 'phone':
        return 'Номер телефона'
      default:
        return 'Email адрес'
    }
  }

  const getContactMethodPlaceholder = (method: string) => {
    switch (method) {
      case 'email':
        return 'example@email.com'
      case 'discord':
        return 'username#1234'
      case 'phone':
        return '+7 (999) 123-45-67'
      default:
        return 'example@email.com'
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="icon">
            <HelpCircle className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-500" />
            Обращение в поддержку
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Категория проблемы</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="technical">Техническая проблема</SelectItem>
                      <SelectItem value="account">Проблемы с аккаунтом</SelectItem>
                      <SelectItem value="gameplay">Игровой процесс</SelectItem>
                      <SelectItem value="billing">Оплата и биллинг</SelectItem>
                      <SelectItem value="bug">Сообщить об ошибке</SelectItem>
                      <SelectItem value="suggestion">Предложение</SelectItem>
                      <SelectItem value="other">Другое</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тема обращения</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Краткое описание проблемы..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Приоритет</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Низкий</SelectItem>
                      <SelectItem value="medium">Средний</SelectItem>
                      <SelectItem value="high">Высокий</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Подробное описание</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Опишите подробно вашу проблему или вопрос..." 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="contactMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Способ связи</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="discord">Discord</SelectItem>
                        <SelectItem value="phone">Телефон</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      {getContactMethodIcon(form.watch('contactMethod'))}
                      {getContactMethodLabel(form.watch('contactMethod'))}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={getContactMethodPlaceholder(form.watch('contactMethod'))}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <HelpCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Информация о поддержке:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Время ответа: 24-48 часов</li>
                    <li>• Для срочных вопросов используйте Discord сервер</li>
                    <li>• Укажите максимально подробную информацию</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Отправка...' : 'Отправить обращение'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 