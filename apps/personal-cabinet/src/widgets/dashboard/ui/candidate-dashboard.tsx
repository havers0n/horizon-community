import { User, Activity, Announcement } from '@/entities/user';
import { Card, CardContent, Button, Avatar, AvatarFallback, AvatarImage } from '@/shared/ui';
import { getStatusIcon, getStatusText, getStatusColor, getStatusTextColor, getAnnouncementBorderColor } from '@/shared/lib/status-helpers';
import { formatTimeAgo } from '@/shared/lib/format-time';
import { getUserInitials } from '@/shared/lib/user-helpers';
import { 
  Star,
  Plus as PlusIcon,
  FileText,
  List,
  AlertTriangle,
  Book,
  Lightbulb,
  Clock,
  Award,
} from "lucide-react";

interface CandidateDashboardProps {
  user: User;
  activities: Activity[];
  announcements: Announcement[];
}

export function CandidateDashboard({ user, activities, announcements }: CandidateDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Profile Widget */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatarUrl || undefined} alt="Профиль" />
                <AvatarFallback className="text-lg">
                  {getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Добро пожаловать, {user.firstName || "Кандидат"}!
                </h1>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Статус:</span>{" "}
                    <span className="text-primary font-medium">
                      Кандидат
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Попыток осталось:</span>{" "}
                    <span className="text-orange-600 font-medium">
                      {user.attemptsLeft || 3}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="space-y-2">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Clock className="h-3 w-3 mr-1" />
                  В процессе рассмотрения
                </div>
                <div className="text-xs text-gray-500">
                  <p>
                    Заявок подано:{" "}
                    <span className="font-medium text-blue-600">
                      {activities.filter(a => a.type === 'application').length}
                    </span>
                  </p>
                  <p>
                    Тестов пройдено:{" "}
                    <span className="font-medium text-green-600">
                      {activities.filter(a => a.type === 'test' && a.status === 'approved').length}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grouped Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Быстрые действия
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Application Group */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Star className="text-primary mr-2 h-4 w-4" />
                Заявки
              </h3>
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  className="w-full justify-start p-3 h-auto text-left"
                >
                  <PlusIcon className="text-primary mr-3 h-4 w-4" />
                  <span className="text-sm font-medium text-gray-700">Подать заявку</span>
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start p-3 h-auto text-left"
                >
                  <List className="text-gray-600 mr-3 h-4 w-4" />
                  <span className="text-sm font-medium text-gray-700">Мои заявки</span>
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start p-3 h-auto text-left"
                >
                  <Award className="text-yellow-500 mr-3 h-4 w-4" />
                  <span className="text-sm font-medium text-gray-700">Пройти тест</span>
                </Button>
              </div>
            </div>

            {/* Documents Group */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <FileText className="text-primary mr-2 h-4 w-4" />
                Документы
              </h3>
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  className="w-full justify-start p-3 h-auto text-left"
                >
                  <FileText className="text-primary mr-3 h-4 w-4" />
                  <span className="text-sm font-medium text-gray-700">Правила сообщества</span>
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start p-3 h-auto text-left"
                >
                  <AlertTriangle className="text-yellow-500 mr-3 h-4 w-4" />
                  <span className="text-sm font-medium text-gray-700">FAQ</span>
                </Button>
              </div>
            </div>

            {/* Information Group */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Book className="text-primary mr-2 h-4 w-4" />
                Информация
              </h3>
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  className="w-full justify-start p-3 h-auto text-left"
                >
                  <Book className="text-primary mr-3 h-4 w-4" />
                  <span className="text-sm font-medium text-gray-700">Документация</span>
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start p-3 h-auto text-left"
                >
                  <Lightbulb className="text-yellow-500 mr-3 h-4 w-4" />
                  <span className="text-sm font-medium text-gray-700">Полезная информация</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Мои последние активности
            </h2>
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  У вас пока нет активности
                </p>
              ) : (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg border ${getStatusColor(activity.type, activity.status)}`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(activity.type, activity.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <button className="font-medium hover:underline text-left">
                          {activity.title}
                        </button>
                      </p>
                      <p className={`text-sm font-medium ${getStatusTextColor(activity.type, activity.status)}`}>
                        {getStatusText(activity.type, activity.status)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(activity.createdAt!)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Community Announcements */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Объявления сообщества
              </h2>
              <button className="text-sm text-primary hover:text-primary/90 font-medium">
                Все объявления →
              </button>
            </div>
            <div className="space-y-4">
              {announcements.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Нет активных объявлений
                </p>
              ) : (
                announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`border-l-4 pl-4 py-2 ${getAnnouncementBorderColor(announcement.priority)}`}
                  >
                    <h3 className="font-medium text-gray-900 text-sm">
                      {announcement.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {announcement.preview}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatTimeAgo(announcement.createdAt!)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}