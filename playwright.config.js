import { defineConfig, devices } from '@playwright/test';

const WEB = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5199';
const API = process.env.PLAYWRIGHT_API_URL || 'http://127.0.0.1:3003';

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: WEB,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  webServer: [
    {
      command: 'pnpm --filter api start',
      url: `${API}/api/health`,
      reuseExistingServer: true,
      timeout: 60_000
    },
    {
      command: 'pnpm --filter web exec vite dev --port 5199 --strictPort --host 127.0.0.1',
      url: WEB,
      reuseExistingServer: true,
      timeout: 60_000
    }
  ]
});
