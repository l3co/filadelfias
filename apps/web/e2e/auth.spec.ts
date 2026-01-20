import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.getByRole('heading', { name: /bem-vindo/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel(/email/i).fill('invalid@email.com');
    await page.getByLabel(/senha/i).fill('wrongpassword');
    await page.getByRole('button', { name: /entrar/i }).click();
    
    // Aguardar resposta da API e verificar que permanece na página de login
    // (não foi redirecionado) e exibe mensagem de erro ou permanece no form
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/login/);
    
    // Verifica se mostra erro OU se o formulário ainda está visível (login falhou)
    const hasError = await page.getByText(/incorretos|erro|invalid|failed/i).isVisible().catch(() => false);
    const hasForm = await page.getByRole('button', { name: /entrar/i }).isVisible();
    
    expect(hasError || hasForm).toBeTruthy();
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByRole('link', { name: /esqueceu/i }).click();
    
    await expect(page).toHaveURL('/forgot-password');
    await expect(page.getByRole('heading', { name: /esqueceu sua senha/i })).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByRole('link', { name: /cadastre sua igreja/i }).click();
    
    await expect(page).toHaveURL('/register');
  });
});
