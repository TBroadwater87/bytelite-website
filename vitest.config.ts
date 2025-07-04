import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { getViteConfig } from 'astro/config';

export default defineConfig(
  getViteConfig({
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './tests/setup.ts',
      include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      coverage: {
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'tests/',
          '**/*.d.ts',
          '**/*.config.*',
          '**/mockData.ts',
          'dist/'
        ]
      }
    },
    resolve: {
      alias: {
        '@/': new URL('./src/', import.meta.url).pathname,
        '@components': new URL('./src/components', import.meta.url).pathname,
        '@layouts': new URL('./src/layouts', import.meta.url).pathname
      }
    }
  })
);