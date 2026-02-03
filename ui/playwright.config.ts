import { defineConfig, devices } from '@playwright/test'

// Use PROD_URL if set (for testing external/production servers)
// Otherwise use local test server on port 3556
const PROD_URL = process.env.PROD_URL
const TEST_PORT = process.env.PORT || '3556'
const BASE_URL = PROD_URL || `http://localhost:${TEST_PORT}`

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    timeout: 30000,
    use: {
        baseURL: BASE_URL,
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    // Only start webserver if not using external PROD_URL
    ...(PROD_URL ? {} : {
        webServer: {
            command: 'bash scripts/test-server.sh',
            url: BASE_URL,
            reuseExistingServer: !process.env.CI,
            timeout: 60000,
            env: {
                PAYLOAD_TEST_MODE: 'true',
                PORT: TEST_PORT,
                DATABASE_URL: 'file:./test.db',
                PAYLOAD_SECRET: 'test-secret-for-e2e-testing-only',
            },
        },
    }),
})
