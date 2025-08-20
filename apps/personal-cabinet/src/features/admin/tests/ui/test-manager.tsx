import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { listTests, createTest, deleteTest, type AdminTest, type CreateTestDto, listDepartments, listRanks, listQualifications, type Purpose } from '../api'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { useNavigate } from 'react-router-dom'

const baseSchema = z.object({
  title: z.string().min(1, 'Обязательное поле'),
  description: z.string().optional(),
  duration_minutes: z.coerce.number().int().positive('> 0'),
  passing_score_percent: z.coerce.number().int().min(0).max(100),
  max_focus_losses: z.coerce.number().int().min(0),
})

const createSchema = baseSchema.extend({
  purpose: z.enum(['ENTRY', 'PROMOTION', 'QUALIFICATION']),
  target: z.union([
    z.object({ department_id: z.string().uuid() }),
    z.object({ rank_id: z.string().uuid() }),
    z.object({ qualification_id: z.string().uuid() }),
  ]),
})

type CreateFormValues = z.infer<typeof createSchema>

type TestFormProps = { onSubmit: (v: CreateTestDto) => Promise<any>, onCancel?: () => void }
function TestForm({ onSubmit, onCancel }: TestFormProps) {
  const [purpose, setPurpose] = useState<Purpose>('ENTRY')
  const [departmentId, setDepartmentId] = useState<string>('')
  const [rankId, setRankId] = useState<string>('')
  const [qualificationId, setQualificationId] = useState<string>('')

  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: listDepartments, staleTime: 300_000 })
  const { data: ranks } = useQuery({ queryKey: ['ranks', departmentId], queryFn: () => listRanks(departmentId || undefined), enabled: !!(purpose === 'PROMOTION' && departmentId), staleTime: 300_000 })
  const { data: qualifications } = useQuery({ queryKey: ['qualifications', departmentId], queryFn: () => listQualifications(departmentId || undefined), enabled: !!(purpose === 'QUALIFICATION'), staleTime: 300_000 })

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      passing_score_percent: 80,
      max_focus_losses: 1,
      duration_minutes: 20,
      purpose: 'ENTRY',
      target: { department_id: '' as any },
    } as any,
  })

  const buildTarget = () => {
    if (purpose === 'ENTRY') return { department_id: departmentId }
    if (purpose === 'PROMOTION') return { rank_id: rankId }
    return { qualification_id: qualificationId }
  }

  return (
    <form
      onSubmit={handleSubmit(async (v) => {
        const payload: CreateTestDto = {
          title: v.title,
          description: v.description,
          duration_minutes: v.duration_minutes,
          passing_score_percent: v.passing_score_percent,
          max_focus_losses: v.max_focus_losses,
          purpose,
          target: buildTarget(),
        }
        await onSubmit(payload)
      })}
      className="space-y-3"
    >
      <Input placeholder="Название" {...register('title')} />
      {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
      <Textarea placeholder="Описание" {...register('description')} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input type="number" placeholder="Длительность (мин)" {...register('duration_minutes')} />
        <Input type="number" placeholder="Проходной %" {...register('passing_score_percent')} />
        <Input type="number" placeholder="Макс. потерь фокуса" {...register('max_focus_losses')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-sm mb-1">Назначение (purpose)</label>
          <select className="w-full border rounded px-2 py-2" value={purpose} onChange={(e) => {
            const p = e.target.value as Purpose
            setPurpose(p)
            setDepartmentId('')
            setRankId('')
            setQualificationId('')
          }}>
            <option value="ENTRY">ENTRY</option>
            <option value="PROMOTION">PROMOTION</option>
            <option value="QUALIFICATION">QUALIFICATION</option>
          </select>
        </div>

        {purpose === 'ENTRY' && (
          <div>
            <label className="block text-sm mb-1">Департамент</label>
            <select className="w-full border rounded px-2 py-2" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <option value="">— Выберите департамент —</option>
              {(departments || []).map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        )}

        {purpose === 'PROMOTION' && (
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Департамент (для фильтра званий)</label>
              <select className="w-full border rounded px-2 py-2" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                <option value="">— Выберите департамент —</option>
                {(departments || []).map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Звание</label>
              <select className="w-full border rounded px-2 py-2" value={rankId} onChange={(e) => setRankId(e.target.value)} disabled={!departmentId}>
                <option value="">— Выберите звание —</option>
                {(ranks || []).map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {purpose === 'QUALIFICATION' && (
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Департамент (для фильтра квалификаций)</label>
              <select className="w-full border rounded px-2 py-2" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                <option value="">— Любой департамент —</option>
                {(departments || []).map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Квалификация</label>
              <select className="w-full border rounded px-2 py-2" value={qualificationId} onChange={(e) => setQualificationId(e.target.value)}>
                <option value="">— Выберите квалификацию —</option>
                {(qualifications || []).map((q) => (
                  <option key={q.id} value={q.id}>{q.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
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