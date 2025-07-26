import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  FileText, 
  Users, 
  Target, 
  AlertCircle, 
  CheckCircle 
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useLocation } from "wouter";

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
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  
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
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'entry': return <Users className="h-4 w-4 text-primary dark:text-primary" />;
      case 'medical': return <Target className="h-4 w-4 text-primary dark:text-primary" />;
      case 'fire': return <AlertCircle className="h-4 w-4 text-primary dark:text-primary" />;
      default: return <FileText className="h-4 w-4 text-primary dark:text-primary" />;
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('tests.title', 'Доступные тесты')}</h1>
          <p className="text-muted-foreground">
            {t('tests.subtitle', 'Пройдите тесты для получения доступа к различным департаментам и повышения квалификации')}
          </p>
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-shadow bg-card border-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(test.category)}
                    <CardTitle className="text-lg text-card-foreground">{test.title}</CardTitle>
                  </div>
                  <Badge className={getDifficultyColor(test.difficulty)}>
                    {test.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{test.description}</p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                    <span>{test.durationMinutes} {t('tests.duration', 'мин')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                    <span>{test.questionsCount} {t('tests.questions', 'вопросов')}</span>
                  </div>
                </div>

                {/* Результат последней попытки */}
                {test.lastAttempt && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('tests.last_attempt', 'Последняя попытка:')}</span>
                      <div className="flex items-center space-x-2">
                        {test.lastAttempt.passed ? (
                          <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
                        )}
                        <span className={test.lastAttempt.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          {test.lastAttempt.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  className={`w-full font-medium py-2 px-4 rounded-md transition-colors duration-200 ${
                    test.isAvailable 
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm border border-primary/20 focus:ring-2 focus:ring-primary/20' 
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                  }`}
                  disabled={!test.isAvailable}
                  onClick={() => navigate(`/test/${test.id}`)}
                >
                  {test.isAvailable ? t('tests.take_test', 'Пройти тест') : t('tests.unavailable', 'Недоступно')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Информация о тестах */}
        <div className="mt-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">{t('tests.test_info', 'Информация о тестировании')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2 text-card-foreground">{t('tests.rules_title', 'Правила прохождения:')}</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>{t('tests.rules.dont_leave', '• Не покидайте окно теста во время прохождения')}</li>
                    <li>{t('tests.rules.time_limit', '• У вас есть ограниченное время на ответы')}</li>
                    <li>{t('tests.rules.navigate', '• Можно вернуться к предыдущим вопросам')}</li>
                    <li>{t('tests.rules.auto_save', '• Результаты сохраняются автоматически')}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-card-foreground">{t('tests.scoring_title', 'Система оценки:')}</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>{t('tests.scoring.minimum', '• Минимум 70% для прохождения')}</li>
                    <li>{t('tests.scoring.retry', '• Повторная попытка через 24 часа')}</li>
                    <li>{t('tests.scoring.application', '• Результаты влияют на статус заявки')}</li>
                    <li>{t('tests.scoring.review', '• Администрация может пересмотреть результаты')}</li>
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