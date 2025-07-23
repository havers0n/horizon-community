import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TestQuestionEditor } from "@/components/TestQuestionEditor";
import { TestResultDetails } from "@/components/TestResultDetails";
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Target,
  Flame,
  Shield
} from "lucide-react";

interface Test {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  questionsCount: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isActive: boolean;
  createdAt: string;
  totalAttempts: number;
  passRate: number;
  questions?: any[];
}

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
  results?: any;
}

interface Question {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'text';
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
}

// API функции
const fetchAdminTests = async () => {
  const response = await fetch('/api/admin/tests', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch tests');
  const data = await response.json();
  return data.tests;
};

const fetchTestResults = async (status?: string) => {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.append('status', status);
  
  const response = await fetch(`/api/admin/tests/results?${params}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch test results');
  const data = await response.json();
  return data.results;
};

const fetchTestAnalytics = async () => {
  const response = await fetch('/api/admin/tests/analytics', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json();
};

const createTest = async (testData: any) => {
  const response = await fetch('/api/admin/tests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify(testData)
  });
  if (!response.ok) throw new Error('Failed to create test');
  return response.json();
};

const updateTest = async ({ id, ...testData }: any) => {
  const response = await fetch(`/api/admin/tests/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify(testData)
  });
  if (!response.ok) throw new Error('Failed to update test');
  return response.json();
};

const deleteTest = async (testId: number) => {
  const response = await fetch(`/api/admin/tests/${testId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  if (!response.ok) throw new Error('Failed to delete test');
  return response.json();
};

const updateResultStatus = async (resultId: number, status: string, comment?: string) => {
  const response = await fetch(`/api/admin/tests/results/${resultId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify({ status, comment })
  });
  if (!response.ok) throw new Error('Failed to update result status');
  return response.json();
};

export default function AdminTests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [activeTab, setActiveTab] = useState('tests');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newTest, setNewTest] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: '',
    durationMinutes: 20,
    questions: [] as Question[]
  });

  // Queries
  const { data: tests = [], isLoading: testsLoading } = useQuery({
    queryKey: ['adminTests'],
    queryFn: fetchAdminTests
  });

  const { data: results = [], isLoading: resultsLoading } = useQuery({
    queryKey: ['testResults', filterStatus],
    queryFn: () => fetchTestResults(filterStatus)
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['testAnalytics'],
    queryFn: fetchTestAnalytics
  });

  // Mutations
  const createTestMutation = useMutation({
    mutationFn: createTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTests'] });
      setIsCreateModalOpen(false);
      setNewTest({
        title: '',
        description: '',
        category: '',
        difficulty: '',
        durationMinutes: 20,
        questions: []
      });
      toast({
        title: "Тест создан",
        description: "Тест успешно создан",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать тест",
        variant: "destructive"
      });
    }
  });

  const updateTestMutation = useMutation({
    mutationFn: updateTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTests'] });
      setIsEditModalOpen(false);
      setSelectedTest(null);
      toast({
        title: "Тест обновлен",
        description: "Тест успешно обновлен",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить тест",
        variant: "destructive"
      });
    }
  });

  const deleteTestMutation = useMutation({
    mutationFn: deleteTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTests'] });
      toast({
        title: "Тест удален",
        description: "Тест успешно удален",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить тест",
        variant: "destructive"
      });
    }
  });

  const updateResultStatusMutation = useMutation({
    mutationFn: ({ resultId, status, comment }: { resultId: number; status: string; comment?: string }) =>
      updateResultStatus(resultId, status, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testResults'] });
      toast({
        title: "Статус обновлен",
        description: "Статус результата успешно обновлен",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус",
        variant: "destructive"
      });
    }
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'entry': return <Users className="h-4 w-4" />;
      case 'medical': return <Target className="h-4 w-4" />;
      case 'fire': return <Flame className="h-4 w-4" />;
      case 'police': return <Shield className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCreateTest = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditTest = (test: Test) => {
    setSelectedTest(test);
    setIsEditModalOpen(true);
  };

  const handleDeleteTest = (testId: number) => {
    if (confirm('Вы уверены, что хотите удалить этот тест?')) {
      deleteTestMutation.mutate(testId);
    }
  };

  const handleSaveTest = () => {
    if (newTest.title && newTest.description && newTest.category && newTest.difficulty && newTest.questions.length > 0) {
      createTestMutation.mutate({
        ...newTest,
        durationMinutes: parseInt(newTest.durationMinutes.toString()),
        isActive: true
      });
    } else {
      toast({
        title: "Ошибка валидации",
        description: "Заполните все обязательные поля и добавьте хотя бы один вопрос",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTest = () => {
    if (selectedTest && newTest.title && newTest.description && newTest.category && newTest.difficulty) {
      updateTestMutation.mutate({
        id: selectedTest.id,
        ...newTest,
        durationMinutes: parseInt(newTest.durationMinutes.toString())
      });
    }
  };

  const handleStatusUpdate = async (resultId: number, status: 'approved' | 'rejected', comment?: string) => {
    updateResultStatusMutation.mutate({ resultId, status, comment });
  };

  if (testsLoading || resultsLoading || analyticsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Загрузка...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление тестами</h1>
          <p className="text-gray-600">
            Создавайте, редактируйте и проверяйте результаты тестов
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tests">Тесты</TabsTrigger>
            <TabsTrigger value="results">Результаты</TabsTrigger>
            <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          </TabsList>

          <TabsContent value="tests" className="space-y-6">
            {/* Tests Management */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Список тестов</h2>
              <Button onClick={handleCreateTest}>
                <Plus className="h-4 w-4 mr-2" />
                Создать тест
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tests.map((test: Test) => (
                <Card key={test.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(test.category)}
                        <CardTitle className="text-lg">{test.title}</CardTitle>
                      </div>
                      <Badge className={getDifficultyColor(test.difficulty)}>
                        {test.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{test.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{test.durationMinutes} мин</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{test.questionsCount} вопросов</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Попыток:</span>
                        <span className="font-medium ml-1">{test.totalAttempts}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Проходимость:</span>
                        <span className="font-medium ml-1">{test.passRate}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant={test.isActive ? "default" : "secondary"}>
                        {test.isActive ? "Активен" : "Неактивен"}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditTest(test)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTest(test.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {/* Test Results Management */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Результаты тестов</h2>
              <div className="flex space-x-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="pending">На проверке</SelectItem>
                    <SelectItem value="approved">Одобрены</SelectItem>
                    <SelectItem value="rejected">Отклонены</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Тест</TableHead>
                      <TableHead>Результат</TableHead>
                      <TableHead>Время</TableHead>
                      <TableHead>Нарушения</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result: TestResult) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">{result.username}</TableCell>
                        <TableCell>{result.testTitle}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{result.percentage}%</span>
                            {result.passed ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatTime(result.timeSpent)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Фокус: {result.focusLostCount}</div>
                            <div>Предупреждения: {result.warningsCount}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(result.status)}>
                            {result.status === 'pending' ? 'На проверке' : 
                             result.status === 'approved' ? 'Одобрен' : 'Отклонен'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <TestResultDetails 
                            result={result} 
                            onStatusUpdate={handleStatusUpdate}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Test Analytics */}
            {analytics && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <FileText className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Всего тестов</dt>
                            <dd className="text-2xl font-bold text-gray-900">{analytics.overview.totalTests}</dd>
                          </dl>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Users className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Всего попыток</dt>
                            <dd className="text-2xl font-bold text-gray-900">{analytics.overview.totalAttempts}</dd>
                          </dl>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-8 w-8 text-yellow-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Средняя проходимость</dt>
                            <dd className="text-2xl font-bold text-gray-900">{analytics.overview.passRate}%</dd>
                          </dl>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Статистика по тестам</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.testStats.map((stat: any) => (
                        <div key={stat.testId} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            {getCategoryIcon(stat.category)}
                            <div>
                              <h3 className="font-medium">{stat.title}</h3>
                              <p className="text-sm text-gray-600">{stat.category} • {stat.difficulty}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <div className="text-lg font-bold">{stat.totalAttempts}</div>
                              <div className="text-sm text-gray-600">Попыток</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold">{stat.passRate}%</div>
                              <div className="text-sm text-gray-600">Проходимость</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold">{Math.round(stat.avgScore || 0)}%</div>
                              <div className="text-sm text-gray-600">Средний балл</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Create Test Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Создать новый тест</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Название теста</label>
                  <Input 
                    placeholder="Введите название теста"
                    value={newTest.title}
                    onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Длительность (минуты)</label>
                  <Input 
                    type="number" 
                    placeholder="20"
                    value={newTest.durationMinutes}
                    onChange={(e) => setNewTest({ ...newTest, durationMinutes: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Описание</label>
                <Textarea 
                  placeholder="Описание теста"
                  value={newTest.description}
                  onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Категория</label>
                  <Select value={newTest.category} onValueChange={(value) => setNewTest({ ...newTest, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Вступление</SelectItem>
                      <SelectItem value="medical">Медицина</SelectItem>
                      <SelectItem value="fire">Пожарная служба</SelectItem>
                      <SelectItem value="police">Полиция</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Сложность</label>
                  <Select value={newTest.difficulty} onValueChange={(value) => setNewTest({ ...newTest, difficulty: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите сложность" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Легкий</SelectItem>
                      <SelectItem value="medium">Средний</SelectItem>
                      <SelectItem value="hard">Сложный</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TestQuestionEditor 
                questions={newTest.questions}
                onQuestionsChange={(questions) => setNewTest({ ...newTest, questions })}
              />

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleSaveTest} disabled={createTestMutation.isPending}>
                  {createTestMutation.isPending ? 'Создание...' : 'Создать тест'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Test Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Редактировать тест</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Название теста</label>
                  <Input 
                    placeholder="Введите название теста" 
                    value={newTest.title}
                    onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Длительность (минуты)</label>
                  <Input 
                    type="number" 
                    placeholder="20" 
                    value={newTest.durationMinutes}
                    onChange={(e) => setNewTest({ ...newTest, durationMinutes: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Описание</label>
                <Textarea 
                  placeholder="Описание теста" 
                  value={newTest.description}
                  onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Категория</label>
                  <Select value={newTest.category} onValueChange={(value) => setNewTest({ ...newTest, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Вступление</SelectItem>
                      <SelectItem value="medical">Медицина</SelectItem>
                      <SelectItem value="fire">Пожарная служба</SelectItem>
                      <SelectItem value="police">Полиция</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Сложность</label>
                  <Select value={newTest.difficulty} onValueChange={(value) => setNewTest({ ...newTest, difficulty: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите сложность" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Легкий</SelectItem>
                      <SelectItem value="medium">Средний</SelectItem>
                      <SelectItem value="hard">Сложный</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TestQuestionEditor 
                questions={newTest.questions}
                onQuestionsChange={(questions) => setNewTest({ ...newTest, questions })}
              />

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleUpdateTest} disabled={updateTestMutation.isPending}>
                  {updateTestMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
} 