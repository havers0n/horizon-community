import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plane, 
  CalendarDays, 
  BarChart3, 
  AlertTriangle,
  Users,
  Building,
  Eye,
  Check,
  X
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ru } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LeaveApplication {
  id: number;
  type: string;
  status: string;
  data: any;
  createdAt: string;
  updatedAt: string;
  reviewComment?: string;
  author?: {
    id: number;
    username: string;
    rank: string;
    department?: {
      id: number;
      name: string;
    };
  };
}

interface LeaveStats {
  totalStats: {
    totalApplications: number;
    approvedApplications: number;
    pendingApplications: number;
    rejectedApplications: number;
    totalDays: number;
  };
  departmentStats: Record<number, {
    name: string;
    totalLeaves: number;
    approvedLeaves: number;
    pendingLeaves: number;
    totalDays: number;
    leaveTypes: Record<string, number>;
  }>;
}

function AdminLeaveManagement() {
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Получаем все заявки на отпуск
  const { data: leaveApplications = [], isLoading: isApplicationsLoading } = useQuery<LeaveApplication[]>({
    queryKey: ['/api/admin/leave-applications']
  });

  // Получаем статистику отпусков
  const { data: leaveStats, isLoading: isStatsLoading } = useQuery<LeaveStats>({
    queryKey: ['/api/admin/leave-stats']
  });

  // Мутация для обновления статуса заявки
  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, status, comment }: { id: number; status: string; comment?: string }) => {
      const response = await apiRequest('PUT', `/api/admin/applications/${id}`, {
        status,
        reviewComment: comment
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/leave-applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/leave-stats'] });
      setIsReviewDialogOpen(false);
      setSelectedApplication(null);
      setReviewComment("");
      toast({
        title: "Успешно",
        description: "Статус заявки обновлен"
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус заявки",
        variant: "destructive"
      });
    }
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

  const handleReview = (application: LeaveApplication) => {
    setSelectedApplication(application);
    setReviewComment(application.reviewComment || "");
    setIsReviewDialogOpen(true);
  };

  const handleApprove = () => {
    if (selectedApplication) {
      updateApplicationMutation.mutate({ 
        id: selectedApplication.id, 
        status: 'approved', 
        comment: reviewComment 
      });
    }
  };

  const handleReject = () => {
    if (selectedApplication) {
      updateApplicationMutation.mutate({ 
        id: selectedApplication.id, 
        status: 'rejected', 
        comment: reviewComment 
      });
    }
  };

  const pendingApplications = leaveApplications.filter(app => app.status === 'pending');
  const approvedApplications = leaveApplications.filter(app => app.status === 'approved');
  const rejectedApplications = leaveApplications.filter(app => app.status === 'rejected');

  if (isApplicationsLoading || isStatsLoading) {
    return <div className="flex items-center justify-center min-h-96">Загрузка данных...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Административное управление отпусками</h1>
        <p className="text-muted-foreground">
          Управление заявками на отпуск и просмотр статистики по всем департаментам.
        </p>
      </div>

      <Tabs defaultValue="applications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="applications">Заявки</TabsTrigger>
          <TabsTrigger value="stats">Статистика</TabsTrigger>
          <TabsTrigger value="departments">По департаментам</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Заявки на отпуск</h2>
            <div className="flex gap-2">
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {pendingApplications.length} в ожидании
              </Badge>
              <Badge variant="default" className="gap-1 bg-green-600">
                <CheckCircle className="h-3 w-3" />
                {approvedApplications.length} одобрено
              </Badge>
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                {rejectedApplications.length} отклонено
              </Badge>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Сотрудник</TableHead>
                    <TableHead>Департамент</TableHead>
                    <TableHead>Тип отпуска</TableHead>
                    <TableHead>Период</TableHead>
                    <TableHead>Дней</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Подана</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveApplications.map((application) => {
                    const data = application.data as any;
                    const startDate = new Date(data.startDate);
                    const endDate = new Date(data.endDate);
                    const days = differenceInDays(endDate, startDate) + 1;
                    
                    return (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                              {application.author?.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{application.author?.username}</div>
                              <div className="text-sm text-muted-foreground">{application.author?.rank}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {application.author?.department?.name || 'Не указан'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getLeaveTypeColor(data.leaveType)}>
                            {getLeaveTypeLabel(data.leaveType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{format(startDate, 'dd.MM.yyyy')}</div>
                            <div className="text-muted-foreground">до {format(endDate, 'dd.MM.yyyy')}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{days}</span>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(application.status)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(application.createdAt), 'dd.MM.yyyy')}
                        </TableCell>
                        <TableCell>
                          {application.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReview(application)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {application.status !== 'pending' && application.reviewComment && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Комментарий администратора</DialogTitle>
                                </DialogHeader>
                                <div className="p-4 bg-muted rounded-lg">
                                  <p className="text-sm">{application.reviewComment}</p>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Общая статистика отпусков</h2>
            <p className="text-muted-foreground">
              Статистика по всем заявкам на отпуск в системе.
            </p>
          </div>

          {leaveStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Всего заявок</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leaveStats.totalStats.totalApplications}</div>
                  <p className="text-xs text-muted-foreground">
                    за все время
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Одобрено</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {leaveStats.totalStats.approvedApplications}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {leaveStats.totalStats.totalApplications > 0 
                      ? Math.round((leaveStats.totalStats.approvedApplications / leaveStats.totalStats.totalApplications) * 100)
                      : 0}% от общего числа
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">В ожидании</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {leaveStats.totalStats.pendingApplications}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    требуют рассмотрения
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Всего дней</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {leaveStats.totalStats.totalDays}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    одобренных отпусков
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Статистика по департаментам</h2>
            <p className="text-muted-foreground">
              Детальная статистика использования отпусков по департаментам.
            </p>
          </div>

          {leaveStats && (
            <div className="grid gap-6">
              {Object.entries(leaveStats.departmentStats).map(([deptId, stats]) => (
                <Card key={deptId}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      {stats.name}
                    </CardTitle>
                    <CardDescription>
                      Статистика отпусков в департаменте
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-2xl font-bold">{stats.totalLeaves}</div>
                        <div className="text-sm text-muted-foreground">Всего заявок</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{stats.approvedLeaves}</div>
                        <div className="text-sm text-muted-foreground">Одобрено</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pendingLeaves}</div>
                        <div className="text-sm text-muted-foreground">В ожидании</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{stats.totalDays}</div>
                        <div className="text-sm text-muted-foreground">Всего дней</div>
                      </div>
                    </div>

                    {Object.keys(stats.leaveTypes).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">По типам отпусков:</h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(stats.leaveTypes).map(([type, days]) => (
                            <Badge key={type} className={getLeaveTypeColor(type)}>
                              {getLeaveTypeLabel(type)}: {days} дн.
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Диалог рассмотрения заявки */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Рассмотрение заявки на отпуск</DialogTitle>
            <DialogDescription>
              Просмотрите детали заявки и примите решение
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Сотрудник</label>
                  <div className="text-sm">{selectedApplication.author?.username}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Департамент</label>
                  <div className="text-sm">{selectedApplication.author?.department?.name || 'Не указан'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Тип отпуска</label>
                  <div className="text-sm">
                    <Badge className={getLeaveTypeColor(selectedApplication.data.leaveType)}>
                      {getLeaveTypeLabel(selectedApplication.data.leaveType)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Период</label>
                  <div className="text-sm">
                    {format(new Date(selectedApplication.data.startDate), 'dd.MM.yyyy')} - {format(new Date(selectedApplication.data.endDate), 'dd.MM.yyyy')}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Причина</label>
                <div className="text-sm p-3 bg-muted rounded-lg">
                  {selectedApplication.data.reason}
                </div>
              </div>

              {selectedApplication.data.additionalNotes && (
                <div>
                  <label className="text-sm font-medium">Дополнительные заметки</label>
                  <div className="text-sm p-3 bg-muted rounded-lg">
                    {selectedApplication.data.additionalNotes}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Комментарий администратора</label>
                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Введите комментарий к решению..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsReviewDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={updateApplicationMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Отклонить
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={updateApplicationMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Одобрить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminLeaveManagement; 