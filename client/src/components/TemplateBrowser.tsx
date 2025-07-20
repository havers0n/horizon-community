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
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  FileText, 
  Calendar, 
  Building,
  Play,
  Eye,
  Clock,
  Users,
  Target,
  Shield,
  Car,
  Heart,
  Flame,
  AlertTriangle,
  UserCheck,
  Zap,
  Plus,
  Star,
  Grid,
  List
} from 'lucide-react';
import { ReportTemplate, Department } from '@shared/schema';
import { extractVariables } from '@/lib/templateUtils';

interface TemplateBrowserProps {
  templates: ReportTemplate[];
  departments: Department[];
  onSelectTemplate: (template: ReportTemplate) => void;
  userDepartmentId?: number | null;
}

const TemplateBrowser: React.FC<TemplateBrowserProps> = ({
  templates,
  departments,
  onSelectTemplate,
  userDepartmentId
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Фильтруем шаблоны: только активные, готовые и доступные пользователю
  const availableTemplates = templates.filter(template => {
    if (!template.isActive) return false;
    
    // Показываем только готовые шаблоны (не черновики)
    if (template.status !== 'ready') return false;
    
    // Если у шаблона нет привязки к департаменту - доступен всем
    if (!template.departmentId) return true;
    
    // Если у пользователя есть департамент - показываем шаблоны его департамента и общие
    if (userDepartmentId) {
      return template.departmentId === userDepartmentId || !template.departmentId;
    }
    
    // Если у пользователя нет департамента - показываем только общие шаблоны
    return !template.departmentId;
  });

  const filteredTemplates = availableTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'all' || template.difficulty === difficultyFilter;
    const matchesDepartment = !departmentFilter || template.departmentId === departmentFilter;
    return matchesSearch && matchesCategory && matchesDifficulty && matchesDepartment;
  });

  const handlePreview = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleSelectTemplate = (template: ReportTemplate) => {
    onSelectTemplate(template);
  };

  const getDepartmentName = (departmentId: number | null) => {
    if (!departmentId) return 'Все департаменты';
    const dept = departments.find(d => d.id === departmentId);
    return dept?.name || 'Неизвестный департамент';
  };

  const getVariablesCount = (template: ReportTemplate) => {
    return extractVariables(template.body).length;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'police': return <Shield className="h-5 w-5" />;
      case 'fire': return <Flame className="h-5 w-5" />;
      case 'ems': return <Heart className="h-5 w-5" />;
      case 'admin': return <FileText className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Легкий';
      case 'medium': return 'Средний';
      case 'hard': return 'Сложный';
      default: return 'Неизвестно';
    }
  };

  const categories = [
    { value: 'all', label: 'Все категории', icon: <FileText className="h-4 w-4" /> },
    { value: 'police', label: 'Полиция', icon: <Shield className="h-4 w-4" /> },
    { value: 'fire', label: 'Пожарная служба', icon: <Flame className="h-4 w-4" /> },
    { value: 'ems', label: 'Медицинская служба', icon: <Heart className="h-4 w-4" /> },
    { value: 'admin', label: 'Административные', icon: <FileText className="h-4 w-4" /> }
  ];

  const difficulties = [
    { value: 'all', label: 'Любая сложность' },
    { value: 'easy', label: 'Легкие' },
    { value: 'medium', label: 'Средние' },
    { value: 'hard', label: 'Сложные' }
  ];

  const getAvailableDepartments = () => {
    const deptIds = new Set(availableTemplates.map(t => t.departmentId).filter(Boolean));
    return departments.filter(d => deptIds.has(d.id));
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h2 className="text-2xl font-bold">Шаблоны рапортов</h2>
        <p className="text-muted-foreground">
          Выберите подходящий шаблон для создания рапорта
        </p>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle>Поиск и фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию, назначению или тегам..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
                </option>
              ))}
            </select>

            <select
              value={departmentFilter || ''}
              onChange={(e) => setDepartmentFilter(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="">Все департаменты</option>
              {getAvailableDepartments().map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Переключатель вида */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4 mr-2" />
                Сетка
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-2" />
                Список
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Найдено: {filteredTemplates.length} из {availableTemplates.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{availableTemplates.length}</div>
            <div className="text-sm text-muted-foreground">Доступно шаблонов</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredTemplates.length}</div>
            <div className="text-sm text-muted-foreground">Найдено</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {availableTemplates.reduce((sum, t) => sum + getVariablesCount(t), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Всего полей</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {Math.round(availableTemplates.reduce((sum, t) => sum + (t.estimatedTime || 0), 0) / availableTemplates.length)} мин
            </div>
            <div className="text-sm text-muted-foreground">Среднее время</div>
          </CardContent>
        </Card>
      </div>

      {/* Список шаблонов */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || categoryFilter !== 'all' || difficultyFilter !== 'all' || departmentFilter
                ? 'Шаблоны не найдены' 
                : 'Нет доступных шаблонов'
              }
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || categoryFilter !== 'all' || difficultyFilter !== 'all' || departmentFilter
                ? 'Попробуйте изменить параметры поиска' 
                : 'Обратитесь к администратору для создания шаблонов'
              }
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(template.category)}
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                  </div>
                  <Badge variant="outline">
                    {getVariablesCount(template)} полей
                  </Badge>
                </div>
                
                {template.departmentId && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-4 w-4" />
                    {getDepartmentName(template.departmentId)}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Назначение */}
                {template.purpose && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Назначение:</p>
                    <p className="text-sm">{template.purpose}</p>
                  </div>
                )}

                {/* Кто заполняет */}
                {template.whoFills && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Кто заполняет:</p>
                    <p className="text-sm">{template.whoFills}</p>
                  </div>
                )}

                {/* Статистика */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{template.estimatedTime || '~'} мин</span>
                  </div>
                  <Badge className={getDifficultyColor(template.difficulty || 'medium')}>
                    {getDifficultyText(template.difficulty || 'medium')}
                  </Badge>
                </div>

                {/* Теги */}
                {template.tags && template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(template)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Просмотр
                  </Button>
                  <Button
                    onClick={() => handleSelectTemplate(template)}
                    size="sm"
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Заполнить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getCategoryIcon(template.category)}
                    <div>
                      <h3 className="font-semibold">{template.title}</h3>
                      {template.purpose && (
                        <p className="text-sm text-muted-foreground">{template.purpose}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{getVariablesCount(template)} полей</Badge>
                        <Badge className={getDifficultyColor(template.difficulty || 'medium')}>
                          {getDifficultyText(template.difficulty || 'medium')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{template.estimatedTime || '~'} мин</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(template)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Заполнить
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Категория:</span>
                  <p className="flex items-center gap-2">
                    {getCategoryIcon(selectedTemplate.category)}
                    {categories.find(c => c.value === selectedTemplate.category)?.label}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Сложность:</span>
                  <p>
                    <Badge className={getDifficultyColor(selectedTemplate.difficulty || 'medium')}>
                      {getDifficultyText(selectedTemplate.difficulty || 'medium')}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Время заполнения:</span>
                  <p>{selectedTemplate.estimatedTime || '~'} минут</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Полей для заполнения:</span>
                  <p>{getVariablesCount(selectedTemplate)}</p>
                </div>
              </div>
              
              {selectedTemplate.purpose && (
                <div>
                  <span className="text-muted-foreground">Назначение:</span>
                  <p className="mt-1">{selectedTemplate.purpose}</p>
                </div>
              )}
              
              {selectedTemplate.whoFills && (
                <div>
                  <span className="text-muted-foreground">Кто заполняет:</span>
                  <p className="mt-1">{selectedTemplate.whoFills}</p>
                </div>
              )}
              
              {selectedTemplate.whenUsed && (
                <div>
                  <span className="text-muted-foreground">Когда используется:</span>
                  <p className="mt-1">{selectedTemplate.whenUsed}</p>
                </div>
              )}
              
              <div>
                <span className="text-muted-foreground">Содержание шаблона:</span>
                <pre className="mt-1 whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md max-h-96 overflow-y-auto">
                  {selectedTemplate.body}
                </pre>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewOpen(false)}
                >
                  Закрыть
                </Button>
                <Button
                  onClick={() => {
                    setIsPreviewOpen(false);
                    handleSelectTemplate(selectedTemplate);
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Заполнить этот шаблон
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateBrowser; 