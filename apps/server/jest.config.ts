// apps/server/jest.config.ts
import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';

const { compilerOptions } = require('../../tsconfig.base.json');

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 10000,
  
  // ✅ Указываем Jest, какие файлы обрабатывать через ts-jest
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },

  // ✅ Игнорируем папки со скомпилированным кодом и кэшем
  modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/.nx/'],

  // Алиасы для путей
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/../../' }),

  // Игнорируем node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(@supabase|@roleplay-identity)/)',
  ],

  // Собираем покрытие с src файлов
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
  ],

  // Покрытие кода
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Тестовые файлы
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.spec.ts',
  ],

  // Игнорируем отключенные тесты
  testPathIgnorePatterns: [
    '.*\\.disabled\\.ts$',
  ],
};

export default config; 