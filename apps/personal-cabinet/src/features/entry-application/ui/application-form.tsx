import { useState, useMemo } from 'react'

import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import { Textarea } from '@shared/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from '@/shared/ui/use-toast'
import { apiClient } from '@/shared/api/api-client'
import { createApplication } from '@/shared/api/applications-service'

export function ApplicationForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    experience: '',
    motivation: ''
  })

  // Загружаем департаменты для выбора (человекочитаемые названия)
  const { data: departments, isLoading: isDepsLoading } = useQuery({
    queryKey: ['common', 'departments'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/common/departments')
      return (res as any).data ?? (res as any)
    },
    staleTime: 10 * 60 * 1000,
  })

  const isValid = useMemo(() => {
    const { firstName, lastName, email, department, motivation } = formData
    return (
      firstName.trim().length > 1 &&
      lastName.trim().length > 1 &&
      /.+@.+\..+/.test(email) &&
      department.trim().length > 0 &&
      motivation.trim().length > 5
    )
  }, [formData])

  const submitMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        type: 'entry',
        target_department_id: formData.department,
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          experience: formData.experience,
          motivation: formData.motivation,
        },
      }
      return await createApplication(payload)
    },
    onSuccess: () => {
      toast({ title: 'Заявка отправлена', description: 'Спасибо! Мы свяжемся с вами после рассмотрения.' })
      setFormData({ firstName: '', lastName: '', email: '', phone: '', department: '', experience: '', motivation: '' })
    },
    onError: (error: any) => {
      toast({ title: 'Ошибка отправки', description: error?.message || 'Не удалось отправить заявку. Попробуйте ещё раз.', variant: 'destructive' as any })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || submitMutation.isPending) return
    submitMutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Подача заявки на вступление</h2>
        <p className="text-sm text-muted-foreground">Заполните форму ниже. Поля, помеченные *, обязательны к заполнению.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Имя *</Label>
          <Input
            id="firstName"
            placeholder="Введите имя"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Фамилия *</Label>
          <Input
            id="lastName"
            placeholder="Введите фамилию"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail *</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Телефон</Label>
          <Input
            id="phone"
            placeholder="+7 (___) ___-__-__"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">Желаемый департамент *</Label>
        <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
          <SelectTrigger>
            <SelectValue placeholder={isDepsLoading ? 'Загрузка...' : 'Выберите департамент'} />
          </SelectTrigger>
          <SelectContent>
            {(departments ?? []).map((d: any) => (
              <SelectItem key={String(d.id ?? d.uuid)} value={String(d.id ?? d.uuid)}>
                {String(d.name ?? d.display_name ?? d.title ?? d.code ?? d.id)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Выберите департамент, в который хотите подать заявку.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="experience">Опыт</Label>
        <Textarea
          id="experience"
          placeholder="Опишите ваш релевантный опыт, достижения, навыки"
          value={formData.experience}
          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="motivation">Мотивация *</Label>
        <Textarea
          id="motivation"
          placeholder="Почему вы хотите присоединиться к нам?"
          value={formData.motivation}
          onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
          rows={5}
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button type="submit" disabled={!isValid || submitMutation.isPending} className="w-full md:w-auto">
          {submitMutation.isPending ? 'Отправка...' : 'Отправить заявку'}
        </Button>
      </div>
    </form>
  )
}

export default ApplicationForm 