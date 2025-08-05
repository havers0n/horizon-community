import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'

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

interface RejectedRequestsProps {
  requests?: LeaveRequest[]
}

export function RejectedRequests({ requests = [] }: RejectedRequestsProps) {
  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case 'vacation': return 'Отпуск'
      case 'sick': return 'Больничный'
      case 'personal': return 'Личные дела'
      case 'other': return 'Другое'
      default: return type
    }
  }

  const rejectedRequests = requests.filter(request => request.status === 'rejected')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Отклоненные заявки на отпуск</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rejectedRequests.length === 0 ? (
            <p className="text-muted-foreground">Нет отклоненных заявок</p>
          ) : (
            rejectedRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{request.employeeName}</h4>
                    <p className="text-sm text-muted-foreground">{request.department}</p>
                  </div>
                  <Badge variant="destructive">Отклонено</Badge>
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
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default RejectedRequests 