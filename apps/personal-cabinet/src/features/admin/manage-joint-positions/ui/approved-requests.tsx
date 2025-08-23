import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { getAllJointPositionRequests } from '../api'
import { 
  JointPositionRequest, 
  formatEmployeeName, 
  formatMainDepartmentName, 
  formatJointDepartmentName,
  formatApproverName,
  formatCreatedAt,
  getStatusVariant,
  getStatusText
} from '../model'

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
      Нет одобренных заявок на совмещение
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

export function ApprovedJointPositionRequests() {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['admin-joint-position-requests', { status: 'approved' }],
    queryFn: () => getAllJointPositionRequests({ status: 'approved', page: 1, limit: 50 }),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Одобренные заявки на совмещение</CardTitle>
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
          <CardTitle>Одобренные заявки на совмещение</CardTitle>
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
          <CardTitle>Одобренные заявки на совмещение</CardTitle>
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
        <CardTitle>Одобренные заявки на совмещение</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request: JointPositionRequest) => (
            <div key={request.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{formatEmployeeName(request)}</h4>
                  <p className="text-sm text-muted-foreground">{formatMainDepartmentName(request)}</p>
                </div>
                <Badge variant={getStatusVariant(request.status_code)}>
                  {getStatusText(request.status_code)}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Основной департамент:</span> {formatMainDepartmentName(request)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Департамент совмещения:</span> {formatJointDepartmentName(request)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Причина:</span> {request.reason}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Дата подачи:</span> {formatCreatedAt(request.created_at)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Одобрено:</span> {formatApproverName(request)}
                </p>
                {request.updated_at && request.updated_at !== request.created_at && (
                  <p className="text-sm">
                    <span className="font-medium">Дата одобрения:</span> {formatCreatedAt(request.updated_at)}
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

export default ApprovedJointPositionRequests