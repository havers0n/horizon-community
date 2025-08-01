import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './Card';
import { Button } from '../Button/Button';

const meta: Meta<typeof Card> = {
  title: 'UI/Atoms/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Заголовок карточки</CardTitle>
        <CardDescription>Описание карточки с дополнительной информацией</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Основное содержимое карточки. Здесь может быть любой контент.</p>
      </CardContent>
      <CardFooter>
        <Button variant="primary" className="w-full">Действие</Button>
      </CardFooter>
    </Card>
  ),
};

export const SimpleCard: Story = {
  render: () => (
    <Card className="w-[300px] p-6">
      <h3 className="text-lg font-semibold mb-2">Простая карточка</h3>
      <p className="text-slate-400">Простое содержимое без структурированных секций.</p>
    </Card>
  ),
};

export const CardWithImage: Story = {
  render: () => (
    <Card className="w-[300px] overflow-hidden">
      <div className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
        <span className="text-slate-400">Изображение</span>
      </div>
      <CardHeader>
        <CardTitle>Карточка с изображением</CardTitle>
        <CardDescription>Карточка с изображением в заголовке</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Содержимое карточки с изображением.</p>
      </CardContent>
    </Card>
  ),
};

export const CardWithActions: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Карточка с действиями</CardTitle>
        <CardDescription>Карточка с несколькими кнопками действий</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Выберите одно из доступных действий:</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="secondary" size="sm">Отмена</Button>
        <Button variant="primary" size="sm">Подтвердить</Button>
        <Button variant="danger" size="sm">Удалить</Button>
      </CardFooter>
    </Card>
  ),
};

export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle>Карточка 1</CardTitle>
          <CardDescription>Первая карточка в сетке</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Содержимое первой карточки.</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Карточка 2</CardTitle>
          <CardDescription>Вторая карточка в сетке</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Содержимое второй карточки.</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Карточка 3</CardTitle>
          <CardDescription>Третья карточка в сетке</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Содержимое третьей карточки.</p>
        </CardContent>
      </Card>
    </div>
  ),
};

export const InteractiveCard: Story = {
  render: () => (
    <Card className="w-[300px] cursor-pointer hover:border-blue-400/40 transition-all duration-200">
      <CardHeader>
        <CardTitle>Интерактивная карточка</CardTitle>
        <CardDescription>Наведите курсор для эффекта</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Эта карточка реагирует на взаимодействие пользователя.</p>
      </CardContent>
    </Card>
  ),
}; 