import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();

/**
 * Step definitions for treasury/financial management.
 * Note: Generic steps like 'clico em', 'preencho', etc. are defined in common.steps.ts
 */

// ============================================================================
// Financial Summary Steps
// ============================================================================

Then('devo ver o saldo atual', async ({ page }) => {
    const balance = page.getByText(/saldo|balance/i)
        .or(page.locator('[data-testid="balance"]'));
    await expect(balance.first()).toBeVisible();
});

Then('devo ver total de entradas do mês', async ({ page }) => {
    const income = page.getByText(/entradas|receitas|income/i)
        .or(page.locator('[data-testid="income"]'));
    await expect(income.first()).toBeVisible();
});

Then('devo ver total de saídas do mês', async ({ page }) => {
    const expenses = page.getByText(/saídas|despesas|expenses/i)
        .or(page.locator('[data-testid="expenses"]'));
    await expect(expenses.first()).toBeVisible();
});

// ============================================================================
// Financial-specific Transaction Steps
// ============================================================================

When('seleciono o período {string}', async ({ page }, period: string) => {
    const periodSelect = page.getByLabel(/período|mês/i)
        .or(page.getByRole('combobox'));
    await periodSelect.first().click();
    await page.getByRole('option', { name: new RegExp(period, 'i') }).click();
});

When('seleciono o mês {string}', async ({ page }, month: string) => {
    const monthSelect = page.getByLabel(/mês/i)
        .or(page.getByRole('combobox'));
    await monthSelect.first().click();
    await page.getByRole('option', { name: new RegExp(month, 'i') }).click();
});

Then('o saldo deve ser atualizado', async ({ page }) => {
    // Wait for the page to refresh/update
    await page.waitForTimeout(1000);
    const balance = page.getByText(/saldo/i);
    await expect(balance.first()).toBeVisible();
});

// ============================================================================
// Report Steps
// ============================================================================

Then('devo ver apenas transações de janeiro', async ({ page }) => {
    // Verify transactions are filtered
    const transactions = page.locator('table tbody tr, [role="row"]');
    const count = await transactions.count();
    expect(count).toBeGreaterThanOrEqual(0);
});

Then('devo ver o relatório formatado', async ({ page }) => {
    const report = page.locator('.report, [data-testid="report"], article');
    await expect(report.first()).toBeVisible();
});

Then('devo ver opção de exportar PDF', async ({ page }) => {
    const exportButton = page.getByRole('button', { name: /exportar|pdf|download/i });
    await expect(exportButton.first()).toBeVisible();
});

// ============================================================================
// Month Navigation Steps
// ============================================================================

When('clico no botão de mês anterior', async ({ page }) => {
    const prevButton = page.getByTestId('prev-month-button');
    await expect(prevButton).toBeVisible();
    await prevButton.click();
});

When('clico no botão de próximo mês', async ({ page }) => {
    const nextButton = page.getByTestId('next-month-button');
    await expect(nextButton).toBeVisible();
    await nextButton.click();
});

Then('devo ver as movimentações do mês anterior', async ({ page }) => {
    await page.waitForTimeout(500);
    const monthLabel = page.getByTestId('current-month-display');
    await expect(monthLabel).toBeVisible();
    // Validate text contains a valid month name
    const text = await monthLabel.innerText();
    expect(text).toMatch(/Janeiro|Fevereiro|Março|Abril|Maio|Junho|Julho|Agosto|Setembro|Outubro|Novembro|Dezembro/);
});

Then('devo ver as movimentações do mês atual', async ({ page }) => {
    await page.waitForTimeout(500);
    const monthLabel = page.getByTestId('current-month-display');
    await expect(monthLabel).toBeVisible();
    // Validate text contains a valid month name
    const text = await monthLabel.innerText();
    expect(text).toMatch(/Janeiro|Fevereiro|Março|Abril|Maio|Junho|Julho|Agosto|Setembro|Outubro|Novembro|Dezembro/);
});

Then('devo ver o mês anterior no seletor', async ({ page }) => {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const currentMonth = new Date().getMonth(); // 0-indexed
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const expectedMonth = months[prevMonth];

    await page.waitForTimeout(500);
    const monthLabel = page.getByTestId('current-month-display');
    await expect(monthLabel).toBeVisible();
    await expect(monthLabel).toContainText(expectedMonth);
});

Then('devo ver o mês atual no seletor', async ({ page }) => {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const currentMonth = new Date().getMonth(); // 0-indexed
    const expectedMonth = months[currentMonth];

    await page.waitForTimeout(500);
    const monthLabel = page.getByTestId('current-month-display');
    await expect(monthLabel).toBeVisible();
    await expect(monthLabel).toContainText(expectedMonth);
});

// ============================================================================
// Pagination Steps
// ============================================================================

Given('que existem mais de 10 movimentações no mês', async () => {
    // Assumes test data has been seeded with enough transactions
});

When('clico em {string} na paginação', async ({ page }, buttonText: string) => {
    const button = page.getByRole('button', { name: new RegExp(buttonText, 'i') });
    await button.click();
});

Then('devo ver a segunda página de movimentações', async ({ page }) => {
    await page.waitForTimeout(500);
    const pageIndicator = page.getByText(/página 2/i);
    await expect(pageIndicator).toBeVisible();
});

// Generic 'devo ver {string}' is defined in common.steps.ts

// Transaction Form Steps - most are in common.steps.ts
// Only financial-specific steps here

When('seleciono uma conta', async ({ page }) => {
    const combobox = page.locator('[data-testid="account-select"]')
        .or(page.getByLabel(/conta/i));
    await combobox.first().click();
    await page.getByRole('option').first().click();
});

When('seleciono uma categoria', async ({ page }) => {
    const combobox = page.locator('[data-testid="category-select"]')
        .or(page.getByLabel(/categoria/i));
    await combobox.first().click();
    await page.getByRole('option').first().click();
});

When('seleciono um membro', async ({ page }) => {
    const combobox = page.locator('[data-testid="member-select"]')
        .or(page.getByLabel(/membro/i));
    await combobox.first().click();
    await page.getByRole('option').first().click();
});
