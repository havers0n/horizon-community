// apps/server/jest.config.ts

import { pathsToModuleNameMapper } from 'ts-jest';

// Используем require вместо import для JSON файла
const { compilerOptions } = require('../../tsconfig.base.json');

export default {
  displayName: 'server',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    }],
  },

  moduleFileExtensions: ['ts', 'js', 'html', 'json'], // Добавил json на всякий случай
  coverageDirectory: '../../coverage/apps/server',

  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/../../' }),

  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};