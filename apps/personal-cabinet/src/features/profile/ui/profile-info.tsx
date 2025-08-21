import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Separator } from '@/shared/ui/separator'
import { H3, H4, Muted, Stack } from '@/shared/ui'
import { Shield, Users, Award, AlertTriangle, Building2, Crown, Star, CheckCircle2, Calendar } from 'lucide-react'
import type { UserSession } from '@/shared/contexts/SessionContext'

interface ProfileInfoProps {
  session: UserSession
}

export function ProfileInfo({ session }: ProfileInfoProps) {
  const getUserInitials = (username: string | null) => {
    if (!username) return 'U'
    return username
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getWarningColor = (count: number) => {
    if (count === 0) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    if (count <= 2) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }

  const hasMultiplePositions = (session.memberships?.length || 0) > 1
  const primaryMembership = session.memberships?.find(m => m.is_primary) || session.memberships?.[0]
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Основная информация профиля */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Основная информация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={undefined} alt="Профиль" />
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {getUserInitials(session.user.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div>
                <H3>{session.user.username || 'Не указано'}</H3>
                <Muted>ID: {session.user.id}</Muted>
              </div>
              <div className="flex flex-wrap gap-2">
                {session.roles.map(role => (
                  <Badge key={role.code} variant="outline">
                    {role.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Информация о департаменте и должности */}
          <div className="space-y-4">
            <H4 className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Служебная информация
            </H4>
            
            {session.combinedDepartment ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Muted className="text-xs">Департамент{hasMultiplePositions ? 'ы' : ''}</Muted>
                  <div className="font-medium">{session.combinedDepartment}</div>
                </div>
                {session.combinedRank && (
                  <div>
                    <Muted className="text-xs">Звание{hasMultiplePositions ? ' / звания' : ''}</Muted>
                    <div className="font-medium flex items-center gap-2">
                      <Crown className="h-4 w-4 text-amber-500" />
                      {session.combinedRank}
                    </div>
                  </div>
                )}
                {session.combinedPosition && (
                  <div className="sm:col-span-2">
                    <Muted className="text-xs">Должность{hasMultiplePositions ? ' / должности' : ''}</Muted>
                    <div className="font-medium">{session.combinedPosition}</div>
                  </div>
                )}
              </div>
            ) : (
              <Muted className="text-sm text-muted-foreground">
                Информация о департаменте не найдена
              </Muted>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Статистика предупреждений */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Предупреждения
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Игровые</span>
              <Badge className={getWarningColor(0)}>
                0
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Административные</span>
              <Badge className={getWarningColor(0)}>
                0
              </Badge>
            </div>
          </div>
          <Separator />
          <div className="text-xs text-muted-foreground">
            Предупреждения влияют на статус в сообществе
          </div>
        </CardContent>
      </Card>

      {/* Детальная информация о членстве */}
      {session.memberships && session.memberships.length > 0 && (
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Детали членства
              {hasMultiplePositions && (
                <Badge variant="secondary" className="ml-2">
                  Совмещение
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {session.memberships.map((membership, index) => (
                <Card key={index} className="border-muted">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">
                            {membership.department.name}
                          </div>
                          <Muted className="text-xs">
                            {membership.department.full_name}
                          </Muted>
                        </div>
                        {membership.is_primary && (
                          <Badge variant="default" className="text-xs">
                            Основная
                          </Badge>
                        )}
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Crown className="h-3 w-3 text-amber-500" />
                          <span className="text-sm">{membership.rank.name}</span>
                        </div>
                        
                        {membership.position && (
                          <div className="flex items-center gap-2">
                            <Star className="h-3 w-3 text-blue-500" />
                            <span className="text-sm">{membership.position}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <Badge className={getStatusColor(membership.status.name)} variant="outline">
                            {membership.status.name}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Квалификации */}
      {session.qualifications && session.qualifications.length > 0 && (
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Квалификации
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {session.qualifications.map((qualification, index) => (
                <Card key={index} className="border-muted">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="font-medium text-sm">
                          {qualification.name}
                        </div>
                        <Muted className="text-xs">
                          {qualification.department.full_name || qualification.department.name}
                        </Muted>
                      </div>
                      <Award className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Статусы */}
      {session.statuses && session.statuses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Статусы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {session.statuses.map(status => (
                <Badge key={status} className={getStatusColor(status)}>
                  {status}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Дополнительная информация */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Дополнительная информация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Muted className="text-xs">Заявок за месяц</Muted>
            <div className="font-medium">
              {3 - (session.attemptsLeft || 3)} / 3
            </div>
          </div>
          <div>
            <Muted className="text-xs">Попыток осталось</Muted>
            <div className="font-medium text-amber-600">
              {session.attemptsLeft || 3}
            </div>
          </div>
          <div>
            <Muted className="text-xs">Разрешения</Muted>
            <div className="font-medium text-blue-600">
              {session.permissions?.length || 0}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}