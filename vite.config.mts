import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    logHeapUsage: true,
    setupFiles: ['./src/tests/matchers'],
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov', 'json-summary'],
      all: true,
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.type.ts',
        'src/temp',
        'src/main.ts',
        'src/types',
        'src/tests',
      ],
    },
  },
});
