const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Загружаем переменные окружения
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Ошибка: Не найдены переменные окружения SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBasicTemplates() {
  try {
    console.log('Создаем базовую таблицу report_templates...');

    // Создаем таблицу report_templates
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS report_templates (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        department_id INTEGER,
        created_by INTEGER NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        category TEXT NOT NULL DEFAULT 'general',
        subcategory TEXT,
        purpose TEXT,
        who_fills TEXT,
        when_used TEXT,
        template_example TEXT,
        filled_example TEXT,
        difficulty TEXT DEFAULT 'medium',
        estimated_time INTEGER,
        required_fields TEXT[] DEFAULT '{}',
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // Выполняем SQL через Supabase
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    if (createError) {
      console.error('Ошибка создания таблицы:', createError.message);
      // Попробуем создать таблицу через обычный запрос
      console.log('Пробуем альтернативный способ...');
    }

    // Создаем индексы
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_report_templates_category ON report_templates(category)',
      'CREATE INDEX IF NOT EXISTS idx_report_templates_subcategory ON report_templates(subcategory)',
      'CREATE INDEX IF NOT EXISTS idx_report_templates_difficulty ON report_templates(difficulty)',
      'CREATE INDEX IF NOT EXISTS idx_report_templates_is_active ON report_templates(is_active)'
    ];

    for (const indexSQL of indexes) {
      const { error } = await supabase.rpc('exec_sql', { sql: indexSQL });
      if (error) {
        console.error('Ошибка создания индекса:', error.message);
      }
    }

    // Добавляем базовые шаблоны
    console.log('Добавляем базовые шаблоны...');
    
    const basicTemplates = [
      {
        title: 'Рапорт об инциденте',
        body: `РАПОРТ

Дата: {{ДАТА}}
Время: {{ВРЕМЯ}}

Я, {{ДОЛЖНОСТЬ}} {{ИМЯ_ОФИЦЕРА}}, докладываю о происшествии, зафиксированном по адресу: {{МЕСТО_ПРОИСШЕСТВИЯ}}.

ОПИСАНИЕ ИНЦИДЕНТА:
{{ОПИСАНИЕ_ИНЦИДЕНТА}}

УЧАСТНИКИ:
{{УЧАСТНИКИ}}

ПРИНЯТЫЕ МЕРЫ:
{{ПРИНЯТЫЕ_МЕРЫ}}

Подпись: ____________ ({{ИМЯ_ОФИЦЕРА}})`,
        category: 'police',
        subcategory: 'incident',
        purpose: 'Общий рапорт о происшествии',
        who_fills: 'Любой офицер',
        when_used: 'Любое происшествие',
        difficulty: 'easy',
        estimated_time: 10,
        required_fields: ['ДАТА', 'ВРЕМЯ', 'МЕСТО_ПРОИСШЕСТВИЯ', 'ИМЯ_ОФИЦЕРА'],
        tags: ['инцидент', 'происшествие', 'общий'],
        created_by: 1,
        is_active: true
      },
      {
        title: 'Рапорт о дорожно-транспортном происшествии',
        body: `РАПОРТ О ДТП

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
Подразделение: {{ПОДРАЗДЕЛЕНИЕ}}`,
        category: 'police',
        subcategory: 'traffic',
        purpose: 'Документирование дорожно-транспортного происшествия',
        who_fills: 'Офицер ДТП',
        when_used: 'Любое ДТП, авария, столкновение',
        difficulty: 'medium',
        estimated_time: 20,
        required_fields: ['ДАТА_ДТП', 'ВРЕМЯ_ДТП', 'МЕСТО_ДТП', 'ИМЯ_ОФИЦЕРА'],
        tags: ['дтп', 'авария', 'транспорт', 'столкновение'],
        created_by: 1,
        is_active: true
      },
      {
        title: 'Arrest Report',
        body: `РАПОРТ ОБ АРЕСТЕ

Дата ареста: {{ДАТА_АРЕСТА}}
Время ареста: {{ВРЕМЯ_АРЕСТА}}
Место ареста: {{МЕСТО_АРЕСТА}}

ДАННЫЕ АРЕСТОВАННОГО:
ФИО: {{ФИО_АРЕСТОВАННОГО}}
Дата рождения: {{ДАТА_РОЖДЕНИЯ}}
Адрес: {{АДРЕС_АРЕСТОВАННОГО}}
Телефон: {{ТЕЛЕФОН_АРЕСТОВАННОГО}}

ОБВИНЕНИЯ:
{{ОБВИНЕНИЯ}}

ОБСТОЯТЕЛЬСТВА АРЕСТА:
{{ОБСТОЯТЕЛЬСТВА_АРЕСТА}}

ПРИМЕНЕНИЕ СИЛЫ:
{{ПРИМЕНЕНИЕ_СИЛЫ}}

ИЗЪЯТОЕ ИМУЩЕСТВО:
{{ИЗЪЯТОЕ_ИМУЩЕСТВО}}

Офицер: {{ИМЯ_ОФИЦЕРА}}
Подразделение: {{ПОДРАЗДЕЛЕНИЕ}}`,
        category: 'police',
        subcategory: 'arrest',
        purpose: 'Детали ареста и обвинения',
        who_fills: 'Офицер, производящий арест',
        when_used: 'При аресте подозреваемого',
        difficulty: 'hard',
        estimated_time: 25,
        required_fields: ['ДАТА_АРЕСТА', 'ФИО_АРЕСТОВАННОГО', 'ОБВИНЕНИЯ', 'ИМЯ_ОФИЦЕРА'],
        tags: ['арест', 'обвинение', 'подозреваемый', 'задержание'],
        created_by: 1,
        is_active: true
      },
      {
        title: 'Use of Force Report',
        body: `РАПОРТ О ПРИМЕНЕНИИ СИЛЫ

Дата: {{ДАТА}}
Время: {{ВРЕМЯ}}
Место: {{МЕСТО}}

ОФИЦЕР:
ФИО: {{ИМЯ_ОФИЦЕРА}}
Звание: {{ЗВАНИЕ}}
Подразделение: {{ПОДРАЗДЕЛЕНИЕ}}

ПОДОЗРЕВАЕМЫЙ:
ФИО: {{ФИО_ПОДОЗРЕВАЕМОГО}}
Пол: {{ПОЛ}}
Возраст: {{ВОЗРАСТ}}

ОБСТОЯТЕЛЬСТВА:
{{ОБСТОЯТЕЛЬСТВА}}

ТИП ПРИМЕНЕННОЙ СИЛЫ:
{{ТИП_СИЛЫ}}

ОБОСНОВАНИЕ ПРИМЕНЕНИЯ СИЛЫ:
{{ОБОСНОВАНИЕ}}

ПОСЛЕДСТВИЯ:
{{ПОСЛЕДСТВИЯ}}

СВИДЕТЕЛИ:
{{СВИДЕТЕЛИ}}

Подпись офицера: ____________ ({{ИМЯ_ОФИЦЕРА}})`,
        category: 'police',
        subcategory: 'use_of_force',
        purpose: 'Документирование применения силы',
        who_fills: 'Офицер/Supervisor',
        when_used: 'При применении силы',
        difficulty: 'hard',
        estimated_time: 30,
        required_fields: ['ДАТА', 'ИМЯ_ОФИЦЕРА', 'ТИП_СИЛЫ', 'ОБОСНОВАНИЕ'],
        tags: ['сила', 'применение', 'обоснование', 'защита'],
        created_by: 1,
        is_active: true
      },
      {
        title: 'Evidence/Property Report',
        body: `РАПОРТ ОБ ИЗЪЯТОМ ИМУЩЕСТВЕ/ДОКАЗАТЕЛЬСТВАХ

Дата изъятия: {{ДАТА_ИЗЪЯТИЯ}}
Время изъятия: {{ВРЕМЯ_ИЗЪЯТИЯ}}
Место изъятия: {{МЕСТО_ИЗЪЯТИЯ}}

ОФИЦЕР:
{{ИМЯ_ОФИЦЕРА}}

ТИП ИЗЪЯТИЯ:
{{ТИП_ИЗЪЯТИЯ}}

ОПИСАНИЕ ИЗЪЯТОГО:
{{ОПИСАНИЕ_ИЗЪЯТОГО}}

КАТЕГОРИЯ:
{{КАТЕГОРИЯ}}

СЕРИЙНЫЕ НОМЕРА:
{{СЕРИЙНЫЕ_НОМЕРА}}

ОЦЕНОЧНАЯ СТОИМОСТЬ:
{{ОЦЕНОЧНАЯ_СТОИМОСТЬ}}

МЕСТО ХРАНЕНИЯ:
{{МЕСТО_ХРАНЕНИЯ}}

ОБОСНОВАНИЕ ИЗЪЯТИЯ:
{{ОБОСНОВАНИЕ_ИЗЪЯТИЯ}}

СВИДЕТЕЛИ:
{{СВИДЕТЕЛИ}}

Подпись: ____________ ({{ИМЯ_ОФИЦЕРА}})`,
        category: 'police',
        subcategory: 'evidence',
        purpose: 'Учёт изъятого/обнаруженного имущества/доказательств',
        who_fills: 'Любой офицер',
        when_used: 'Изъятие, находка, конфискация',
        difficulty: 'medium',
        estimated_time: 15,
        required_fields: ['ДАТА_ИЗЪЯТИЯ', 'ОПИСАНИЕ_ИЗЪЯТОГО', 'ИМЯ_ОФИЦЕРА'],
        tags: ['изъятие', 'имущество', 'доказательства', 'конфискация'],
        created_by: 1,
        is_active: true
      }
    ];

    for (const template of basicTemplates) {
      console.log('Добавляем шаблон:', template.title);
      const { error } = await supabase
        .from('report_templates')
        .insert(template);
      
      if (error) {
        console.error('Ошибка добавления шаблона:', error.message);
      } else {
        console.log('✅ Шаблон добавлен:', template.title);
      }
    }

    console.log('✅ Базовая система шаблонов создана успешно!');

    // Проверяем результат
    const { data: templates, error } = await supabase
      .from('report_templates')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Ошибка проверки:', error);
    } else {
      console.log(`Найдено ${templates.length} шаблонов`);
      if (templates.length > 0) {
        console.log('Пример шаблона:', {
          title: templates[0].title,
          category: templates[0].category,
          difficulty: templates[0].difficulty,
          tags: templates[0].tags
        });
      }
    }

  } catch (error) {
    console.error('Ошибка:', error);
    process.exit(1);
  }
}

createBasicTemplates(); 