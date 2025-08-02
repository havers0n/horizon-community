#!/usr/bin/env node

/**
 * Скрипт для детального анализа результатов тестов
 * Позволяет получить точную статистику и детали по каждому тесту
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestAnalyzer {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      suites: [],
      errors: [],
      performance: {
        totalTime: 0,
        averageTime: 0,
        slowestTests: []
      }
    };
  }

  /**
   * Запускает тесты и собирает результаты
   */
  async runTests(options = {}) {
    const {
      verbose = false,
      timeout = 30000,
      detectOpenHandles = true,
      maxWorkers = 1
    } = options;

    console.log('🧪 Запуск тестов...\n');

    try {
      const command = [
        'npm test',
        verbose ? '--verbose' : '',
        detectOpenHandles ? '--detectOpenHandles' : '',
        `--maxWorkers=${maxWorkers}`,
        `--testTimeout=${timeout}`,
        '--json',
        '--outputFile=test-results.json'
      ].filter(Boolean).join(' ');

      console.log(`Выполняется команда: ${command}`);
      
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 300000 // 5 минут максимум
      });

      return this.parseResults(output);
    } catch (error) {
      console.error('❌ Ошибка при выполнении тестов:', error.message);
      return this.parseErrorOutput(error.stdout || error.stderr);
    }
  }

  /**
   * Парсит результаты тестов
   */
  parseResults(output) {
    try {
      // Пытаемся прочитать JSON файл с результатами
      if (fs.existsSync('test-results.json')) {
        const jsonResults = JSON.parse(fs.readFileSync('test-results.json', 'utf8'));
        return this.processJsonResults(jsonResults);
      }
    } catch (error) {
      console.warn('⚠️ Не удалось прочитать JSON результаты, парсим текстовый вывод');
    }

    return this.parseTextOutput(output);
  }

  /**
   * Обрабатывает JSON результаты
   */
  processJsonResults(jsonResults) {
    const results = {
      total: jsonResults.numTotalTests,
      passed: jsonResults.numPassedTests,
      failed: jsonResults.numFailedTests,
      suites: [],
      errors: [],
      performance: {
        totalTime: jsonResults.testResults.reduce((sum, suite) => sum + suite.endTime - suite.startTime, 0),
        averageTime: 0,
        slowestTests: []
      }
    };

    // Обрабатываем каждый тестовый набор
    jsonResults.testResults.forEach(suite => {
      const suiteInfo = {
        name: suite.name,
        total: suite.numTotalTests,
        passed: suite.numPassedTests,
        failed: suite.numFailedTests,
        time: suite.endTime - suite.startTime,
        tests: []
      };

      // Обрабатываем тесты в наборе
      suite.testResults.forEach(test => {
        const testInfo = {
          name: test.fullName,
          status: test.status,
          time: test.duration,
          error: test.failureMessages?.[0] || null
        };

        suiteInfo.tests.push(testInfo);

        if (test.status === 'failed') {
          results.errors.push({
            suite: suite.name,
            test: test.fullName,
            error: test.failureMessages?.[0] || 'Unknown error'
          });
        }
      });

      results.suites.push(suiteInfo);
    });

    // Вычисляем среднее время
    results.performance.averageTime = results.performance.totalTime / results.total;

    // Находим самые медленные тесты
    const allTests = results.suites.flatMap(suite => suite.tests);
    results.performance.slowestTests = allTests
      .sort((a, b) => b.time - a.time)
      .slice(0, 10);

    return results;
  }

  /**
   * Парсит текстовый вывод тестов
   */
  parseTextOutput(output) {
    const lines = output.split('\n');
    const results = {
      total: 0,
      passed: 0,
      failed: 0,
      suites: [],
      errors: [],
      performance: {
        totalTime: 0,
        averageTime: 0,
        slowestTests: []
      }
    };

    let currentSuite = null;
    let currentTest = null;

    for (const line of lines) {
      // Ищем общую статистику
      if (line.includes('Test Suites:')) {
        const match = line.match(/Tests:\s+(\d+)\s+failed,\s+(\d+)\s+passed,\s+(\d+)\s+total/);
        if (match) {
          results.failed = parseInt(match[1]);
          results.passed = parseInt(match[2]);
          results.total = parseInt(match[3]);
        }
      }

      // Ищем время выполнения
      if (line.includes('Time:')) {
        const match = line.match(/Time:\s+([\d.]+)\s+s/);
        if (match) {
          results.performance.totalTime = parseFloat(match[1]) * 1000; // в миллисекундах
        }
      }

      // Ищем названия тестовых наборов
      if (line.includes('FAIL') || line.includes('PASS')) {
        const suiteName = line.split(' ').slice(1).join(' ');
        currentSuite = {
          name: suiteName,
          status: line.includes('FAIL') ? 'failed' : 'passed',
          total: 0,
          passed: 0,
          failed: 0,
          tests: []
        };
        results.suites.push(currentSuite);
      }

      // Ищем тесты
      if (line.includes('✓') || line.includes('×')) {
        const testName = line.split(' ').slice(1).join(' ');
        const status = line.includes('✓') ? 'passed' : 'failed';
        
        if (currentSuite) {
          currentTest = {
            name: testName,
            status,
            time: 0,
            error: null
          };
          currentSuite.tests.push(currentTest);
          currentSuite.total++;
          if (status === 'passed') {
            currentSuite.passed++;
          } else {
            currentSuite.failed++;
          }
        }
      }

      // Ищем ошибки
      if (line.includes('●') && currentTest) {
        currentTest.error = line.replace('●', '').trim();
        results.errors.push({
          suite: currentSuite?.name || 'Unknown',
          test: currentTest.name,
          error: currentTest.error
        });
      }
    }

    return results;
  }

  /**
   * Парсит вывод ошибок
   */
  parseErrorOutput(output) {
    const lines = output.split('\n');
    const results = {
      total: 0,
      passed: 0,
      failed: 0,
      suites: [],
      errors: [],
      performance: {
        totalTime: 0,
        averageTime: 0,
        slowestTests: []
      }
    };

    // Извлекаем статистику из вывода ошибок
    for (const line of lines) {
      if (line.includes('Tests:')) {
        const match = line.match(/(\d+)\s+failed,\s+(\d+)\s+passed,\s+(\d+)\s+total/);
        if (match) {
          results.failed = parseInt(match[1]);
          results.passed = parseInt(match[2]);
          results.total = parseInt(match[3]);
        }
      }

      if (line.includes('Time:')) {
        const match = line.match(/([\d.]+)\s+s/);
        if (match) {
          results.performance.totalTime = parseFloat(match[1]) * 1000;
        }
      }
    }

    return results;
  }

  /**
   * Генерирует детальный отчет
   */
  generateReport(results) {
    const report = {
      summary: this.generateSummary(results),
      details: this.generateDetails(results),
      recommendations: this.generateRecommendations(results),
      performance: this.generatePerformanceReport(results)
    };

    return report;
  }

  /**
   * Генерирует краткое резюме
   */
  generateSummary(results) {
    const successRate = ((results.passed / results.total) * 100).toFixed(1);
    
    return {
      totalTests: results.total,
      passedTests: results.passed,
      failedTests: results.failed,
      successRate: `${successRate}%`,
      totalTime: `${(results.performance.totalTime / 1000).toFixed(2)}s`,
      averageTime: `${(results.performance.averageTime / 1000).toFixed(2)}s`
    };
  }

  /**
   * Генерирует детальную информацию
   */
  generateDetails(results) {
    return {
      suites: results.suites.map(suite => ({
        name: suite.name,
        status: suite.status,
        total: suite.total,
        passed: suite.passed,
        failed: suite.failed,
        successRate: suite.total > 0 ? ((suite.passed / suite.total) * 100).toFixed(1) + '%' : '0%'
      })),
      errors: results.errors.slice(0, 20) // Показываем только первые 20 ошибок
    };
  }

  /**
   * Генерирует рекомендации
   */
  generateRecommendations(results) {
    const recommendations = [];

    if (results.failed > 0) {
      recommendations.push({
        type: 'critical',
        message: `Исправить ${results.failed} проваленных тестов`,
        priority: 'high'
      });
    }

    if (results.performance.averageTime > 1000) {
      recommendations.push({
        type: 'performance',
        message: 'Оптимизировать медленные тесты',
        priority: 'medium'
      });
    }

    const successRate = (results.passed / results.total) * 100;
    if (successRate < 80) {
      recommendations.push({
        type: 'quality',
        message: 'Улучшить покрытие тестами',
        priority: 'high'
      });
    }

    return recommendations;
  }

  /**
   * Генерирует отчет о производительности
   */
  generatePerformanceReport(results) {
    return {
      totalTime: `${(results.performance.totalTime / 1000).toFixed(2)}s`,
      averageTime: `${(results.performance.averageTime / 1000).toFixed(2)}s`,
      slowestTests: results.performance.slowestTests.map(test => ({
        name: test.name,
        time: `${(test.time / 1000).toFixed(2)}s`
      }))
    };
  }

  /**
   * Выводит отчет в консоль
   */
  printReport(report) {
    console.log('\n📊 ДЕТАЛЬНЫЙ ОТЧЕТ О ТЕСТАХ\n');
    console.log('='.repeat(60));

    // Краткое резюме
    console.log('\n📈 КРАТКОЕ РЕЗЮМЕ:');
    console.log(`   Всего тестов: ${report.summary.totalTests}`);
    console.log(`   Пройдено: ${report.summary.passedTests}`);
    console.log(`   Провалено: ${report.summary.failedTests}`);
    console.log(`   Процент успеха: ${report.summary.successRate}`);
    console.log(`   Общее время: ${report.summary.totalTime}`);
    console.log(`   Среднее время: ${report.summary.averageTime}`);

    // Детали по наборам тестов
    console.log('\n📋 ДЕТАЛИ ПО НАБОРАМ ТЕСТОВ:');
    report.details.suites.forEach(suite => {
      const statusIcon = suite.status === 'passed' ? '✅' : '❌';
      console.log(`   ${statusIcon} ${suite.name}`);
      console.log(`      Пройдено: ${suite.passed}/${suite.total} (${suite.successRate})`);
    });

    // Ошибки
    if (report.details.errors.length > 0) {
      console.log('\n🚨 ОСНОВНЫЕ ОШИБКИ:');
      report.details.errors.slice(0, 10).forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.suite} - ${error.test}`);
        console.log(`      ${error.error}`);
      });
    }

    // Рекомендации
    if (report.recommendations.length > 0) {
      console.log('\n💡 РЕКОМЕНДАЦИИ:');
      report.recommendations.forEach(rec => {
        const priorityIcon = rec.priority === 'high' ? '🔴' : '🟡';
        console.log(`   ${priorityIcon} ${rec.message}`);
      });
    }

    // Производительность
    console.log('\n⚡ ПРОИЗВОДИТЕЛЬНОСТЬ:');
    console.log(`   Общее время: ${report.performance.totalTime}`);
    console.log(`   Среднее время: ${report.performance.averageTime}`);
    
    if (report.performance.slowestTests.length > 0) {
      console.log('   Самые медленные тесты:');
      report.performance.slowestTests.slice(0, 5).forEach(test => {
        console.log(`      ${test.name}: ${test.time}`);
      });
    }

    console.log('\n' + '='.repeat(60));
  }

  /**
   * Сохраняет отчет в файл
   */
  saveReport(report, filename = 'test-analysis-report.json') {
    const reportData = {
      timestamp: new Date().toISOString(),
      report
    };

    fs.writeFileSync(filename, JSON.stringify(reportData, null, 2));
    console.log(`\n💾 Отчет сохранен в файл: ${filename}`);
  }
}

// Основная функция
async function main() {
  const analyzer = new TestAnalyzer();
  
  // Парсим аргументы командной строки
  const args = process.argv.slice(2);
  const options = {
    verbose: args.includes('--verbose'),
    timeout: parseInt(args.find(arg => arg.startsWith('--timeout='))?.split('=')[1]) || 30000,
    detectOpenHandles: !args.includes('--no-detect-open-handles'),
    maxWorkers: parseInt(args.find(arg => arg.startsWith('--max-workers='))?.split('=')[1]) || 1
  };

  try {
    // Запускаем тесты
    const results = await analyzer.runTests(options);
    
    // Генерируем отчет
    const report = analyzer.generateReport(results);
    
    // Выводим отчет
    analyzer.printReport(report);
    
    // Сохраняем отчет
    if (!args.includes('--no-save')) {
      analyzer.saveReport(report);
    }

    // Возвращаем код выхода
    process.exit(results.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Ошибка при анализе тестов:', error.message);
    process.exit(1);
  }
}

// Запускаем скрипт
if (require.main === module) {
  main();
}

module.exports = TestAnalyzer; 