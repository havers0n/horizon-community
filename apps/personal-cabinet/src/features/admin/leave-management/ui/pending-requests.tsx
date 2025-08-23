import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { useToast } from '@/shared/ui/use-toast'
import { Check, X } from 'lucide-react'
import { getLeaveRequests, approveLeaveRequest, rejectLeaveRequest } from '../api'
import { LeaveRequest, formatEmployeeName, formatDepartmentName, formatDateRange, formatCreatedAt } from '../model'

const LoadingSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
  </div>
)

const EmptyState = () => (
  <div className="text-center py-8">
    <p className="text-muted-foreground text-sm">
      Нет ожидающих заявок
    </p>
  </div>
)

const ErrorState = ({ error }: { error: Error }) => (
  <div className="text-center py-8">
    <p className="text-destructive text-sm">
      Ошибка при загрузке заявок: {error.message}
    </p>
  </div>
)

export function PendingRequests() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['admin-leave-requests', { status: 'in_review' }],
    queryFn: () => getLeaveRequests({ status: 'in_review', page: 1, limit: 50 }),
  })

  const approveMutation = useMutation({
    mutationFn: approveLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leave-requests'] })
      toast({
        title: 'Успешно',
        description: 'Заявка одобрена',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось одобрить заявку',
        variant: 'destructive',
      })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => rejectLeaveRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leave-requests'] })
      toast({
        title: 'Успешно',
        description: 'Заявка отклонена',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось отклонить заявку',
        variant: 'destructive',
      })
    },
  })

  const handleApprove = (id: string) => {
    approveMutation.mutate(id)
  }

  const handleReject = (id: string) => {
    // For now, reject without reason. Could be enhanced with a modal for reason input
    rejectMutation.mutate({ id })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ожидающие заявки на отпуск</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ожидающие заявки на отпуск</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState error={error as Error} />
        </CardContent>
      </Card>
    )
  }

  const requests = response?.data || []

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ожидающие заявки на отпуск</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ожидающие заявки на отпуск</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request: LeaveRequest) => (
            <div key={request.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{formatEmployeeName(request)}</h4>
                  <p className="text-sm text-muted-foreground">{formatDepartmentName(request)}</p>
                </div>
                <Badge variant="warning">На рассмотрении</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Период:</span> {formatDateRange(request.start_date, request.end_date)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Причина:</span> {request.reason}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Дата подачи:</span> {formatCreatedAt(request.created_at)}
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => handleApprove(request.id)}
                  disabled={approveMutation.isPending}
                  className="flex items-center gap-1"
                >
                  <Check className="h-4 w-4" />
                  Одобрить
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(request.id)}
                  disabled={rejectMutation.isPending}
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Отклонить
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default PendingRequests 