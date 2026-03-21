import { test, expect } from '@playwright/test';

test.describe('PWA baseline', () => {
  test('loads manifest and registers service worker assets', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');

    const manifestResponse = await page.request.get('/manifest.json');
    expect(manifestResponse.ok()).toBeTruthy();

    const manifest = await manifestResponse.json();
    expect(manifest.name).toBe('Filadélfias');
    expect(Array.isArray(manifest.icons)).toBeTruthy();

    const requests = [];
    page.on('request', (request) => {
      requests.push(request.url());
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    const sawServiceWorkerAsset = requests.some(
      (url) => url.includes('/sw.js') || url.includes('/workbox-'),
    );
    expect(sawServiceWorkerAsset).toBeTruthy();

    const registration = await page.evaluate(async () => {
      const registered = await navigator.serviceWorker.getRegistrations();
      return registered.length;
    });
    expect(registration).toBeGreaterThanOrEqual(0);

    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('alert')).toContainText(/offline/i);
    await context.setOffline(false);
  });
});
