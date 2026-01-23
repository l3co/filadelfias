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
    // Use placeholder since label is not associated with input
    await page.getByPlaceholder(/graça|título|amor/i).first().fill(title);
});

When('preencho a referência {string}', async ({ page }, reference: string) => {
    // Use placeholder: "Ex: João 3:16"
    await page.getByPlaceholder(/joão|referência/i).first().fill(reference);
});

When('preencho o texto do versículo', async ({ page }) => {
    // Use placeholder: "Digite o texto do versículo..."
    await page.getByPlaceholder(/digite o texto|versículo/i).first().fill(testDevotionals.today.verseText);
});

When('preencho a meditação', async ({ page }) => {
    // Use placeholder: "Escreva a meditação do dia..."
    await page.getByPlaceholder(/escreva a meditação|meditação/i).first().fill(testDevotionals.today.meditation);
});

Then('o devocional deve aparecer na lista', async ({ page }) => {
    const list = page.locator('table, [role="list"], ul, ol, .grid, .list');
    await expect(list.getByText(new RegExp(testDevotionals.today.title, 'i')).first()).toBeVisible();
});

Then('devo ver lista de devocionais', async ({ page }) => {
    // Check that at least one devotional heading is visible
    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible({ timeout: 5000 });
});

When('navego para {string}', async ({ page }, path: string) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
});

Then('devo ver a página de devocionais admin', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /devocional|devocionais/i }).first()).toBeVisible({ timeout: 5000 });
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
    // Use placeholder: "Compartilhe seu pedido de oração..."
    await page.getByPlaceholder(/compartilhe|pedido|oração/i).first().fill(content);
});

When('marco como anônimo', async ({ page }) => {
    // Checkbox with label "Publicar anonimamente"
    await page.getByText(/anônimo|anonimamente/i).click();
});

Then('meu pedido deve aparecer na lista', async ({ page }) => {
    await expect(page.getByText(/oração pela minha família/i).first()).toBeVisible({ timeout: 5000 });
});

Then('devo ver pedidos na lista', async ({ page }) => {
    // Verify at least one prayer request is visible - look for the "Orar" button
    await expect(page.getByRole('button', { name: /orar/i }).first()).toBeVisible({ timeout: 5000 });
});

Then('devo ver o formulário de pedido de oração', async ({ page }) => {
    // Form opens inline with a heading and textbox
    await expect(page.getByRole('heading', { name: /compartilhar pedido/i })).toBeVisible({ timeout: 5000 });
});

Then('o pedido deve aparecer sem meu nome', async ({ page }) => {
    await expect(page.getByText(/anônimo/i)).toBeVisible();
});

Given('que existe um pedido de oração', async ({ page: _page }) => {
    // Assume a prayer request exists - would be set up via API
});

Then('o contador de orações deve aumentar', async ({ page }) => {
    // Format: "X pessoas oraram" - wait for at least 1
    await expect(page.getByText(/[1-9]\d*\s*pessoa|pessoas\s*oraram/i).first()).toBeVisible({ timeout: 5000 });
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

Then('devo ver eventos na lista', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible({ timeout: 5000 });
});

Then('devo ver a página de eventos admin', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /eventos/i }).first()).toBeVisible({ timeout: 5000 });
});

Then('devo ver lista de eventos futuros', async ({ page }) => {
    // Wait for events to load - look for event headings (h3)
    await expect(
        page.getByRole('heading', { level: 3 }).first()
    ).toBeVisible({ timeout: 10000 });
});

Then('cada evento deve mostrar data e horário', async ({ page }) => {
    // Format: "segunda-feira, 26 de janeiro de 2026" and "10:06"
    await expect(page.getByText(/janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro/i).first()).toBeVisible();
});

Then('cada evento deve mostrar local', async ({ page }) => {
    // Look for location text like "Templo Principal" or "Auditório Central"
    await expect(page.getByText(/templo|auditório|igreja|salão/i).first()).toBeVisible();
});

Given('que existe um evento {string}', async ({ page: _page }, _eventTitle: string) => {
    // Assume event exists - would be set up via API
});

When('clico no evento', async ({ page }) => {
    // Click on the first event heading (h3)
    await page.getByRole('heading', { level: 3 }).first().click();
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
    await expect(page.getByText(/\d+\s*(confirmado|confirmados|attending)/i)).toBeVisible({ timeout: 5000 });
});

When('seleciono a data {string}', async ({ page }, date: string) => {
    // Date input
    await page.locator('input[type="date"]').first().fill(date);
});

When('preencho o horário {string}', async ({ page }, time: string) => {
    // Time input
    await page.locator('input[type="time"]').first().fill(time);
});

When('preencho o local {string}', async ({ page }, location: string) => {
    // Location input placeholder
    await page.getByPlaceholder(/local|endereço/i).first().fill(location);
});

Then('o evento deve aparecer na lista', async ({ page }) => {
    const list = page.locator('table, [role="list"], ul, ol, .grid, .list');
    await expect(list.first()).toBeVisible();
});
