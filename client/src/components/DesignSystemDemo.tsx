import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';

export function DesignSystemDemo() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Заголовок */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Дизайн-система</h1>
          <p className="text-xl text-muted-foreground">
            Текущая тема: <span className="text-primary font-semibold capitalize">{theme}</span>
          </p>
        </div>

        {/* Цветовая палитра */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Цветовая палитра</h2>
          
          {/* Сравнительная таблица */}
          <Card className="card-gold">
            <CardHeader>
              <CardTitle>📊 Сравнительная таблица цветов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2">Назначение</th>
                      <th className="text-left p-2">Тёмная тема</th>
                      <th className="text-left p-2">Светлая тема</th>
                      <th className="text-left p-2">Применение</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="p-2 font-medium">Фон</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#191F23] border border-border rounded"></div>
                          <span className="font-mono text-xs">#191F23</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#FFFFFF] border border-border rounded"></div>
                          <span className="font-mono text-xs">#FFFFFF</span>
                        </div>
                      </td>
                      <td className="p-2 text-muted-foreground">Основной фон приложения</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-2 font-medium">Карточка/блок</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#23292F] border border-border rounded"></div>
                          <span className="font-mono text-xs">#23292F</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#F8F5EE] border border-border rounded"></div>
                          <span className="font-mono text-xs">#F8F5EE</span>
                        </div>
                      </td>
                      <td className="p-2 text-muted-foreground">Контентные блоки, модальные окна</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-2 font-medium">Текст главный</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#E2C178] border border-border rounded"></div>
                          <span className="font-mono text-xs">#E2C178</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#191F23] border border-border rounded"></div>
                          <span className="font-mono text-xs">#191F23</span>
                        </div>
                      </td>
                      <td className="p-2 text-muted-foreground">Заголовки, основной текст</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-2 font-medium">Текст вторичный</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#C4B68A] border border-border rounded"></div>
                          <span className="font-mono text-xs">#C4B68A</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#444A50] border border-border rounded"></div>
                          <span className="font-mono text-xs">#444A50</span>
                        </div>
                      </td>
                      <td className="p-2 text-muted-foreground">Подписи, вспомогательный текст</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-2 font-medium">Акцент</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#E2C178] border border-border rounded"></div>
                          <span className="font-mono text-xs">#E2C178</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#E2C178] border border-border rounded"></div>
                          <span className="font-mono text-xs">#E2C178</span>
                        </div>
                      </td>
                      <td className="p-2 text-muted-foreground">Кнопки, ссылки, важные элементы</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="p-2 font-medium">Интерактив</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#B89D5A] border border-border rounded"></div>
                          <span className="font-mono text-xs">#B89D5A</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#B89D5A] border border-border rounded"></div>
                          <span className="font-mono text-xs">#B89D5A</span>
                        </div>
                      </td>
                      <td className="p-2 text-muted-foreground">Состояния hover, focus</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Граница</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#2C333A] border border-border rounded"></div>
                          <span className="font-mono text-xs">#2C333A</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#ECE3D3] border border-border rounded"></div>
                          <span className="font-mono text-xs">#ECE3D3</span>
                        </div>
                      </td>
                      <td className="p-2 text-muted-foreground">Разделители, обводки элементов</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="card-gold">
              <CardHeader>
                <CardTitle className="text-sm">Primary (Золото)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="w-full h-16 bg-primary rounded-lg"></div>
                <p className="text-xs text-muted-foreground">#E2C178</p>
              </CardContent>
            </Card>
            
            <Card className="card-gold">
              <CardHeader>
                <CardTitle className="text-sm">Background</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="w-full h-16 bg-background border border-border rounded-lg"></div>
                <p className="text-xs text-muted-foreground">
                  {theme === 'dark' ? '#191F23' : '#FFFFFF'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-gold">
              <CardHeader>
                <CardTitle className="text-sm">Card</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="w-full h-16 bg-card border border-border rounded-lg"></div>
                <p className="text-xs text-muted-foreground">
                  {theme === 'dark' ? '#23292F' : '#F8F5EE'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-gold">
              <CardHeader>
                <CardTitle className="text-sm">Success</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="w-full h-16 bg-success rounded-lg"></div>
                <p className="text-xs text-muted-foreground">#81C784</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Кнопки */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Кнопки</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Primary</h3>
              <div className="space-y-2">
                <Button className="btn-gold w-full">Основная кнопка</Button>
                <Button className="btn-gold-outline w-full">Контурная кнопка</Button>
                <Button className="btn-gradient-primary w-full">Градиентная кнопка</Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Secondary</h3>
              <div className="space-y-2">
                <Button variant="secondary" className="w-full">Вторичная кнопка</Button>
                <Button variant="outline" className="w-full">Контурная кнопка</Button>
                <Button variant="ghost" className="w-full">Призрачная кнопка</Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Success/Error</h3>
              <div className="space-y-2">
                <Button className="btn-gradient-success w-full">Успех</Button>
                <Button className="btn-gradient-error w-full">Ошибка</Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Размеры</h3>
              <div className="space-y-2">
                <Button size="sm" className="btn-gold w-full">Маленькая</Button>
                <Button size="default" className="btn-gold w-full">Средняя</Button>
                <Button size="lg" className="btn-gold w-full">Большая</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Формы */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Формы</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="card-gold">
              <CardHeader>
                <CardTitle>Поля ввода</CardTitle>
                <CardDescription>Примеры различных типов полей</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Текстовое поле</label>
                  <Input className="input-gold" placeholder="Введите текст" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Выпадающий список</label>
                  <Select>
                    <SelectTrigger className="select-gold">
                      <SelectValue placeholder="Выберите опцию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="option1">Опция 1</SelectItem>
                      <SelectItem value="option2">Опция 2</SelectItem>
                      <SelectItem value="option3">Опция 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox className="checkbox-gold" id="terms" />
                  <label htmlFor="terms" className="text-sm text-foreground">
                    Согласен с условиями
                  </label>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-gold">
              <CardHeader>
                <CardTitle>Состояния полей</CardTitle>
                <CardDescription>Различные состояния интерактивных элементов</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Обычное состояние</label>
                  <Input className="input-gold" placeholder="Обычное поле" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">С фокусом</label>
                  <Input className="input-gold focus:ring-2 focus:ring-primary" placeholder="Сфокусированное поле" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Отключенное</label>
                  <Input className="input-gold" placeholder="Отключенное поле" disabled />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Статусы */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Статусы</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="card-gold">
              <CardHeader>
                <CardTitle>Статусы заявок</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Одобрено</span>
                  <Badge className="status-badge approved">Одобрено</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Отклонено</span>
                  <Badge className="status-badge rejected">Отклонено</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">В ожидании</span>
                  <Badge className="status-badge pending">В ожидании</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-gold">
              <CardHeader>
                <CardTitle>Уведомления</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                  <p className="text-sm text-success-foreground">Успешная операция</p>
                </div>
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">Ошибка операции</p>
                </div>
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <p className="text-sm text-warning-foreground">Предупреждение</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-gold">
              <CardHeader>
                <CardTitle>Прогресс</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Загрузка</span>
                    <span className="text-muted-foreground">75%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Выполнено</span>
                    <span className="text-muted-foreground">100%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Карточки */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Карточки</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="card-hover card-gold">
              <CardHeader>
                <CardTitle>Обычная карточка</CardTitle>
                <CardDescription>Карточка с hover эффектом</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Это пример обычной карточки с золотым акцентом и анимацией при наведении.
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-gold bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle>Градиентная карточка</CardTitle>
                <CardDescription>Карточка с градиентным фоном</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Карточка с мягким градиентным фоном в золотых тонах.
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-gold border-primary/30">
              <CardHeader>
                <CardTitle>Акцентная карточка</CardTitle>
                <CardDescription>Карточка с золотой границей</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Карточка с выделенной золотой границей для важного контента.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Анимации */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Анимации</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="card-gold fade-in">
              <CardHeader>
                <CardTitle className="text-sm">Fade In</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Появление с прозрачности</p>
              </CardContent>
            </Card>
            
            <Card className="card-gold slide-up">
              <CardHeader>
                <CardTitle className="text-sm">Slide Up</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Появление снизу вверх</p>
              </CardContent>
            </Card>
            
            <Card className="card-gold scale-in">
              <CardHeader>
                <CardTitle className="text-sm">Scale In</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Появление с масштабирования</p>
              </CardContent>
            </Card>
            
            <Card className="card-gold pulse-gentle">
              <CardHeader>
                <CardTitle className="text-sm">Pulse</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Мягкая пульсация</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Типографика */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Типографика</h2>
          <Card className="card-gold">
            <CardContent className="space-y-4 pt-6">
              <div>
                <h1 className="text-4xl font-bold text-foreground">Заголовок H1</h1>
                <p className="text-sm text-muted-foreground">4xl (36px) - Основной заголовок страницы</p>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-foreground">Заголовок H2</h2>
                <p className="text-sm text-muted-foreground">3xl (30px) - Заголовки разделов</p>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-foreground">Заголовок H3</h3>
                <p className="text-sm text-muted-foreground">2xl (24px) - Подзаголовки</p>
              </div>
              
              <div>
                <h4 className="text-xl font-semibold text-foreground">Заголовок H4</h4>
                <p className="text-sm text-muted-foreground">xl (20px) - Заголовки карточек</p>
              </div>
              
              <div>
                <p className="text-base text-foreground">Обычный текст (16px)</p>
                <p className="text-sm text-muted-foreground">Мелкий текст (14px) - описания и подписи</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground">Очень мелкий текст (12px) - метаданные</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

export default DesignSystemDemo; 