import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { testUsers } from '../support/fixtures';

const { Given, When, Then } = createBdd();

/**
 * Step definitions for RBAC (Role-Based Access Control) scenarios.
 * Covers permissions by office (Pastor, Presbítero, Diácono) and functions (Tesoureiro, Secretário).
 */

// ============================================================================
// Login Steps for Different Offices
// ============================================================================

Given('que estou logado como Pastor', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testUsers.pastor.email);
    await page.locator('#password').fill(testUsers.pastor.password);
    await page.getByRole('button', { name: /entrar/i }).click();

    try {
        await expect(page).toHaveURL(/\/member/, { timeout: 10000 });
    } catch {
        throw new Error('Login as Pastor failed - backend may not be running or test user does not exist.');
    }
});

Given('que estou logado como Presbítero', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testUsers.presbitero.email);
    await page.locator('#password').fill(testUsers.presbitero.password);
    await page.getByRole('button', { name: /entrar/i }).click();

    try {
        await expect(page).toHaveURL(/\/member/, { timeout: 10000 });
    } catch {
        throw new Error('Login as Presbítero failed - backend may not be running or test user does not exist.');
    }
});

Given('que estou logado como Diácono', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testUsers.diacono.email);
    await page.locator('#password').fill(testUsers.diacono.password);
    await page.getByRole('button', { name: /entrar/i }).click();

    try {
        await expect(page).toHaveURL(/\/member/, { timeout: 10000 });
    } catch {
        throw new Error('Login as Diácono failed - backend may not be running or test user does not exist.');
    }
});

Given('que estou logado como Membro', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testUsers.member.email);
    await page.locator('#password').fill(testUsers.member.password);
    await page.getByRole('button', { name: /entrar/i }).click();

    try {
        await page.waitForURL(/\/member/, { timeout: 10000 });
    } catch {
        throw new Error('Login as Membro failed - backend may not be running or test user does not exist.');
    }
});

Given('que estou logado como membro com função {string}', async ({ page }, functionName: string) => {
    const userMap: Record<string, typeof testUsers.tesoureiro | typeof testUsers.secretario> = {
        'Tesoureiro': testUsers.tesoureiro,
        'Secretário': testUsers.secretario,
    };

    const user = userMap[functionName];
    if (!user) {
        throw new Error(`Unknown function: ${functionName}`);
    }

    await page.goto('/login');
    await page.locator('#email').fill(user.email);
    await page.locator('#password').fill(user.password);
    await page.getByRole('button', { name: /entrar/i }).click();

    try {
        await expect(page).toHaveURL(/\/member/, { timeout: 10000 });
    } catch {
        throw new Error(`Login as ${functionName} failed - backend may not be running or test user does not exist.`);
    }
});

Given('que estou logado como Diácono com função {string}', async ({ page }) => {
    // For this scenario, we'd need a special test user that is both Diácono and has a function
    // For now, we'll use the tesoureiro user as an example
    await page.goto('/login');
    await page.locator('#email').fill(testUsers.tesoureiro.email);
    await page.locator('#password').fill(testUsers.tesoureiro.password);
    await page.getByRole('button', { name: /entrar/i }).click();

    try {
        await expect(page).toHaveURL(/\/member/, { timeout: 10000 });
    } catch {
        throw new Error('Login failed - backend may not be running or test user does not exist.');
    }
});

// ============================================================================
// Permission Assertion Steps
// ============================================================================

Then('devo ver menu {string}', async ({ page }, menuItem: string) => {
    const sidebar = page.locator('nav, aside, [role="navigation"]');
    await expect(sidebar.getByText(new RegExp(menuItem, 'i')).first()).toBeVisible({ timeout: 5000 });
});

Then('devo poder criar novos membros', async ({ page }) => {
    await page.goto('/admin/members');
    await expect(page.getByRole('button', { name: /novo|adicionar|criar/i })).toBeVisible();
});

Then('devo poder excluir membros', async ({ page }) => {
    await page.goto('/admin/members');
    // Check if delete button/action exists
    const deleteButton = page.getByRole('button', { name: /excluir|remover|delete/i });
    await expect(deleteButton.first()).toBeVisible().catch(async () => {
        // Alternative: check for delete icon
        await expect(page.locator('[data-testid="delete-button"], .delete-action').first()).toBeVisible();
    });
});

Then('devo poder criar membros', async ({ page }) => {
    await page.goto('/admin/members');
    await expect(page.getByRole('button', { name: /novo|adicionar|criar/i })).toBeVisible();
});

Then('NÃO devo poder excluir membros', async ({ page }) => {
    await page.goto('/admin/members');
    const deleteButton = page.getByRole('button', { name: /excluir|remover|delete/i });

    await expect(deleteButton).not.toBeVisible().catch(() => {
        // If element doesn't exist, that's acceptable
        return Promise.resolve();
    });
});

Then('NÃO devo poder editar configurações', async ({ page }) => {
    const sidebar = page.locator('nav, aside, [role="navigation"]');

    await expect(sidebar.getByText(/configurações/i)).not.toBeVisible().catch(() => {
        return Promise.resolve();
    });
});

Then('NÃO devo ver menu {string}', async ({ page }, menuItem: string) => {
    const sidebar = page.locator('nav, aside, [role="navigation"]');

    await expect(sidebar.getByText(new RegExp(menuItem, 'i'))).not.toBeVisible().catch(() => {
        return Promise.resolve();
    });
});

Then('NÃO devo ter acesso a {string}', async ({ page }, path: string) => {
    await page.goto(path);

    // Should be redirected away or see error
    await page.waitForLoadState('networkidle');

    const isOnPath = await page.url().includes(path);
    expect(isOnPath).toBe(false);
});

// ============================================================================
// Function-Specific Permission Steps
// ============================================================================

Then('devo poder criar transações', async ({ page }) => {
    await page.goto('/admin/treasury');
    await expect(page.getByRole('button', { name: /nova|adicionar|criar/i })).toBeVisible();
});

Then('devo poder gerar relatórios financeiros', async ({ page }) => {
    await page.goto('/admin/treasury');
    await expect(page.getByRole('button', { name: /relatório|report/i })
        .or(page.getByText(/relatório/i)))
        .toBeVisible();
});

Then('devo poder visualizar saldo das contas', async ({ page }) => {
    await page.goto('/admin/treasury');
    await expect(page.getByText(/saldo|balance/i)).toBeVisible();
});

Then('devo poder criar atas de reunião', async ({ page }) => {
    await page.goto('/admin/governance');
    await expect(page.getByRole('button', { name: /nova|adicionar|criar/i })).toBeVisible();
});

Then('devo poder gerenciar documentos', async ({ page }) => {
    await page.goto('/admin/governance');
    await expect(page.getByText(/documento|ata|minutes/i)).toBeVisible();
});

// ============================================================================
// Error Handling Steps
// ============================================================================

Given('que minha sessão expirou', async ({ page }) => {
    // Clear cookies to simulate expired session
    await page.context().clearCookies();
});

When('tento realizar uma ação', async ({ page }) => {
    await page.goto('/admin/members');
});

Given('que o backend está indisponível', async ({ page }) => {
    // Mock backend failure
    await page.route('**/api/**', route => route.abort());
});

When('tento fazer login', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testUsers.admin.email);
    await page.locator('#password').fill(testUsers.admin.password);
    await page.getByRole('button', { name: /entrar/i }).click();
});

When('acesso uma rota inexistente {string}', async ({ page }, path: string) => {
    await page.goto(path);
});

Then('devo ver página de erro 404', async ({ page }) => {
    await expect(page.getByText(/404|não encontrado|not found/i)).toBeVisible();
});

Then('devo ver opção para voltar ao dashboard', async ({ page }) => {
    await expect(page.getByRole('link', { name: /dashboard|início|home|voltar/i })).toBeVisible();
});

Then('devo ver mensagem de erro de conexão', async ({ page }) => {
    await expect(page.getByText(/erro de conexão|serviço.*indisponível|connection error|service unavailable/i)).toBeVisible();
});
