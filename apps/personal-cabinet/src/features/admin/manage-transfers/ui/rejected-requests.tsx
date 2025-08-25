import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import { getAllTransferRequests } from '../api'
import { AdminTransferRequest, formatEmployeeName, formatSourceDepartmentName, formatTargetDepartmentName, formatCreatedAt, formatApproverName, getStatusVariant, getStatusText } from '../model'

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
    <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
    <p className="text-muted-foreground text-sm mt-2">
      Нет отклоненных заявок
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

export function RejectedRequests() {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['admin-transfer-requests', { status: 'rejected' }],
    queryFn: () => getAllTransferRequests({ status: 'rejected', page: 1, limit: 50 }),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Отклоненные заявки на перевод</CardTitle>
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
          <CardTitle>Отклоненные заявки на перевод</CardTitle>
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
          <CardTitle>Отклоненные заявки на перевод</CardTitle>
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
        <CardTitle>Отклоненные заявки на перевод</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request: AdminTransferRequest) => (
            <div key={request.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{formatEmployeeName(request)}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatSourceDepartmentName(request)} → {formatTargetDepartmentName(request)}
                  </p>
                </div>
                <Badge variant={getStatusVariant(request.status_code)}>
                  {getStatusText(request.status_code)}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Причина:</span> {request.reason}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Дата подачи:</span> {formatCreatedAt(request.created_at)}
                </p>
                {request.approver_id && (
                  <p className="text-sm">
                    <span className="font-medium">Отклонил:</span> {formatApproverName(request)}
                  </p>
                )}
                {request.rejection_reason && (
                  <p className="text-sm">
                    <span className="font-medium">Причина отклонения:</span> {request.rejection_reason}
                  </p>
                )}
                {request.updated_at && (
                  <p className="text-sm">
                    <span className="font-medium">Дата решения:</span> {formatCreatedAt(request.updated_at)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default RejectedRequests