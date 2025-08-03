import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { DashboardStats } from '@/features/dashboard/ui/dashboard-stats'
import { QuickActions } from '@/features/dashboard/ui/quick-actions'
import { RecentActivity } from '@/features/dashboard/ui/recent-activity'
import { ApplicationModal } from '@/features/applications'
import { NotificationsModal } from '@/features/notifications'
import { MDTEmbed } from '@/features/mdt-integration'
import { Plus, Bell, Monitor, FileText, Users, Calendar } from 'lucide-react'
import { Activity } from '@/features/dashboard/model'

export default function DashboardPage() {
  const [showMDT, setShowMDT] = useState(false)

  const mockStats = {
    activeSessions: 3,
    documents: 12,
    timeSpent: '4ч 30м',
    productivity: 85
  }

  const mockActivities: Activity[] = [
    {
      id: '1',
      userId: '1',
      type: 'login',
      description: 'Вход в систему',
      timestamp: new Date().toISOString(),
      metadata: {}
    },
    {
      id: '2',
      userId: '1',
      type: 'profile_update',
      description: 'Обновлен профиль',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      metadata: {}
    },
    {
      id: '3',
      userId: '1',
      type: 'document_upload',
      description: 'Загружен отчет',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      metadata: {}
    }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Панель управления</h1>
          <p className="text-muted-foreground">Добро пожаловать в личный кабинет</p>
        </div>
        <div className="flex items-center space-x-2">
          <NotificationsModal>
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
          </NotificationsModal>
          
          <ApplicationModal>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Создать заявку
            </Button>
          </ApplicationModal>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная статистика */}
        <div className="lg:col-span-2">
          <DashboardStats stats={mockStats} />
        </div>

        {/* Быстрые действия */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent>
              <QuickActions />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Последняя активность */}
        <RecentActivity activities={mockActivities} />

        {/* Интеграции */}
        <Card>
          <CardHeader>
            <CardTitle>Интеграции</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => setShowMDT(true)}
              >
                <Monitor className="h-6 w-6" />
                <span className="text-sm">MDT Система</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => window.location.href = '/reports'}
              >
                <FileText className="h-6 w-6" />
                <span className="text-sm">Отчеты</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => window.location.href = '/departments'}
              >
                <Users className="h-6 w-6" />
                <span className="text-sm">Департаменты</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => window.location.href = '/applications'}
              >
                <Calendar className="h-6 w-6" />
                <span className="text-sm">Заявки</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MDT Embed Modal */}
      {showMDT && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <MDTEmbed onClose={() => setShowMDT(false)} />
          </div>
        </div>
      )}
    </div>
  )
} 