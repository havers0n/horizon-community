import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../src/stories.ts',
  ],
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    // Добавляем поддержку абсолютных импортов
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': '/src',
        '@/shared': '/src/shared',
        '@/app': '/src/app',
        '@/widgets': '/src/widgets',
        '@/features': '/src/features',
        '@/entities': '/src/entities',
      };
    }
    return config;
  },
};

export default config; 