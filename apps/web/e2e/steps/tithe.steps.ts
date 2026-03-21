import { createBdd } from 'playwright-bdd';
import { expect, type Page } from '@playwright/test';
import { testUsers } from '../support/fixtures';

const { Given, When, Then } = createBdd();
let lastPendingRecordNote: string | null = null;

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

async function loginAs(page: Page, email: string, password: string) {
    await page.context().clearCookies();
    await page.goto('/login');
    await page.evaluate(() => {
        window.localStorage.clear();
        window.sessionStorage.clear();
    });
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL(/\/member/, { timeout: 10000 });
}

async function ensurePendingTithe(page: Page) {
    await loginAs(page, testUsers.member.email, testUsers.member.password);
    await page.goto('/member/tithes');
    await page.waitForLoadState('networkidle').catch(() => {});

    const uniqueNote = `E2E pendente ${Date.now()}`;
    lastPendingRecordNote = uniqueNote;

    await page.getByRole('button', { name: /novo registro/i }).click();
    await page.locator('#amount').fill('777');
    await page.locator('#date').fill('2026-03-20');
    await page.locator('textarea').first().fill(uniqueNote);
    await page.getByRole('button', { name: /enviar para aprovação/i }).click();
    await expect(page.getByText(/pendente/i).first()).toBeVisible({ timeout: 10000 });

    await loginAs(page, testUsers.tesoureiro.email, testUsers.tesoureiro.password);
}

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

Given('que existe um dízimo pendente', async ({ page }) => {
    lastPendingRecordNote = null;
    await ensurePendingTithe(page);
});

When('clico em {string} no registro pendente', async ({ page }, action: string) => {
    expect(lastPendingRecordNote).toBeTruthy();
    const pendingCard = page.getByText(lastPendingRecordNote!, { exact: false })
        .locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]');
    await expect(pendingCard).toBeVisible({ timeout: 10000 });
    await pendingCard.getByRole('button', { name: new RegExp(action, 'i') }).click();
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
    expect(lastPendingRecordNote).toBeTruthy();
    await expect(page.getByText(lastPendingRecordNote!, { exact: false })).toHaveCount(0);
});
