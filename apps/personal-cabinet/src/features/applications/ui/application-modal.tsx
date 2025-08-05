import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/shared/lib/use-toast'
import { Plus } from 'lucide-react'

const applicationSchema = z.object({
  type: z.string().min(1, 'Тип заявки обязателен'),
  data: z.object({
    details: z.string().min(10, 'Пожалуйста, предоставьте подробную информацию')
  })
})

type ApplicationFormData = z.infer<typeof applicationSchema>

interface ApplicationModalProps {
  children?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ApplicationModal({ children, isOpen, onOpenChange }: ApplicationModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = typeof isOpen === 'boolean' ? isOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const { toast } = useToast()
  const queryClient = useQueryClient()


  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      type: '',
      data: {
        details: ''
      }
    }
  })

  const mutation = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      // Здесь будет API вызов для создания заявки
      console.log('Создание заявки:', data)
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] })
      toast({
        title: 'Успешно',
        description: 'Заявка отправлена успешно'
      })
      setOpen(false)
      form.reset()
    },
    onError: () => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить заявку',
        variant: 'destructive'
      })
    }
  })

  const onSubmit = (data: ApplicationFormData) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
            <div className="flex items-center space-x-3">
              <Plus className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Новая заявка</span>
            </div>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новая заявка</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип заявки</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип заявки..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="promotion">Запрос на повышение</SelectItem>
                      <SelectItem value="transfer_dept">Перевод в департамент</SelectItem>
                      <SelectItem value="transfer_div">Перевод в подразделение</SelectItem>
                      <SelectItem value="leave">Запрос на отпуск</SelectItem>
                      <SelectItem value="qualification">Запрос на квалификацию</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="data.details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Детали</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Пожалуйста, предоставьте подробную информацию о вашей заявке..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
      </DialogContent>
    </Dialog>
  )
} 