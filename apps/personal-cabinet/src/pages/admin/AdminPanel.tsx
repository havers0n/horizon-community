import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Progress } from '@/shared/ui/progress'
import { useSession } from '@/shared/contexts/SessionContext'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { 
  Users, 
  FileText, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  UserPlus,
  Settings,
  BarChart3
} from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  pendingApplications: number
  approvedApplications: number
  totalDepartments: number
  systemHealth: number
}

interface RecentActivity {
  id: string
  type: 'user_registration' | 'application_submitted' | 'application_approved' | 'system_alert'
  title: string
  description: string
  timestamp: Date
  user?: string
}

const AdminPanel: React.FC = () => {
  const { isLoading } = useSession()
  const { isLoggedIn, isAdmin } = usePermissions()

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">Загрузка...</div>
    )
  }

  if (!isLoggedIn || !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    totalDepartments: 0,
    systemHealth: 0
  })

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])

  useEffect(() => {
    // Mock data
    setStats({
      totalUsers: 1250,
      activeUsers: 892,
      pendingApplications: 23,
      approvedApplications: 156,
      totalDepartments: 8,
      systemHealth: 98
    })

    setRecentActivity([
      {
        id: '1',
        type: 'user_registration',
        title: 'Новый пользователь зарегистрирован',
        description: 'Иван Петров присоединился к системе',
        timestamp: new Date('2024-07-10T10:30:00'),
        user: 'Иван Петров'
      },
      {
        id: '2',
        type: 'application_submitted',
        title: 'Подана заявка на отпуск',
        description: 'Мария Сидорова подала заявку на отпуск',
        timestamp: new Date('2024-07-10T09:15:00'),
        user: 'Мария Сидорова'
      },
      {
        id: '3',
        type: 'application_approved',
        title: 'Заявка одобрена',
        description: 'Заявка на перевод департамента одобрена',
        timestamp: new Date('2024-07-10T08:45:00'),
        user: 'Алексей Козлов'
      }
    ])
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <UserPlus className="h-4 w-4 text-blue-500" />
      case 'application_submitted':
        return <FileText className="h-4 w-4 text-orange-500" />
      case 'application_approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'system_alert':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <Badge variant="default">Регистрация</Badge>
      case 'application_submitted':
        return <Badge variant="secondary">Заявка</Badge>
      case 'application_approved':
        return <Badge variant="outline">Одобрено</Badge>
      case 'system_alert':
        return <Badge variant="destructive">Алерт</Badge>
      default:
        return <Badge variant="outline">Другое</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Админ панель</h1>
          <p className="text-muted-foreground">Управление системой и мониторинг</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Настройки
          </Button>
          <Button>
            <BarChart3 className="h-4 w-4 mr-2" />
            Подробная статистика
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.activeUsers} активных
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Заявки на рассмотрении</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">
              {stats.approvedApplications} одобрено
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Департаменты</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDepartments}</div>
            <p className="text-xs text-muted-foreground">
              Активных отделов
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Состояние системы</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.systemHealth}%</div>
            <Progress value={stats.systemHealth} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="activity">Активность</TabsTrigger>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>Состояние системы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Сервер</span>
                    <Badge variant="default">Онлайн</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">База данных</span>
                    <Badge variant="default">Онлайн</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Файловое хранилище</span>
                    <Badge variant="default">Онлайн</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email сервис</span>
                    <Badge variant="secondary">Внимание</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Быстрые действия</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Управление пользователями
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Просмотр заявок
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Управление отпусками
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Настройки системы
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Последняя активность</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <div className="flex items-center space-x-2">
                          {getActivityBadge(activity.type)}
                          <span className="text-xs text-muted-foreground">
                            {activity.timestamp.toLocaleString('ru-RU')}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      {activity.user && (
                        <p className="text-xs text-muted-foreground">
                          Пользователь: {activity.user}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Последние пользователи</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Департамент</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата регистрации</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/avatars/01.png" />
                          <AvatarFallback>ИП</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">Иван Петров</div>
                          <div className="text-sm text-muted-foreground">EMP001</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>ivan.petrov@company.com</TableCell>
                    <TableCell>IT</TableCell>
                    <TableCell>
                      <Badge variant="default">Активен</Badge>
                    </TableCell>
                    <TableCell>10.07.2024</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/avatars/02.png" />
                          <AvatarFallback>МС</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">Мария Сидорова</div>
                          <div className="text-sm text-muted-foreground">EMP002</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>maria.sidorova@company.com</TableCell>
                    <TableCell>HR</TableCell>
                    <TableCell>
                      <Badge variant="default">Активен</Badge>
                    </TableCell>
                    <TableCell>09.07.2024</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminPanel 