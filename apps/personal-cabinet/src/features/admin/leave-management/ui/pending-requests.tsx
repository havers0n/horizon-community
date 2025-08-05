import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Check, X } from 'lucide-react'

interface LeaveRequest {
  id: string
  employeeName: string
  employeeId: string
  department: string
  leaveType: 'vacation' | 'sick' | 'personal' | 'other'
  startDate: Date
  endDate: Date
  status: 'pending' | 'approved' | 'rejected'
  reason: string
  submittedAt: Date
}

interface PendingRequestsProps {
  requests?: LeaveRequest[]
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
}

export function PendingRequests({ requests = [], onApprove, onReject }: PendingRequestsProps) {
  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case 'vacation': return 'Отпуск'
      case 'sick': return 'Больничный'
      case 'personal': return 'Личные дела'
      case 'other': return 'Другое'
      default: return type
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Ожидает</Badge>
      case 'approved':
        return <Badge variant="default">Одобрено</Badge>
      case 'rejected':
        return <Badge variant="destructive">Отклонено</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ожидающие заявки на отпуск</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-muted-foreground">Нет ожидающих заявок</p>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{request.employeeName}</h4>
                    <p className="text-sm text-muted-foreground">{request.department}</p>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Тип:</span> {getLeaveTypeLabel(request.leaveType)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Период:</span> {request.startDate.toLocaleDateString()} - {request.endDate.toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Причина:</span> {request.reason}
                  </p>
                </div>
                {request.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      onClick={() => onApprove?.(request.id)}
                      className="flex items-center gap-1"
                    >
                      <Check className="h-4 w-4" />
                      Одобрить
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onReject?.(request.id)}
                      className="flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      Отклонить
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default PendingRequests 