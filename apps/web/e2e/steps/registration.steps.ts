import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { testChurches } from '../support/fixtures';

const { Given, When, Then } = createBdd();

/**
 * Step definitions for church registration wizard.
 * The wizard has 4 steps: Church Data, Address, Admin, and Confirmation.
 */

// ============================================================================
// Church Data Steps (Step 1)
// ============================================================================

When('preencho o nome da igreja {string}', async ({ page }, name: string) => {
    // The field uses react-hook-form with name="church_name"
    const input = page.locator('input[name="church_name"]');
    await input.fill(name);
});

When('preencho o identificador {string}', async ({ page }, identifier: string) => {
    const input = page.locator('input[name="church_slug"]');
    await input.fill(identifier);
});

Then('devo ver preview da URL {string}', async ({ page }, urlPreview: string) => {
    await expect(page.getByText(new RegExp(urlPreview, 'i'))).toBeVisible();
});

Then('devo ver erro {string} no campo identificador', async ({ page }, errorMessage: string) => {
    await expect(page.getByText(new RegExp(errorMessage, 'i'))).toBeVisible();
});

// ============================================================================
// Address Steps (Step 2)
// ============================================================================

When('preencho o CEP {string}', async ({ page }, cep: string) => {
    // Mock ViaCEP response to ensure reliability
    if (cep) {
        const cleanCep = cep.replace(/\D/g, '');
        const mockAddress = {
            logradouro: cleanCep === '01310100' ? 'Avenida Paulista' : 'Praça da Sé',
            bairro: cleanCep === '01310100' ? 'Bela Vista' : 'Sé',
            localidade: 'São Paulo',
            uf: 'SP',
            cep: cep
        };

        await page.route(`**/*viacep.com.br/ws/${cleanCep}/json/`, async route => {
            await route.fulfill({ status: 200, body: JSON.stringify(mockAddress) });
        });
    }

    const input = page.locator('input[name="postal_code"]');
    await input.fill(cep);
    await input.blur(); // Trigger CEP lookup
    await page.waitForTimeout(1500); // Wait for CEP API and React State update
});

When('preencho o número {string}', async ({ page }, number: string) => {
    const input = page.locator('input[name="number"]');
    await input.fill(number);
});

Then('o campo rua deve ser preenchido automaticamente', async ({ page }) => {
    const streetInput = page.locator('input[name="street"]');
    await page.waitForTimeout(1500);
    const value = await streetInput.inputValue();
    expect(value.length).toBeGreaterThan(0);
});

Then('o campo cidade deve ser preenchido automaticamente', async ({ page }) => {
    const cityInput = page.locator('input[name="city"]');
    const value = await cityInput.inputValue();
    expect(value.length).toBeGreaterThan(0);
});

Then('devo ver mensagem de CEP inválido', async ({ page }) => {
    await expect(page.getByText(/cep inválido|cep não encontrado/i)).toBeVisible();
});

// ============================================================================
// Admin Steps (Step 3)
// ============================================================================

When('preencho o nome do administrador {string}', async ({ page }, name: string) => {
    // Wait for step 3 to be visible first
    await expect(page.getByText(/administrador/i).first()).toBeVisible({ timeout: 5000 });
    const input = page.locator('input[name="admin_name"]');
    await input.fill(name);
});

When('preencho o email do administrador {string}', async ({ page }, email: string) => {
    const input = page.locator('input[name="admin_email"]');
    await input.fill(email);
});

When('preencho a senha do administrador {string}', async ({ page }, password: string) => {
    const input = page.locator('input[name="admin_password"]');
    await input.fill(password);
});

When('confirmo a senha do administrador {string}', async ({ page }, password: string) => {
    const input = page.locator('input[name="admin_password_confirm"]');
    await input.fill(password);
});

When('preencho o telefone {string}', async ({ page }, phone: string) => {
    const input = page.locator('input[name="admin_phone"]');
    await input.fill(phone);
});

// ============================================================================
// Wizard Navigation Steps
// ============================================================================

When('avanço para o próximo passo', async ({ page }) => {
    await page.getByRole('button', { name: /próximo/i }).click();
});

When('volto para o passo anterior', async ({ page }) => {
    await page.getByRole('button', { name: /voltar/i }).first().click();
});

Then('devo estar no passo {int}', async ({ page }, step: number) => {
    // Check step indicator or heading
    const stepTexts = ['Dados da Igreja', 'Endereço', 'Administrador', 'Confirmação'];
    await expect(page.getByText(stepTexts[step - 1])).toBeVisible();
});

Then('devo ver o resumo dos dados', async ({ page }) => {
    // Wait for confirmation step - use heading which is unique
    await expect(page.getByRole('heading', { name: /confirmação/i })).toBeVisible();
});

// Note: 'clico em {string}' is defined in common.steps.ts

// ============================================================================
// Pre-populated Steps (for testing specific wizard steps)
// ============================================================================

Given('que estou no passo de endereço', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Fill step 1 to proceed
    await page.locator('input[name="church_name"]').fill(testChurches.newChurch.name);
    await page.locator('input[name="church_slug"]').fill(`test-church-${Date.now()}`);
    await page.getByRole('button', { name: /próximo/i }).click();

    // Wait for step 2
    await expect(page.getByRole('heading', { name: /endereço/i })).toBeVisible({ timeout: 5000 });
});

Given('que estou no passo de dados do administrador', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Fill step 1
    await page.locator('input[name="church_name"]').fill(testChurches.newChurch.name);
    await page.locator('input[name="church_slug"]').fill(`test-church-${Date.now()}`);
    await page.getByRole('button', { name: /próximo/i }).click();

    // Wait for step 2 loading
    await expect(page.locator('input[name="postal_code"]')).toBeVisible({ timeout: 5000 });

    // Fill step 2
    await page.locator('input[name="postal_code"]').fill('01310-100');
    await page.waitForTimeout(1500); // Wait for CEP lookup
    await page.locator('input[name="number"]').fill('1234');
    await page.getByRole('button', { name: /próximo/i }).click();

    // Wait for step 3
    await expect(page.locator('input[name="admin_name"]')).toBeVisible({ timeout: 5000 });
});

Given('que estou no passo {int}', async ({ page }, step: number) => {
    await page.goto('/register');

    if (step >= 2) {
        await page.locator('input[name="church_name"]').fill(testChurches.newChurch.name);
        await page.locator('input[name="church_slug"]').fill(`test-church-${Date.now()}`);
        await page.getByRole('button', { name: /próximo/i }).click();
    }

    if (step >= 3) {
        await page.locator('input[name="postal_code"]').fill('01310-100');
        await page.waitForTimeout(1500);
        await page.locator('input[name="number"]').fill('1234');
        await page.getByRole('button', { name: /próximo/i }).click();
    }

    if (step >= 4) {
        await page.locator('input[name="admin_name"]').fill('Admin Teste');
        await page.locator('input[name="admin_email"]').fill(`admin-${Date.now()}@teste.com`);
        await page.locator('input[name="admin_password"]').fill('Senha@123');
        await page.locator('input[name="admin_password_confirm"]').fill('Senha@123');
        await page.getByRole('button', { name: /próximo/i }).click();
    }
});

// ============================================================================
// Assertion Steps
// ============================================================================

Then('devo ver os dados preenchidos anteriormente', async ({ page }) => {
    // Should see church name from step 1
    await expect(page.getByText(testChurches.newChurch.name)).toBeVisible();
});

Then('devo ver mensagem de sucesso', async ({ page }) => {
    await expect(page.getByText(/sucesso|cadastrado com sucesso|bem-vindo/i)).toBeVisible();
});

Then('devo ser redirecionado para o painel', async ({ page }) => {
    await expect(page).toHaveURL(/\/app/);
});

Then('devo ver o passo {string}', async ({ page }, stepName: string) => {
    await expect(page.getByText(new RegExp(stepName, 'i')).first()).toBeVisible();
});

Then('devo ver campo de nome da igreja', async ({ page }) => {
    await expect(page.locator('input[name="church_name"]')).toBeVisible();
});

Then('devo ver campo de identificador', async ({ page }) => {
    await expect(page.locator('input[name="church_slug"]')).toBeVisible();
});

Then('os dados preenchidos devem ser mantidos', async ({ page }) => {
    // Verify the name field still has the value
    const nameInput = page.locator('input[name="church_name"]');
    const value = await nameInput.inputValue();
    expect(value.length).toBeGreaterThan(0);
});
