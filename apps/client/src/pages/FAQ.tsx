import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Search, 
  HelpCircle, 
  MessageCircle, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { VKIcon } from "@/components/ui/VKIcon";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: 'general' | 'technical' | 'application' | 'gameplay';
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "Где я буду играть?",
    answer: "Наш проект построен на базе платформы FiveM, соответственно на FiveM.",
    category: 'general'
  },
  {
    id: 2,
    question: "Какой возраст нужен для игры?",
    answer: "Вы должны быть старше 16 лет.",
    category: 'general'
  },
  {
    id: 3,
    question: "Могу ли я играть на проекте, если мне нет 16 лет?",
    answer: "Нет, Вы можете играть на проекте только с обозначенного возраста для вступления.",
    category: 'general'
  },
  {
    id: 4,
    question: "Я могу играть на консолях?",
    answer: "Нет, FiveM поддерживает только компьютерную версию игры.",
    category: 'technical'
  },
  {
    id: 5,
    question: "У меня нет лицензионной версии GTA 5, только пиратская, я могу играть у вас?",
    answer: "Нет, у вас должна быть лицензированная игра (Steam, Epic Games Store, RG).",
    category: 'technical'
  },
  {
    id: 6,
    question: "Мне можно играть за DD, если у меня нет ГТА 5?",
    answer: "Да, диспетчерам не обязательно наличие лицензионной копии игры.",
    category: 'technical'
  },
  {
    id: 7,
    question: "Когда я смогу играть у вас?",
    answer: "Для игры у нас, вы должны подать заявку на главной странице, пройти интервью и пройти вступительный тест в желаемый для отыгровки департамент, а также пройти тренировку. Только после этого вы сможете играть у нас.",
    category: 'application'
  },
  {
    id: 8,
    question: "Что насчёт денег? Как мне развиваться?",
    answer: "В отличие от SAMP, у нас нет денежной системы и развития. Вы можете отыгрывать кого угодно в рамках правил, установленных проектом и Департаментом, в котором вы состоите/будете состоять.",
    category: 'gameplay'
  },
  {
    id: 9,
    question: "Почему вы выбрали Штат San-Andreas?",
    answer: "Для того, чтобы иметь возможность не опираться на какой-либо штат, и дать игрокам больше возможностей для отыгровок.",
    category: 'general'
  },
  {
    id: 10,
    question: "Я могу нон-РПшить на сервере?",
    answer: "Наш сервер создан для отыгровки различных рп-ситуаций в рамках мероприятий, называемых \"активными сменами\". Во время них запрещена и строго карается любая нон-рп деятельность. В остальное же время вы вольны делать на сервере любые вещи, не запрещенные правилами проекта.",
    category: 'gameplay'
  },
  {
    id: 11,
    question: "Какой терминал вы используете?",
    answer: "Мы используем уникальный терминал и базу данных. Подробнее об этом узнаете после вступления в сообщество.",
    category: 'technical'
  },
  {
    id: 12,
    question: "Почему моя заявка отклонена?",
    answer: "Скорее всего, ваша заявка не удовлетворяет нашим требованиям. Внимательно заполняйте пункты заявки на главной странице.",
    category: 'application'
  },
  {
    id: 13,
    question: "Когда я смогу подать заявку снова?",
    answer: "Вы можете подать не более 3 заявок в месяц.",
    category: 'application'
  },
  {
    id: 14,
    question: "Почему не могу подать заявку?",
    answer: "Возможно, вы получили блокировку, или вам отказали в заявке. Однако, если у вас есть вопросы, обращайтесь в сообщения поддержки или в сообщения группы ВК.",
    category: 'application'
  },
  {
    id: 15,
    question: "Мне нужен микрофон?",
    answer: "Да, для игрового взаимодействия вам потребуется исправный микрофон, также, Вам запрещено использовать колонки и микрофон вместе.",
    category: 'technical'
  },
  {
    id: 16,
    question: "Какие департаменты доступны на проекте?",
    answer: "На проекте доступны такие департаменты как: LSPD/BCSO, SAHP, SAMS, SAMR, DD, CD.",
    category: 'general'
  },
  {
    id: 17,
    question: "Могу ли я играть с баном в GTA Online или в Steam?",
    answer: "Да, бан в GTA Online и Steam не влияет на FiveM.",
    category: 'technical'
  },
  {
    id: 18,
    question: "Что представляет из себя интервью?",
    answer: "Это закрытая информация, однако, там не будет ничего сложного.",
    category: 'application'
  },
  {
    id: 19,
    question: "Где я смогу найти документы департаментов?",
    answer: "Вы найдете их только после того, как успешно пройдете интервью.",
    category: 'application'
  },
  {
    id: 20,
    question: "Я могу играть в нескольких департаментах одновременно?",
    answer: "Да, в нашем сообществе действует механика \"совмещений\".",
    category: 'gameplay'
  },
  {
    id: 21,
    question: "Могу ли я записывать видео на сервере?",
    answer: "Да, если у Вас имеются требуемые разрешения от Администрации.",
    category: 'gameplay'
  },
  {
    id: 22,
    question: "Что делать, если я не нашёл ответа на свой вопрос?",
    answer: "Если вы не нашли ответа на вопрос, обратитесь в сообщения группы ВКонтакте.",
    category: 'general'
  }
];

const FAQ: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'general' | 'technical' | 'application' | 'gameplay'>('all');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const handleDiscordClick = () => {
    window.open('https://discord.gg/your-server', '_blank');
  };

  const handleVKClick = () => {
    window.open('https://vk.com/your-group', '_blank');
  };

  const toggleItem = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryLabels = {
    all: 'Все вопросы',
    general: 'Общие вопросы',
    technical: 'Технические вопросы',
    application: 'Вопросы по заявкам',
    gameplay: 'Игровой процесс'
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card shadow-sm border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Часто задаваемые вопросы
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Найдите ответы на самые популярные вопросы о нашем ролевом сообществе
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="оиск по вопросам..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-gold"
              />
            </div>
            <div className="flex gap-2">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(key as any)}
                  className={selectedCategory === key ? "btn-gold" : ""}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQ.map((item) => (
            <Card key={item.id} className="card-hover card-gold">
              <CardHeader 
                className="cursor-pointer pb-2"
                onClick={() => toggleItem(item.id)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    {item.question}
                  </CardTitle>
                  {expandedItems.has(item.id) ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              {expandedItems.has(item.id) && (
                <CardContent className="pt-0">
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* No results */}
        {filteredFAQ.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">Вопрос не найден</h3>
            <p className="text-muted-foreground mb-6">
              Попробуйте изменить поисковый запрос или обратитесь к нам напрямую
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleVKClick} variant="outline" className="btn-gold-outline">
                <VKIcon className="h-4 w-4 mr-2" />
                Группа ВК
              </Button>
              <Button onClick={handleDiscordClick} className="btn-gold">
                <DiscordIcon className="h-4 w-4 mr-2" />
                Discord
              </Button>
            </div>
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-12">
          <Card className="card-gold bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  Не нашли ответ на свой вопрос?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Свяжитесь с нами через Discord или группу ВКонтакте, и мы обязательно поможем вам
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={handleDiscordClick}
                    className="btn-gold"
                  >
                    <DiscordIcon className="h-4 w-4 mr-2" />
                    Наш Discord
                  </Button>
                  <Button 
                    onClick={handleVKClick}
                    variant="outline"
                    className="btn-gold-outline"
                  >
                    <VKIcon className="h-4 w-4 mr-2" />
                    Группа ВК
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        {!user && (
          <div className="mt-8">
            <Card className="card-gold">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">
                    Готовы присоединиться к нам?
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Подайте заявку и станьте частью нашего сообщества
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button asChild className="btn-gold">
                      <a href="/register">Подать заявку</a>
                    </Button>
                    <Button variant="outline" asChild className="btn-gold-outline">
                      <a href="/departments">Узнать о департаментах</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
};

export default FAQ;
