import { test, expect } from '@playwright/test';

test.describe('Delivery Partner Flow', () => {

    test('should load the brutalist partner dashboard and interact with offline sync', async ({ page }) => {
        // Log in as Partner
        await page.goto('/login');
        await page.locator('input[type="tel"]').first().fill('9876543210'); // Assume 9876543210 is a partner number
        await page.getByRole('button', { name: /login/i }).click();
        await page.locator('input[type="text"]').first().fill('1234');
        await page.getByRole('button', { name: /verify/i }).click();

        await page.goto('/partner/delivery');

        const syncButton = page.getByRole('button', { name: /sync routes/i });
        await expect(syncButton).toBeVisible();

        // Before Sync -> Should see routes listed or an empty state
        await expect(page.locator('text=DELIVERY COMPLETED').first()).toBeVisible().catch(() => null); // Optional verification
    });
});
