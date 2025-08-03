import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/ui/tabs'
import { LeaveManagementFeature } from '@features/leave-management'

export function LeaveManagementWidget() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="my-leaves" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-leaves">Мои отпуска</TabsTrigger>
          <TabsTrigger value="new-request">Новая заявка</TabsTrigger>
          <TabsTrigger value="history">История</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-leaves" className="space-y-4">
          <LeaveManagementFeature.MyLeaves />
        </TabsContent>
        
        <TabsContent value="new-request" className="space-y-4">
          <LeaveManagementFeature.NewRequest />
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <LeaveManagementFeature.History />
        </TabsContent>
      </Tabs>
    </div>
  )
} 