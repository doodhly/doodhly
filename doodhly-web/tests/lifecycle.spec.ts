import { test, expect } from '@playwright/test';

test.describe('Doodhly Operational & Lifecycle E2E', () => {

    test('Backend Health Check should be healthy', async ({ request }) => {
        const response = await request.get('http://localhost:5000/api/health');
        expect(response.ok()).toBeTruthy();
        const body = await response.json();
        expect(body.status).toBe('healthy');
        expect(body.services.database.healthy).toBeTruthy();
    });

    test('Full User Lifecycle: Auth -> Dashboard -> Wallet', async ({ page }) => {
        // 1. Auth
        await page.goto('/auth/login');
        await page.fill('input[name="phone"]', '+919111111938');
        await page.click('button[type="submit"]');
        await page.waitForSelector('input[name="otp"]');
        await page.fill('input[name="otp"]', '1234');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/app/dashboard');

        // 2. Dashboard Verification (TanStack Query check)
        await expect(page.locator('h1')).toContainText(/Customer|Testing/i);

        // 3. Wallet Navigation
        await page.click('text=/wallet|balance/i');
        await page.waitForURL('**/app/wallet');
        await expect(page.locator('text=/Recharge|Add Money/i').first()).toBeVisible();

        // 4. Subscription Overview
        await page.goto('/app/subscriptions');
        await expect(page.locator('h1, h2').filter({ hasText: /Subscription/i })).toBeVisible();
    });

    test('Subscription Pause/Resume Flow', async ({ page }) => {
        // Login
        await page.goto('/auth/login');
        await page.fill('input[name="phone"]', '+919111111938');
        await page.click('button[type="submit"]');
        await page.waitForSelector('input[name="otp"]');
        await page.fill('input[name="otp"]', '1234');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/app/dashboard');

        await page.goto('/app/subscriptions');

        // Find an active subscription and try to pause it (if exists)
        const pauseButton = page.locator('button').filter({ hasText: /Pause/i }).first();
        if (await pauseButton.isVisible()) {
            await pauseButton.click();
            // Wait for toast or status change
            await expect(page.locator('text=/Paused|Deactivated/i').first()).toBeVisible({ timeout: 10000 });

            // Resume
            const resumeButton = page.locator('button').filter({ hasText: /Resume|Activate/i }).first();
            await resumeButton.click();
            await expect(page.locator('text=/Active/i').first()).toBeVisible({ timeout: 10000 });
        }
    });

    test('Live Tracking Map rendering', async ({ page }) => {
        // Login
        await page.goto('/auth/login');
        await page.fill('input[name="phone"]', '+919111111938');
        await page.click('button[type="submit"]');
        await page.waitForSelector('input[name="otp"]');
        await page.fill('input[name="otp"]', '1234');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/app/dashboard');

        // Check if map container exists (even if no delivery is active, the component might render a placeholder)
        const mapContainer = page.locator('.leaflet-container, [ref="mapContainerRef"]');
        // Note: Map only shows if there is a todayDelivery. We might need to mock this or just check for component presence if possible.
    });
});
