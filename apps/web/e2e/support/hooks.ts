import { createBdd } from 'playwright-bdd';
import { Page, TestInfo } from '@playwright/test';

const { BeforeAll, AfterAll, Before, After } = createBdd();

/**
 * Global hooks for E2E tests.
 * Sets up and tears down the test environment.
 */

BeforeAll(async () => {
    // Global setup before all tests
    console.log('🚀 Starting E2E test suite');
});

AfterAll(async () => {
    // Global teardown after all tests
    console.log('✅ E2E test suite completed');
});

Before(async ({ page }: { page: Page }) => {
    // Setup before each scenario
    // Set default timeout for assertions
    page.setDefaultTimeout(10000);

    if (process.env.VITE_API_URL) {
        await page.addInitScript((apiUrl: string) => {
            window.__CONFIG__ = {
                ...(window.__CONFIG__ ?? {}),
                API_URL: apiUrl,
            };
        }, process.env.VITE_API_URL);
    }

    // Clear any previous state
    await page.context().clearCookies();
});

After(async ({ page, $testInfo }: { page: Page; $testInfo: TestInfo }) => {
    // Teardown after each scenario
    if ($testInfo.status !== 'passed') {
        // Take screenshot on failure for debugging
        const screenshotPath = `screenshots/${$testInfo.title.replace(/\s+/g, '-')}-failure.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => { });
        console.log(`📸 Screenshot saved: ${screenshotPath}`);
    }
});
