import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './src/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
  ],
  use: {
    // CORREÇÃO: URL completa para a UI
    baseURL: 'http://localhost:5500', // A UI roda na porta 5500
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'ui',
      testMatch: '**/*.spec.ts', // Todos os testes
      use: {
        ...devices['Desktop Chrome'],
        // URL específica para testes UI
        baseURL: 'http://localhost:5500',
      },
    },
  ],
  timeout: 30000,
  expect: {
    timeout: 10000
  }
});