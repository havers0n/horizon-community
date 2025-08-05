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

interface ApprovedRequestsProps {
  requests?: LeaveRequest[]
}

export function ApprovedRequests({ requests = [] }: ApprovedRequestsProps) {
  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case 'vacation': return 'Отпуск'
      case 'sick': return 'Больничный'
      case 'personal': return 'Личные дела'
      case 'other': return 'Другое'
      default: return type
    }
  }

  const approvedRequests = requests.filter(request => request.status === 'approved')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Одобренные заявки на отпуск</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {approvedRequests.length === 0 ? (
            <p className="text-muted-foreground">Нет одобренных заявок</p>
          ) : (
            approvedRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{request.employeeName}</h4>
                    <p className="text-sm text-muted-foreground">{request.department}</p>
                  </div>
                  <Badge variant="default">Одобрено</Badge>
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

export default ApprovedRequests 