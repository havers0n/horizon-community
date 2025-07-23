import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  FileText,
  User,
  Calendar
} from "lucide-react";
import { useTranslation } from 'react-i18next';

interface TestResult {
  id: number;
  userId: number;
  username: string;
  testId: number;
  testTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  focusLostCount: number;
  warningsCount: number;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  results?: {
    answers: Array<{
      questionId: string;
      question: string;
      userAnswer: string | string[];
      correctAnswer: string | string[];
      isCorrect: boolean;
      points: number;
    }>;
    adminComment?: string;
  };
}

interface TestResultDetailsProps {
  result: TestResult;
  onStatusUpdate: (resultId: number, status: 'approved' | 'rejected', comment?: string) => void;
}

export function TestResultDetails({ result, onStatusUpdate }: TestResultDetailsProps) {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comment, setComment] = useState(result.results?.adminComment || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return t('admin.tests.results.pending', 'На проверке');
      case 'approved': return t('admin.tests.results.approved', 'Одобрен');
      case 'rejected': return t('admin.tests.results.rejected', 'Отклонен');
      default: return status;
    }
  };

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(result.id, status, comment);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderAnswer = (answer: string | string[]) => {
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    return answer;
  };

  const renderAnswerComparison = (userAnswer: string | string[], correctAnswer: string | string[]) => {
    const userAnswerStr = renderAnswer(userAnswer);
    const correctAnswerStr = renderAnswer(correctAnswer);
    
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">{t('test_result.user_answer', 'Ответ пользователя:')}</span>
          <span className="text-sm">{userAnswerStr}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">{t('test_result.correct_answer', 'Правильный ответ:')}</span>
          <span className="text-sm">{correctAnswerStr}</span>
        </div>
      </div>
    );
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsModalOpen(true)}
      >
        <Eye className="h-4 w-4" />
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('test_result.details_title', 'Детали результата теста')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Основная информация */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('test_result.basic_info', 'Основная информация')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{t('test_result.user', 'Пользователь:')}</span>
                    <span className="text-sm">{result.username}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{t('test_result.test', 'Тест:')}</span>
                    <span className="text-sm">{result.testTitle}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{t('test_result.date', 'Дата:')}</span>
                    <span className="text-sm">{formatDate(result.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{t('test_result.time', 'Время:')}</span>
                    <span className="text-sm">{formatTime(result.timeSpent)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold">{result.percentage}%</div>
                    <div className="text-sm text-gray-600">{t('test_result.result', 'Результат')}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold">{result.score}/{result.maxScore}</div>
                    <div className="text-sm text-gray-600">{t('test_result.points', 'Баллы')}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center">
                      {result.passed ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {result.passed ? t('test_result.passed', 'Прошел') : t('test_result.failed', 'Не прошел')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(result.status)}>
                    {getStatusLabel(result.status)}
                  </Badge>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{t('test_result.focus', 'Фокус:')} {result.focusLostCount}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{t('test_result.warnings', 'Предупреждения:')} {result.warningsCount}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Детали ответов */}
            {result.results?.answers && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('test_result.answer_details', 'Детали ответов')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.results.answers.map((answer, index) => (
                      <div key={answer.questionId} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium">{t('test_exam.question', 'Вопрос')} {index + 1}</h4>
                          <div className="flex items-center space-x-2">
                            {answer.isCorrect ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <Badge variant="secondary">{answer.points} {t('test_result.points', 'баллов')}</Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3">{answer.question}</p>
                        
                        {renderAnswerComparison(answer.userAnswer, answer.correctAnswer)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Административные действия */}
            {result.status === 'pending' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('test_result.admin_actions', 'Административные действия')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{t('test_result.comment', 'Комментарий (необязательно)')}</label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={t('test_result.comment_placeholder', 'Добавьте комментарий к решению...')}
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      disabled={isUpdating}
                    >
                      {t('test_result.cancel', 'Отмена')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleStatusUpdate('rejected')}
                      disabled={isUpdating}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {t('test_result.reject', 'Отклонить')}
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate('approved')}
                      disabled={isUpdating}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t('test_result.approve', 'Одобрить')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Существующий комментарий */}
            {result.results?.adminComment && result.status !== 'pending' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('test_result.admin_comment', 'Комментарий администратора')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{result.results.adminComment}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 