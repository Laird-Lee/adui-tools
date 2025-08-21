import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv, type UserConfig } from 'vite'
import createVitePlugin from './vite'

// 环境变量类型
export interface EnvConfig {
  VITE_APP_ENV: 'development' | 'production'
  VITE_APP_TITLE: string
  VITE_BASE_URL: string
  VITE_BUILD_COMPRESS?: string
  [key: string]: string | undefined
}

// https://vite.dev/config/
export default defineConfig(({ mode, command }): UserConfig => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), 'VITE_') as unknown as EnvConfig
  const isProd = command === 'build'

  return {
    base: '/',
    publicDir: 'public',
    cacheDir: 'node_modules/.vite',

    plugins: createVitePlugin(env, isProd),

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '#': fileURLToPath(new URL('./types', import.meta.url)),
      },
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },

    css: {
      devSourcemap: true,
    },

    // 开发服务器配置
    server: {
      host: true,
      port: 18888,
      open: true,
      cors: true,
      strictPort: true,
      proxy: {
        '^/dev-api': {
          target: 'http://localhost:38080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },

    // 构建配置
    build: {
      target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
      sourcemap: isProd ? false : 'inline',
      outDir: 'dist',
      assetsDir: 'assets',
      assetsInlineLimit: 4096,
      chunkSizeWarningLimit: 2000,
      minify: 'esbuild', // 改用 esbuild 作为压缩工具
      rollupOptions: {
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'td-vendor': ['tdesign-vue-next'],
          },
        },
      },
    },

    // esbuild 配置
    esbuild: {
      drop: isProd ? ['console', 'debugger'] : [], // 使用 drop 替代 pure
      legalComments: 'none',
      treeShaking: true,
    },

    // 预览配置
    preview: {
      port: 18080,
      host: true,
      strictPort: true,
    },

    // 依赖优化配置
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', 'tdesign-vue-next'],
    },
  }
})
