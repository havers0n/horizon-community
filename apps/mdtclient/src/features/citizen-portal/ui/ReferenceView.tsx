import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/atoms';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/atoms';
import { Button } from '@/shared/ui/atoms';
import { BookOpen, Search, FileText, Heart, Shield, AlertTriangle } from 'lucide-react';

interface ReferenceViewProps {
  subView: string;
}

// Типы для статей уголовного кодекса
interface CriminalCodeArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  penalty: string;
  details: string;
}

// Типы для медицинских справочников
interface MedicalReference {
  id: string;
  title: string;
  description: string;
  category: string;
  symptoms: string[];
  treatment: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const ReferenceView: React.FC<ReferenceViewProps> = ({ subView }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const defaultTab = subView || 'criminal-code';

  // Моковые данные для уголовного кодекса
  const criminalCodeArticles: CriminalCodeArticle[] = [
    {
      id: '1',
      title: 'Убийство первой степени',
      description: 'Предумышленное убийство другого человека',
      category: 'Преступления против жизни',
      penalty: 'Пожизненное заключение или смертная казнь',
      details: 'Убийство первой степени включает в себя предумышленное лишение жизни другого человека с особой жестокостью, из корыстных побуждений или в отношении двух или более лиц.'
    },
    {
      id: '2',
      title: 'Убийство второй степени',
      description: 'Убийство без предварительного умысла',
      category: 'Преступления против жизни',
      penalty: '15-25 лет лишения свободы',
      details: 'Убийство второй степени происходит в состоянии аффекта или при превышении пределов необходимой обороны.'
    },
    {
      id: '3',
      title: 'Кража',
      description: 'Тайное хищение чужого имущества',
      category: 'Преступления против собственности',
      penalty: 'Штраф или лишение свободы до 5 лет',
      details: 'Кража включает в себя тайное хищение чужого имущества без применения насилия.'
    },
    {
      id: '4',
      title: 'Грабеж',
      description: 'Открытое хищение чужого имущества',
      category: 'Преступления против собственности',
      penalty: 'Лишение свободы от 3 до 10 лет',
      details: 'Грабеж - это открытое хищение чужого имущества, совершенное без применения насилия или с применением насилия, не опасного для жизни или здоровья.'
    },
    {
      id: '5',
      title: 'Разбой',
      description: 'Нападение с целью хищения имущества',
      category: 'Преступления против собственности',
      penalty: 'Лишение свободы от 8 до 15 лет',
      details: 'Разбой - это нападение с целью хищения чужого имущества, совершенное с применением насилия, опасного для жизни или здоровья.'
    },
    {
      id: '6',
      title: 'Незаконное хранение оружия',
      description: 'Хранение оружия без соответствующего разрешения',
      category: 'Преступления против общественной безопасности',
      penalty: 'Штраф или лишение свободы до 3 лет',
      details: 'Незаконное хранение огнестрельного оружия, боеприпасов или взрывчатых веществ без соответствующего разрешения.'
    },
    {
      id: '7',
      title: 'Управление ТС в состоянии опьянения',
      description: 'Вождение автомобиля под воздействием алкоголя или наркотиков',
      category: 'Преступления против безопасности движения',
      penalty: 'Лишение прав на 1-3 года, штраф или лишение свободы',
      details: 'Управление транспортным средством лицом, находящимся в состоянии алкогольного, наркотического или иного токсического опьянения.'
    },
    {
      id: '8',
      title: 'Незаконный оборот наркотиков',
      description: 'Изготовление, сбыт и хранение наркотических веществ',
      category: 'Преступления против здоровья населения',
      penalty: 'Лишение свободы от 3 до 20 лет',
      details: 'Незаконное изготовление, приобретение, хранение, перевозка, пересылка либо сбыт наркотических средств или психотропных веществ.'
    }
  ];

  // Моковые данные для медицинского справочника
  const medicalReferences: MedicalReference[] = [
    {
      id: '1',
      title: 'Остановка сердца',
      description: 'Внезапная остановка сердечной деятельности',
      category: 'Неотложные состояния',
      symptoms: ['Потеря сознания', 'Отсутствие пульса', 'Остановка дыхания', 'Расширенные зрачки'],
      treatment: 'Немедленная сердечно-легочная реанимация (СЛР), дефибрилляция, вызов скорой помощи',
      severity: 'critical'
    },
    {
      id: '2',
      title: 'Инфаркт миокарда',
      description: 'Острое нарушение кровоснабжения сердечной мышцы',
      category: 'Кардиология',
      symptoms: ['Сильная боль в груди', 'Одышка', 'Тошнота', 'Холодный пот', 'Страх смерти'],
      treatment: 'Немедленная госпитализация, тромболитическая терапия, стентирование',
      severity: 'critical'
    },
    {
      id: '3',
      title: 'Инсульт',
      description: 'Острое нарушение мозгового кровообращения',
      category: 'Неврология',
      symptoms: ['Внезапная слабость в конечностях', 'Нарушение речи', 'Асимметрия лица', 'Головокружение'],
      treatment: 'Немедленная госпитализация, тромболитическая терапия в течение 4.5 часов',
      severity: 'critical'
    },
    {
      id: '4',
      title: 'Переломы',
      description: 'Нарушение целостности кости',
      category: 'Травматология',
      symptoms: ['Боль в месте травмы', 'Отек', 'Деформация', 'Нарушение функции'],
      treatment: 'Иммобилизация, рентгенография, репозиция отломков, гипсовая повязка',
      severity: 'high'
    },
    {
      id: '5',
      title: 'Ожоги',
      description: 'Повреждение тканей под действием высокой температуры',
      category: 'Травматология',
      symptoms: ['Боль', 'Покраснение кожи', 'Образование пузырей', 'Некроз тканей'],
      treatment: 'Охлаждение пораженного участка, стерильная повязка, обезболивание',
      severity: 'high'
    },
    {
      id: '6',
      title: 'Отравление',
      description: 'Патологическое состояние, вызванное токсическими веществами',
      category: 'Токсикология',
      symptoms: ['Тошнота и рвота', 'Головокружение', 'Слабость', 'Нарушение сознания'],
      treatment: 'Промывание желудка, активированный уголь, симптоматическая терапия',
      severity: 'high'
    },
    {
      id: '7',
      title: 'Аллергическая реакция',
      description: 'Патологическая реакция иммунной системы на аллерген',
      category: 'Аллергология',
      symptoms: ['Кожная сыпь', 'Зуд', 'Отек', 'Затруднение дыхания'],
      treatment: 'Антигистаминные препараты, адреналин при анафилаксии',
      severity: 'medium'
    },
    {
      id: '8',
      title: 'Гипертонический криз',
      description: 'Резкое повышение артериального давления',
      category: 'Кардиология',
      symptoms: ['Головная боль', 'Тошнота', 'Головокружение', 'Покраснение лица'],
      treatment: 'Гипотензивные препараты, постельный режим, контроль давления',
      severity: 'high'
    }
  ];

  // Фильтрация статей уголовного кодекса
  const filteredCriminalArticles = criminalCodeArticles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Фильтрация медицинских справочников
  const filteredMedicalReferences = medicalReferences.filter(ref =>
    ref.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ref.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ref.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-slate-400';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Критическое';
      case 'high': return 'Высокое';
      case 'medium': return 'Среднее';
      case 'low': return 'Низкое';
      default: return 'Неизвестно';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Справочная информация</h1>
        <p className="text-slate-400">
          Уголовный кодекс и медицинский справочник для быстрого доступа
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="criminal-code">Уголовный кодекс</TabsTrigger>
          <TabsTrigger value="medical">Медицинский справочник</TabsTrigger>
        </TabsList>

        <TabsContent value="criminal-code" className="mt-6">
          <div className="space-y-6">
            {/* Поиск */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Поиск по статьям уголовного кодекса..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Список статей */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredCriminalArticles.map((article) => (
                <Card key={article.id} className="hover:bg-slate-800/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-500" />
                        <div>
                          <h3 className="font-semibold text-white">{article.title}</h3>
                          <p className="text-sm text-slate-400">{article.category}</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">Ст. {article.id}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-sm mb-3">{article.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Наказание:</span>
                        <span className="text-red-400 font-medium">{article.penalty}</span>
                      </div>
                      <details className="mt-3">
                        <summary className="cursor-pointer text-primary-400 hover:text-primary-300">
                          Подробности
                        </summary>
                        <p className="text-slate-400 mt-2 text-xs leading-relaxed">
                          {article.details}
                        </p>
                      </details>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="medical" className="mt-6">
          <div className="space-y-6">
            {/* Поиск */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Поиск по медицинскому справочнику..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Список медицинских справочников */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredMedicalReferences.map((ref) => (
                <Card key={ref.id} className="hover:bg-slate-800/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        <div>
                          <h3 className="font-semibold text-white">{ref.title}</h3>
                          <p className="text-sm text-slate-400">{ref.category}</p>
                        </div>
                      </div>
                      <span className={`text-xs ${getSeverityColor(ref.severity)}`}>
                        {getSeverityText(ref.severity)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-sm mb-3">{ref.description}</p>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-slate-400 font-medium">Симптомы:</span>
                        <ul className="list-disc list-inside text-slate-300 mt-1">
                          {ref.symptoms.map((symptom, index) => (
                            <li key={index} className="text-xs">{symptom}</li>
                          ))}
                        </ul>
                      </div>
                      <details className="mt-3">
                        <summary className="cursor-pointer text-primary-400 hover:text-primary-300">
                          Лечение
                        </summary>
                        <p className="text-slate-400 mt-2 text-xs leading-relaxed">
                          {ref.treatment}
                        </p>
                      </details>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 