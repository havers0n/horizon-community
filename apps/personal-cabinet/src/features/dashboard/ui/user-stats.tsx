import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui'
import { useCabinet } from '@shared/hooks'
import { 
  FileText, 
  Building2, 
  ClipboardList, 
  Clock
} from 'lucide-react'

export function UserStats() {
  const { stats, statsLoading, statsError } = useCabinet()

  if (statsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (statsError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Ошибка загрузки статистики
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Нет данных'
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Заявки</CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.applicationsCount || 0}</div>
          <p className="text-xs text-muted-foreground">
            Всего подано заявок
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Активность</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.applicationsCount || 0}</div>
          <p className="text-xs text-muted-foreground">
            Активных заявок
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Департаменты</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.departmentsCount || 0}</div>
          <p className="text-xs text-muted-foreground">
            Участвует в департаментах
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Последняя активность</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium">
            {formatDate(stats?.lastActivity)}
          </div>
          <p className="text-xs text-muted-foreground">
            Последний вход в систему
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 