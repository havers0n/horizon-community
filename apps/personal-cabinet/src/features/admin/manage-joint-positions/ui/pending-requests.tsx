import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { Textarea } from '@/shared/ui/textarea'
import { Label } from '@/shared/ui/label'
import { useToast } from '@/shared/ui/use-toast'
import { Check, X } from 'lucide-react'
import { getAllJointPositionRequests, approveJointPositionRequest, rejectJointPositionRequest } from '../api'
import { 
  JointPositionRequest, 
  formatEmployeeName, 
  formatMainDepartmentName, 
  formatJointDepartmentName,
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
      Нет ожидающих заявок на совмещение
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

interface RejectModalProps {
  requestId: string
  requesterName: string
  onReject: (id: string, reason: string) => void
  isLoading: boolean
}

const RejectModal = ({ requestId, requesterName, onReject, isLoading }: RejectModalProps) => {
  const [reason, setReason] = useState('')
  const [open, setOpen] = useState(false)

  const handleReject = () => {
    if (reason.trim()) {
      onReject(requestId, reason.trim())
      setReason('')
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="destructive"
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <X className="h-4 w-4" />
          Отклонить
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Отклонить заявку на совмещение</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Вы собираетесь отклонить заявку от <strong>{requesterName}</strong>
          </p>
          <div className="space-y-2">
            <Label htmlFor="reason">Причина отклонения *</Label>
            <Textarea
              id="reason"
              placeholder="Укажите причину отклонения заявки..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!reason.trim() || isLoading}
            >
              Отклонить заявку
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function PendingJointPositionRequests() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['admin-joint-position-requests', { status: 'in_review' }],
    queryFn: () => getAllJointPositionRequests({ status: 'in_review', page: 1, limit: 50 }),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })

  const approveMutation = useMutation({
    mutationFn: approveJointPositionRequest,
    onMutate: async (requestId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin-joint-position-requests', { status: 'in_review' }] })
      
      // Snapshot the previous value
      const previousRequests = queryClient.getQueryData(['admin-joint-position-requests', { status: 'in_review' }])
      
      // Optimistically update to remove the approved request
      queryClient.setQueryData(['admin-joint-position-requests', { status: 'in_review' }], (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.filter((req: JointPositionRequest) => req.id !== requestId)
        }
      })
      
      return { previousRequests }
    },
    onSuccess: () => {
      // Refetch specific queries for all three tabs to ensure fresh data
      queryClient.refetchQueries({ 
        queryKey: ['admin-joint-position-requests', { status: 'in_review' }] 
      })
      queryClient.refetchQueries({ 
        queryKey: ['admin-joint-position-requests', { status: 'approved' }] 
      })
      queryClient.refetchQueries({ 
        queryKey: ['admin-joint-position-requests', { status: 'rejected' }] 
      })
      // Also invalidate all admin-joint-position-requests queries to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: ['admin-joint-position-requests'] 
      })
      toast({
        title: 'Успешно',
        description: 'Заявка на совмещение одобрена',
      })
    },
    onError: (err, requestId, context: any) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousRequests) {
        queryClient.setQueryData(['admin-joint-position-requests', { status: 'in_review' }], context.previousRequests)
      }
      toast({
        title: 'Ошибка',
        description: err.message || 'Не удалось одобрить заявку',
        variant: 'destructive',
      })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => rejectJointPositionRequest(id, reason),
    onMutate: async ({ id: requestId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin-joint-position-requests', { status: 'in_review' }] })
      
      // Snapshot the previous value
      const previousRequests = queryClient.getQueryData(['admin-joint-position-requests', { status: 'in_review' }])
      
      // Optimistically update to remove the rejected request
      queryClient.setQueryData(['admin-joint-position-requests', { status: 'in_review' }], (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.filter((req: JointPositionRequest) => req.id !== requestId)
        }
      })
      
      return { previousRequests }
    },
    onSuccess: () => {
      // Refetch specific queries for all three tabs to ensure fresh data
      queryClient.refetchQueries({ 
        queryKey: ['admin-joint-position-requests', { status: 'in_review' }] 
      })
      queryClient.refetchQueries({ 
        queryKey: ['admin-joint-position-requests', { status: 'approved' }] 
      })
      queryClient.refetchQueries({ 
        queryKey: ['admin-joint-position-requests', { status: 'rejected' }] 
      })
      // Also invalidate all admin-joint-position-requests queries to ensure consistency
      queryClient.invalidateQueries({ 
        queryKey: ['admin-joint-position-requests'] 
      })
      toast({
        title: 'Успешно',
        description: 'Заявка на совмещение отклонена',
      })
    },
    onError: (err, { id: requestId }, context: any) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousRequests) {
        queryClient.setQueryData(['admin-joint-position-requests', { status: 'in_review' }], context.previousRequests)
      }
      toast({
        title: 'Ошибка',
        description: err.message || 'Не удалось отклонить заявку',
        variant: 'destructive',
      })
    },
  })

  const handleApprove = (id: string) => {
    approveMutation.mutate(id)
  }

  const handleReject = (id: string, reason: string) => {
    rejectMutation.mutate({ id, reason })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ожидающие заявки на совмещение</CardTitle>
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
          <CardTitle>Ожидающие заявки на совмещение</CardTitle>
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
          <CardTitle>Ожидающие заявки на совмещение</CardTitle>
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
        <CardTitle>Ожидающие заявки на совмещение</CardTitle>
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
                <RejectModal
                  requestId={request.id}
                  requesterName={formatEmployeeName(request)}
                  onReject={handleReject}
                  isLoading={rejectMutation.isPending}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default PendingJointPositionRequests