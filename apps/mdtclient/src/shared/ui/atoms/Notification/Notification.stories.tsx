import type { Meta, StoryObj } from '@storybook/react';
import { Notification } from './Notification';

const meta: Meta<typeof Notification> = {
  title: 'Atoms/Notification',
  component: Notification,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['info', 'success', 'warning', 'error'],
    },
    autoClose: {
      control: { type: 'boolean' },
    },
    persistent: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'info',
    title: 'Информация',
    message: 'Это информационное уведомление для пользователя.',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Notification
        variant="info"
        title="Информация"
        message="Это информационное уведомление с заголовком и описанием."
      />
      <Notification
        variant="success"
        title="Успешно"
        message="Операция выполнена успешно. Данные сохранены в системе."
      />
      <Notification
        variant="warning"
        title="Предупреждение"
        message="Внимание! Обнаружены потенциальные проблемы в системе."
      />
      <Notification
        variant="error"
        title="Ошибка"
        message="Произошла критическая ошибка. Пожалуйста, попробуйте снова."
      />
    </div>
  ),
};

export const WithoutTitle: Story = {
  render: () => (
    <div className="space-y-4">
      <Notification
        variant="info"
        message="Простое уведомление без заголовка."
      />
      <Notification
        variant="success"
        message="Операция выполнена успешно."
      />
      <Notification
        variant="warning"
        message="Внимание! Обнаружены проблемы."
      />
      <Notification
        variant="error"
        message="Произошла ошибка в системе."
      />
    </div>
  ),
};

export const Persistent: Story = {
  render: () => (
    <div className="space-y-4">
      <Notification
        variant="warning"
        title="Важное уведомление"
        message="Это уведомление не исчезнет автоматически и требует вашего внимания."
        persistent={true}
      />
      <Notification
        variant="error"
        title="Критическая ошибка"
        message="Система требует немедленного вмешательства администратора."
        persistent={true}
      />
    </div>
  ),
};

export const AutoClose: Story = {
  render: () => (
    <div className="space-y-4">
      <Notification
        variant="info"
        title="Автозакрытие"
        message="Это уведомление закроется автоматически через 5 секунд."
        autoClose={true}
        autoCloseDelay={5000}
      />
      <Notification
        variant="success"
        title="Быстрое закрытие"
        message="Это уведомление закроется через 2 секунды."
        autoClose={true}
        autoCloseDelay={2000}
      />
    </div>
  ),
};

export const LongMessage: Story = {
  render: () => (
    <div className="space-y-4">
      <Notification
        variant="info"
        title="Длинное сообщение"
        message="Это очень длинное уведомление с подробным описанием ситуации. Оно содержит много текста для демонстрации того, как компонент обрабатывает длинные сообщения. Уведомление должно корректно отображать весь текст и не ломать макет интерфейса."
      />
      <Notification
        variant="warning"
        title="Многострочное сообщение"
        message="Первая строка сообщения.\nВторая строка с дополнительной информацией.\nТретья строка с важными деталями."
      />
    </div>
  ),
};

export const Interactive: Story = {
  render: () => (
    <div className="space-y-4">
      <Notification
        variant="info"
        title="Интерактивное уведомление"
        message="Нажмите на крестик, чтобы закрыть это уведомление."
        onClose={() => console.log('Notification closed')}
      />
      <Notification
        variant="success"
        title="Уведомление с действием"
        message="Это уведомление можно закрыть программно или нажав на крестик."
        onClose={() => alert('Уведомление закрыто!')}
      />
    </div>
  ),
};
