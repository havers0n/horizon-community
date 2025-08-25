import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { useToast } from '@/shared/ui/use-toast'
import { Check, X, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { Textarea } from '@/shared/ui/textarea'
import { Label } from '@/shared/ui/label'
import { useState } from 'react'
import { getAllTransferRequests, approveTransferRequest, rejectTransferRequest } from '../api'
import { AdminTransferRequest, formatEmployeeName, formatSourceDepartmentName, formatTargetDepartmentName, formatCreatedAt, getStatusVariant, getStatusText } from '../model'

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
  const [rejectReason, setRejectReason] = useState('')
  const [requestToReject, setRequestToReject] = useState<AdminTransferRequest | null>(null)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['admin-transfer-requests', { status: 'pending' }],
    queryFn: () => getAllTransferRequests({ status: 'pending', page: 1, limit: 50 }),
  })

  const approveMutation = useMutation({
    mutationFn: approveTransferRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-transfer-requests'] })
      toast({
        title: 'Успешно',
        description: 'Заявка на перевод одобрена',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось одобрить заявку на перевод',
        variant: 'destructive',
      })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectTransferRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-transfer-requests'] })
      toast({
        title: 'Успешно',
        description: 'Заявка на перевод отклонена',
      })
      setIsRejectDialogOpen(false)
      setRejectReason('')
      setRequestToReject(null)
    },
    onError: (error: any) => {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось отклонить заявку на перевод',
        variant: 'destructive',
      })
    },
  })

  const handleApprove = (id: string) => {
    approveMutation.mutate(id)
  }

  const handleRejectClick = (request: AdminTransferRequest) => {
    setRequestToReject(request)
    setIsRejectDialogOpen(true)
  }

  const handleRejectConfirm = () => {
    if (requestToReject && rejectReason.trim()) {
      rejectMutation.mutate({ id: requestToReject.id, reason: rejectReason.trim() })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ожидающие заявки на перевод</CardTitle>
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
          <CardTitle>Ожидающие заявки на перевод</CardTitle>
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
          <CardTitle>Ожидающие заявки на перевод</CardTitle>
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
        <CardTitle>Ожидающие заявки на перевод</CardTitle>
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
                  onClick={() => handleRejectClick(request)}
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

      {/* Reject Reason Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Причина отклонения</DialogTitle>
            <DialogDescription>
              Пожалуйста, укажите причину отклонения заявки на перевод от {requestToReject ? formatEmployeeName(requestToReject) : ''}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Причина *</Label>
              <Textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Укажите причину отклонения заявки..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false)
                setRejectReason('')
                setRequestToReject(null)
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={handleRejectConfirm}
              disabled={!rejectReason.trim() || rejectMutation.isPending}
              variant="destructive"
            >
              Отклонить заявку
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default PendingRequests