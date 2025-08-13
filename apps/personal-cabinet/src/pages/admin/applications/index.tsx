import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listAdminApplications, updateAdminApplicationStatus, getAdminApplicationById, type AdminApplication } from '@/features/admin/applications/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

const STATUSES = [
  { value: 'awaiting_review', label: 'В ожидании проверки' },
  { value: 'awaiting_interview', label: 'Ожидает интервью' },
  { value: 'interview_scheduled', label: 'Интервью назначено' },
  { value: 'approved', label: 'Одобрено' },
  { value: 'rejected', label: 'Отклонено' },
  { value: 'on_hold', label: 'На удержании' },
  { value: 'withdrawn', label: 'Отозвано' },
]

export default function AdminApplicationsPage() {
  const queryClient = useQueryClient()
  const [status, setStatus] = React.useState<string>('')
  const [department, setDepartment] = React.useState<string>('')
  const [page] = React.useState<number>(1)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [reviewStatus, setReviewStatus] = React.useState<string>('')
  const [reviewComment, setReviewComment] = React.useState<string>('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-applications', { status, department, page }],
    queryFn: () => listAdminApplications({ status: status || undefined, department: department || undefined, page }),
  })

  const { data: selectedApplication } = useQuery({
    queryKey: ['admin-application', selectedId],
    queryFn: () => getAdminApplicationById(selectedId!),
    enabled: !!selectedId,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, new_status_code, review_comment }: { id: string; new_status_code: string; review_comment?: string }) => updateAdminApplicationStatus(id, { new_status_code, review_comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] })
      setSelectedId(null)
    },
  })

  const items = (data as any)?.items || []
  // const pagination = (data as any)?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Админ — Заявки</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-muted-foreground">Статус</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Все" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все</SelectItem>
                {STATUSES.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Департамент</label>
            <Input placeholder="ID департамента" value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>
          <div className="flex items-end justify-end">
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-applications'] })}>Применить</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Список заявок</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Загрузка...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Короткий ID</TableHead>
                  <TableHead>Автор</TableHead>
                  <TableHead>Департамент</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Создано</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((app: AdminApplication) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-mono">{app.id.slice(0, 8)}</TableCell>
                    <TableCell className="font-mono">{app.author_user_id.slice(0, 8)}</TableCell>
                    <TableCell>{app.target_department_id || '-'}</TableCell>
                    <TableCell>{app.status_id}</TableCell>
                    <TableCell>{app.created_at ? new Date(app.created_at).toLocaleString() : '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => { setSelectedId(app.id); setReviewStatus(app.status_id); setReviewComment('') }}>Просмотр</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Заявка {selectedId?.slice(0,8)}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Детали</div>
                <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-64">{JSON.stringify(selectedApplication?.data ?? {}, null, 2)}</pre>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">Новый статус</label>
                <Select value={reviewStatus} onValueChange={setReviewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Комментарий ревьюера</label>
                <Textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={6} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedId(null)}>Закрыть</Button>
                <Button onClick={() => selectedId && updateStatusMutation.mutate({ id: selectedId, new_status_code: reviewStatus, review_comment: reviewComment })}>Сохранить</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
