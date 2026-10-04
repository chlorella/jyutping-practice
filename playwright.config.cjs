const { defineConfig, devices } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests', testMatch: '**/*.spec.cjs', timeout: 15000,
  use: { baseURL: process.env.APP_URL || 'http://127.0.0.1:4178', channel: 'chrome', screenshot: 'only-on-failure' },
  projects: [{ name: 'desktop', use: { viewport: { width: 1280, height: 900 } } }, { name: 'phone', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } }],
  webServer: process.env.APP_URL ? undefined : { command: 'python3 -m http.server 4178 --bind 127.0.0.1', url: 'http://127.0.0.1:4178', reuseExistingServer: true }
});
