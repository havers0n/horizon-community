// C:/.../RolePlayIdentity/jest.preset.js

// Импортируем утилиту из ts-jest для автоматического создания карты путей
const { pathsToModuleNameMapper } = require('ts-jest');
// Импортируем базовый tsconfig, где лежат наши алиасы
const { compilerOptions } = require('./tsconfig.base.json');

module.exports = {
  // Указываем, что нужно запускать тесты через ts-jest
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  // Автоматически создаем карту путей из tsconfig.base.json
  // Это более современный подход, чем прописывать все вручную
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),

  // Говорим Jest'у, где искать файлы
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],

  // Настройки для отчета о покрытии
  coverageReporters: ['html', 'text-summary'],
};