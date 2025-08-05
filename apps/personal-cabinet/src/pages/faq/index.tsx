
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Часто задаваемые вопросы</h1>
        <p className="text-muted-foreground">
          Ответы на самые популярные вопросы пользователей
        </p>
      </div>

      <div className="grid gap-6">
        {/* FAQ Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Общие вопросы</CardTitle>
              <CardDescription>
                Основные вопросы по работе с системой
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">12 вопросов</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Заявки и переводы</CardTitle>
              <CardDescription>
                Вопросы по подаче заявок и переводам
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">8 вопросов</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Отчеты и документы</CardTitle>
              <CardDescription>
                Работа с отчетами и документацией
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">15 вопросов</p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ List */}
        <Card>
          <CardHeader>
            <CardTitle>Популярные вопросы</CardTitle>
            <CardDescription>
              Наиболее часто задаваемые вопросы
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                {
                  question: 'Как подать заявку на перевод в другой отдел?',
                  answer: 'Для подачи заявки на перевод перейдите в раздел "Заявки" и выберите "Новая заявка". Выберите тип заявки "Перевод" и заполните все необходимые поля. После отправки заявка будет рассмотрена руководством.',
                  category: 'Заявки и переводы'
                },
                {
                  question: 'Как создать новый отчет?',
                  answer: 'В разделе "Отчеты" выберите подходящий шаблон отчета. Заполните все обязательные поля и сохраните черновик или сразу опубликуйте отчет. Все отчеты сохраняются в вашем профиле.',
                  category: 'Отчеты и документы'
                },
                {
                  question: 'Как пройти обязательный тест?',
                  answer: 'Перейдите в раздел "Тесты" и найдите тест с пометкой "Обязательный". Нажмите "Начать тест" и следуйте инструкциям. У вас будет ограниченное время для прохождения теста.',
                  category: 'Общие вопросы'
                },
                {
                  question: 'Как изменить личные данные в профиле?',
                  answer: 'В правом верхнем углу нажмите на ваш аватар и выберите "Профиль". В разделе "Личные данные" вы можете изменить контактную информацию, но некоторые поля могут быть недоступны для редактирования.',
                  category: 'Общие вопросы'
                },
                {
                  question: 'Как получить доступ к MDT системе?',
                  answer: 'Доступ к MDT предоставляется администраторами системы. Обратитесь к вашему руководителю или создайте тикет в разделе "Поддержка" с запросом на предоставление доступа.',
                  category: 'Общие вопросы'
                },
                {
                  question: 'Что делать, если забыл пароль?',
                  answer: 'На странице входа нажмите "Забыли пароль?" и следуйте инструкциям для восстановления доступа. Если у вас возникли проблемы, обратитесь в службу поддержки.',
                  category: 'Общие вопросы'
                },
                {
                  question: 'Как отследить статус поданной заявки?',
                  answer: 'В разделе "Заявки" вы можете увидеть все ваши заявки и их текущий статус. Статус обновляется в реальном времени, и вы получите уведомление при изменении статуса.',
                  category: 'Заявки и переводы'
                },
                {
                  question: 'Можно ли отредактировать отправленный отчет?',
                  answer: 'Отчеты можно редактировать только в статусе "Черновик". После публикации отчет становится доступен только для просмотра. Для внесения изменений создайте новый отчет.',
                  category: 'Отчеты и документы'
                },
                {
                  question: 'Как связаться с администрацией?',
                  answer: 'Используйте раздел "Поддержка" для создания тикета или обратитесь к вашему непосредственному руководителю. Для срочных вопросов используйте Discord сервер организации.',
                  category: 'Общие вопросы'
                },
                {
                  question: 'Какие документы нужны для подачи заявки на отпуск?',
                  answer: 'Для заявки на отпуск достаточно указать даты и причину. Дополнительные документы могут потребоваться в зависимости от типа отпуска и политики организации.',
                  category: 'Заявки и переводы'
                },
              ].map((faq, index) => (
                <div key={index} className="border-b pb-6 last:border-b-0">
                  <div className="mb-2">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {faq.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card>
          <CardHeader>
            <CardTitle>Не нашли ответ?</CardTitle>
            <CardDescription>
              Если вы не нашли ответ на свой вопрос, обратитесь в службу поддержки
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Создать тикет</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Отправьте запрос в службу поддержки
                </p>
                <Button>Создать тикет</Button>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Discord сервер</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Присоединяйтесь к нашему сообществу
                </p>
                <Button variant="outline">Присоединиться</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Поиск по вопросам</CardTitle>
            <CardDescription>
              Найдите ответ на свой вопрос
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Введите ваш вопрос..."
                className="flex-1 p-2 border rounded-md"
              />
              <Button>Найти</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 