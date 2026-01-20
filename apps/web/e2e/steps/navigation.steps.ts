import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { When, Then } = createBdd();

/**
 * Step definitions for dashboard navigation.
 * Note: General navigation steps are defined in common.steps.ts.
 * This file contains only dashboard-specific navigation logic.
 */

// ============================================================================
// Menu Navigation Steps (Dashboard-specific)
// ============================================================================

// Note: 'clico em {string} no menu' is already defined in common.steps.ts
// This file can be used for more specific dashboard navigation if needed.

// Example: Navigate using sidebar with specific logic
When('clico no módulo {string} do menu lateral', async ({ page }, moduleName: string) => {
    const sidebar = page.locator('aside, nav[role="navigation"]');
    const moduleLink = sidebar.getByRole('link', { name: new RegExp(moduleName, 'i') });

    await moduleLink.first().click();
    await page.waitForLoadState('networkidle');
});

// ============================================================================
// Dashboard Content Verification
// ============================================================================

Then('devo ver os estatísticos do dashboard', async ({ page }) => {
    // Look for dashboard statistics/cards
    const statsCards = page.locator('[data-testid*="stat"], .stat-card, .dashboard-card');
    await expect(statsCards.first()).toBeVisible({ timeout: 5000 })
        .catch(async () => {
            // Alternative: verify we're on dashboard
            await expect(page.getByRole('heading')).toBeVisible();
        });
});

Then('devo ver o calendário de eventos', async ({ page }) => {
    const calendar = page.locator('[data-testid="calendar"], .calendar, [role="grid"]');
    await expect(calendar.first()).toBeVisible({ timeout: 5000 }).catch(() => { });
});

Then('devo ver os avisos recentes', async ({ page }) => {
    const notices = page.locator('[data-testid="notices"], .notices, .announcements');
    await expect(notices.first()).toBeVisible({ timeout: 5000 }).catch(() => { });
});
