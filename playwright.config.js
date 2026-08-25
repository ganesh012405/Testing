const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  preserveOutput: 'always',
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-report/report.json' }]
  ],
  outputDir: 'test-results',
  use: {
    browserName: 'chromium',
    channel: process.env.CI ? undefined : 'msedge',
    headless: true,
    screenshot: 'on',
    video: 'on',
    trace: 'on-first-retry'
  }
});
