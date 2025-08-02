import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fivemPlugin } from "./vite-plugin-fivem.js";

export default defineConfig(({ mode, command }) => {
  // ИСПРАВЛЕНИЕ: Загружаем переменные с правильным префиксом VITE_
  const env = loadEnv(mode, '.', 'VITE_');
  
  console.log('🔧 Vite Config: Загруженные переменные окружения:', Object.keys(env));
  console.log('🔧 Vite Config: VITE_SUPABASE_URL:', env.VITE_SUPABASE_URL ? 'ПРИСУТСТВУЕТ' : 'ОТСУТСТВУЕТ');
  console.log('🔧 Vite Config: VITE_SUPABASE_ANON_KEY:', env.VITE_SUPABASE_ANON_KEY ? 'ПРИСУТСТВУЕТ' : 'ОТСУТСТВУЕТ');
  
  // Автоматическое определение режима сборки
  const isNUI = process.env.NUI === 'true' || process.env.BUILD_TARGET === 'fivem';
  const isProduction = mode === 'production';
  
  console.log(`🔧 Vite Config: ${isNUI ? 'FiveM NUI' : 'Browser'} mode`);
  
  return {
    plugins: [
      react(),
      fivemPlugin() // Автоматическое копирование в FiveM
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.IS_NUI': JSON.stringify(isNUI),
      'process.env.BUILD_TARGET': JSON.stringify(isNUI ? 'fivem' : 'browser')
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@shared": path.resolve(__dirname, "src/shared"),
        "@shared/schema": path.resolve(__dirname, "../../libs/shared-schema/src"),
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
      outDir: isNUI ? "dist-nui" : "dist",
      sourcemap: !isNUI, // Отключаем sourcemap для FiveM
      emptyOutDir: true,
      
      // Автоматические настройки для FiveM
      base: isNUI ? './' : '/',
      
      rollupOptions: {
        output: {
          // Для FiveM: простые имена файлов без хешей
          entryFileNames: isNUI ? '[name].js' : '[name]-[hash].js',
          chunkFileNames: isNUI ? '[name].js' : '[name]-[hash].js',
          assetFileNames: isNUI ? '[name].[ext]' : '[name]-[hash].[ext]',
          
          // Оптимизация для FiveM
          manualChunks: isNUI ? undefined : {
            'react-vendor': ['react', 'react-dom'],
            'ui-vendor': ['lucide-react'],
          }
        }
      },
      
      // Оптимизация размера для FiveM
      minify: isNUI ? 'esbuild' : 'terser',
      target: isNUI ? 'es2015' : 'esnext',
    },
  };
});
