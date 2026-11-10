import {defineConfig} from '@nlabs/lex/test-playwright';
import {fileURLToPath} from 'node:url';

const lexConfig = fileURLToPath(new URL('./tests/rendering/lex.config.mjs', import.meta.url));

export default defineConfig({
  outputDir: './.artifacts/browser-results',
  testDir: './tests',
  testMatch: ['**/rendering/*.e2e.ts', '**/hooks/*.e2e.ts'],
  workers: 1,
  use: {baseURL: 'http://localhost:4317', browserName: 'chromium', headless: true},
  webServer: {
    command: `node_modules/.bin/lex dev --lexConfig ${lexConfig} --port 4317`,
    reuseExistingServer: false,
    timeout: 120000,
    url: 'http://localhost:4317'
  }
});
