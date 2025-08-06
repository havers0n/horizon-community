#!/usr/bin/env node

const newman = require('newman');
const fs = require('fs');
const path = require('path');

// Конфигурация
const config = {
    collection: path.join(__dirname, 'postman-collection.json'),
    environment: path.join(__dirname, 'postman-environment.json'),
    reporters: ['cli', 'json', 'html'],
    timeout: 30000,
    delay: 1000, // Задержка между запросами
    outputDir: path.join(__dirname, 'test-results')
};

// Создание директории для результатов
if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
}

// Функция для генерации отчета
function generateReport(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(config.outputDir, `api-test-report-${timestamp}.json`);
    
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            total: results.run.stats.requests.total,
            passed: results.run.stats.requests.passed,
            failed: results.run.stats.requests.failed,
            skipped: results.run.stats.requests.skipped,
            duration: results.run.timings.completed - results.run.timings.started
        },
        details: results.run.executions.map(execution => ({
            name: execution.item.name,
            status: execution.response ? 'completed' : 'failed',
            responseTime: execution.response ? execution.response.responseTime : null,
            statusCode: execution.response ? execution.response.code : null,
            error: execution.response ? null : execution.error
        })),
        failures: results.run.failures || []
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Отчет сохранен: ${reportPath}`);
    
    return report;
}

// Функция для вывода статистики
function printStats(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 СТАТИСТИКА ТЕСТИРОВАНИЯ API');
    console.log('='.repeat(60));
    
    const { summary } = report;
    const successRate = ((summary.passed / summary.total) * 100).toFixed(2);
    
    console.log(`⏱️  Время выполнения: ${summary.duration}ms`);
    console.log(`📈 Всего запросов: ${summary.total}`);
    console.log(`✅ Успешно: ${summary.passed}`);
    console.log(`❌ Провалено: ${summary.failed}`);
    console.log(`⏭️  Пропущено: ${summary.skipped}`);
    console.log(`📊 Процент успеха: ${successRate}%`);
    
    if (summary.failed > 0) {
        console.log('\n❌ ПРОВАЛЕННЫЕ ЗАПРОСЫ:');
        report.details
            .filter(detail => detail.status === 'failed')
            .forEach(detail => {
                console.log(`  - ${detail.name}: ${detail.error || 'Ошибка выполнения'}`);
            });
    }
    
    console.log('\n' + '='.repeat(60));
}

// Основная функция запуска тестов
function runTests() {
    console.log('🚀 Запуск тестов API через Postman/Newman...\n');
    
    return new Promise((resolve, reject) => {
        newman.run({
            collection: config.collection,
            environment: config.environment,
            reporters: config.reporters,
            timeout: config.timeout,
            delay: config.delay,
            reporter: {
                json: {
                    export: path.join(config.outputDir, 'newman-results.json')
                },
                html: {
                    export: path.join(config.outputDir, 'newman-report.html')
                }
            }
        }, function (err, results) {
            if (err) {
                console.error('❌ Ошибка при выполнении тестов:', err.message);
                reject(err);
                return;
            }
            
            try {
                const report = generateReport(results);
                printStats(report);
                
                if (report.summary.failed === 0) {
                    console.log('✅ Все тесты выполнены успешно!');
                    resolve(report);
                } else {
                    console.log(`⚠️  ${report.summary.failed} тестов провалено`);
                    resolve(report);
                }
            } catch (error) {
                console.error('❌ Ошибка при генерации отчета:', error.message);
                reject(error);
            }
        });
    });
}

// Проверка зависимостей
function checkDependencies() {
    try {
        require.resolve('newman');
    } catch (e) {
        console.error('❌ Newman не установлен');
        console.log('Установите Newman командой:');
        console.log('npm install -g newman');
        process.exit(1);
    }
    
    // Проверка существования файлов
    if (!fs.existsSync(config.collection)) {
        console.error('❌ Файл коллекции не найден:', config.collection);
        process.exit(1);
    }
    
    if (!fs.existsSync(config.environment)) {
        console.error('❌ Файл окружения не найден:', config.environment);
        process.exit(1);
    }
}

// Функция для запуска тестов с параметрами
function runTestsWithOptions(options = {}) {
    const testConfig = { ...config, ...options };
    
    console.log('🔧 Конфигурация тестирования:');
    console.log(`  Коллекция: ${testConfig.collection}`);
    console.log(`  Окружение: ${testConfig.environment}`);
    console.log(`  Таймаут: ${testConfig.timeout}ms`);
    console.log(`  Задержка: ${testConfig.delay}ms`);
    console.log('');
    
    return new Promise((resolve, reject) => {
        newman.run({
            collection: testConfig.collection,
            environment: testConfig.environment,
            reporters: testConfig.reporters,
            timeout: testConfig.timeout,
            delay: testConfig.delay,
            reporter: {
                json: {
                    export: path.join(testConfig.outputDir, 'newman-results.json')
                },
                html: {
                    export: path.join(testConfig.outputDir, 'newman-report.html')
                }
            }
        }, function (err, results) {
            if (err) {
                reject(err);
                return;
            }
            
            try {
                const report = generateReport(results);
                printStats(report);
                resolve(report);
            } catch (error) {
                reject(error);
            }
        });
    });
}

// CLI интерфейс
function parseArguments() {
    const args = process.argv.slice(2);
    const options = {};
    
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--timeout':
                options.timeout = parseInt(args[++i]) || 30000;
                break;
            case '--delay':
                options.delay = parseInt(args[++i]) || 1000;
                break;
            case '--collection':
                options.collection = args[++i];
                break;
            case '--environment':
                options.environment = args[++i];
                break;
            case '--help':
                console.log(`
Использование: node run-postman-tests.js [опции]

Опции:
  --timeout <ms>        Таймаут для запросов (по умолчанию: 30000)
  --delay <ms>          Задержка между запросами (по умолчанию: 1000)
  --collection <path>   Путь к файлу коллекции
  --environment <path>  Путь к файлу окружения
  --help                Показать эту справку

Примеры:
  node run-postman-tests.js
  node run-postman-tests.js --timeout 60000 --delay 2000
  node run-postman-tests.js --collection ./custom-collection.json
                `);
                process.exit(0);
                break;
        }
    }
    
    return options;
}

// Основная функция
async function main() {
    try {
        // Проверяем зависимости
        checkDependencies();
        
        // Парсим аргументы командной строки
        const options = parseArguments();
        
        // Запускаем тесты
        const report = await runTestsWithOptions(options);
        
        // Возвращаем код выхода в зависимости от результатов
        process.exit(report.summary.failed === 0 ? 0 : 1);
        
    } catch (error) {
        console.error('❌ Критическая ошибка:', error.message);
        process.exit(1);
    }
}

// Экспорт функций для использования в других модулях
module.exports = {
    runTests,
    runTestsWithOptions,
    generateReport,
    printStats,
    config
};

// Запуск если файл выполняется напрямую
if (require.main === module) {
    main();
} 