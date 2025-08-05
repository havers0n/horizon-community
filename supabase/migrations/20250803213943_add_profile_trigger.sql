-- Миграция для добавления триггера автоматического создания профилей
-- Этот триггер будет автоматически создавать запись в таблице profiles
-- при создании нового пользователя в auth.users

-- Создаем триггер для автоматического создания профилей
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Добавляем права на выполнение функции для всех ролей
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role; 