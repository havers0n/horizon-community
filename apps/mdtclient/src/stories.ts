// Этот файл экспортирует все истории для Storybook
// Он автоматически импортируется в .storybook/main.ts

// Атомы
export { default as ButtonStories } from './shared/ui/atoms/Button/Button.stories';
export { default as InputStories } from './shared/ui/atoms/Input/Input.stories';
export { default as CardStories } from './shared/ui/atoms/Card/Card.stories';
export { default as SelectStories } from './shared/ui/atoms/Select/Select.stories';
export { default as BadgeStories } from './shared/ui/atoms/Badge/Badge.stories';
export { default as CheckboxStories } from './shared/ui/atoms/Checkbox/Checkbox.stories';

// Сущности
export { default as CitizenCardStories } from './entities/citizen/ui/CitizenCard.stories';
export { default as VehicleCardStories } from './entities/vehicle/ui/VehicleCard.stories';

// Виджеты
export { default as OfficerDashboardWidgetStories } from './widgets/officer-dashboard/ui/OfficerDashboardWidget.stories'; 