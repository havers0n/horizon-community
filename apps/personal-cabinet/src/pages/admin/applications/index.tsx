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

// Словарь переводов ключей данных заявки на человеко-читаемые русские метки
const dataKeyLabels: { [key: string]: string } = {
  full_name: 'ФИО',
  first_name: 'Имя',
  last_name: 'Фамилия',
  middle_name: 'Отчество',
  birth_date: 'Дата рождения',
  date_of_birth: 'Дата рождения',
  phone: 'Телефон',
  email: 'E-mail',
  motivation: 'Мотивация',
  department_id: 'Департамент',
  department: 'Департамент',
  experience: 'Опыт',
  skills: 'Навыки',
  links: 'Ссылки',
  discord: 'Discord',
  telegram: 'Telegram',
  nickname: 'Никнейм',
  test_id: 'Тест',
  city: 'Город',
  address: 'Адрес',
  reason: 'Причина',
  source: 'Откуда вы узнали о нас?',
  has_microphone: 'Наличие микрофона',
  pc_requirements_link: 'Ссылка на системные требования',
  pc_meets_requirements: 'ПК соответствует требованиям',
  department_understanding: 'Понимание задач департамента',
  in_other_communities_now: 'Состоит в других сообществах',
  been_in_other_fivem_communities: 'Состоял в других FiveM сообществах',
};

const getLabel = (key: string) => dataKeyLabels[key] ?? key;

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="py-3 grid grid-cols-3 gap-5">
    <dt className="text-base text-muted-foreground">{label}</dt>
    <dd className="text-base col-span-2 break-all leading-relaxed">{value ?? '-'}</dd>
  </div>
);

// Note: SectionTitle removed as layout was restructured

const deriveStatusKind = (name?: string | null): 'submitted' | 'approved' | 'rejected' | 'other' => {
  const v = String(name || '').toLowerCase()
  if (v.includes('подан') || v.includes('submit') || v.includes('await')) return 'submitted'
  if (v.includes('одобр') || v.includes('approv')) return 'approved'
  if (v.includes('отклон') || v.includes('reject')) return 'rejected'
  return 'other'
}

const StatusBadge: React.FC<{ name?: string | null }> = ({ name }) => {
  const kind = deriveStatusKind(name)
  const base = 'px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center'
  const tone = kind === 'submitted'
    ? 'bg-blue-900 text-blue-300'
    : kind === 'approved'
      ? 'bg-green-900 text-green-300'
      : kind === 'rejected'
        ? 'bg-red-900 text-red-300'
        : 'bg-gray-800 text-gray-300'
  return <span className={`${base} ${tone}`}>{name || '-'}</span>
}

export default function AdminApplicationsPage() {
  const queryClient = useQueryClient()
  const { session, isLoading: isSessionLoading } = useSession()
  const [status, setStatus] = React.useState<string>('')
  const [department, setDepartment] = React.useState<string>('')
  const [page] = React.useState<number>(1)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  // removed reviewStatus state as status is now controlled via explicit buttons
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

  // Removed departments dictionary — not required for enriched rendering

  // Removed statusNameMap — enriched status_name provided by API

  // Карта соответствия: id статуса -> code (для установки значения в выпадающем списке изменения статуса)
  // removed statusCodeByIdMap as we no longer allow selecting arbitrary status in modal
  // const statusCodeByIdMap = React.useMemo(() => {
  //   const map = new Map<string, string>()
  //   ;(statusesDict ?? []).forEach((s: any) => {
  //     const id = s?.id ?? s?.status_id ?? s?.uuid
  //     const code = s?.code ?? s?.id
  //     if (id && code) map.set(String(id), String(code))
  //   })
  //   return map
  // }, [statusesDict])

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

  // Removed departmentNameMap — enriched department_name provided by API

  // Removed getStatusName/getDepartmentName — status and department now rendered via enriched names

  // const getStatusCodeFromIdOrCode = (value?: string | null) => {
  //   if (!value) return ''
  //   return statusCodeByIdMap.get(value) ?? value
  // }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-applications', { status, department, page }],
    queryFn: () => listAdminApplications({ status: status || undefined, department: department || undefined, page }),
  })

  const { data: selectedApplication, isFetching: isFetchingSelected, isError: isSelectedError, error: selectedError } = useQuery({
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
            <Select value={status} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Все" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                {applicationStatuses
                  .filter((s: any) => s && typeof s.code === 'string' && s.code.length > 0)
                  .map((s: { id?: string; code: string; name: string }) => (
                    <SelectItem key={s.id ?? s.code} value={s.code}>{s.name}</SelectItem>
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
                {Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 w-24 bg-gray-800 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-40 bg-gray-800 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-48 bg-gray-800 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-28 bg-gray-800 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-36 bg-gray-800 rounded animate-pulse" /></TableCell>
                    <TableCell className="text-right"><div className="h-8 w-20 bg-gray-800 rounded animate-pulse inline-block" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : isError ? (
            <div className="text-red-400">Ошибка загрузки заявок: {typeof (error as any)?.message === 'string' ? (error as any).message : 'Неизвестная ошибка'}</div>
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
                    onClick={() => { setSelectedId(app.id); setReviewComment('') }}
                  >
                    <TableCell className="font-mono">{app.id.slice(0, 8)}</TableCell>
                    <TableCell>{app.author_name || '-'}</TableCell>
                    <TableCell>{app.department_name || '-'}</TableCell>
                    <TableCell><StatusBadge name={app.status_name} /></TableCell>
                    <TableCell>{app.created_at ? new Date(app.created_at).toLocaleString() : '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); setSelectedId(app.id); setReviewComment('') }}>Просмотр</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="w-[76vw] max-w-[76vw] h-[72vh] top-[48%] md:top-[46%] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Заявка {selectedId?.slice(0,8)}</DialogTitle>
          </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full min-h-0">
            {/* LEFT: Application Data (large scrollable area) */}
            <div className="md:col-span-2 flex flex-col min-h-0">
              <div className="space-y-3 flex-1 min-h-0">
                <div className="text-base text-muted-foreground">Данные заявки</div>
                <div className="rounded border p-4 text-base space-y-3 flex-1 min-h-0">
                  {(() => {
                    const data = (selectedApplication as any)?.data ?? {}
                    const entries = Object.entries(data as Record<string, any>)
                    if (isFetchingSelected) return <div className="h-24 bg-gray-800 rounded animate-pulse" />
                    if (!entries.length) return <div className="text-muted-foreground">Нет дополнительных данных</div>

                    const formatKey = (key: string) => getLabel(key)
                    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/

                    const renderPrimitive = (key: string, v: any): React.ReactNode => {
                      if (v === null || v === undefined) return '-' as any
                      if (typeof v === 'boolean') return v ? <span className="text-green-400">Да</span> : <span className="text-red-400">Нет</span>
                      if (typeof v === 'string') {
                        const val = v.trim()
                        if (uuidRegex.test(val)) {
                          if (['department', 'department_id'].includes(key)) return (selectedApplication as any)?.department_name || '-'
                          if (['status', 'status_id'].includes(key)) return (selectedApplication as any)?.status_name || '-'
                          if (['author', 'author_user_id', 'user_id'].includes(key)) return (selectedApplication as any)?.author_name || '-'
                          return '-'
                        }
                        if (val.startsWith('http://') || val.startsWith('https://')) {
                          return <a href={val} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{val}</a>
                        }
                        return val
                      }
                      if (typeof v === 'number') return String(v)
                      return String(v)
                    }

                    const renderObject = (obj: Record<string, any>) => (
                      <div className="space-y-2">
                        {Object.entries(obj).map(([k2, v2]) => (
                          <div key={k2} className="py-3 grid grid-cols-3 gap-5">
                            <dt className="text-base text-muted-foreground">{formatKey(k2)}</dt>
                            <dd className="text-base col-span-2 break-all leading-relaxed">{Array.isArray(v2)
                              ? <div className="flex flex-wrap gap-1">{(v2 as any[]).map((x, i) => <span key={i} className="inline-block px-2 py-0.5 bg-gray-800 rounded text-xs">{String(x)}</span>)}</div>
                              : (typeof v2 === 'object' && v2 !== null) ? renderObject(v2 as Record<string, any>)
                              : renderPrimitive(k2, v2)}</dd>
                          </div>
                        ))}
                      </div>
                    )

                    return (
                      <dl className="divide-y divide-gray-700">
                        {entries.map(([k, v]) => (
                          <div key={k} className="py-3 grid grid-cols-3 gap-5">
                            <dt className="text-base text-muted-foreground">{formatKey(k)}</dt>
                            <dd className="text-base col-span-2 break-all leading-relaxed">{Array.isArray(v)
                              ? <div className="flex flex-wrap gap-1">{(v as any[]).map((x, i) => <span key={i} className="inline-block px-2 py-0.5 bg-gray-800 rounded text-xs">{String(x)}</span>)}</div>
                              : (typeof v === 'object' && v !== null) ? renderObject(v as Record<string, any>)
                              : renderPrimitive(k, v)}</dd>
                          </div>
                        ))}
                      </dl>
                    )
                  })()}
                </div>
              </div>
            </div>

            {/* RIGHT: General Info on top, Reviewer comment below */}
            <div className="flex flex-col gap-4 min-h-0">
              <div className="space-y-3">
                <div className="text-base text-muted-foreground">Общая информация</div>
                <div className="rounded border p-4 text-base space-y-3">
                  {isFetchingSelected ? (
                    <>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex justify-between gap-6"><span className="h-5 w-28 bg-gray-800 rounded animate-pulse" /><span className="h-5 w-40 bg-gray-800 rounded animate-pulse" /></div>
                      ))}
                    </>
                  ) : isSelectedError ? (
                    <div className="text-red-400">Ошибка загрузки данных заявки: {typeof (selectedError as any)?.message === 'string' ? (selectedError as any).message : 'Неизвестная ошибка'}</div>
                  ) : (
                    <dl className="divide-y divide-gray-700">
                      <DetailItem label="ID" value={<span className="font-mono">{selectedId?.slice(0,8)}</span>} />
                      <DetailItem label="Автор" value={(selectedApplication as any)?.author_name || '-'} />
                      <DetailItem label="Департамент" value={(selectedApplication as any)?.department_name || '-'} />
                      <DetailItem label="Статус" value={<StatusBadge name={(selectedApplication as any)?.status_name} />} />
                      <DetailItem label="Тип" value={selectedApplication?.type ?? '-'} />
                      <DetailItem label="Создано" value={selectedApplication?.created_at ? new Date(selectedApplication.created_at).toLocaleString() : '-'} />
                    </dl>
                  )}
                </div>
              </div>
 
              {/* Reviewer comment */}
              <div>
                <label className="text-base text-muted-foreground">Комментарий ревьюера</label>
                {(() => {
                  const statusName = String((selectedApplication as any)?.status_name || '')
                  const isSubmitted = statusName.toLowerCase().includes('подан') || statusName.toLowerCase().includes('submit')
                  return (
                    <Textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows={10} disabled={!isSubmitted} />
                  )
                })()}
              </div>
              {(() => {
                const statusName = String((selectedApplication as any)?.status_name || '')
                const isSubmitted = statusName.toLowerCase().includes('подан') || statusName.toLowerCase().includes('submit')
                return isSubmitted ? (
                  <div className="flex flex-wrap justify-end gap-3">
                    <Button onClick={() => selectedId && updateStatusMutation.mutate({ id: selectedId, new_status_code: 'approved', review_comment: reviewComment })}>Одобрить</Button>
                    <Button variant="destructive" onClick={() => selectedId && updateStatusMutation.mutate({ id: selectedId, new_status_code: 'rejected', review_comment: reviewComment })}>Отклонить</Button>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground p-3 rounded border border-gray-700">Заявка уже обработана. Статус: <span className="font-semibold">{(selectedApplication as any)?.status_name || '-'}</span></div>
                )
              })()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
