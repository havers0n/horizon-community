import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Navigate } from 'react-router-dom'
import { listAdminApplications, updateAdminApplicationStatus, getAdminApplicationById, type AdminApplication } from '@/features/admin/applications/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { useSession } from '@/shared/contexts/SessionContext'
import { toast } from '@/shared/ui/use-toast'
import { apiClient } from '@/shared/api/api-client'

// Удалён локальный STATUSES: статусы теперь подтягиваются динамически из словаря

export default function AdminApplicationsPage() {
  const queryClient = useQueryClient()
  const { session, isLoading: isSessionLoading } = useSession()
  const [status, setStatus] = React.useState<string>('')
  const [department, setDepartment] = React.useState<string>('')
  const [page] = React.useState<number>(1)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [reviewStatus, setReviewStatus] = React.useState<string>('')
  const [reviewComment, setReviewComment] = React.useState<string>('')

  // Dictionaries: statuses and departments
  const { data: statusesDict } = useQuery({
    queryKey: ['dict', 'statuses'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/common/statuses')
      return (res as any).data ?? (res as any)
    },
    staleTime: 10 * 60 * 1000,
  })

  const { data: departmentsDict } = useQuery({
    queryKey: ['dict', 'departments'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/common/departments')
      return (res as any).data ?? (res as any)
    },
    staleTime: 10 * 60 * 1000,
  })

  const statusNameMap = React.useMemo(() => {
    const map = new Map<string, string>()
    ;(statusesDict ?? []).forEach((s: any) => {
      const id = s?.id ?? s?.status_id ?? s?.uuid ?? s?.code
      const name = s?.name ?? s?.display_name ?? s?.label ?? s?.code ?? s?.id
      if (id) map.set(String(id), String(name))
      if (s?.code) map.set(String(s.code), String(name))
    })
    return map
  }, [statusesDict])

  // Карта соответствия: id статуса -> code (для установки значения в выпадающем списке изменения статуса)
  const statusCodeByIdMap = React.useMemo(() => {
    const map = new Map<string, string>()
    ;(statusesDict ?? []).forEach((s: any) => {
      const id = s?.id ?? s?.status_id ?? s?.uuid
      const code = s?.code ?? s?.id
      if (id && code) map.set(String(id), String(code))
    })
    return map
  }, [statusesDict])

  // Список статусов только нужного вида: application_status
  const applicationStatuses = React.useMemo(() => {
    const items = (statusesDict ?? []).filter((s: any) => (
      s?.kind_code === 'application_status' || s?.kind?.code === 'application_status'
    ))
    return items.map((s: any) => ({
      id: String(s?.id ?? s?.status_id ?? s?.uuid ?? s?.code),
      code: String(s?.code ?? s?.id),
      name: String(s?.name ?? s?.display_name ?? s?.label ?? s?.code ?? s?.id),
    }))
  }, [statusesDict])

  const departmentNameMap = React.useMemo(() => {
    const map = new Map<string, string>()
    ;(departmentsDict ?? []).forEach((d: any) => {
      const id = d?.id ?? d?.department_id ?? d?.uuid
      const name = d?.name ?? d?.display_name ?? d?.title ?? d?.label ?? d?.code ?? d?.id
      if (id) map.set(String(id), String(name))
    })
    return map
  }, [departmentsDict])

  const getStatusName = (idOrCode?: string | null) => {
    if (!idOrCode) return '-'
    return statusNameMap.get(idOrCode) ?? idOrCode
  }

  const getDepartmentName = (id?: string | null) => {
    if (!id) return '-'
    return departmentNameMap.get(id) ?? id
  }

  const getStatusCodeFromIdOrCode = (value?: string | null) => {
    if (!value) return ''
    return statusCodeByIdMap.get(value) ?? value
  }

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
      toast({ title: 'Статус обновлён', description: 'Заявка успешно обновлена' })
    },
    onError: (error: any) => {
      toast({ title: 'Ошибка обновления статуса', description: error?.message || 'Не удалось обновить статус заявки', variant: 'destructive' as any })
    },
  })

  const items = (data as any)?.items || []
  // const pagination = (data as any)?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 }

  if (isSessionLoading) {
    return (
      <div className="container mx-auto p-6">Загрузка...</div>
    )
  }

  const canManage = !!session?.permissions?.includes('applications.manage')
  if (!canManage) {
    return <Navigate to="/dashboard" replace />
  }

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
                {applicationStatuses.map((s: { code: string; name: string }) => (
                  <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
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
                  <TableRow
                    key={app.id}
                    className="cursor-pointer"
                    onClick={() => { setSelectedId(app.id); setReviewStatus(getStatusCodeFromIdOrCode(app.status_id)); setReviewComment('') }}
                  >
                    <TableCell className="font-mono">{app.id.slice(0, 8)}</TableCell>
                    <TableCell className="font-mono">{app.author_user_id.slice(0, 8)}</TableCell>
                    <TableCell>{getDepartmentName(app.target_department_id)}</TableCell>
                    <TableCell>{getStatusName(app.status_id)}</TableCell>
                    <TableCell>{app.created_at ? new Date(app.created_at).toLocaleString() : '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); setSelectedId(app.id); setReviewStatus(getStatusCodeFromIdOrCode(app.status_id)); setReviewComment('') }}>Просмотр</Button>
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
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Общая информация</div>
                <div className="rounded border p-3 text-sm space-y-2">
                  <div className="flex justify-between gap-4"><span className="text-muted-foreground">ID</span><span className="font-mono">{selectedId?.slice(0,8)}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-muted-foreground">Автор</span><span className="font-mono">{selectedApplication?.author_user_id?.slice(0,8)}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-muted-foreground">Департамент</span><span>{getDepartmentName(selectedApplication?.target_department_id)}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-muted-foreground">Статус</span><span>{getStatusName(selectedApplication?.status_id)}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-muted-foreground">Тип</span><span>{selectedApplication?.type ?? '-'}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-muted-foreground">Создано</span><span>{selectedApplication?.created_at ? new Date(selectedApplication.created_at).toLocaleString() : '-'}</span></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Данные заявки</div>
                <div className="rounded border p-3 text-sm space-y-2 max-h-64 overflow-auto">
                  {(() => {
                    const data = (selectedApplication as any)?.data ?? {}
                    const entries = Object.entries(data as Record<string, any>)
                    if (!entries.length) return <div className="text-muted-foreground">Нет дополнительных данных</div>

                    const formatKey = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                    const renderValue = (v: any): React.ReactNode => {
                      if (v === null || v === undefined) return '-' as any
                      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v)
                      if (Array.isArray(v)) return v.map((x, i) => <span key={i} className="inline-block mr-1">{String(x)}</span>)
                      if (typeof v === 'object') return <pre className="whitespace-pre-wrap break-words text-xs">{JSON.stringify(v, null, 2)}</pre>
                      return String(v)
                    }

                    return entries.map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4">
                        <span className="text-muted-foreground">{formatKey(k)}</span>
                        <span className="text-right break-all">{renderValue(v)}</span>
                      </div>
                    ))
                  })()}
                </div>
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
                    {applicationStatuses.map((s: { code: string; name: string }) => (
                      <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
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
