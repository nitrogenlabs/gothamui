import {defineConfig} from '@playwright/test';
import {fileURLToPath} from 'node:url';

const lexConfig = fileURLToPath(new URL('./tests/rendering/lex.config.mjs', import.meta.url));

export default defineConfig({
  outputDir: '/tmp/gotham-playwright-results',
  testDir: './tests/rendering',
  testMatch: '**/*.e2e.ts',
  use: {baseURL: 'http://localhost:4317', browserName: 'chromium', headless: true},
  webServer: {
    command: `node_modules/.bin/lex dev --lexConfig ${lexConfig} --port 4317`,
    reuseExistingServer: false,
    timeout: 120000,
    url: 'http://localhost:4317'
  }
});
