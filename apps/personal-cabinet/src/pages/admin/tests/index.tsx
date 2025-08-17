
import React from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listTests, deleteTest, type AdminTest } from '@/features/admin/tests/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { useSession } from '@/shared/contexts/SessionContext'
import { toast } from 'sonner'

export default function AdminTestsPage() {
  const navigate = useNavigate()
  const { session, isLoading } = useSession()
  const queryClient = useQueryClient()

  const { data: tests, isLoading: isLoadingTests } = useQuery({
    queryKey: ['admin-tests'],
    queryFn: listTests,
    staleTime: 60_000,
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteTest(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<AdminTest[] | undefined>(['admin-tests'], (old) =>
        Array.isArray(old) ? old.filter((t) => t.id !== id) : old
      )
      queryClient.invalidateQueries({ queryKey: ['admin-tests'] })
      toast.success('Тест успешно удален')
    },
  })

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">Загрузка...</div>
    )
  }

  if (!session?.permissions?.includes('tests.manage')) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Админ панель - Управление тестами</h1>
          <p className="text-muted-foreground">Создание и управление тестами и экзаменами</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/admin/tests/new')}>Создать новый тест</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список тестов</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTests ? (
            <div>Загрузка...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Длительность</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests?.map((t: AdminTest) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-muted-foreground font-mono">{t.id.slice(0, 8)}</TableCell>
                    <TableCell className="font-medium">{t.title}</TableCell>
                    <TableCell className="truncate max-w-[480px]">{t.description}</TableCell>
                    <TableCell>{t.duration_minutes} мин</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="outline" onClick={() => navigate(`/admin/tests/${t.id}/edit`)}>Редактировать</Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          if (!confirm('Удалить тест? Действие необратимо.')) return
                          removeMutation.mutate(t.id)
                        }}
                        disabled={removeMutation.isPending}
                      >
                        Удалить
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 