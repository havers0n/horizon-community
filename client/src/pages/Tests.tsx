import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  FileText, 
  Clock, 
  Users, 
  Target,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface Test {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  questionsCount: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isAvailable: boolean;
  lastAttempt?: {
    passed: boolean;
    percentage: number;
    date: string;
  };
}

export default function Tests() {
  // Mock данные тестов (в реальности будут загружаться с API)
  const mockTests: Test[] = [
    {
      id: 1,
      title: "LSPD Entry Exam",
      description: "Базовый тест для вступления в полицейский департамент",
      durationMinutes: 20,
      questionsCount: 15,
      category: "entry",
      difficulty: "medium",
      isAvailable: true
    },
    {
      id: 2,
      title: "SAHP Entry Exam", 
      description: "Тест для вступления в патрульную службу шоссе",
      durationMinutes: 25,
      questionsCount: 20,
      category: "entry",
      difficulty: "medium",
      isAvailable: true
    },
    {
      id: 3,
      title: "SAMS Medical Test",
      description: "Тест на знание медицинских процедур",
      durationMinutes: 30,
      questionsCount: 25,
      category: "medical",
      difficulty: "hard",
      isAvailable: true,
      lastAttempt: {
        passed: false,
        percentage: 65,
        date: "2024-12-15"
      }
    },
    {
      id: 4,
      title: "SAFR Fire Safety",
      description: "Тест по пожарной безопасности",
      durationMinutes: 15,
      questionsCount: 10,
      category: "fire",
      difficulty: "easy",
      isAvailable: false
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'entry': return <Users className="h-4 w-4" />;
      case 'medical': return <Target className="h-4 w-4" />;
      case 'fire': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Доступные тесты</h1>
          <p className="text-gray-600">
            Пройдите тесты для получения доступа к различным департаментам и повышения квалификации
          </p>
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTests.map((test) => (
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
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{test.durationMinutes} мин</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>{test.questionsCount} вопросов</span>
                  </div>
                </div>

                {/* Результат последней попытки */}
                {test.lastAttempt && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Последняя попытка:</span>
                      <div className="flex items-center space-x-2">
                        {test.lastAttempt.passed ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className={test.lastAttempt.passed ? 'text-green-600' : 'text-red-600'}>
                          {test.lastAttempt.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full"
                  disabled={!test.isAvailable}
                  onClick={() => window.location.href = `/test/${test.id}`}
                >
                  {test.isAvailable ? 'Пройти тест' : 'Недоступно'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Информация о тестах */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Информация о тестировании</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Правила прохождения:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Не покидайте окно теста во время прохождения</li>
                    <li>• У вас есть ограниченное время на ответы</li>
                    <li>• Можно вернуться к предыдущим вопросам</li>
                    <li>• Результаты сохраняются автоматически</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Система оценки:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Минимум 70% для прохождения</li>
                    <li>• Повторная попытка через 24 часа</li>
                    <li>• Результаты влияют на статус заявки</li>
                    <li>• Администрация может пересмотреть результаты</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
} 