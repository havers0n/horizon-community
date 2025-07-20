import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Users, Clock, CheckCircle, XCircle, Eye, Trash2, AlertTriangle, FileText } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { JointModal } from "@/components/JointModal";
import { Layout } from "@/components/Layout";

interface JointPosition {
  id: number;
  userId: number;
  primaryDepartmentId: number;
  secondaryDepartmentId: number;
  secondaryDepartment: {
    id: number;
    name: string;
    fullName: string;
    description?: string;
  };
  type: string;
  status: string;
  approvedAt?: string;
  reason: string;
}

interface JointApplication {
  id: number;
  type: string;
  status: string;
  data: any;
  createdAt: string;
  updatedAt: string;
  reviewComment?: string;
}

function JointPositions() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedJoint, setSelectedJoint] = useState<JointPosition | null>(null);
  const [removeReason, setRemoveReason] = useState("");

  // Получаем активные совмещения пользователя
  const { data: activeJoints = [], isLoading: isActiveLoading } = useQuery<JointPosition[]>({
    queryKey: ['/api/joint-positions']
  });

  // Получаем историю заявок на совмещение
  const { data: jointApplications = [], isLoading: isHistoryLoading } = useQuery<JointApplication[]>({
    queryKey: ['/api/applications'],
    select: (applications) => applications.filter(app => 
      app.type === 'joint_primary' || app.type === 'joint_secondary'
    )
  });

  // Мутация для снятия совмещения
  const removeJointMutation = useMutation({
    mutationFn: async (data: { userId: number; reason?: string }) => {
      const response = await apiRequest('DELETE', `/api/joint-positions/${data.userId}`, {
        reason: data.reason
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/joint-positions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      setIsRemoveModalOpen(false);
      setSelectedJoint(null);
      setRemoveReason("");
      toast({
        title: "Совмещение снято",
        description: "Ваше совмещение было успешно снято."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось снять совмещение",
        variant: "destructive"
      });
    }
  });

  const handleRemoveJoint = () => {
    if (!selectedJoint) return;
    
    removeJointMutation.mutate({
      userId: selectedJoint.userId,
      reason: removeReason || undefined
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> В ожидании</Badge>;
      case 'approved':
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" /> Одобрено</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Отклонено</Badge>;
      case 'active':
        return <Badge variant="default" className="gap-1 bg-blue-600"><CheckCircle className="h-3 w-3" /> Активно</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getJointTypeLabel = (type: string) => {
    switch (type) {
      case 'joint_primary':
        return 'Основное совмещение';
      case 'joint_secondary':
        return 'Дополнительное совмещение';
      default:
        return type;
    }
  };

  if (isActiveLoading || isHistoryLoading) {
    return <div className="flex items-center justify-center min-h-96">Загрузка совмещений...</div>;
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Совмещения</h1>
          <p className="text-muted-foreground">
            Управляйте своими совмещениями в различных департаментах.
          </p>
        </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Активные совмещения</TabsTrigger>
          <TabsTrigger value="history">История заявок</TabsTrigger>
          <TabsTrigger value="apply">Подать заявку</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Активные совмещения</h2>
            <JointModal>
              <Button className="gap-2" disabled={activeJoints.length > 0}>
                <Building2 className="h-4 w-4" />
                Подать заявку на совмещение
              </Button>
            </JointModal>
          </div>

          {activeJoints.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Нет активных совмещений</h3>
                <p className="text-muted-foreground mb-4">
                  У вас пока нет активных совмещений. Подайте заявку, чтобы начать работать в дополнительном департаменте.
                </p>
                <JointModal>
                  <Button>
                    Подать первую заявку
                  </Button>
                </JointModal>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeJoints.map((joint) => (
                <Card key={joint.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{joint.secondaryDepartment.fullName}</CardTitle>
                          <CardDescription>
                            {getJointTypeLabel(joint.type)}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(joint.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedJoint(joint);
                            setIsRemoveModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Обоснование:</Label>
                        <p className="text-sm text-muted-foreground mt-1">{joint.reason}</p>
                      </div>
                      {joint.approvedAt && (
                        <div>
                          <Label className="text-sm font-medium">Дата одобрения:</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(joint.approvedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {joint.secondaryDepartment.description && (
                        <div>
                          <Label className="text-sm font-medium">Описание департамента:</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {joint.secondaryDepartment.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">История заявок на совмещение</h2>
            <p className="text-muted-foreground">
              Просмотрите все ваши заявки на совмещение и их статусы.
            </p>
          </div>

          {jointApplications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">История пуста</h3>
                <p className="text-muted-foreground">
                  Вы еще не подавали заявки на совмещение.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {jointApplications.map((application) => (
                <Card key={application.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">
                            Заявка #{application.id.toString().padStart(3, '0')}
                          </span>
                          {getStatusBadge(application.status)}
                        </div>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="text-muted-foreground">Тип: </span>
                            <span>{getJointTypeLabel(application.type)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Подана: </span>
                            <span>{new Date(application.createdAt).toLocaleDateString()}</span>
                          </div>
                          {application.reviewComment && (
                            <div className="mt-3 p-3 bg-muted rounded-lg">
                              <p className="text-sm font-medium mb-1">Комментарий администратора:</p>
                              <p className="text-sm">{application.reviewComment}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Показать детали заявки
                            toast({
                              title: "Детали заявки",
                              description: `Обоснование: ${(application.data as any)?.reason || 'Не указано'}`
                            });
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="apply" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Подать заявку на совмещение</h2>
            <p className="text-muted-foreground mb-6">
              Подайте заявку на работу в дополнительном департаменте.
            </p>
          </div>

          {activeJoints.length > 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Активное совмещение</h3>
                <p className="text-muted-foreground mb-4">
                  У вас уже есть активное совмещение. Для подачи новой заявки необходимо сначала снять текущее совмещение.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedJoint(activeJoints[0]);
                    setIsRemoveModalOpen(true);
                  }}
                >
                  Снять текущее совмещение
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Building2 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Готовы подать заявку?</h3>
                <p className="text-muted-foreground mb-4">
                  Заполните форму заявки на совмещение. Убедитесь, что у вас есть веские причины для совмещения.
                </p>
                <JointModal>
                  <Button size="lg" className="gap-2">
                    <Building2 className="h-4 w-4" />
                    Подать заявку на совмещение
                  </Button>
                </JointModal>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Модальное окно снятия совмещения */}
      <Dialog open={isRemoveModalOpen} onOpenChange={setIsRemoveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Снять совмещение</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите снять совмещение? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedJoint && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="font-medium mb-2">Совмещение для снятия:</div>
                <div className="text-sm text-muted-foreground">
                  {selectedJoint.secondaryDepartment.fullName}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="remove-reason">Причина снятия (необязательно)</Label>
              <Textarea
                id="remove-reason"
                placeholder="Укажите причину снятия совмещения..."
                value={removeReason}
                onChange={(e) => setRemoveReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsRemoveModalOpen(false)}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveJoint}
              disabled={removeJointMutation.isPending}
            >
              {removeJointMutation.isPending ? 'Снятие...' : 'Снять совмещение'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </Layout>
  );
}

export default JointPositions; 