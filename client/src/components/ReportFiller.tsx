import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Copy, Send, Download } from 'lucide-react';
import { ReportTemplate } from '@shared/schema';
import { 
  extractVariables, 
  renderPreview, 
  getInputType, 
  isRequiredField,
  generateReportTitle 
} from '@/lib/templateUtils';
import { useToast } from '@/hooks/use-toast';

interface ReportFillerProps {
  template: ReportTemplate;
  onBack: () => void;
  onSubmit: (reportData: {
    templateId: number;
    title: string;
    content: string;
  }) => void;
}

const ReportFiller: React.FC<ReportFillerProps> = ({ 
  template, 
  onBack,
  onSubmit 
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const variables = useMemo(() => extractVariables(template.body), [template.body]);
  const previewText = useMemo(() => renderPreview(template.body, fieldValues), [template.body, fieldValues]);
  const reportTitle = useMemo(() => generateReportTitle(template.title, fieldValues), [template.title, fieldValues]);

  const handleInputChange = (variable: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [variable]: value }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(previewText).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
      toast({
        title: "Скопировано",
        description: "Текст рапорта скопирован в буфер обмена"
      });
    }).catch(() => {
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать текст",
        variant: "destructive"
      });
    });
  };

  const handleDownload = () => {
    const blob = new Blob([previewText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportTitle}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Скачано",
      description: "Рапорт сохранен в файл"
    });
  };

  const handleSubmit = async () => {
    // Проверяем обязательные поля
    const requiredFields = variables.filter(isRequiredField);
    const missingFields = requiredFields.filter(field => !fieldValues[field]?.trim());
    
    if (missingFields.length > 0) {
      toast({
        title: "Незаполненные поля",
        description: `Пожалуйста, заполните обязательные поля: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        templateId: template.id,
        title: reportTitle,
        content: previewText
      });
      
      toast({
        title: "Рапорт отправлен",
        description: "Ваш рапорт успешно отправлен на рассмотрение"
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить рапорт. Попробуйте еще раз.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInputField = (variable: string) => {
    const inputType = getInputType(variable);
    const isRequired = isRequiredField(variable);
    const value = fieldValues[variable] || '';

    if (inputType === 'textarea') {
      return (
        <Textarea
          value={value}
          onChange={(e) => handleInputChange(variable, e.target.value)}
          placeholder={`Введите ${variable.toLowerCase()}`}
          rows={4}
          className="font-mono text-sm"
          required={isRequired}
        />
      );
    }

    return (
      <Input
        type={inputType}
        value={value}
        onChange={(e) => handleInputChange(variable, e.target.value)}
        placeholder={`Введите ${variable.toLowerCase()}`}
        required={isRequired}
      />
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к шаблонам
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Заполнение рапорта</h2>
            <p className="text-muted-foreground">{template.title}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Левая панель: Поля для ввода */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Поля для заполнения
              <Badge variant="outline">{variables.length} полей</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Заполните все необходимые поля для создания рапорта
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {variables.map(variable => {
              const isRequired = isRequiredField(variable);
              return (
                <div key={variable} className="space-y-2">
                  <Label className="flex items-center gap-2">
                    {variable}
                    {isRequired && <Badge variant="destructive" className="text-xs">Обязательно</Badge>}
                  </Label>
                  {renderInputField(variable)}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Правая панель: Предпросмотр */}
        <Card>
          <CardHeader>
            <CardTitle>Предпросмотр рапорта</CardTitle>
            <p className="text-sm text-muted-foreground">
              Предварительный просмотр заполненного рапорта
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <pre className="whitespace-pre-wrap font-mono text-sm max-h-96 overflow-y-auto">
                {previewText || 'Заполните поля слева для предпросмотра'}
              </pre>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleCopy}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                {copyStatus === 'idle' ? 'Скопировать' : 'Скопировано!'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDownload}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Скачать
              </Button>
            </div>
            
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Отправка...' : 'Отправить рапорт'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Информация о шаблоне */}
      <Card>
        <CardHeader>
          <CardTitle>Информация о шаблоне</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Название:</Label>
              <p className="font-medium">{template.title}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Создан:</Label>
              <p className="font-medium">{new Date(template.createdAt).toLocaleDateString('ru-RU')}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Переменных:</Label>
              <p className="font-medium">{variables.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportFiller; 