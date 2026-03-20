import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();
let lastPendingRecordText: string | null = null;
let lastPendingRecordsCount: number | null = null;

/**
 * Step definitions for tithe/offering management.
 * 
 * NOTE: Common steps like navigation, auth, form filling are in:
 * - common.steps.ts (preencho o valor, seleciono o tipo, etc.)
 * - auth.steps.ts (que estou logado como...)
 */

// ============================================================================
// Tithe-specific Steps
// ============================================================================

When('adiciono observação {string}', async ({ page }, note: string) => {
    const textarea = page.getByLabel(/observa/i)
        .or(page.locator('textarea[name="notes"]'))
        .or(page.locator('textarea'));
    await textarea.first().fill(note);
});

When('seleciono o tipo de contribuição {string}', async ({ page }, tipo: string) => {
    await page.getByRole('button', { name: new RegExp(`^${tipo}$`, 'i') }).click();
});

Then('o registro deve aparecer na lista com status {string}', async ({ page }, status: string) => {
    const statusBadge = page.getByText(new RegExp(status, 'i'));
    await expect(statusBadge.first()).toBeVisible();
});

Then('devo ver a seção {string}', async ({ page }, sectionName: string) => {
    const section = page.getByText(new RegExp(sectionName, 'i'));
    await expect(section.first()).toBeVisible();
});

Then('devo ver registros aguardando aprovação', async ({ page }) => {
    const pendingItems = page.locator('[data-status="pending"], [data-testid="pending-tithe"]')
        .or(page.getByText(/pendente/i));
    await expect(pendingItems.first()).toBeVisible();
});

Given('que existe um dízimo pendente', async () => {
    // Seed data includes pending tithes
    lastPendingRecordText = null;
});

When('clico em {string} no registro pendente', async ({ page }, action: string) => {
    const button = page.getByRole('button', { name: new RegExp(action, 'i') });
    const targetButton = button.first();
    const pendingCard = targetButton.locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]');
    lastPendingRecordText = (await pendingCard.textContent())?.replace(/\s+/g, ' ').trim() || null;
    lastPendingRecordsCount = await page.getByText(/Enviado em \d{2}\/\d{2}\/\d{4}/i).count();
    await targetButton.click();
});

When('seleciono a conta de destino', async ({ page }) => {
    const select = page.getByLabel(/conta/i)
        .or(page.getByRole('combobox'));
    await select.first().click();
    await page.getByRole('option').first().click();
});

When('confirmo a aprovação', async ({ page }) => {
    const confirmButton = page.getByRole('button', { name: /confirmar|aprovar/i });
    await confirmButton.click();
});

When('informo o motivo {string}', async ({ page }, reason: string) => {
    const textarea = page.getByLabel(/motivo/i)
        .or(page.locator('textarea[name="rejection_reason"]'))
        .or(page.locator('textarea'));
    await textarea.first().fill(reason);
});

When('confirmo a rejeição', async ({ page }) => {
    const confirmButton = page.getByRole('button', { name: /confirmar rejeição/i });
    await confirmButton.click();
});

Then('o registro deve ser removido da lista de pendentes', async ({ page }) => {
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(500);
    expect(lastPendingRecordsCount).not.toBeNull();
    await expect(page.getByText(/Enviado em \d{2}\/\d{2}\/\d{4}/i)).toHaveCount(
        Math.max((lastPendingRecordsCount ?? 1) - 1, 0),
    );
});
