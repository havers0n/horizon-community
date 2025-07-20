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

async function applyEnhancedTemplates() {
  try {
    console.log('Добавляем новые поля в таблицу report_templates...');

    // Добавляем новые колонки по одной
    const alterCommands = [
      "ALTER TABLE report_templates ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'general'",
      "ALTER TABLE report_templates ADD COLUMN IF NOT EXISTS subcategory TEXT",
      "ALTER TABLE report_templates ADD COLUMN IF NOT EXISTS purpose TEXT",
      "ALTER TABLE report_templates ADD COLUMN IF NOT EXISTS who_fills TEXT",
      "ALTER TABLE report_templates ADD COLUMN IF NOT EXISTS when_used TEXT",
      "ALTER TABLE report_templates ADD COLUMN IF NOT EXISTS template_example TEXT",
      "ALTER TABLE report_templates ADD COLUMN IF NOT EXISTS filled_example TEXT",
      "ALTER TABLE report_templates ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium'",
      "ALTER TABLE report_templates ADD COLUMN IF NOT EXISTS estimated_time INTEGER",
      "ALTER TABLE report_templates ADD COLUMN IF NOT EXISTS required_fields TEXT[] DEFAULT '{}'",
      "ALTER TABLE report_templates ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'"
    ];

    for (const command of alterCommands) {
      console.log('Выполняем:', command);
      const { error } = await supabase.rpc('exec_sql', { sql: command });
      if (error) {
        console.error('Ошибка:', error.message);
      }
    }

    // Создаем индексы
    const indexCommands = [
      "CREATE INDEX IF NOT EXISTS idx_report_templates_category ON report_templates(category)",
      "CREATE INDEX IF NOT EXISTS idx_report_templates_subcategory ON report_templates(subcategory)",
      "CREATE INDEX IF NOT EXISTS idx_report_templates_difficulty ON report_templates(difficulty)"
    ];

    for (const command of indexCommands) {
      console.log('Создаем индекс:', command);
      const { error } = await supabase.rpc('exec_sql', { sql: command });
      if (error) {
        console.error('Ошибка индекса:', error.message);
      }
    }

    // Обновляем существующие шаблоны
    console.log('Обновляем существующие шаблоны...');
    
    const updateCommands = [
      "UPDATE report_templates SET category = 'police', subcategory = 'incident', purpose = 'Общий рапорт о происшествии', who_fills = 'Любой офицер', when_used = 'Любое происшествие', difficulty = 'easy', estimated_time = 10, required_fields = ARRAY['ДАТА', 'ВРЕМЯ', 'МЕСТО_ПРОИСШЕСТВИЯ', 'ИМЯ_ОФИЦЕРА'], tags = ARRAY['инцидент', 'происшествие', 'общий'] WHERE title = 'Рапорт об инциденте'",
      "UPDATE report_templates SET category = 'police', subcategory = 'traffic', purpose = 'Документирование дорожно-транспортного происшествия', who_fills = 'Офицер ДТП', when_used = 'Любое ДТП, авария, столкновение', difficulty = 'medium', estimated_time = 20, required_fields = ARRAY['ДАТА_ДТП', 'ВРЕМЯ_ДТП', 'МЕСТО_ДТП', 'ИМЯ_ОФИЦЕРА'], tags = ARRAY['дтп', 'авария', 'транспорт', 'столкновение'] WHERE title = 'Рапорт о дорожно-транспортном происшествии'",
      "UPDATE report_templates SET category = 'fire', subcategory = 'fire', purpose = 'Документирование пожара и действий по его тушению', who_fills = 'Руководитель тушения пожара', when_used = 'Любой пожар или возгорание', difficulty = 'medium', estimated_time = 15, required_fields = ARRAY['ДАТА_ВЫЗОВА', 'АДРЕС_ПОЖАРА', 'РУКОВОДИТЕЛЬ_ТУШЕНИЯ'], tags = ARRAY['пожар', 'возгорание', 'тушение'] WHERE title = 'Рапорт о пожаре'",
      "UPDATE report_templates SET category = 'ems', subcategory = 'medical', purpose = 'Документирование медицинского события и оказанной помощи', who_fills = 'Медицинская бригада', when_used = 'Любой медицинский вызов', difficulty = 'medium', estimated_time = 12, required_fields = ARRAY['ДАТА_И_ВРЕМЯ', 'ФИО_ПАЦИЕНТА', 'МЕД_БРИГАДА'], tags = ARRAY['медицина', 'пациент', 'помощь', 'вызов'] WHERE title = 'Рапорт о медицинском событии'"
    ];

    for (const command of updateCommands) {
      console.log('Обновляем шаблон:', command.substring(0, 100) + '...');
      const { error } = await supabase.rpc('exec_sql', { sql: command });
      if (error) {
        console.error('Ошибка обновления:', error.message);
      }
    }

    // Добавляем новые полицейские шаблоны
    console.log('Добавляем новые полицейские шаблоны...');
    
    const newTemplates = [
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

    for (const template of newTemplates) {
      console.log('Добавляем шаблон:', template.title);
      const { error } = await supabase
        .from('report_templates')
        .insert(template);
      
      if (error) {
        console.error('Ошибка добавления шаблона:', error.message);
      }
    }

    console.log('✅ Расширение системы шаблонов завершено успешно!');

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

applyEnhancedTemplates(); 