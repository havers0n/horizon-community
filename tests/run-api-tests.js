#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Конфигурация
const config = {
    testFile: path.join(__dirname, 'api-tests.js'),
    mochaConfig: {
        timeout: 30000,
        reporter: 'spec',
        require: ['chai/register-expect']
    },
    environment: {
        NODE_ENV: 'test',
        API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
        ADMIN_TOKEN: process.env.ADMIN_TOKEN || 'admin_test_token',
        USER_TOKEN: process.env.USER_TOKEN || 'user_test_token'
    }
};

// Утилиты для работы с отчетами
class TestReporter {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            startTime: null,
            endTime: null,
            tests: []
        };
    }

    start() {
        this.results.startTime = new Date();
        console.log('🚀 Запуск тестов API эндпоинтов...\n');
    }

    addTest(test) {
        this.results.tests.push(test);
        this.results.total++;
        
        if (test.status === 'passed') {
            this.results.passed++;
        } else if (test.status === 'failed') {
            this.results.failed++;
        } else if (test.status === 'skipped') {
            this.results.skipped++;
        }
    }

    finish() {
        this.results.endTime = new Date();
        this.generateReport();
    }

    generateReport() {
        const duration = this.results.endTime - this.results.startTime;
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 ОТЧЕТ О ТЕСТИРОВАНИИ API ЭНДПОИНТОВ');
        console.log('='.repeat(60));
        
        console.log(`⏱️  Время выполнения: ${duration}ms`);
        console.log(`📈 Всего тестов: ${this.results.total}`);
        console.log(`✅ Успешно: ${this.results.passed}`);
        console.log(`❌ Провалено: ${this.results.failed}`);
        console.log(`⏭️  Пропущено: ${this.results.skipped}`);
        
        const successRate = ((this.results.passed / this.results.total) * 100).toFixed(2);
        console.log(`📊 Процент успеха: ${successRate}%`);
        
        if (this.results.failed > 0) {
            console.log('\n❌ ПРОВАЛЕННЫЕ ТЕСТЫ:');
            this.results.tests
                .filter(test => test.status === 'failed')
                .forEach(test => {
                    console.log(`  - ${test.name}: ${test.error}`);
                });
        }
        
        console.log('\n' + '='.repeat(60));
        
        // Сохраняем отчет в файл
        this.saveReport();
    }

    saveReport() {
        const reportPath = path.join(__dirname, 'test-reports', 'api-test-report.json');
        const reportDir = path.dirname(reportPath);
        
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }
        
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`📄 Отчет сохранен: ${reportPath}`);
    }
}

// Проверка зависимостей
function checkDependencies() {
    const requiredPackages = ['mocha', 'chai', 'axios'];
    const missingPackages = [];
    
    for (const pkg of requiredPackages) {
        try {
            require.resolve(pkg);
        } catch (e) {
            missingPackages.push(pkg);
        }
    }
    
    if (missingPackages.length > 0) {
        console.error('❌ Отсутствуют необходимые пакеты:');
        missingPackages.forEach(pkg => console.error(`  - ${pkg}`));
        console.log('\nУстановите их командой:');
        console.log(`npm install --save-dev ${missingPackages.join(' ')}`);
        process.exit(1);
    }
}

// Проверка доступности API
async function checkAPIAvailability() {
    const axios = require('axios');
    
    try {
        console.log('🔍 Проверка доступности API...');
        const response = await axios.get(config.environment.API_BASE_URL, {
            timeout: 5000
        });
        console.log('✅ API доступен');
        return true;
    } catch (error) {
        console.error('❌ API недоступен:', error.message);
        console.log('Убедитесь, что сервер запущен и доступен по адресу:', config.environment.API_BASE_URL);
        return false;
    }
}

// Запуск тестов с Mocha
function runMochaTests() {
    return new Promise((resolve, reject) => {
        const mochaArgs = [
            config.testFile,
            '--timeout', config.mochaConfig.timeout.toString(),
            '--reporter', config.mochaConfig.reporter
        ];
        
        // Добавляем переменные окружения
        Object.entries(config.environment).forEach(([key, value]) => {
            process.env[key] = value;
        });
        
        const mocha = spawn('npx', ['mocha', ...mochaArgs], {
            stdio: 'inherit',
            env: process.env
        });
        
        mocha.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Mocha завершился с кодом ${code}`));
            }
        });
        
        mocha.on('error', (error) => {
            reject(error);
        });
    });
}

// Основная функция
async function main() {
    const reporter = new TestReporter();
    
    try {
        // Проверяем зависимости
        checkDependencies();
        
        // Проверяем доступность API
        const apiAvailable = await checkAPIAvailability();
        if (!apiAvailable) {
            process.exit(1);
        }
        
        // Запускаем тесты
        reporter.start();
        await runMochaTests();
        reporter.finish();
        
        console.log('\n✅ Все тесты выполнены успешно!');
        
    } catch (error) {
        console.error('\n❌ Ошибка при выполнении тестов:', error.message);
        reporter.finish();
        process.exit(1);
    }
}

// Запуск если файл выполняется напрямую
if (require.main === module) {
    main();
}

module.exports = {
    main,
    TestReporter,
    config
}; 