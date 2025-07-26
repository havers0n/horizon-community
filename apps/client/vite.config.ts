import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
    // Анализ бандла только в production
    ...(process.env.NODE_ENV === "production" ? [visualizer({
      filename: "dist/bundle-analysis.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    })] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared/schema": path.resolve(__dirname, "../../libs/shared-schema/src/index.ts"),
      "@roleplay-identity/shared-types": path.resolve(__dirname, "../../libs/shared-types/src"),
      "@roleplay-identity/shared-utils": path.resolve(__dirname, "../../libs/shared-utils/src"),
      "@assets": path.resolve(__dirname, "../attached_assets"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "../dist/client"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Выносим React и React DOM в самостоятельный чанк
          'react-vendor': ['react', 'react-dom'],
          // Выносим UI библиотеки в самостоятельный чанк
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            'lucide-react',
            'class-variance-authority',
            'clsx',
            'tailwind-merge'
          ],
          // Выносим графики и визуализацию
          'charts-vendor': ['recharts', 'html2canvas', 'jspdf'],
          // Выносим формы и валидацию
          'forms-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Выносим интернационализацию
          'i18n-vendor': ['i18next', 'react-i18next'],
          // Выносим анимации
          'animations-vendor': ['framer-motion', 'tailwindcss-animate'],
          // Выносим утилиты
          'utils-vendor': ['date-fns', 'nanoid', 'zod-validation-error'],
        },
        // Оптимизация имен файлов
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || ['asset'];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    // Оптимизация размера
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  server: {
    port: parseInt(process.env.VITE_PORT || '3000'),
    fs: {
      strict: false,
      allow: ['..', '../../']
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
}); 