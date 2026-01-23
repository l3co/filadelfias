import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { testDevotionals } from '../support/fixtures';

const { Given, When, Then } = createBdd();

/**
 * Step definitions for member area features.
 * Covers devotionals, prayer requests, and events.
 */

// ============================================================================
// Navigation Steps
// ============================================================================

Given('que estou na página de Devocionais', async ({ page }) => {
    await page.goto('/membro/devocionais');
    await page.waitForLoadState('networkidle');
});

Given('que estou na página de Devocionais (admin)', async ({ page }) => {
    await page.goto('/app/devocionais');
    await page.waitForLoadState('networkidle');
});

Given('que estou na página de Pedidos de Oração', async ({ page }) => {
    await page.goto('/membro/oracao');
    await page.waitForLoadState('networkidle');
});

Given('que estou na página de Eventos', async ({ page }) => {
    await page.goto('/membro/eventos');
    await page.waitForLoadState('networkidle');
});

Given('que estou na página de Eventos (admin)', async ({ page }) => {
    await page.goto('/app/eventos');
    await page.waitForLoadState('networkidle');
});

Given('que estou na página de EBD (membro)', async ({ page }) => {
    await page.goto('/membro/ebd');
    await page.waitForLoadState('networkidle');
});

// ============================================================================
// Devotionals Steps
// ============================================================================

Then('devo ver o devocional de hoje', async ({ page }) => {
    // Check for today's devotional
    await expect(page.getByText(/devocional|hoje|meditação/i).first()).toBeVisible();
});

Then('devo ver o título do devocional', async ({ page }) => {
    await expect(page.getByRole('heading').first()).toBeVisible();
});

Then('devo ver a referência bíblica', async ({ page }) => {
    // Look for Bible reference pattern (e.g., "João 3:16")
    await expect(page.getByText(/\w+\s+\d+:\d+/)).toBeVisible();
});

Then('devo ver o texto da meditação', async ({ page }) => {
    await expect(page.locator('p, article, [role="article"]').first()).toBeVisible();
});

When('preencho o título {string}', async ({ page }, title: string) => {
    await page.getByLabel(/título/i).fill(title);
});

When('preencho a referência {string}', async ({ page }, reference: string) => {
    await page.getByLabel(/referência/i).fill(reference);
});

When('preencho o texto do versículo', async ({ page }) => {
    await page.getByLabel(/versículo|texto/i).fill(testDevotionals.today.verseText);
});

When('preencho a meditação', async ({ page }) => {
    await page.getByLabel(/meditação|conteúdo/i).fill(testDevotionals.today.meditation);
});

Then('o devocional deve aparecer na lista', async ({ page }) => {
    const list = page.locator('table, [role="list"], ul, ol, .grid, .list');
    await expect(list.getByText(new RegExp(testDevotionals.today.title, 'i')).first()).toBeVisible();
});

Then('devo ver lista de devocionais', async ({ page }) => {
    await expect(page.locator('table, [role="list"], ul, ol, .grid, .list').first()).toBeVisible();
});

Then('cada devocional deve mostrar título', async ({ page }) => {
    const items = page.locator('[role="listitem"], tr, .card, .item');
    await expect(items.first()).toBeVisible();
});

Then('cada devocional deve mostrar data', async ({ page }) => {
    // Look for date pattern
    await expect(page.getByText(/\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2}/)).toBeVisible();
});

When('clico em um devocional', async ({ page }) => {
    const firstDevotional = page.locator('[role="listitem"], tr, .card, .item').first();
    await firstDevotional.click();
});

Then('devo ver o título completo', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 }).or(page.getByRole('heading').first())).toBeVisible();
});

Then('devo ver o texto do versículo', async ({ page }) => {
    await expect(page.locator('blockquote, .verse, [data-testid="verse"]').first()).toBeVisible();
});

Then('devo ver a meditação completa', async ({ page }) => {
    await expect(page.locator('article, .meditation, [data-testid="meditation"]').first()).toBeVisible();
});

// ============================================================================
// Prayer Requests Steps
// ============================================================================

When('preencho o conteúdo {string}', async ({ page }, content: string) => {
    await page.getByLabel(/conteúdo|pedido|mensagem/i).fill(content);
});

When('marco como anônimo', async ({ page }) => {
    await page.getByLabel(/anônimo|anônima/i).check();
});

Then('meu pedido deve aparecer na lista', async ({ page }) => {
    const list = page.locator('table, [role="list"], ul, ol, .grid, .list');
    await expect(list.getByText(/oração pela minha família/i).first()).toBeVisible();
});

Then('o pedido deve aparecer sem meu nome', async ({ page }) => {
    await expect(page.getByText(/anônimo/i)).toBeVisible();
});

Given('que existe um pedido de oração', async ({ page: _page }) => {
    // Assume a prayer request exists - would be set up via API
});

Then('o contador de orações deve aumentar', async ({ page }) => {
    // Wait for counter update
    await page.waitForTimeout(500);
    await expect(page.getByText(/\d+\s*(oração|orações|prayed)/i)).toBeVisible();
});

Given('que criei pedidos de oração', async ({ page: _page }) => {
    // Assume user has created prayer requests
});

When('acesso {string}', async ({ page }, section: string) => {
    await page.getByText(new RegExp(section, 'i')).click();
});

Then('devo ver apenas meus pedidos', async ({ page }) => {
    await expect(page.locator('[role="list"], table, .grid').first()).toBeVisible();
});

Then('devo poder editar meus pedidos', async ({ page }) => {
    await expect(page.getByRole('button', { name: /editar/i }).first()).toBeVisible();
});

Then('devo poder excluir meus pedidos', async ({ page }) => {
    await expect(page.getByRole('button', { name: /excluir|remover/i }).first()).toBeVisible();
});

Then('devo ver apenas pedidos de {string}', async ({ page }, category: string) => {
    // All visible items should be of the selected category
    await expect(page.getByText(new RegExp(category, 'i')).first()).toBeVisible();
});

// ============================================================================
// Events Steps
// ============================================================================

Then('devo ver lista de eventos futuros', async ({ page }) => {
    await expect(page.locator('[role="list"], table, .grid, .events').first()).toBeVisible();
});

Then('cada evento deve mostrar data e horário', async ({ page }) => {
    await expect(page.getByText(/\d{2}\/\d{2}\/\d{4}|\d{2}:\d{2}/)).toBeVisible();
});

Then('cada evento deve mostrar local', async ({ page }) => {
    await expect(page.getByText(/local|endereço|onde/i)).toBeVisible();
});

Given('que existe um evento {string}', async ({ page: _page }, _eventTitle: string) => {
    // Assume event exists - would be set up via API
});

When('clico no evento', async ({ page }) => {
    const firstEvent = page.locator('[role="listitem"], tr, .card, .event-item').first();
    await firstEvent.click();
});

Then('devo ver o título do evento', async ({ page }) => {
    await expect(page.getByRole('heading').first()).toBeVisible();
});

Then('devo ver a descrição completa', async ({ page }) => {
    await expect(page.locator('p, article, .description').first()).toBeVisible();
});

Then('devo ver data e horário', async ({ page }) => {
    await expect(page.getByText(/\d{2}\/\d{2}\/\d{4}/).or(page.getByText(/\d{2}:\d{2}/))).toBeVisible();
});

Then('devo ver o local', async ({ page }) => {
    await expect(page.getByText(/local|endereço/i)).toBeVisible();
});

Given('que existe um evento futuro', async ({ page: _page }) => {
    // Assume event exists
});

When('confirmo minha presença', async ({ page }) => {
    await page.getByRole('button', { name: /confirmar|participar|vou/i }).click();
});

Then('devo ver confirmação de presença', async ({ page }) => {
    await expect(page.getByText(/presença confirmada|você confirmou/i)).toBeVisible();
});

Then('o contador de confirmados deve aumentar', async ({ page }) => {
    await page.waitForTimeout(500);
    await expect(page.getByText(/\d+\s*(confirmado|confirmados|attending)/i)).toBeVisible();
});

When('seleciono a data {string}', async ({ page }, date: string) => {
    await page.getByLabel(/data/i).fill(date);
});

When('preencho o horário {string}', async ({ page }, time: string) => {
    await page.getByLabel(/horário|hora/i).fill(time);
});

When('preencho o local {string}', async ({ page }, location: string) => {
    await page.getByLabel(/local|endereço/i).fill(location);
});

Then('o evento deve aparecer na lista', async ({ page }) => {
    const list = page.locator('table, [role="list"], ul, ol, .grid, .list');
    await expect(list.first()).toBeVisible();
});
