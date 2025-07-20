-- Миграция для системы шаблонов рапортов
-- Создание таблиц для шаблонов и заполненных рапортов

-- Таблица шаблонов рапортов
CREATE TABLE IF NOT EXISTS report_templates (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Таблица заполненных рапортов
CREATE TABLE IF NOT EXISTS filled_reports (
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL REFERENCES report_templates(id),
    author_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    supervisor_comment TEXT,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_report_templates_department_id ON report_templates(department_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_is_active ON report_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_report_templates_created_by ON report_templates(created_by);

CREATE INDEX IF NOT EXISTS idx_filled_reports_template_id ON filled_reports(template_id);
CREATE INDEX IF NOT EXISTS idx_filled_reports_author_id ON filled_reports(author_id);
CREATE INDEX IF NOT EXISTS idx_filled_reports_status ON filled_reports(status);
CREATE INDEX IF NOT EXISTS idx_filled_reports_created_at ON filled_reports(created_at);

-- RLS политики для report_templates
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;

-- Политика для чтения: все могут читать активные шаблоны
CREATE POLICY "report_templates_select_policy" ON report_templates
    FOR SELECT USING (is_active = true);

-- Политика для создания: только админы и супервайзеры
CREATE POLICY "report_templates_insert_policy" ON report_templates
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::integer 
            AND users.role IN ('admin', 'supervisor')
        )
    );

-- Политика для обновления: только создатель или админы
CREATE POLICY "report_templates_update_policy" ON report_templates
    FOR UPDATE USING (
        created_by = auth.uid()::integer 
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::integer 
            AND users.role = 'admin'
        )
    );

-- Политика для удаления: только админы
CREATE POLICY "report_templates_delete_policy" ON report_templates
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::integer 
            AND users.role = 'admin'
        )
    );

-- RLS политики для filled_reports
ALTER TABLE filled_reports ENABLE ROW LEVEL SECURITY;

-- Политика для чтения: пользователи видят только свои рапорты, админы видят все
CREATE POLICY "filled_reports_select_policy" ON filled_reports
    FOR SELECT USING (
        author_id = auth.uid()::integer 
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::integer 
            AND users.role IN ('admin', 'supervisor')
        )
    );

-- Политика для создания: пользователи могут создавать свои рапорты
CREATE POLICY "filled_reports_insert_policy" ON filled_reports
    FOR INSERT WITH CHECK (author_id = auth.uid()::integer);

-- Политика для обновления: пользователи могут обновлять только свои черновики
CREATE POLICY "filled_reports_update_policy" ON filled_reports
    FOR UPDATE USING (
        (author_id = auth.uid()::integer AND status = 'draft')
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::integer 
            AND users.role IN ('admin', 'supervisor')
        )
    );

-- Политика для удаления: только админы
CREATE POLICY "filled_reports_delete_policy" ON filled_reports
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::integer 
            AND users.role = 'admin'
        )
    );

-- Вставка начальных шаблонов
INSERT INTO report_templates (title, body, created_by) VALUES
(
    'Рапорт об инциденте',
    'РАПОРТ

Дата: {{ДАТА}}
Время: {{ВРЕМЯ}}

Я, {{ДОЛЖНОСТЬ}} {{ИМЯ_ОФИЦЕРА}}, докладываю о происшествии, зафиксированном по адресу: {{МЕСТО_ПРОИСШЕСТВИЯ}}.

ОПИСАНИЕ ИНЦИДЕНТА:
{{ОПИСАНИЕ_ИНЦИДЕНТА}}

УЧАСТНИКИ:
{{УЧАСТНИКИ}}

ПРИНЯТЫЕ МЕРЫ:
{{ПРИНЯТЫЕ_МЕРЫ}}

Подпись: ____________ ({{ИМЯ_ОФИЦЕРА}})',
    1
),
(
    'Рапорт о дорожно-транспортном происшествии',
    'РАПОРТ О ДТП

Дата ДТП: {{ДАТА_ДТП}}
Время ДТП: {{ВРЕМЯ_ДТП}}
Место ДТП: {{МЕСТО_ДТП}}

Транспортное средство 1:
Марка/Модель: {{МАРКА_МОДЕЛЬ_ТС1}}
Гос. номер: {{ГОС_НОМЕР_ТС1}}
Водитель: {{ВОДИТЕЛЬ_ТС1}}

Транспортное средство 2:
Марка/Модель: {{МАРКА_МОДЕЛЬ_ТС2}}
Гос. номер: {{ГОС_НОМЕР_ТС2}}
Водитель: {{ВОДИТЕЛЬ_ТС2}}

Обстоятельства ДТП:
{{ОБСТОЯТЕЛЬСТВА_ДТП}}

Пострадавшие:
{{ПОСТРАДАВШИЕ}}

Офицер: {{ИМЯ_ОФИЦЕРА}}
Подразделение: {{ПОДРАЗДЕЛЕНИЕ}}',
    1
),
(
    'Рапорт о пожаре',
    'РАПОРТ О ПОЖАРЕ

Дата вызова: {{ДАТА_ВЫЗОВА}}
Время прибытия: {{ВРЕМЯ_ПРИБЫТИЯ}}
Адрес: {{АДРЕС_ПОЖАРА}}

Предполагаемая причина возгорания:
{{ПРИЧИНА_ВОЗГОРАНИЯ}}

Масштаб пожара:
{{МАСШТАБ_ПОЖАРА}}

Задействованные ресурсы:
{{РЕСУРСЫ}}

Пострадавшие / Жертвы:
{{ПОСТРАДАВШИЕ_И_ЖЕРТВЫ}}

Руководитель тушения пожара: {{РУКОВОДИТЕЛЬ_ТУШЕНИЯ}}',
    1
),
(
    'Рапорт о медицинском событии',
    'МЕДИЦИНСКИЙ РАПОРТ

Дата и время вызова: {{ДАТА_И_ВРЕМЯ}}
Место происшествия: {{МЕСТО_ПРОИСШЕСТВИЯ}}

Данные пациента:
ФИО: {{ФИО_ПАЦИЕНТА}}
Возраст: {{ВОЗРАСТ_ПАЦИЕНТА}}

Жалобы:
{{ЖАЛОБЫ}}

Объективный осмотр:
{{ОСМОТР}}

Оказанная помощь:
{{ОКАЗАННАЯ_ПОМОЩЬ}}

Диагноз:
{{ДИАГНОЗ}}

Мед. бригада: {{МЕД_БРИГАДА}}',
    1
);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_report_templates_updated_at 
    BEFORE UPDATE ON report_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_filled_reports_updated_at 
    BEFORE UPDATE ON filled_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 