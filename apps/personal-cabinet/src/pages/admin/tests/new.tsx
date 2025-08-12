import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTest } from '@/features/admin/tests/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'

const testSchema = z.object({
  title: z.string().min(1, 'Обязательное поле'),
  description: z.string().optional(),
  duration_minutes: z.coerce.number().int().positive('> 0'),
  passing_score_percent: z.coerce.number().int().min(0).max(100),
  max_focus_losses: z.coerce.number().int().min(0),
})

type TestFormValues = z.infer<typeof testSchema>

export default function AdminTestNewPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
  })

  const createMutation = useMutation({
    mutationFn: createTest,
    onSuccess: (created) => {
      navigate(`/admin/tests/${created.id}`)
    },
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Создание теста</h1>
          <p className="text-muted-foreground">Заполните свойства теста и сохраните</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/tests')}>Назад к списку</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Свойства теста</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(async (v) => createMutation.mutateAsync(v))} className="space-y-3">
            <Input placeholder="Название" {...register('title')} />
            {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
            <Textarea placeholder="Описание" {...register('description')} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input type="number" placeholder="Длительность (мин)" {...register('duration_minutes')} />
              <Input type="number" placeholder="Проходной %" {...register('passing_score_percent')} />
              <Input type="number" placeholder="Макс. потерь фокуса" {...register('max_focus_losses')} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>Создать тест</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
