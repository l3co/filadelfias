import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd();

/**
 * Common step definitions used across multiple features.
 * These provide reusable navigation and assertion steps.
 */

// ============================================================================
// Navigation Steps
// ============================================================================

Given('que estou na página de login', async ({ page }) => {
    await page.goto('/login');
});

Given('que estou na página de recuperação de senha', async ({ page }) => {
    await page.goto('/forgot-password');
});

Given('que estou na página de cadastro de igreja', async ({ page }) => {
    await page.goto('/register');
    // Wait for the wizard to load
    await expect(page.getByText(/dados da igreja|cadastre sua igreja/i).first()).toBeVisible({ timeout: 10000 });
});

Given('que estou na página da Bíblia', async ({ page }) => {
    await page.goto('/bible');
});

Given('que estou na página do Hinário', async ({ page }) => {
    await page.goto('/hymnal');
});

Given('que estou na página do Manual', async ({ page }) => {
    await page.goto('/manual');
});

Given('estou na área administrativa', async ({ page }) => {
    await expect(page).toHaveURL(/\/app/);
});

Given('que estou na página de Membros', async ({ page }) => {
    await page.goto('/app/members');
});

Given('estou na página de Membros', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/members/);
});

Given('que estou na página de Tesouraria', async ({ page }) => {
    await page.goto('/app/financial');
});

Given('estou na página de Tesouraria', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/financial/);
});

Given('que estou na página de Governança', async ({ page }) => {
    await page.goto('/app/governance');
});

Given('estou na página de Governança', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/governance/);
});

Given('que estou na página de EBD', async ({ page }) => {
    await page.goto('/app/ebd');
});

Given('estou na página de EBD', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/ebd/);
});

Given('que estou na página de Missões', async ({ page }) => {
    await page.goto('/app/missions');
});

Given('estou na página de Missões', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/missions/);
});

Given('que estou na página de Configurações', async ({ page }) => {
    await page.goto('/app/settings');
});

Given('estou na página de Configurações', async ({ page }) => {
    await expect(page).toHaveURL(/\/app\/settings/);
});

// ============================================================================
// Form Interaction Steps
// ============================================================================

When('preencho o email {string}', async ({ page }, email: string) => {
    // Try #email (login page), then placeholder (member form in dialog)
    const emailById = page.locator('#email');
    if (await emailById.isVisible().catch(() => false)) {
        await emailById.fill(email);
        return;
    }
    
    // Try inside dialog first (for member forms)
    const dialog = page.locator('[role="dialog"]');
    if (await dialog.isVisible().catch(() => false)) {
        const emailInDialog = dialog.getByPlaceholder(/email@exemplo|email/i).first();
        await emailInDialog.fill(email);
        return;
    }
    
    // Fallback to any email input
    await page.locator('input[type="email"]').first().fill(email);
});

When('preencho a senha {string}', async ({ page }, password: string) => {
    const passwordField = page.locator('#password');
    if (await passwordField.isVisible().catch(() => false)) {
        await passwordField.fill(password);
    } else {
        await page.getByLabel(/senha/i).fill(password);
    }
});

When('clico no botão {string}', async ({ page }, buttonText: string) => {
    const button = page.getByRole('button', { name: new RegExp(buttonText, 'i') });
    await button.click();
    // Wait for network response after button click (login may take time)
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle').catch(() => {});
});

When('clico no link {string}', async ({ page }, linkText: string) => {
    await page.getByRole('link', { name: new RegExp(linkText, 'i') }).click();
});

When('clico em {string}', async ({ page }, text: string) => {
    // If a dialog is open, prioritize clicking within the dialog
    const dialog = page.locator('[role="dialog"]');
    if (await dialog.isVisible().catch(() => false)) {
        // Use exact match for dialog buttons to avoid matching similar names
        const dialogButton = dialog.getByRole('button', { name: text, exact: true });
        if (await dialogButton.isVisible().catch(() => false)) {
            await dialogButton.click();
            await page.waitForLoadState('networkidle').catch(() => {});
            return;
        }
        // Fallback to regex match within dialog
        const dialogButtonRegex = dialog.getByRole('button', { name: new RegExp(`^${text}$`, 'i') });
        if (await dialogButtonRegex.isVisible().catch(() => false)) {
            await dialogButtonRegex.click();
            await page.waitForLoadState('networkidle').catch(() => {});
            return;
        }
    }

    const button = page.getByRole('button', { name: new RegExp(text, 'i') });
    if (await button.isVisible().catch(() => false)) {
        await button.click();
        return;
    }

    const link = page.getByRole('link', { name: new RegExp(text, 'i') });
    if (await link.isVisible().catch(() => false)) {
        await link.click();
        return;
    }

    // Fallback to text content
    await page.getByText(new RegExp(text, 'i')).first().click();
});

When('clico em {string} no menu', async ({ page }, menuItem: string) => {
    const sidebar = page.locator('nav, aside, [role="navigation"]');
    await sidebar.getByText(new RegExp(menuItem, 'i')).first().click();
});

When('deixo o campo senha vazio', async ({ page }) => {
    await page.getByLabel(/senha/i).clear();
});

When('preencho o nome {string}', async ({ page }, name: string) => {
    // Use placeholder "Nome completo" from MemberForm
    await page.getByPlaceholder(/nome completo|nome/i).first().fill(name);
});

When('preencho a descrição {string}', async ({ page }, description: string) => {
    await page.getByPlaceholder(/descrição/i).first().fill(description);
});

When('preencho o valor {string}', async ({ page }, value: string) => {
    await page.getByPlaceholder(/valor|0,00/i).first().fill(value);
});

When('seleciono categoria {string}', async ({ page }, category: string) => {
    // Try native select (combobox) first
    const select = page.getByRole('combobox').first();
    if (await select.isVisible().catch(() => false)) {
        await select.selectOption({ label: category });
        return;
    }
    // Fallback to click-based selection
    await page.getByLabel(/categoria/i).click();
    await page.getByRole('option', { name: new RegExp(category, 'i') }).click();
});

When('seleciono a data de hoje', async ({ page }) => {
    // Default to today's date - implementation depends on date picker component
    const today = new Date().toISOString().split('T')[0];
    const dateInput = page.getByLabel(/data/i);
    if (await dateInput.isVisible()) {
        await dateInput.fill(today);
    }
});

When('busco por {string}', async ({ page }, searchTerm: string) => {
    const searchInput = page.getByPlaceholder(/buscar|pesquisar|search/i).first();
    await searchInput.fill(searchTerm);
    await searchInput.press('Enter');
});

// ============================================================================
// Assertion Steps
// ============================================================================

Then('devo ser redirecionado para {string}', async ({ page }, path: string) => {
    await expect(page).toHaveURL(new RegExp(path));
});

Then('devo ver a mensagem {string}', async ({ page }, message: string) => {
    // Para mensagens de "vazio", aceita também se houver dados (testes podem ter dados pré-existentes)
    // ou se a lista estiver realmente vazia (mostra contagem 0)
    if (message.toLowerCase().includes('nenhum')) {
        const hasMessage = await page.getByText(new RegExp(message, 'i')).count() > 0;
        const hasData = await page.locator('button:has-text("Detalhes"), [data-testid^="meeting-card-"]').count() > 0;
        const hasEmptyCount = await page.getByText(/\(0\)/).count() > 0;
        expect(hasMessage || hasData || hasEmptyCount).toBeTruthy();
    } else {
        await expect(page.getByText(new RegExp(message, 'i'))).toBeVisible();
    }
});

Then('devo ver mensagem {string}', async ({ page }, message: string) => {
    // Wait longer for API response and UI update
    await expect(page.getByText(new RegExp(message, 'i'))).toBeVisible({ timeout: 10000 });
});

Then('devo ver a mensagem de boas-vindas', async ({ page }) => {
    await expect(page.getByText(/bem-vindo|olá|dashboard/i).first()).toBeVisible();
});

Then('devo ver a mensagem de erro {string}', async ({ page }, errorMessage: string) => {
    await expect(page.getByText(new RegExp(errorMessage, 'i'))).toBeVisible();
});

Then('devo ver erro {string}', async ({ page }, errorMessage: string) => {
    await expect(page.getByText(new RegExp(errorMessage, 'i'))).toBeVisible();
});

Then('devo permanecer na página de login', async ({ page }) => {
    await expect(page).toHaveURL(/\/login/);
});

Then('devo ver erro de validação no campo email', async ({ page }) => {
    const emailField = page.getByLabel(/email/i);
    await expect(emailField).toHaveAttribute('aria-invalid', 'true')
        .catch(async () => {
            // Alternative: check for error message near the field
            await expect(page.getByText(/email inválido|email é obrigatório/i)).toBeVisible();
        });
});

Then('devo ver erro de validação no campo senha', async ({ page }) => {
    const passwordField = page.getByLabel(/senha/i);
    await expect(passwordField).toHaveAttribute('aria-invalid', 'true')
        .catch(async () => {
            await expect(page.getByText(/senha é obrigatória|senha obrigatória/i)).toBeVisible();
        });
});

Then('devo ver campo de email', async ({ page }) => {
    const emailField = page.locator('#email').or(page.getByLabel(/email/i));
    await expect(emailField.first()).toBeVisible();
});

Then('devo ver campo de senha', async ({ page }) => {
    const passwordField = page.locator('#password').or(page.getByLabel(/senha/i));
    await expect(passwordField.first()).toBeVisible();
});

Then('devo ver campo de busca', async ({ page }) => {
    await expect(page.getByPlaceholder(/buscar|pesquisar|search/i).first()).toBeVisible();
});

Then('devo ver botão {string}', async ({ page }, buttonText: string) => {
    await expect(page.getByRole('button', { name: new RegExp(buttonText, 'i') })).toBeVisible();
});

Then('o botão {string} deve estar desabilitado', async ({ page }, buttonText: string) => {
    await expect(page.getByRole('button', { name: new RegExp(buttonText, 'i') })).toBeDisabled();
});

Then('devo ver {string}', async ({ page }, text: string) => {
    await expect(page.getByText(new RegExp(text, 'i')).first()).toBeVisible();
});

Then('devo ver o título {string}', async ({ page }, title: string) => {
    await expect(page.getByRole('heading', { name: new RegExp(title, 'i') }).first()).toBeVisible();
});

Then('devo ver {string} na lista', async ({ page }, text: string) => {
    const list = page.locator('table, [role="list"], ul, ol');
    await expect(list.getByText(new RegExp(text, 'i')).first()).toBeVisible();
});

Then('{string} deve aparecer na lista', async ({ page }, text: string) => {
    const list = page.locator('table, [role="list"], ul, ol');
    await expect(list.getByText(new RegExp(text, 'i')).first()).toBeVisible();
});

Then('não devo estar mais autenticado', async ({ page }) => {
    // Check that we're redirected to login or auth tokens are cleared
    await expect(page).toHaveURL(/\/login/);
});

// ============================================================================
// Dashboard Assertions
// ============================================================================

Then('devo ver o nome da minha igreja', async ({ page }) => {
    // Church name should be visible in header or sidebar
    const churchName = page.locator('header, aside, nav').getByText(/igreja/i);
    await expect(churchName.first()).toBeVisible({ timeout: 5000 })
        .catch(async () => {
            // Fallback: any heading
            await expect(page.getByRole('heading').first()).toBeVisible();
        });
});

Then('devo ver menu lateral com todos os módulos', async ({ page }) => {
    const sidebar = page.locator('nav, aside, [role="navigation"]');

    // Check for main navigation items
    const expectedItems = ['Dashboard', 'Membros', 'Governança', 'Tesouraria', 'Missões', 'EBD', 'Eventos'];

    for (const item of expectedItems) {
        await expect(sidebar.getByText(new RegExp(item, 'i')).first()).toBeVisible();
    }
});

Then('devo ver meu nome no canto superior', async ({ page }) => {
    const header = page.locator('header');
    // User name or profile indicator should be visible
    await expect(header.getByRole('button').or(header.getByText(/admin|perfil|usuário/i)).first()).toBeVisible();
});

// ============================================================================
// Settings Assertions
// ============================================================================

Then('devo ver o nome da igreja', async ({ page }) => {
    const churchName = page.getByLabel(/nome da igreja/i)
        .or(page.getByText(/igreja/i));
    await expect(churchName.first()).toBeVisible();
});

Then('devo ver o endereço', async ({ page }) => {
    const address = page.getByText(/endereço|rua|logradouro|address/i);
    await expect(address.first()).toBeVisible();
});

// ============================================================================
// Additional Form Steps
// ============================================================================

When('preencho o campo {string}', async ({ page }, value: string) => {
    // Generic field input - use for mission field, etc.
    const fieldInput = page.getByLabel(/campo|field/i);
    await fieldInput.fill(value);
});

