import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  MoreHorizontal 
} from 'lucide-react';
import { ReportTemplate, Department } from '@shared/schema';
import { extractVariables } from '@/lib/templateUtils';
import { useToast } from '@/hooks/use-toast';

interface TemplateManagerProps {
  templates: ReportTemplate[];
  departments: Department[];
  onEdit: (template: ReportTemplate) => void;
  onDelete: (templateId: number) => void;
  onCreate: () => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  departments,
  onEdit,
  onDelete,
  onCreate
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !departmentFilter || template.departmentId === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const handleDelete = (template: ReportTemplate) => {
    if (window.confirm(`Вы уверены, что хотите удалить шаблон "${template.title}"?`)) {
      onDelete(template.id);
      toast({
        title: "Шаблон удален",
        description: `Шаблон "${template.title}" успешно удален`
      });
    }
  };

  const handlePreview = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  const getDepartmentName = (departmentId: number | null) => {
    if (!departmentId) return 'Все департаменты';
    const dept = departments.find(d => d.id === departmentId);
    return dept?.name || 'Неизвестный департамент';
  };

  const getVariablesCount = (template: ReportTemplate) => {
    return extractVariables(template.body).length;
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Управление шаблонами рапортов</h2>
          <p className="text-muted-foreground">
            Создавайте и редактируйте шаблоны для различных типов рапортов
          </p>
        </div>
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Создать шаблон
        </Button>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию шаблона..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                value={departmentFilter || ''}
                onChange={(e) => setDepartmentFilter(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
              >
                <option value="">Все департаменты</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{templates.length}</div>
            <div className="text-sm text-muted-foreground">Всего шаблонов</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredTemplates.length}</div>
            <div className="text-sm text-muted-foreground">Отфильтровано</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {templates.filter(t => t.isActive).length}
            </div>
            <div className="text-sm text-muted-foreground">Активных</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {templates.reduce((sum, t) => sum + getVariablesCount(t), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Всего переменных</div>
          </CardContent>
        </Card>
      </div>

      {/* Таблица шаблонов */}
      <Card>
        <CardHeader>
          <CardTitle>Шаблоны рапортов</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || departmentFilter 
                  ? 'По вашему запросу шаблоны не найдены' 
                  : 'Шаблоны рапортов не созданы'
                }
              </p>
              {!searchTerm && !departmentFilter && (
                <Button onClick={onCreate} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Создать первый шаблон
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Департамент</TableHead>
                  <TableHead>Переменных</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Создан</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">
                      {template.title}
                    </TableCell>
                    <TableCell>
                      {getDepartmentName(template.departmentId)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getVariablesCount(template)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.isActive ? "default" : "secondary"}>
                        {template.isActive ? "Активен" : "Неактивен"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(template.createdAt).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(template)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Модальное окно предпросмотра */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Предпросмотр шаблона</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Информация о шаблоне:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Департамент:</span>
                    <p>{getDepartmentName(selectedTemplate.departmentId)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Переменных:</span>
                    <p>{getVariablesCount(selectedTemplate)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Статус:</span>
                    <Badge variant={selectedTemplate.isActive ? "default" : "secondary"}>
                      {selectedTemplate.isActive ? "Активен" : "Неактивен"}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Создан:</span>
                    <p>{new Date(selectedTemplate.createdAt).toLocaleDateString('ru-RU')}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Переменные:</h4>
                <div className="flex flex-wrap gap-2">
                  {extractVariables(selectedTemplate.body).map(variable => (
                    <Badge key={variable} variant="outline">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Тело шаблона:</h4>
                <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md max-h-96 overflow-y-auto">
                  {selectedTemplate.body}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateManager; 