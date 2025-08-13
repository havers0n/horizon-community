import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { listTests, createTest, deleteTest, type AdminTest, type CreateTestDto } from '../api'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { useNavigate } from 'react-router-dom'

const testSchema = z.object({
  title: z.string().min(1, 'Обязательное поле'),
  description: z.string().optional(),
  duration_minutes: z.coerce.number().int().positive('> 0'),
  passing_score_percent: z.coerce.number().int().min(0).max(100),
  max_focus_losses: z.coerce.number().int().min(0),
})

type TestFormValues = z.infer<typeof testSchema>

function TestForm({ onSubmit, defaultValues, onCancel }: { onSubmit: (v: CreateTestDto) => Promise<any>, defaultValues?: Partial<TestFormValues>, onCancel?: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: defaultValues as any,
  })

  return (
    <form onSubmit={handleSubmit(async (v) => { await onSubmit(v) })} className="space-y-3">
      <Input placeholder="Название" {...register('title')} />
      {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
      <Textarea placeholder="Описание" {...register('description')} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input type="number" placeholder="Длительность (мин)" {...register('duration_minutes')} />
        <Input type="number" placeholder="Проходной %" {...register('passing_score_percent')} />
        <Input type="number" placeholder="Макс. потерь фокуса" {...register('max_focus_losses')} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>Сохранить</Button>
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Отмена</Button>}
      </div>
    </form>
  )
}

export function TestManager() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)

  const { data: tests, isLoading } = useQuery({
    queryKey: ['admin-tests'],
    queryFn: listTests,
    staleTime: 60_000,
  })

  const createMutation = useMutation({
    mutationFn: (dto: CreateTestDto) => createTest(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tests'] })
      setIsCreating(false)
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteTest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tests'] })
    },
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Управление тестами</CardTitle>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreating((v) => !v)}>{isCreating ? 'Скрыть' : 'Создать тест'}</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isCreating && (
          <TestForm
            onSubmit={async (v) => createMutation.mutateAsync(v)}
            onCancel={() => setIsCreating(false)}
          />
        )}

        {isLoading ? (
          <div>Загрузка...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Длительность</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tests?.map((t: AdminTest) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.title}</TableCell>
                  <TableCell className="truncate max-w-[480px]">{t.description}</TableCell>
                  <TableCell>{t.duration_minutes} мин</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(`/admin/tests/${t.id}`)}>Редактировать</Button>
                    <Button variant="destructive" onClick={() => removeMutation.mutate(t.id)}>Удалить</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export default TestManager 