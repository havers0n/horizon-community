# Инструкции по ручному применению миграции

## 🚀 Применение миграции системы тестирования

Поскольку автоматическое применение миграции требует Service Role Key, выполните следующие шаги вручную:

### Шаг 1: Откройте панель Supabase
1. Перейдите на https://supabase.com/dashboard
2. Выберите ваш проект: `axgtvvcimqoyxbfvdrok`
3. Перейдите в раздел **SQL Editor**

### Шаг 2: Примените миграцию
Скопируйте и выполните следующий SQL код в SQL Editor:

```sql
-- Создание таблиц для системы тестирования

-- Таблица сессий тестов
CREATE TABLE IF NOT EXISTS test_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  test_id INTEGER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  application_id INTEGER REFERENCES applications(id) ON DELETE SET NULL,
  start_time TIMESTAMP NOT NULL DEFAULT NOW(),
  end_time TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Таблица результатов тестов
CREATE TABLE IF NOT EXISTS test_results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  test_id INTEGER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  session_id INTEGER NOT NULL REFERENCES test_sessions(id) ON DELETE CASCADE,
  application_id INTEGER REFERENCES applications(id) ON DELETE SET NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  time_spent INTEGER NOT NULL, -- в секундах
  focus_lost_count INTEGER NOT NULL DEFAULT 0,
  warnings_count INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL,
  results JSONB NOT NULL, -- детальные результаты по каждому вопросу
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_test_sessions_user_test ON test_sessions(user_id, test_id);
CREATE INDEX IF NOT EXISTS idx_test_sessions_status ON test_sessions(status);
CREATE INDEX IF NOT EXISTS idx_test_results_user_test ON test_results(user_id, test_id);
CREATE INDEX IF NOT EXISTS idx_test_results_session ON test_results(session_id);
CREATE INDEX IF NOT EXISTS idx_test_results_application ON test_results(application_id);

-- RLS политики для test_sessions
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;

-- Пользователи могут видеть только свои сессии
CREATE POLICY "Users can view own test sessions" ON test_sessions
  FOR SELECT USING (auth.uid() IN (
    SELECT auth_id FROM users WHERE id = user_id
  ));

-- Пользователи могут создавать свои сессии
CREATE POLICY "Users can create own test sessions" ON test_sessions
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT auth_id FROM users WHERE id = user_id
  ));

-- Пользователи могут обновлять только свои сессии
CREATE POLICY "Users can update own test sessions" ON test_sessions
  FOR UPDATE USING (auth.uid() IN (
    SELECT auth_id FROM users WHERE id = user_id
  ));

-- Админы и супервайзеры могут видеть все сессии
CREATE POLICY "Admins can view all test sessions" ON test_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'supervisor')
    )
  );

-- RLS политики для test_results
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Пользователи могут видеть только свои результаты
CREATE POLICY "Users can view own test results" ON test_results
  FOR SELECT USING (auth.uid() IN (
    SELECT auth_id FROM users WHERE id = user_id
  ));

-- Пользователи могут создавать свои результаты
CREATE POLICY "Users can create own test results" ON test_results
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT auth_id FROM users WHERE id = user_id
  ));

-- Админы и супервайзеры могут видеть все результаты
CREATE POLICY "Admins can view all test results" ON test_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'supervisor')
    )
  );

-- Функция для автоматического обновления updated_at в applications
CREATE OR REPLACE FUNCTION update_application_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_application_updated_at();
```

### Шаг 3: Проверьте результат
После выполнения SQL проверьте, что таблицы созданы:
1. Перейдите в раздел **Table Editor**
2. Убедитесь, что появились таблицы:
   - `test_sessions`
   - `test_results`

### Шаг 4: Создайте тестовые данные (опционально)
Для тестирования системы можно создать тестовый тест:

```sql
-- Создание тестового теста
INSERT INTO tests (title, related_to, duration_minutes, questions) VALUES (
  'Тест на вступление в департамент',
  '{"type": "entry", "departmentId": 1}',
  20,
  '[
    {
      "id": "q1",
      "question": "Какой департамент вы хотите выбрать?",
      "type": "single",
      "options": ["Департамент 1", "Департамент 2", "Департамент 3"],
      "correctAnswer": "Департамент 1",
      "points": 10
    },
    {
      "id": "q2", 
      "question": "Опишите ваш опыт в ролевых играх",
      "type": "text",
      "points": 20
    }
  ]'
);
```

## ✅ После применения миграции

1. **Система тестирования готова к работе**
2. **API эндпоинты доступны:**
   - `GET /api/tests` - список тестов
   - `POST /api/tests/:id/start` - начало теста
   - `POST /api/tests/:id/submit` - отправка ответов
3. **Планировщик автоматически обрабатывает отпуска и сбрасывает лимиты**

## 🔧 Альтернативный способ (если есть Service Role Key)

Если у вас есть Service Role Key, можете выполнить:

```bash
set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
node scripts/apply_test_migration.js
```

---

**Статус:** Миграция готова к применению вручную
**Следующий шаг:** Применить SQL код в панели Supabase 