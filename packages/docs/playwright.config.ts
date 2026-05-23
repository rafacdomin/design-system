import { defineConfig, devices } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const isBrowserStack = process.env.RUN_ON_BROWSERSTACK === 'true'

// Get credentials if running on BrowserStack
const BS_USERNAME = process.env.BROWSERSTACK_USERNAME
const BS_ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY

if (isBrowserStack && (!BS_USERNAME || !BS_ACCESS_KEY)) {
  throw new Error(
    'Error: BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY environment variables are required to run tests on BrowserStack.'
  )
}

// Get playwright version dynamically from package.json
const packageJsonPath = path.resolve(__dirname, 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
const playwrightVersion =
  (packageJson.devDependencies['@playwright/test'] as string)?.replace(
    /[\^~]/g,
    ''
  ) || '1.60.0'

const getBrowserStackWS = (
  projectName: string,
  caps: Record<string, string>
) => {
  const mergedCaps = {
    ...caps,
    'browserstack.username': BS_USERNAME,
    'browserstack.accessKey': BS_ACCESS_KEY,
    'browserstack.local': 'true',
    'client.playwrightVersion': playwrightVersion,
    project: 'design-system',
    build:
      process.env.BROWSERSTACK_BUILD_NAME ||
      `local-run-${new Date().toISOString().split('T')[0]}`,
    name: `Visual: ${projectName}`,
  }
  return `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(mergedCaps))}`
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './src/test-visual',
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. For BrowserStack we can run parallel workers. */
  workers: isBrowserStack ? 2 : process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',

  globalSetup: isBrowserStack
    ? require.resolve('./src/test-visual/browserstack-setup.ts')
    : undefined,
  globalTeardown: isBrowserStack
    ? require.resolve('./src/test-visual/browserstack-teardown.ts')
    : undefined,

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:6006',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers and devices */
  projects: isBrowserStack
    ? [
        {
          name: 'browserstack-chrome-windows',
          use: {
            viewport: { width: 1280, height: 800 },
            connectOptions: {
              wsEndpoint: getBrowserStackWS('Chrome-Windows', {
                browser: 'chrome',
                browser_version: 'latest',
                os: 'Windows',
                os_version: '11',
              }),
            },
          },
        },
        {
          name: 'browserstack-firefox-windows',
          use: {
            viewport: { width: 1280, height: 800 },
            connectOptions: {
              wsEndpoint: getBrowserStackWS('Firefox-Windows', {
                browser: 'playwright-firefox',
                browser_version: 'latest',
                os: 'Windows',
                os_version: '11',
              }),
            },
          },
        },
        {
          name: 'browserstack-safari-macos',
          use: {
            viewport: { width: 1280, height: 800 },
            connectOptions: {
              wsEndpoint: getBrowserStackWS('Safari-macOS', {
                browser: 'playwright-webkit',
                browser_version: 'latest',
                os: 'OS X',
                os_version: 'Sonoma',
              }),
            },
          },
        },
        {
          name: 'browserstack-safari-mobile',
          use: {
            viewport: { width: 375, height: 812 },
            connectOptions: {
              wsEndpoint: getBrowserStackWS('Safari-Mobile', {
                browser: 'playwright-webkit',
                browser_version: 'latest',
                os: 'OS X',
                os_version: 'Sonoma',
              }),
            },
          },
        },
        {
          name: 'browserstack-safari-tablet',
          use: {
            viewport: { width: 768, height: 1024 },
            connectOptions: {
              wsEndpoint: getBrowserStackWS('Safari-Tablet', {
                browser: 'playwright-webkit',
                browser_version: 'latest',
                os: 'OS X',
                os_version: 'Sonoma',
              }),
            },
          },
        },
      ]
    : [
        {
          name: 'chromium-desktop',
          use: {
            ...devices['Desktop Chrome'],
            viewport: { width: 1280, height: 800 },
          },
        },
        {
          name: 'firefox-desktop',
          use: {
            ...devices['Desktop Firefox'],
            viewport: { width: 1280, height: 800 },
          },
        },
        {
          name: 'webkit-desktop',
          use: {
            ...devices['Desktop Safari'],
            viewport: { width: 1280, height: 800 },
          },
        },
        {
          name: 'webkit-mobile',
          use: {
            ...devices['iPhone 12'],
            viewport: { width: 375, height: 812 },
          },
        },
        {
          name: 'webkit-tablet',
          use: {
            ...devices['iPad Mini'],
            viewport: { width: 768, height: 1024 },
          },
        },
      ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npx http-server storybook-static -p 6006 --silent',
    port: 6006,
    reuseExistingServer: !process.env.CI,
  },
})
