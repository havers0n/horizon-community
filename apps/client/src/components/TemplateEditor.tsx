import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Eye, FileText, CheckCircle } from 'lucide-react';
import { ReportTemplate } from '@shared/schema';
import { extractVariables, validateTemplate } from '@/lib/templateUtils';
import { useToast } from '@/hooks/use-toast';

interface TemplateEditorProps {
  template?: ReportTemplate;
  onSave: (template: Partial<ReportTemplate>) => void;
  onCancel: () => void;
  departments?: Array<{ id: number; name: string }>;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ 
  template, 
  onSave, 
  onCancel,
  departments = []
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [category, setCategory] = useState('general');
  const [subcategory, setSubcategory] = useState('');
  const [purpose, setPurpose] = useState('');
  const [whoFills, setWhoFills] = useState('');
  const [whenUsed, setWhenUsed] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [estimatedTime, setEstimatedTime] = useState<number>(10);
  const [status, setStatus] = useState('draft');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    if (template) {
      setTitle(template.title);
      setBody(template.body);
      setDepartmentId(template.departmentId);
      setCategory(template.category || 'general');
      setSubcategory(template.subcategory || '');
      setPurpose(template.purpose || '');
      setWhoFills(template.whoFills || '');
      setWhenUsed(template.whenUsed || '');
      setDifficulty(template.difficulty || 'medium');
      setEstimatedTime(template.estimatedTime || 10);
      setStatus(template.status || 'draft');
      setTags(template.tags || []);
    }
  }, [template]);

  const usedVariables = useMemo(() => extractVariables(body), [body]);

  const handleSave = () => {
    const validation = validateTemplate({ title, body });
    
    if (!validation.isValid) {
      toast({
        title: "Ошибка валидации",
        description: validation.errors.join(', '),
        variant: "destructive"
      });
      return;
    }

    const templateData: Partial<ReportTemplate> = {
      title: title.trim(),
      body: body.trim(),
      departmentId: departmentId || undefined,
      category,
      subcategory: subcategory || undefined,
      purpose: purpose || undefined,
      whoFills: whoFills || undefined,
      whenUsed: whenUsed || undefined,
      difficulty,
      estimatedTime,
      status,
      tags: tags.length > 0 ? tags : undefined,
      isActive: true
    };

    onSave(templateData);
  };

  const handlePreviewToggle = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const categories = [
    { value: 'general', label: 'Общие' },
    { value: 'police', label: 'Полиция' },
    { value: 'fire', label: 'Пожарная служба' },
    { value: 'ems', label: 'Медицинская служба' },
    { value: 'admin', label: 'Административные' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Легкий' },
    { value: 'medium', label: 'Средний' },
    { value: 'hard', label: 'Сложный' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <h2 className="text-2xl font-bold">
            {template ? 'Редактирование шаблона' : 'Создание нового шаблона'}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreviewToggle}>
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? 'Редактировать' : 'Предпросмотр'}
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Сохранить
          </Button>
        </div>
      </div>

      {isPreviewMode ? (
        <Card>
          <CardHeader>
            <CardTitle>Предпросмотр шаблона</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Название:</Label>
                <p className="text-lg font-semibold">{title || 'Без названия'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Тело шаблона:</Label>
                <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md mt-2 max-h-96 overflow-y-auto">
                  {body || 'Пустой шаблон'}
                </pre>
              </div>
              {usedVariables.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Переменные:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {usedVariables.map(variable => (
                      <Badge key={variable} variant="secondary">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template-title">Название шаблона *</Label>
                <Input
                  id="template-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Например: Рапорт об инциденте"
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Категория *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subcategory">Подкатегория</Label>
                  <Input
                    id="subcategory"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="Например: incident, arrest, traffic"
                    className="mt-1"
                  />
                </div>
              </div>

              {departments.length > 0 && (
                <div>
                  <Label htmlFor="department">Департамент</Label>
                  <Select value={departmentId?.toString() || 'all'} onValueChange={(value) => setDepartmentId(value === 'all' ? null : parseInt(value))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Выберите департамент (необязательно)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все департаменты</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Описание и назначение</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="purpose">Назначение</Label>
                <Textarea
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Краткое описание назначения шаблона"
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="who-fills">Кто заполняет</Label>
                  <Input
                    id="who-fills"
                    value={whoFills}
                    onChange={(e) => setWhoFills(e.target.value)}
                    placeholder="Например: Любой офицер, Офицер ДТП"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="when-used">Когда используется</Label>
                  <Input
                    id="when-used"
                    value={whenUsed}
                    onChange={(e) => setWhenUsed(e.target.value)}
                    placeholder="Например: Любое происшествие, При аресте"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Тело шаблона *</CardTitle>
              <p className="text-sm text-muted-foreground">
                Используйте {'{{ПЕРЕМЕННЫЕ}}'} для создания полей ввода. Например: {'{{ИМЯ_ОФИЦЕРА}}'}, {'{{ДАТА}}'}, {'{{МЕСТО_ПРОИСШЕСТВИЯ}}'}
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={`РАПОРТ

Дата: {{ДАТА}}
Время: {{ВРЕМЯ}}

Я, {{ДОЛЖНОСТЬ}} {{ИМЯ_ОФИЦЕРА}}, докладываю о происшествии, зафиксированном по адресу: {{МЕСТО_ПРОИСШЕСТВИЯ}}.

ОПИСАНИЕ ИНЦИДЕНТА:
{{ОПИСАНИЕ_ИНЦИДЕНТА}}

УЧАСТНИКИ:
{{УЧАСТНИКИ}}

ПРИНЯТЫЕ МЕРЫ:
{{ПРИНЯТЫЕ_МЕРЫ}}

Подпись: ____________ ({{ИМЯ_ОФИЦЕРА}})`}
                rows={15}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Дополнительные настройки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="difficulty">Сложность</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Выберите сложность" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map(diff => (
                        <SelectItem key={diff.value} value={diff.value}>
                          {diff.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="estimated-time">Примерное время заполнения (мин)</Label>
                  <Input
                    id="estimated-time"
                    type="number"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(parseInt(e.target.value) || 0)}
                    min="1"
                    max="120"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Статус шаблона</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Черновик (только для админов)
                        </div>
                      </SelectItem>
                      <SelectItem value="ready">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Готовый (для пользователей)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Теги</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="tags"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Добавить тег"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    Добавить
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {usedVariables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Найденные переменные</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Эти поля будут доступны для заполнения пользователями
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {usedVariables.map(variable => (
                    <Badge key={variable} variant="outline">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Примеры шаблонов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Рапорт об инциденте:</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`РАПОРТ

Дата: {{ДАТА}}
Время: {{ВРЕМЯ}}

Я, {{ДОЛЖНОСТЬ}} {{ИМЯ_ОФИЦЕРА}}, докладываю о происшествии, зафиксированном по адресу: {{МЕСТО_ПРОИСШЕСТВИЯ}}.

ОПИСАНИЕ ИНЦИДЕНТА:
{{ОПИСАНИЕ_ИНЦИДЕНТА}}

УЧАСТНИКИ:
{{УЧАСТНИКИ}}

ПРИНЯТЫЕ МЕРЫ:
{{ПРИНЯТЫЕ_МЕРЫ}}

Подпись: ____________ ({{ИМЯ_ОФИЦЕРА}})`}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Рапорт о ДТП:</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`РАПОРТ О ДТП

Дата ДТП: {{ДАТА_ДТП}}
Время ДТП: {{ВРЕМЯ_ДТП}}
Место ДТП: {{МЕСТО_ДТП}}

Транспортное средство 1:
Марка/Модель: {{МАРКА_МОДЕЛЬ_ТС1}}
Гос. номер: {{ГОС_НОМЕР_ТС1}}
Водитель: {{ВОДИТЕЛЬ_ТС1}}

Транспортное средство 2:
Марка/Модель: {{МАРКА_МОДЕЛЬ_ТС2}}
Гос. номер: {{ГОС_НОМЕР_ТС2}}
Водитель: {{ВОДИТЕЛЬ_ТС2}}

Обстоятельства ДТП:
{{ОБСТОЯТЕЛЬСТВА_ДТП}}

Пострадавшие:
{{ПОСТРАДАВШИЕ}}

Офицер: {{ИМЯ_ОФИЦЕРА}}
Подразделение: {{ПОДРАЗДЕЛЕНИЕ}}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TemplateEditor; 