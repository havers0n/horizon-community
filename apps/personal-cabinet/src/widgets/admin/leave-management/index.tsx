import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/ui/tabs'
import { AdminLeaveManagementFeature } from '@features/admin/leave-management'

export function AdminLeaveManagementWidget() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Ожидающие</TabsTrigger>
          <TabsTrigger value="approved">Одобренные</TabsTrigger>
          <TabsTrigger value="rejected">Отклоненные</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          <AdminLeaveManagementFeature.PendingRequests />
        </TabsContent>
        
        <TabsContent value="approved" className="space-y-4">
          <AdminLeaveManagementFeature.ApprovedRequests />
        </TabsContent>
        
        <TabsContent value="rejected" className="space-y-4">
          <AdminLeaveManagementFeature.RejectedRequests />
        </TabsContent>
      </Tabs>
    </div>
  )
} 