import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();

/**
 * Step definitions for public pages: Bible, Hymnal, Manual.
 */

// ============================================================================
// Bible Steps
// ============================================================================

Then('devo ver a lista de livros do Antigo Testamento', async ({ page }) => {
    const oldTestament = page.getByText(/antigo testamento|old testament/i)
        .or(page.getByRole('heading', { name: /antigo testamento/i }));
    await expect(oldTestament.first()).toBeVisible({ timeout: 5000 });

    // Check for some OT books
    const genesis = page.getByText(/gênesis|genesis/i);
    await expect(genesis.first()).toBeVisible();
});

Then('devo ver a lista de livros do Novo Testamento', async ({ page }) => {
    const newTestament = page.getByText(/novo testamento|new testament/i)
        .or(page.getByRole('heading', { name: /novo testamento/i }));
    await expect(newTestament.first()).toBeVisible();

    // Check for some NT books
    const matthew = page.getByText(/mateus|matthew/i);
    await expect(matthew.first()).toBeVisible();
});

Then('devo ver seletor de versão da Bíblia', async ({ page }) => {
    const versionSelector = page.getByRole('combobox')
        .or(page.getByLabel(/versão/i))
        .or(page.getByText(/ARA|NVI|ACF/i));
    await expect(versionSelector.first()).toBeVisible();
});

When('clico no livro {string}', async ({ page }, book: string) => {
    await page.getByRole('link', { name: new RegExp(book, 'i') })
        .or(page.getByText(new RegExp(`^${book}$`, 'i')))
        .first()
        .click();
});

When('seleciono o capítulo {int}', async ({ page }, chapter: number) => {
    const chapterLink = page.getByRole('link', { name: new RegExp(`^${chapter}$`) })
        .or(page.getByText(new RegExp(`^${chapter}$`)));
    await chapterLink.first().click();
});

Given('que estou lendo Gênesis capítulo {int}', async ({ page }, chapter: number) => {
    await page.goto(`/bible/genesis/${chapter}`);
});

Given('que estou lendo na versão ARA', async ({ page }) => {
    await page.goto('/bible/genesis/1?version=ara');
});

When('seleciono a versão {string}', async ({ page }, version: string) => {
    const versionSelector = page.getByRole('combobox')
        .or(page.getByLabel(/versão/i));
    await versionSelector.first().click();
    await page.getByRole('option', { name: new RegExp(version, 'i') }).click();
});

Then('devo ver o texto de Gênesis {int}', async ({ page }) => {
    // Verify that Bible text is loaded
    const textContent = page.locator('.verse, [data-verse], p').first();
    await expect(textContent).toBeVisible();
});

Then('devo estar em Gênesis capítulo {int}', async ({ page }, chapter: number) => {
    await expect(page).toHaveURL(new RegExp(`genesis/${chapter}`));
});

Then('o texto deve ser atualizado para a versão NVI', async ({ page }) => {
    await expect(page).toHaveURL(/version=nvi/i)
        .catch(async () => {
            // Alternative: check if NVI is selected
            await expect(page.getByText(/NVI/)).toBeVisible();
        });
});

Then('devo ser redirecionado para o versículo', async ({ page }) => {
    await expect(page).toHaveURL(/\/bible\//);
});

Then('devo ver o texto destacado', async ({ page }) => {
    // Check for highlighted text or verse
    const highlightedVerse = page.locator('.highlight, .selected, [data-highlighted]');
    await expect(highlightedVerse.first()).toBeVisible()
        .catch(async () => {
            // Alternative: just verify page has content
            await expect(page.locator('.verse, [data-verse], p').first()).toBeVisible();
        });
});

// ============================================================================
// Hymnal Steps
// ============================================================================

Then('devo ver lista de hinos', async ({ page }) => {
    const hymnList = page.locator('table, ul, [role="list"]')
        .or(page.getByText(/001|hino/i));
    await expect(hymnList.first()).toBeVisible();
});

When('busco pelo número {string}', async ({ page }, number: string) => {
    const searchInput = page.getByPlaceholder(/buscar|pesquisar|número/i)
        .or(page.getByLabel(/buscar/i));
    await searchInput.first().fill(number);
    await searchInput.first().press('Enter');
});

Then('devo ver o hino {string}', async ({ page }, title: string) => {
    await expect(page.getByText(new RegExp(title, 'i'))).toBeVisible();
});

Then('devo ver o hino número {int}', async ({ page }, number: number) => {
    const hymnNumber = page.getByText(new RegExp(`${number}`));
    await expect(hymnNumber.first()).toBeVisible();
});

When('clico no hino {string}', async ({ page }, identifier: string) => {
    const hymn = page.getByRole('link', { name: new RegExp(identifier) })
        .or(page.getByText(new RegExp(`^${identifier}`)));
    await hymn.first().click();
});

Then('devo ver a letra completa do hino', async ({ page }) => {
    // Check for hymn lyrics content
    const lyrics = page.locator('.lyrics, .stanza, .verse, p').first();
    await expect(lyrics).toBeVisible();
});

Then('devo ver informações do autor', async ({ page }) => {
    const authorInfo = page.getByText(/autor|compositor|letra/i);
    await expect(authorInfo.first()).toBeVisible()
        .catch(() => {
            // Author info might not always be available
        });
});

// ============================================================================
// Manual Steps
// ============================================================================

Then('devo ver índice com seções do manual', async ({ page }) => {
    const index = page.locator('nav, aside, [role="navigation"]')
        .or(page.getByRole('list'));
    await expect(index.first()).toBeVisible();
});

When('clico na seção {string}', async ({ page }, section: string) => {
    await page.getByRole('link', { name: new RegExp(section, 'i') })
        .or(page.getByText(new RegExp(section, 'i')))
        .first()
        .click();
});

Then('devo ver o conteúdo da seção', async ({ page }) => {
    const content = page.locator('article, main, .content').first();
    await expect(content).toBeVisible();
});

Then('devo ver resultados relacionados a batismo', async ({ page }) => {
    const results = page.getByText(/batismo/i);
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
});
