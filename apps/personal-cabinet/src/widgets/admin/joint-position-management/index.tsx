import React, { Suspense, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/ui/tabs'
import { useQueryClient } from '@tanstack/react-query'

// Lazy load components
const PendingRequests = React.lazy(() => import('@/features/admin/manage-joint-positions/ui/pending-requests'))
const ApprovedRequests = React.lazy(() => import('@/features/admin/manage-joint-positions/ui/approved-requests'))
const RejectedRequests = React.lazy(() => import('@/features/admin/manage-joint-positions/ui/rejected-requests'))

export function AdminJointPositionManagementWidget() {
  const [activeTab, setActiveTab] = useState('pending')
  const queryClient = useQueryClient()

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    
    // Force refetch data for the newly active tab to ensure fresh data
    switch (value) {
      case 'pending':
        queryClient.invalidateQueries({ 
          queryKey: ['admin-joint-position-requests', { status: 'in_review' }],
          refetchType: 'active'
        })
        break
      case 'approved':
        queryClient.invalidateQueries({ 
          queryKey: ['admin-joint-position-requests', { status: 'approved' }],
          refetchType: 'active'
        })
        break
      case 'rejected':
        queryClient.invalidateQueries({ 
          queryKey: ['admin-joint-position-requests', { status: 'rejected' }],
          refetchType: 'active'
        })
        break
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Ожидающие</TabsTrigger>
          <TabsTrigger value="approved">Одобренные</TabsTrigger>
          <TabsTrigger value="rejected">Отклоненные</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          <Suspense fallback={<div>Загрузка...</div>}>
            <PendingRequests />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="approved" className="space-y-4">
          <Suspense fallback={<div>Загрузка...</div>}>
            <ApprovedRequests />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="rejected" className="space-y-4">
          <Suspense fallback={<div>Загрузка...</div>}>
            <RejectedRequests />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}