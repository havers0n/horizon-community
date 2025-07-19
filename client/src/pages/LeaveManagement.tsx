import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CalendarIcon, Clock, CheckCircle, XCircle, Plane, CalendarDays, BarChart3, AlertTriangle } from "lucide-react";
import { format, differenceInDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval } from "date-fns";
import { ru } from "date-fns/locale";
import { LeaveModal } from "@/components/LeaveModal";

interface LeaveApplication {
  id: number;
  type: string;
  status: string;
  data: any;
  createdAt: string;
  updatedAt: string;
  reviewComment?: string;
}

interface LeaveStats {
  currentYear: {
    totalDays: number;
    usedDays: number;
    remainingDays: number;
    leaveTypes: Record<string, number>;
  };
  activeLeave?: {
    id: number;
    type: string;
    startDate: string;
    endDate: string;
    daysRemaining: number;
  };
  upcomingLeaves: Array<{
    id: number;
    type: string;
    startDate: string;
    endDate: string;
    daysUntilStart: number;
  }>;
}

function LeaveManagement() {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Получаем заявки на отпуск пользователя
  const { data: leaveApplications = [], isLoading: isApplicationsLoading } = useQuery<LeaveApplication[]>({
    queryKey: ['/api/applications'],
    select: (applications) => applications.filter(app => app.type === 'leave')
  });

  // Получаем статистику отпусков
  const { data: leaveStats, isLoading: isStatsLoading } = useQuery<LeaveStats>({
    queryKey: ['/api/leave-stats']
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> В ожидании</Badge>;
      case 'approved':
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" /> Одобрено</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Отклонено</Badge>;
      case 'closed':
        return <Badge variant="outline" className="gap-1">Завершено</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      vacation: 'Отпуск',
      sick: 'Больничный',
      personal: 'Личный',
      emergency: 'Экстренный',
      medical: 'Медицинский',
      maternity: 'Декретный',
      bereavement: 'Траурный'
    };
    return labels[type] || type;
  };

  const getLeaveTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      vacation: "bg-blue-100 text-blue-800",
      sick: "bg-red-100 text-red-800",
      personal: "bg-purple-100 text-purple-800",
      emergency: "bg-orange-100 text-orange-800",
      medical: "bg-green-100 text-green-800",
      maternity: "bg-pink-100 text-pink-800",
      bereavement: "bg-gray-100 text-gray-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  // Генерация календаря
  const generateCalendarDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    // Получаем одобренные отпуска для текущего месяца
    const approvedLeaves = leaveApplications.filter(app => app.status === 'approved');

    return days.map(day => {
      const dayLeaves = approvedLeaves.filter(app => {
        const data = app.data as any;
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        return isWithinInterval(day, { start: startDate, end: endDate });
      });

      return {
        date: day,
        leaves: dayLeaves,
        isToday: isSameDay(day, new Date()),
        isCurrentMonth: day.getMonth() === currentMonth.getMonth()
      };
    });
  };

  const calendarDays = generateCalendarDays();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  if (isApplicationsLoading || isStatsLoading) {
    return <div className="flex items-center justify-center min-h-96">Загрузка отпусков...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Управление отпусками</h1>
        <p className="text-muted-foreground">
          Планируйте и отслеживайте ваши отпуска и время отдыха.
        </p>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calendar">Календарь</TabsTrigger>
          <TabsTrigger value="stats">Статистика</TabsTrigger>
          <TabsTrigger value="history">История</TabsTrigger>
          <TabsTrigger value="request">Подать заявку</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Календарь отпусков</h2>
            <LeaveModal>
              <Button className="gap-2">
                <Plane className="h-4 w-4" />
                Подать заявку на отпуск
              </Button>
            </LeaveModal>
          </div>

          {/* Навигация по месяцам */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => navigateMonth('prev')}
            >
              ← Предыдущий месяц
            </Button>
            <h3 className="text-lg font-medium">
              {format(currentMonth, 'MMMM yyyy', { locale: ru })}
            </h3>
            <Button
              variant="outline"
              onClick={() => navigateMonth('next')}
            >
              Следующий месяц →
            </Button>
          </div>

          {/* Календарь */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                  <div key={day} className="text-center font-medium text-sm text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`
                      min-h-[80px] p-2 border rounded-lg relative
                      ${day.isToday ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}
                      ${!day.isCurrentMonth ? 'opacity-50' : ''}
                    `}
                  >
                    <div className="text-sm font-medium mb-1">
                      {format(day.date, 'd')}
                    </div>
                    
                    {day.leaves.map((leave, leaveIndex) => {
                      const data = leave.data as any;
                      return (
                        <div
                          key={leaveIndex}
                          className={`
                            text-xs p-1 rounded mb-1 truncate
                            ${getLeaveTypeColor(data.leaveType)}
                          `}
                          title={`${getLeaveTypeLabel(data.leaveType)} - ${data.reason}`}
                        >
                          {getLeaveTypeLabel(data.leaveType)}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Статистика отпусков</h2>
            <p className="text-muted-foreground">
              Обзор использования отпусков за текущий год.
            </p>
          </div>

          {leaveStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Общая статистика */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Использовано дней</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leaveStats.currentYear.usedDays}</div>
                  <p className="text-xs text-muted-foreground">
                    из {leaveStats.currentYear.totalDays} дней
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Осталось дней</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {leaveStats.currentYear.remainingDays}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    доступно в этом году
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Активный отпуск</CardTitle>
                </CardHeader>
                <CardContent>
                  {leaveStats.activeLeave ? (
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        {leaveStats.activeLeave.daysRemaining} дней
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {getLeaveTypeLabel(leaveStats.activeLeave.type)}
                      </p>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Нет активного отпуска
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Предстоящие отпуска</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {leaveStats.upcomingLeaves.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    запланировано
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Детальная статистика по типам */}
          {leaveStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Статистика по типам отпусков
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(leaveStats.currentYear.leaveTypes).map(([type, days]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getLeaveTypeColor(type)}>
                          {getLeaveTypeLabel(type)}
                        </Badge>
                      </div>
                      <span className="font-medium">{days} дней</span>
                    </div>
                  ))}
                  {Object.keys(leaveStats.currentYear.leaveTypes).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Нет использованных отпусков в этом году
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Предстоящие отпуска */}
          {leaveStats && leaveStats.upcomingLeaves.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Предстоящие отпуска
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaveStats.upcomingLeaves.slice(0, 5).map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={getLeaveTypeColor(leave.type)}>
                          {getLeaveTypeLabel(leave.type)}
                        </Badge>
                        <div>
                          <div className="font-medium">
                            {format(new Date(leave.startDate), 'dd.MM.yyyy')} - {format(new Date(leave.endDate), 'dd.MM.yyyy')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Через {leave.daysUntilStart} дней
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">История отпусков</h2>
            <p className="text-muted-foreground">
              Все ваши заявки на отпуск и их статусы.
            </p>
          </div>

          {leaveApplications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">История пуста</h3>
                <p className="text-muted-foreground mb-4">
                  Вы еще не подавали заявки на отпуск.
                </p>
                <LeaveModal>
                  <Button>
                    Подать первую заявку
                  </Button>
                </LeaveModal>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {leaveApplications.map((application) => {
                const data = application.data as any;
                const startDate = new Date(data.startDate);
                const endDate = new Date(data.endDate);
                const days = differenceInDays(endDate, startDate) + 1;
                
                return (
                  <Card key={application.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Badge className={getLeaveTypeColor(data.leaveType)}>
                              {getLeaveTypeLabel(data.leaveType)}
                            </Badge>
                            {getStatusBadge(application.status)}
                          </div>
                          <div className="space-y-1 text-sm">
                            <div>
                              <span className="text-muted-foreground">Период: </span>
                              <span className="font-medium">
                                {format(startDate, 'dd.MM.yyyy')} - {format(endDate, 'dd.MM.yyyy')}
                              </span>
                              <span className="text-muted-foreground"> ({days} дней)</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Причина: </span>
                              <span>{data.reason}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Подана: </span>
                              <span>{format(new Date(application.createdAt), 'dd.MM.yyyy')}</span>
                            </div>
                            {application.reviewComment && (
                              <div className="mt-3 p-3 bg-muted rounded-lg">
                                <p className="text-sm font-medium mb-1">Комментарий администратора:</p>
                                <p className="text-sm">{application.reviewComment}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="request" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Подать заявку на отпуск</h2>
            <p className="text-muted-foreground mb-6">
              Заполните форму для подачи заявки на отпуск.
            </p>
          </div>

          <Card>
            <CardContent className="p-8 text-center">
              <Plane className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Готовы подать заявку?</h3>
              <p className="text-muted-foreground mb-4">
                Убедитесь, что у вас есть веские причины для отпуска и необходимые документы.
              </p>
              <LeaveModal>
                <Button size="lg" className="gap-2">
                  <Plane className="h-4 w-4" />
                  Подать заявку на отпуск
                </Button>
              </LeaveModal>
            </CardContent>
          </Card>

          {/* Информация о политике отпусков */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="space-y-2">
                  <div className="font-medium text-yellow-800">Политика отпусков:</div>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Подавайте заявки на отпуск минимум за 2 недели</li>
                    <li>• Экстренные и больничные отпуска можно подавать задним числом</li>
                    <li>• Максимум 2 заявки на отпуск в месяц</li>
                    <li>• Требуется одобрение супервайзера</li>
                    <li>• Длительные отпуска (7+ дней) могут требовать дополнительных документов</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LeaveManagement; 