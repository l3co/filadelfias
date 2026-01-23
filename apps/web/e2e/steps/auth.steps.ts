import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { testUsers } from '../support/fixtures';

const { Given, When, Then } = createBdd();

/**
 * Authentication step definitions for login, password recovery, and session management.
 * 
 * NOTE: Login tests require a running backend with seeded test users.
 * In CI, these tests may be skipped or use mocked authentication.
 */

// ============================================================================
// Login Steps
// ============================================================================

Given('que estou logado como administrador', async ({ page }) => {
    await page.goto('/login');

    // Fill login form using the actual HTML structure (input id="email" and id="password")
    await page.locator('#email').fill(testUsers.admin.email);
    await page.locator('#password').fill(testUsers.admin.password);
    await page.getByRole('button', { name: /entrar/i }).click();

    // Wait for redirect to dashboard - may fail if no backend or user doesn't exist
    try {
        await expect(page).toHaveURL(/\/app/, { timeout: 10000 });
    } catch {
        // If login fails, skip this test scenario
        throw new Error('Login failed - backend may not be running or test user does not exist. This is expected in some environments.');
    }
});

Given('que estou logado como membro', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#email').fill(testUsers.member.email);
    await page.locator('#password').fill(testUsers.member.password);
    await page.getByRole('button', { name: /entrar/i }).click();

    try {
        // Members may be redirected to /membro or /app depending on their role
        await page.waitForURL(/\/(app|membro)/, { timeout: 10000 });
    } catch {
        throw new Error('Login failed - backend may not be running or test user does not exist.');
    }
});

// ============================================================================
// Password Reset Steps
// ============================================================================

Given('que acessei o link de redefinição válido', async ({ page }) => {
    // Mock the API response to ensure success scenario works without real token
    await page.route('**/api/auth/reset-password', async route => {
        await route.fulfill({ status: 200, body: JSON.stringify({ message: 'Password reset successful' }) });
    });

    // Navigate to reset password page with a mock token
    await page.goto('/reset-password?token=valid-test-token');
});

Given('que o link de redefinição expirou', async ({ page }) => {
    await page.goto('/reset-password?token=expired-token');
});

When('preencho a nova senha {string}', async ({ page }, password: string) => {
    // Use name attribute or label as the input might not have id="password"
    await page.locator('input[name="new_password"]').fill(password);
});

When('confirmo a senha {string}', async ({ page }, password: string) => {
    await page.locator('input[name="confirm_password"]').fill(password);
});

Then('devo ver erro de validação de senha fraca', async ({ page }) => {
    await expect(page.getByText(/senha fraca|senha muito curta|mínimo de caracteres|mínimo 8/i)).toBeVisible();
});

Then('devo ver opção para solicitar novo link', async ({ page }) => {
    await expect(page.getByRole('link', { name: /solicitar novo|novo link|reenviar/i })).toBeVisible();
});

// ============================================================================
// Dashboard Assertions (Auth-specific)
// ============================================================================

Then('devo estar logado como {string}', async ({ page }, name: string) => {
    await expect(page.getByText(new RegExp(name, 'i'))).toBeVisible();
});
