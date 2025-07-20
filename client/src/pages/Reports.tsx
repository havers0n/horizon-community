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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Upload, FileText, Clock, CheckCircle, XCircle, Eye, Plus, Settings, ArrowLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Report, ReportTemplate, FilledReport, Department } from "@shared/schema";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import TemplateEditor from "@/components/TemplateEditor";
import ReportFiller from "@/components/ReportFiller";
import InteractivePDFForm from "@/components/InteractivePDFForm";
import TemplateManager from "@/components/TemplateManager";
import TemplateBrowser from "@/components/TemplateBrowser";

type ViewMode = 'browse' | 'fill' | 'manage' | 'edit' | 'my-reports' | 'interactive';

function Reports() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<FilledReport | null>(null);

  // Проверяем права администратора
  const isAdmin = user?.role === 'admin' || user?.role === 'supervisor';

  // Загружаем шаблоны рапортов
  const { data: templates = [], isLoading: templatesLoading } = useQuery<ReportTemplate[]>({
    queryKey: ['/api/report-templates'],
    enabled: true
  });

  // Загружаем департаменты
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
    enabled: true
  });

  // Загружаем заполненные рапорты пользователя
  const { data: filledReports = [], isLoading: reportsLoading } = useQuery<FilledReport[]>({
    queryKey: ['/api/filled-reports'],
    enabled: true
  });

  // Мутация для создания шаблона
  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: Partial<ReportTemplate>) => {
      const response = await apiRequest('POST', '/api/report-templates', templateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/report-templates'] });
      setViewMode('manage');
      toast({
        title: "Шаблон создан",
        description: "Новый шаблон рапорта успешно создан"
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать шаблон",
        variant: "destructive"
      });
    }
  });

  // Мутация для обновления шаблона
  const updateTemplateMutation = useMutation({
    mutationFn: async (templateData: Partial<ReportTemplate>) => {
      const response = await apiRequest('PUT', `/api/report-templates/${editingTemplate?.id}`, templateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/report-templates'] });
      setViewMode('manage');
      setEditingTemplate(null);
      toast({
        title: "Шаблон обновлен",
        description: "Шаблон рапорта успешно обновлен"
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить шаблон",
        variant: "destructive"
      });
    }
  });

  // Мутация для удаления шаблона
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      await apiRequest('DELETE', `/api/report-templates/${templateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/report-templates'] });
      toast({
        title: "Шаблон удален",
        description: "Шаблон рапорта успешно удален"
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить шаблон",
        variant: "destructive"
      });
    }
  });

  // Мутация для отправки заполненного рапорта
  const submitFilledReportMutation = useMutation({
    mutationFn: async (reportData: {
      templateId: number;
      title: string;
      content: string;
    }) => {
      const response = await apiRequest('POST', '/api/filled-reports', reportData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/filled-reports'] });
      setViewMode('my-reports');
      toast({
        title: "Рапорт отправлен",
        description: "Ваш рапорт успешно отправлен на рассмотрение"
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить рапорт",
        variant: "destructive"
      });
    }
  });

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setViewMode('edit');
  };

  const handleEditTemplate = (template: ReportTemplate) => {
    setEditingTemplate(template);
    setViewMode('edit');
  };

  const handleDeleteTemplate = (templateId: number) => {
    deleteTemplateMutation.mutate(templateId);
  };

  const handleSaveTemplate = (templateData: Partial<ReportTemplate>) => {
    if (editingTemplate) {
      updateTemplateMutation.mutate(templateData);
    } else {
      createTemplateMutation.mutate(templateData);
    }
  };

  const handleSelectTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setViewMode('fill');
  };

  const handleSubmitFilledReport = async (reportData: {
    templateId: number;
    title: string;
    content: string;
  }) => {
    await submitFilledReportMutation.mutateAsync(reportData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="gap-1"><FileText className="h-3 w-3" /> Черновик</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Отправлен</Badge>;
      case 'approved':
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" /> Одобрен</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Отклонен</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderView = () => {
    switch (viewMode) {
      case 'browse':
        return (
          <TemplateBrowser
            templates={templates}
            departments={departments}
            onSelectTemplate={handleSelectTemplate}
            userDepartmentId={(user as any)?.departmentId}
          />
        );
      
      case 'fill':
        if (!selectedTemplate) {
          setViewMode('browse');
          return null;
        }
        // Используем новый интерактивный компонент для пользователей
        // Админы могут использовать старый компонент для тестирования
        if (isAdmin) {
          return (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setViewMode('browse')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад к шаблонам
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Переключаемся на интерактивную форму
                    setViewMode('interactive');
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Интерактивная форма
                </Button>
              </div>
              <ReportFiller
                template={selectedTemplate}
                onBack={() => setViewMode('browse')}
                onSubmit={handleSubmitFilledReport}
              />
            </div>
          );
        }
        return (
          <InteractivePDFForm
            template={selectedTemplate}
            onBack={() => setViewMode('browse')}
            onSubmit={handleSubmitFilledReport}
          />
        );
      
      case 'interactive':
        if (!selectedTemplate) {
          setViewMode('browse');
          return null;
        }
        return (
          <InteractivePDFForm
            template={selectedTemplate}
            onBack={() => setViewMode('browse')}
            onSubmit={handleSubmitFilledReport}
          />
        );
      
      case 'manage':
        if (!isAdmin) {
          setViewMode('browse');
          return null;
        }
        return (
          <TemplateManager
            templates={templates}
            departments={departments}
            onEdit={handleEditTemplate}
            onDelete={handleDeleteTemplate}
            onCreate={handleCreateTemplate}
          />
        );
      
      case 'edit':
        if (!isAdmin) {
          setViewMode('browse');
          return null;
        }
        return (
          <TemplateEditor
            template={editingTemplate || undefined}
            onSave={handleSaveTemplate}
            onCancel={() => setViewMode('manage')}
            departments={departments}
          />
        );
      
      case 'my-reports':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Мои рапорты</h2>
                <p className="text-muted-foreground">
                  Просмотр и управление отправленными рапортами
                </p>
              </div>
              <Button onClick={() => setViewMode('browse')}>
                <Plus className="h-4 w-4 mr-2" />
                Создать новый рапорт
              </Button>
            </div>

            {filledReports.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Рапорты не найдены</h3>
                  <p className="text-muted-foreground mb-4">
                    Вы еще не создавали рапорты. Начните с выбора шаблона.
                  </p>
                  <Button onClick={() => setViewMode('browse')}>
                    Выбрать шаблон
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filledReports.map((report) => (
                  <Card key={report.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">{report.title}</span>
                            {getStatusBadge(report.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Создан: {new Date(report.createdAt).toLocaleDateString('ru-RU')}
                            {report.submittedAt && (
                              <span className="ml-4">
                                Отправлен: {new Date(report.submittedAt).toLocaleDateString('ru-RU')}
                              </span>
                            )}
                          </p>
                          {report.supervisorComment && (
                            <div className="mt-3 p-3 bg-muted rounded-lg">
                              <p className="text-sm font-medium mb-1">Комментарий руководителя:</p>
                              <p className="text-sm">{report.supervisorComment}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReport(report);
                              setIsViewModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const blob = new Blob([report.content], { type: 'text/plain;charset=utf-8' });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `${report.title}.txt`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              URL.revokeObjectURL(url);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  if (templatesLoading || reportsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          {t('reports.loading', 'Loading reports...')}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{t('reports.title', 'Reports')}</h1>
          <p className="text-muted-foreground">
            {t('reports.subtitle', 'Create and manage incident reports using templates.')}
          </p>
        </div>

        {/* Навигация */}
        <div className="mb-6">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
            <TabsList>
              <TabsTrigger value="browse">Шаблоны</TabsTrigger>
              <TabsTrigger value="my-reports">Мои рапорты</TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="manage">
                  <Settings className="h-4 w-4 mr-2" />
                  Управление
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </div>

        {/* Основной контент */}
        {renderView()}

        {/* Модальное окно просмотра рапорта */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Просмотр рапорта</DialogTitle>
              <DialogDescription>
                {selectedReport?.title}
              </DialogDescription>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Статус</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedReport.status)}
                    </div>
                  </div>
                  <div>
                    <Label>Создан</Label>
                    <p className="text-sm mt-1">
                      {new Date(selectedReport.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
                
                {selectedReport.supervisorComment && (
                  <div>
                    <Label>Комментарий руководителя</Label>
                    <div className="mt-1 p-3 bg-muted rounded-lg">
                      <p className="text-sm">{selectedReport.supervisorComment}</p>
                    </div>
                  </div>
                )}

                <div>
                  <Label>Содержание рапорта</Label>
                  <pre className="mt-1 whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md max-h-96 overflow-y-auto">
                    {selectedReport.content}
                  </pre>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const blob = new Blob([selectedReport.content], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${selectedReport.title}.txt`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Скачать
                  </Button>
                  <Button onClick={() => setIsViewModalOpen(false)}>
                    Закрыть
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

export default Reports;
