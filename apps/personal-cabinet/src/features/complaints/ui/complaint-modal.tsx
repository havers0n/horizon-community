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
import { AlertTriangle } from 'lucide-react'

const complaintSchema = z.object({
  type: z.string().min(1, 'Тип жалобы обязателен'),
  subject: z.string().min(5, 'Тема должна содержать минимум 5 символов'),
  description: z.string().min(20, 'Описание должно содержать минимум 20 символов'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  department: z.string().min(1, 'Департамент обязателен'),
  evidence: z.string().optional()
})

type ComplaintFormData = z.infer<typeof complaintSchema>

interface ComplaintModalProps {
  children?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ComplaintModal({ children, isOpen, onOpenChange }: ComplaintModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = typeof isOpen === 'boolean' ? isOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      type: '',
      subject: '',
      description: '',
      priority: 'medium',
      department: '',
      evidence: ''
    }
  })

  const mutation = useMutation({
    mutationFn: async (data: ComplaintFormData) => {
      // Здесь будет API вызов для создания жалобы
      console.log('Создание жалобы:', data)
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/complaints'] })
      toast({
        title: 'Жалоба отправлена',
        description: 'Ваша жалоба принята и будет рассмотрена в ближайшее время'
      })
      setOpen(false)
      form.reset()
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить жалобу',
        variant: 'destructive'
      })
    }
  })

  const onSubmit = (data: ComplaintFormData) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="icon">
            <AlertTriangle className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Подать жалобу
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип жалобы</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип жалобы..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="harassment">Домогательство</SelectItem>
                      <SelectItem value="discrimination">Дискриминация</SelectItem>
                      <SelectItem value="abuse">Злоупотребление властью</SelectItem>
                      <SelectItem value="corruption">Коррупция</SelectItem>
                      <SelectItem value="safety">Нарушение техники безопасности</SelectItem>
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
                  <FormLabel>Тема жалобы</FormLabel>
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
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Департамент</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите департамент..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="lspd">LSPD</SelectItem>
                      <SelectItem value="bcso">BCSO</SelectItem>
                      <SelectItem value="lsfd">LSFD</SelectItem>
                      <SelectItem value="sams">SAMS</SelectItem>
                      <SelectItem value="safr">SAFR</SelectItem>
                      <SelectItem value="admin">Администрация</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="urgent">Срочный</SelectItem>
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
                      placeholder="Опишите подробно ситуацию, которая привела к необходимости подачи жалобы..." 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="evidence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Дополнительная информация</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ссылки на скриншоты, видео, имена свидетелей и другая информация..." 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <p className="font-medium mb-1">Важная информация:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Жалобы рассматриваются конфиденциально</li>
                    <li>• Предоставьте максимально подробную информацию</li>
                    <li>• Ложные жалобы могут привести к дисциплинарным взысканиям</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Отправка...' : 'Отправить жалобу'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 