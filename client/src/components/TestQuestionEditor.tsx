import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle,
  AlertCircle,
  FileText
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'text';
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
}

interface TestQuestionEditorProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
}

export function TestQuestionEditor({ questions, onQuestionsChange }: TestQuestionEditorProps) {
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      question: '',
      type: 'single',
      options: ['Вариант 1', 'Вариант 2'],
      correctAnswer: '',
      points: 1
    };
    setEditingQuestion(newQuestion);
    setIsAddingQuestion(true);
  };

  const editQuestion = (question: Question) => {
    setEditingQuestion({ ...question });
    setIsAddingQuestion(false);
  };

  const deleteQuestion = (questionId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот вопрос?')) {
      const updatedQuestions = questions.filter(q => q.id !== questionId);
      onQuestionsChange(updatedQuestions);
    }
  };

  const saveQuestion = () => {
    if (!editingQuestion) return;

    // Валидация
    if (!editingQuestion.question.trim()) {
      alert('Введите текст вопроса');
      return;
    }

    if (editingQuestion.type !== 'text') {
      const validOptions = editingQuestion.options?.filter(option => option.trim() !== '') || [];
      if (validOptions.length < 2) {
        alert('Добавьте минимум 2 варианта ответа');
        return;
      }

      if (editingQuestion.type === 'single' && !editingQuestion.correctAnswer) {
        alert('Выберите правильный ответ');
        return;
      }

      if (editingQuestion.type === 'multiple' && (!editingQuestion.correctAnswer || (editingQuestion.correctAnswer as string[]).length === 0)) {
        alert('Выберите хотя бы один правильный ответ');
        return;
      }
    }

    if (isAddingQuestion) {
      onQuestionsChange([...questions, editingQuestion]);
    } else {
      const updatedQuestions = questions.map(q => 
        q.id === editingQuestion.id ? editingQuestion : q
      );
      onQuestionsChange(updatedQuestions);
    }

    setEditingQuestion(null);
    setIsAddingQuestion(false);
  };

  const cancelEdit = () => {
    setEditingQuestion(null);
    setIsAddingQuestion(false);
  };

  const updateQuestionField = (field: keyof Question, value: any) => {
    if (!editingQuestion) return;
    setEditingQuestion({ ...editingQuestion, [field]: value });
  };

  const addOption = () => {
    if (!editingQuestion) return;
    const newOptions = [...(editingQuestion.options || []), `Вариант ${(editingQuestion.options?.length || 0) + 1}`];
    setEditingQuestion({ ...editingQuestion, options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    if (!editingQuestion?.options) return;
    const newOptions = [...editingQuestion.options];
    newOptions[index] = value;
    setEditingQuestion({ ...editingQuestion, options: newOptions });
  };

  const removeOption = (index: number) => {
    if (!editingQuestion?.options) return;
    if (editingQuestion.options.length <= 2) {
      alert('Минимум 2 варианта ответа должны остаться');
      return;
    }
    const newOptions = editingQuestion.options.filter((_, i) => i !== index);
    setEditingQuestion({ ...editingQuestion, options: newOptions });
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'single': return <CheckCircle className="h-4 w-4" />;
      case 'multiple': return <AlertCircle className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'single': return 'Один ответ';
      case 'multiple': return 'Несколько ответов';
      case 'text': return 'Текстовый ответ';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Вопросы теста ({questions.length})</h3>
          <Button onClick={addQuestion}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить вопрос
          </Button>
        </div>

        {questions.map((question, index) => (
          <Card key={question.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium">Вопрос {index + 1}</span>
                    {getQuestionTypeIcon(question.type)}
                    <Badge variant="outline">{getQuestionTypeLabel(question.type)}</Badge>
                    <Badge variant="secondary">{question.points} баллов</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{question.question}</p>
                  
                  {question.type !== 'text' && question.options && (
                    <div className="space-y-1">
                      {question.options.filter(option => option.trim() !== '').map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-2 text-sm">
                          <span className="w-4 h-4 rounded border flex items-center justify-center">
                            {question.type === 'single' ? '○' : '□'}
                          </span>
                          <span className={
                             question.type === 'single' 
                               ? (option === question.correctAnswer ? 'font-medium text-green-600' : '')
                               : (Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option) ? 'font-medium text-green-600' : '')
                           }>
                             {option}
                           </span>
                           {(question.type === 'single' && option === question.correctAnswer && question.correctAnswer) ||
                            (question.type === 'multiple' && Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option)) ? (
                             <CheckCircle className="h-4 w-4 text-green-500" />
                           ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => editQuestion(question)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteQuestion(question.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {questions.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет вопросов</h3>
              <p className="text-gray-600 mb-4">
                Добавьте вопросы для создания теста
              </p>
              <Button onClick={addQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить первый вопрос
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Question Editor Modal */}
      {editingQuestion && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>
              {isAddingQuestion ? 'Добавить вопрос' : 'Редактировать вопрос'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Текст вопроса</label>
              <Textarea
                value={editingQuestion.question}
                onChange={(e) => updateQuestionField('question', e.target.value)}
                placeholder="Введите текст вопроса"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Тип вопроса</label>
                <Select
                  value={editingQuestion.type}
                  onValueChange={(value: 'single' | 'multiple' | 'text') => 
                    updateQuestionField('type', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Один ответ</SelectItem>
                    <SelectItem value="multiple">Несколько ответов</SelectItem>
                    <SelectItem value="text">Текстовый ответ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Баллы</label>
                <Input
                  type="number"
                  value={editingQuestion.points}
                  onChange={(e) => updateQuestionField('points', parseInt(e.target.value))}
                  min="1"
                  max="10"
                />
              </div>
            </div>

            {/* Options for single/multiple choice questions */}
            {editingQuestion.type !== 'text' && (
              <div>
                <label className="text-sm font-medium">Варианты ответов</label>
                <div className="space-y-2">
                  {editingQuestion.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Вариант ${index + 1}`}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeOption(index)}
                        disabled={editingQuestion.options!.length <= 2}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addOption}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить вариант
                  </Button>
                </div>

                {/* Correct answer selection */}
                <div className="mt-4">
                  <label className="text-sm font-medium">Правильный ответ</label>
                  {editingQuestion.type === 'single' ? (
                    <Select
                      value={editingQuestion.correctAnswer as string}
                      onValueChange={(value) => updateQuestionField('correctAnswer', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите правильный ответ" />
                      </SelectTrigger>
                      <SelectContent>
                        {editingQuestion.options?.filter(option => option.trim() !== '').map((option, index) => (
                          <SelectItem key={index} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="space-y-2">
                      {editingQuestion.options?.filter(option => option.trim() !== '').map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={(editingQuestion.correctAnswer as string[])?.includes(option)}
                            onChange={(e) => {
                              const currentAnswers = editingQuestion.correctAnswer as string[] || [];
                              const newAnswers = e.target.checked
                                ? [...currentAnswers, option]
                                : currentAnswers.filter(ans => ans !== option);
                              updateQuestionField('correctAnswer', newAnswers);
                            }}
                          />
                          <span>{option}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={cancelEdit}>
                Отмена
              </Button>
              <Button onClick={saveQuestion}>
                {isAddingQuestion ? 'Добавить' : 'Сохранить'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 