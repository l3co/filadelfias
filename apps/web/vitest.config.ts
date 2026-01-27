import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    exclude: ['node_modules', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
        'e2e/',
      ],
    },
    // Use projects for different test environments
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          // Tests that run in node environment (schemas, services, hooks without DOM)
          include: [
            'src/lib/validations/**/*.test.ts',
            'src/hooks/__tests__/useMetadata.test.ts',
            'src/services/__tests__/members.test.ts',
          ],
          environment: 'node',
          globals: true,
        },
      },
      {
        extends: true,
        test: {
          name: 'components',
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: [
            'src/lib/validations/**/*.test.ts',
            'src/hooks/__tests__/useMetadata.test.ts',
            'src/services/__tests__/members.test.ts',
            'node_modules',
            'e2e',
          ],
          environment: 'jsdom',
          setupFiles: ['./src/test/setup.ts'],
          globals: true,
        },
      },
    ],
  },
});
