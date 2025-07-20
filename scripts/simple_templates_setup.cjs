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

async function setupTemplates() {
  try {
    console.log('Настраиваем систему шаблонов...');

    // Проверяем, существует ли таблица
    const { data: existingTemplates, error: checkError } = await supabase
      .from('report_templates')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      console.log('Таблица report_templates не существует. Создаем базовую структуру...');
      
      // Создаем простую таблицу через обычные запросы
      // К сожалению, без exec_sql мы не можем создать таблицу
      console.log('Для создания таблицы требуется доступ к базе данных через Supabase CLI или SQL Editor');
      console.log('Пожалуйста, выполните миграцию 010_report_templates_system.sql вручную');
      return;
    }

    console.log('Таблица report_templates существует. Проверяем содержимое...');

    // Получаем все существующие шаблоны
    const { data: templates, error } = await supabase
      .from('report_templates')
      .select('*');

    if (error) {
      console.error('Ошибка получения шаблонов:', error);
      return;
    }

    console.log(`Найдено ${templates.length} существующих шаблонов`);

    // Проверяем, есть ли новые поля
    if (templates.length > 0 && !templates[0].category) {
      console.log('Обновляем существующие шаблоны с новыми полями...');
      
      // Обновляем существующие шаблоны
      const updates = [
        {
          id: templates.find(t => t.title === 'Рапорт об инциденте')?.id,
          category: 'police',
          subcategory: 'incident',
          purpose: 'Общий рапорт о происшествии',
          who_fills: 'Любой офицер',
          when_used: 'Любое происшествие',
          difficulty: 'easy',
          estimated_time: 10,
          required_fields: ['ДАТА', 'ВРЕМЯ', 'МЕСТО_ПРОИСШЕСТВИЯ', 'ИМЯ_ОФИЦЕРА'],
          tags: ['инцидент', 'происшествие', 'общий']
        },
        {
          id: templates.find(t => t.title === 'Рапорт о дорожно-транспортном происшествии')?.id,
          category: 'police',
          subcategory: 'traffic',
          purpose: 'Документирование дорожно-транспортного происшествия',
          who_fills: 'Офицер ДТП',
          when_used: 'Любое ДТП, авария, столкновение',
          difficulty: 'medium',
          estimated_time: 20,
          required_fields: ['ДАТА_ДТП', 'ВРЕМЯ_ДТП', 'МЕСТО_ДТП', 'ИМЯ_ОФИЦЕРА'],
          tags: ['дтп', 'авария', 'транспорт', 'столкновение']
        }
      ];

      for (const update of updates) {
        if (update.id) {
          const { error: updateError } = await supabase
            .from('report_templates')
            .update(update)
            .eq('id', update.id);
          
          if (updateError) {
            console.error('Ошибка обновления шаблона:', updateError.message);
          } else {
            console.log('✅ Шаблон обновлен:', update.id);
          }
        }
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
      // Проверяем, существует ли уже такой шаблон
      const existing = templates.find(t => t.title === template.title);
      if (!existing) {
        console.log('Добавляем шаблон:', template.title);
        const { error: insertError } = await supabase
          .from('report_templates')
          .insert(template);
        
        if (insertError) {
          console.error('Ошибка добавления шаблона:', insertError.message);
        } else {
          console.log('✅ Шаблон добавлен:', template.title);
        }
      } else {
        console.log('Шаблон уже существует:', template.title);
      }
    }

    console.log('✅ Настройка системы шаблонов завершена!');

    // Финальная проверка
    const { data: finalTemplates, error: finalError } = await supabase
      .from('report_templates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (finalError) {
      console.error('Ошибка финальной проверки:', finalError);
    } else {
      console.log(`Всего шаблонов: ${finalTemplates.length}`);
      console.log('Категории:', [...new Set(finalTemplates.map(t => t.category))]);
      console.log('Сложности:', [...new Set(finalTemplates.map(t => t.difficulty))]);
    }

  } catch (error) {
    console.error('Ошибка:', error);
    process.exit(1);
  }
}

setupTemplates(); 