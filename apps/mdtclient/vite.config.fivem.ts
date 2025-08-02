import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fivemPlugin } from "./vite-plugin-fivem.js";

export default defineConfig(({ mode, command }) => {
  // Загружаем переменные с правильным префиксом VITE_
  const env = loadEnv(mode, '.', 'VITE_');
  
  console.log('🔧 Vite Config (FiveM): Загруженные переменные окружения:', Object.keys(env));
  console.log('🔧 Vite Config (FiveM): VITE_SUPABASE_URL:', env.VITE_SUPABASE_URL ? 'ПРИСУТСТВУЕТ' : 'ОТСУТСТВУЕТ');
  console.log('🔧 Vite Config (FiveM): VITE_SUPABASE_ANON_KEY:', env.VITE_SUPABASE_ANON_KEY ? 'ПРИСУТСТВУЕТ' : 'ОТСУТСТВУЕТ');
  
  // Принудительно устанавливаем режим FiveM
  const isNUI = true;
  const isProduction = mode === 'production';
  
  console.log(`🔧 Vite Config (FiveM): FiveM NUI mode`);
  
  return {
    plugins: [
      react(),
      fivemPlugin() // Автоматическое копирование в FiveM
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.IS_NUI': JSON.stringify(isNUI),
      'process.env.BUILD_TARGET': JSON.stringify('fivem')
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@shared": path.resolve(__dirname, "src/shared"),
        "@shared/schema": path.resolve(__dirname, "../../libs/shared/schema/src"),
        "@roleplay-identity/shared-types": path.resolve(__dirname, "../../libs/shared-types/src"),
        "@roleplay-identity/shared-utils": path.resolve(__dirname, "../../libs/shared-utils/src"),
      },
    },
    server: {
      port: 3001,
      host: '0.0.0.0',
      fs: {
        allow: ['..', '../../']
      },
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('🔴 Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('🔄 Proxying:', req.method, req.url, '→', proxyReq.path);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('✅ Proxy response:', proxyRes.statusCode, req.url);
            });
          },
        },
      },
    },
    build: {
      outDir: "dist-nui",
      sourcemap: false, // Отключаем sourcemap для FiveM
      emptyOutDir: true,
      
      // Настройки для FiveM
      base: './',
      
      rollupOptions: {
        output: {
          // Для FiveM: простые имена файлов без хешей
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
        }
      },
      
      // Оптимизация для FiveM
      minify: 'esbuild',
      target: 'es2015',
    },
  };
}); 