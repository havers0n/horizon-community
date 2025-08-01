// Этот файл экспортирует все истории для Storybook
// Он автоматически импортируется в .storybook/main.ts

// Атомы
export * from './shared/ui/atoms/Button/Button.stories';
export * from './shared/ui/atoms/Input/Input.stories';
export * from './shared/ui/atoms/Card/Card.stories';
export * from './shared/ui/atoms/Select/Select.stories';
export * from './shared/ui/atoms/Badge/Badge.stories';
export * from './shared/ui/atoms/Checkbox/Checkbox.stories';

// Сущности
export * from './entities/citizen/ui/CitizenCard.stories';
export * from './entities/vehicle/ui/VehicleCard.stories';

// Виджеты
export * from './widgets/officer-dashboard/ui/OfficerDashboardWidget.stories'; 