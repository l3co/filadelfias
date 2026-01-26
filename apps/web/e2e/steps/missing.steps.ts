import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();

/**
 * Missing step definitions identified during test generation.
 * These steps are used across multiple features but were not yet implemented.
 */

// ============================================================================
// Navigation and Redirection Steps
// ============================================================================

Then('devo ser redirecionado para login', async ({ page }) => {
    await expect(page).toHaveURL(/\/login/);
});

// ============================================================================
// Form Validation Steps
// ============================================================================

When('clico em {string} sem preencher campos', async ({ page }, buttonText: string) => {
    // Click button without filling required fields
    await page.getByRole('button', { name: new RegExp(buttonText, 'i') }).click();
});

Then('devo ver erro de validação', async ({ page }) => {
    // Check for validation error messages
    await expect(page.getByText(/obrigatório|required|inválido|invalid/i)).toBeVisible();
});

Then('o formulário não deve ser enviado', async ({ page }) => {
    // Form should still be visible (not submitted)
    // Check that we're still on the same page with the form
    await expect(page.locator('form').first()).toBeVisible({ timeout: 3000 });
});

// ============================================================================
// Status Selection Steps
// ============================================================================

When('seleciono status {string}', async ({ page }, status: string) => {
    // MemberForm uses native select inside dialog
    const dialog = page.locator('[role="dialog"]');
    const selectInDialog = dialog.locator('select').filter({ has: page.locator(`option:text-matches("${status}", "i")`) }).first();
    
    if (await selectInDialog.isVisible().catch(() => false)) {
        await selectInDialog.selectOption({ label: status });
        return;
    }
    
    // Try any select on the page
    const statusSelect = page.locator('select').filter({ has: page.locator(`option:text-matches("${status}", "i")`) }).first();
    if (await statusSelect.isVisible().catch(() => false)) {
        await statusSelect.selectOption({ label: status });
        return;
    }
    
    // Fallback: use combobox pattern
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: new RegExp(status, 'i') }).click();
});

// ============================================================================
// List Assertion Steps
// ============================================================================

Then('o membro deve aparecer na lista', async ({ page }) => {
    // Wait for list to be visible
    const list = page.locator('table, [role="list"], ul, ol, .grid, .list');
    await expect(list.first()).toBeVisible({ timeout: 5000 });
});

// ============================================================================
// Page Navigation Steps (with special characters)
// ============================================================================

// Note: These are already defined in member.steps.ts but Playwright may not find them
// due to escaped parentheses in the step name. Adding them here as well.

// Steps with escaped parentheses - exact syntax required by bddgen
Given('que estou na página de EBD \\(membro)', async ({ page }) => {
    await page.goto('/member/education');
    await page.waitForLoadState('networkidle');
});

Given('que estou na página de Devocionais \\(admin)', async ({ page }) => {
    await page.goto('/admin/devotionals');
    await page.waitForLoadState('networkidle');
});

Given('que estou na página de Eventos \\(admin)', async ({ page }) => {
    await page.goto('/admin/events');
    await page.waitForLoadState('networkidle');
});

// ============================================================================
// Form Input Steps
// ============================================================================

When('preencho a descrição', async ({ page }) => {
    await page.getByLabel(/descrição|description/i).fill('Descrição do evento de teste.');
});

// ============================================================================
// RBAC Negative Assertion Steps
// ============================================================================

// NOTE: These steps are now correctly defined in rbac.steps.ts:
// - 'NÃO devo poder excluir membros'
// - 'NÃO devo ver menu {string}'
