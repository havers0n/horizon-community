import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { DashboardStats } from '@/features/dashboard/ui/dashboard-stats'
import { QuickActions } from '@/features/dashboard/ui/quick-actions'
import { ApplicationModal } from '@/features/applications'
import { AchievementsModal } from '@/features/achievements'
import { ComplaintModal } from '@/features/complaints'
import { SupportModal } from '@/features/support'
import { EntryApplicationModal } from '@/features/entry-application'
import { LeaveModal } from '@/features/leave-management'
import { TransferModal } from '@/features/transfer-department'
import { JointModal } from '@/features/joint-positions'
import { Plus, Bell, Trophy, AlertTriangle, HelpCircle, UserPlus, CalendarDays, Building2, Handshake } from 'lucide-react'

// Расширенный интерфейс для Activity
interface ExtendedActivity {
  id: string
  type: string
  title: string
  description: string
  timestamp: Date
  status: string
}

export default function DashboardPage() {
  
  const mockActivities: ExtendedActivity[] = [
    {
      id: '1',
      type: 'application',
      title: 'Заявка на повышение одобрена',
      description: 'Ваша заявка на повышение до старшего офицера была одобрена',
      timestamp: new Date('2024-01-15T10:30:00'),
      status: 'completed'
    },
    {
      id: '2',
      type: 'leave',
      title: 'Заявка на отпуск',
      description: 'Заявка на ежегодный отпуск с 1 по 15 февраля',
      timestamp: new Date('2024-01-14T14:20:00'),
      status: 'pending'
    },
    {
      id: '3',
      type: 'transfer',
      title: 'Перевод в следственный отдел',
      description: 'Заявка на перевод в следственный отдел рассмотрена',
      timestamp: new Date('2024-01-13T09:15:00'),
      status: 'approved'
    }
  ]

  const mockStats = {
    activeSessions: 5,
    documents: 12,
    timeSpent: '18 дней',
    productivity: 85
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Панель управления</h1>
          <p className="text-muted-foreground">Добро пожаловать в личный кабинет</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          
          <AchievementsModal>
            <Button variant="outline" size="icon">
              <Trophy className="h-4 w-4" />
            </Button>
          </AchievementsModal>

          <ComplaintModal>
            <Button variant="outline" size="icon">
              <AlertTriangle className="h-4 w-4" />
            </Button>
          </ComplaintModal>

          <SupportModal>
            <Button variant="outline" size="icon">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </SupportModal>
          
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
        {/* Недавняя активность */}
        <Card>
          <CardHeader>
            <CardTitle>Недавняя активность</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{activity.title}</h4>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.timestamp.toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                    activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {activity.status === 'completed' ? 'Завершено' :
                     activity.status === 'pending' ? 'На рассмотрении' : 'Одобрено'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>


      </div>

      {/* Новые модальные окна */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <EntryApplicationModal>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <UserPlus className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Заявка на вступление</h3>
                  <p className="text-sm text-muted-foreground">Подать заявку на вступление в организацию</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </EntryApplicationModal>

        <LeaveModal>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CalendarDays className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Управление отпусками</h3>
                  <p className="text-sm text-muted-foreground">Подать заявку на отпуск или посмотреть историю</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </LeaveModal>

        <TransferModal>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Переводы</h3>
                  <p className="text-sm text-muted-foreground">Заявка на перевод между департаментами</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TransferModal>

        <JointModal>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Handshake className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Совместные позиции</h3>
                  <p className="text-sm text-muted-foreground">Управление совместными позициями</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </JointModal>
      </div>


    </div>
  )
} 