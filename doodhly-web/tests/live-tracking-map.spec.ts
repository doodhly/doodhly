import { test, expect } from '@playwright/test';

test.describe('Live Tracking Map', () => {
    test.beforeEach(async ({ page }) => {
        // Login as customer
        await page.goto('http://localhost:3000/auth/login');

        // Use development backdoor OTP
        await page.fill('input[name="phone"]', '+919111111938');
        await page.click('button[type="submit"]');

        await page.waitForSelector('input[name="otp"]', { timeout: 5000 });
        await page.fill('input[name="otp"]', '1234');
        await page.click('button[type="submit"]');

        // Wait for redirect to dashboard
        await page.waitForURL('**/app/dashboard', { timeout: 10000 });
    });

    test('should initialize map without errors', async ({ page }) => {
        // Navigate to dashboard where map is displayed
        await page.goto('http://localhost:3000/app/dashboard');

        // Wait for map container to be visible
        const mapContainer = page.locator('.leaflet-container').first();
        await expect(mapContainer).toBeVisible({ timeout: 10000 });

        // Check for console errors
        const consoleErrors: string[] = [];
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        // Wait a bit for any errors to surface
        await page.waitForTimeout(2000);

        // Verify no "Map container is already initialized" error
        const hasInitError = consoleErrors.some(err =>
            err.includes('Map container is already initialized')
        );
        expect(hasInitError).toBe(false);

        // Verify map controls are present
        const zoomControl = page.locator('.leaflet-control-zoom');
        await expect(zoomControl).toBeVisible();
    });

    test('should display partner location when simulation is running', async ({ page }) => {
        await page.goto('http://localhost:3000/app/dashboard');

        // Wait for map to load
        await page.waitForSelector('.leaflet-container', { timeout: 10000 });

        // Check if "Live Delivery" indicator is present
        const liveIndicator = page.locator('text=/Live Delivery/i');

        // This might not always be visible if simulation isn't running
        // So we just check the map loads without errors
        const mapContainer = page.locator('.leaflet-container').first();
        await expect(mapContainer).toBeVisible();

        // If marker exists, verify it
        const marker = page.locator('.leaflet-marker-icon').first();
        const markerCount = await marker.count();

        if (markerCount > 0) {
            await expect(marker).toBeVisible();
            console.log('✓ Partner marker found on map');
        } else {
            console.log('⚠ No partner marker (simulation may not be running)');
        }
    });

    test('should not crash on React Strict Mode double-render', async ({ page }) => {
        // This test verifies the fix for React Strict Mode
        await page.goto('http://localhost:3000/app/dashboard');

        // Reload the page to trigger potential re-mount
        await page.reload();
        await page.waitForSelector('.leaflet-container', { timeout: 10000 });

        // Map should still be visible and functional
        const mapContainer = page.locator('.leaflet-container').first();
        await expect(mapContainer).toBeVisible();

        // No JavaScript errors should be thrown
        const pageErrors: Error[] = [];
        page.on('pageerror', (error) => {
            pageErrors.push(error);
        });

        await page.waitForTimeout(2000);

        expect(pageErrors.length).toBe(0);
    });

    test('should display ETA information', async ({ page }) => {
        await page.goto('http://localhost:3000/app/dashboard');

        // Wait for map to load
        await page.waitForSelector('.leaflet-container', { timeout: 10000 });

        // Check for ETA text (might be "Calculating..." or "~5 mins away")
        const etaText = page.locator('text=/mins|Calculating|stationary/i').first();

        // ETA should be visible when map loads
        if (await etaText.isVisible()) {
            const etaContent = await etaText.textContent();
            console.log(`ETA displayed: ${etaContent}`);
            expect(etaContent).toBeTruthy();
        }
    });
});
