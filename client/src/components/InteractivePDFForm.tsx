import React, { useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Copy, 
  Send, 
  Download, 
  FileText, 
  Printer,
  Eye,
  EyeOff
} from 'lucide-react';
import { ReportTemplate } from '@shared/schema';
import { 
  extractVariables, 
  renderPreview, 
  getInputType, 
  isRequiredField,
  generateReportTitle 
} from '@/lib/templateUtils';
import { useToast } from '@/hooks/use-toast';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InteractivePDFFormProps {
  template: ReportTemplate;
  onBack: () => void;
  onSubmit: (reportData: {
    templateId: number;
    title: string;
    content: string;
  }) => void;
}

const InteractivePDFForm: React.FC<InteractivePDFFormProps> = ({ 
  template, 
  onBack,
  onSubmit 
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [activeField, setActiveField] = useState<string | null>(null);
  
  const printRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  const variables = useMemo(() => extractVariables(template.body), [template.body]);
  const previewText = useMemo(() => renderPreview(template.body, fieldValues), [template.body, fieldValues]);
  const reportTitle = useMemo(() => generateReportTitle(template.title, fieldValues), [template.title, fieldValues]);

  const handleInputChange = (variable: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [variable]: value }));
  };

  const handleFieldFocus = (variable: string) => {
    setActiveField(variable);
  };

  const handleFieldBlur = () => {
    setActiveField(null);
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

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => {
      toast({
        title: "Печать",
        description: "Рапорт отправлен на печать"
      });
    }
  });

  const handleExportPDF = async () => {
    if (!pdfRef.current) return;
    
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${reportTitle}.pdf`);
      
      toast({
        title: "PDF экспортирован",
        description: "Рапорт сохранен в формате PDF"
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось экспортировать PDF",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
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
    const isActive = activeField === variable;

    if (inputType === 'textarea') {
      return (
        <Textarea
          value={value}
          onChange={(e) => handleInputChange(variable, e.target.value)}
          onFocus={() => handleFieldFocus(variable)}
          onBlur={handleFieldBlur}
          placeholder={`Введите ${variable.toLowerCase()}`}
          rows={3}
          className={`font-mono text-sm transition-all duration-200 ${
            isActive ? 'ring-2 ring-blue-500 border-blue-500' : ''
          }`}
          required={isRequired}
        />
      );
    }

    return (
      <Input
        type={inputType}
        value={value}
        onChange={(e) => handleInputChange(variable, e.target.value)}
        onFocus={() => handleFieldFocus(variable)}
        onBlur={handleFieldBlur}
        placeholder={`Введите ${variable.toLowerCase()}`}
        className={`transition-all duration-200 ${
          isActive ? 'ring-2 ring-blue-500 border-blue-500' : ''
        }`}
        required={isRequired}
      />
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к шаблонам
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Интерактивная форма</h2>
            <p className="text-muted-foreground">{template.title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showPreview ? 'Скрыть' : 'Показать'} предпросмотр
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Левая панель: Поля для ввода */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Поля для заполнения
              <Badge variant="outline">{variables.length} полей</Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Заполните все необходимые поля. Изменения отображаются в реальном времени.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {variables.map(variable => {
              const isRequired = isRequiredField(variable);
              const isActive = activeField === variable;
              
              return (
                <div 
                  key={variable} 
                  className={`space-y-2 p-3 rounded-lg transition-all duration-200 ${
                    isActive ? 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800' : ''
                  }`}
                >
                  <Label className="flex items-center gap-2">
                    {variable}
                    {isRequired && <Badge variant="destructive" className="text-xs">Обязательно</Badge>}
                    {isActive && <Badge variant="secondary" className="text-xs">Активно</Badge>}
                  </Label>
                  {renderInputField(variable)}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Правая панель: A4 Предпросмотр */}
        {showPreview && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Предпросмотр документа
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Живой предпросмотр заполненного рапорта в формате A4
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    {copyStatus === 'copied' ? 'Скопировано!' : 'Копировать'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Скачать TXT
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Печать
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportPDF}>
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* A4 Документ */}
            <div className="flex justify-center">
              <div 
                ref={printRef}
                className="bg-white shadow-lg border border-gray-200 w-[210mm] min-h-[297mm] p-8 font-serif text-black"
                style={{
                  fontSize: '12pt',
                  lineHeight: '1.5',
                  fontFamily: 'Times New Roman, serif'
                }}
              >
                <div 
                  ref={pdfRef}
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ 
                    __html: previewText.replace(/\n/g, '<br>') 
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Кнопки действий */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Заполнено полей: {Object.values(fieldValues).filter(v => v.trim()).length} из {variables.length}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onBack}>
                Отмена
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Отправить рапорт
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractivePDFForm; 