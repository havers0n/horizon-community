// apps/server/src/db/storage.ts
// Файл для совместимости с тестами

import { SupabaseStorage } from './SupabaseStorage';

// Экспортируем экземпляр для использования в тестах
export const storage = new SupabaseStorage();

// Экспортируем класс для создания новых экземпляров
export { SupabaseStorage }; 