
import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        // Login before each test
        await page.goto('/login');
        await page.locator('input[type="tel"]').fill('9876543210');
        await page.getByRole('button', { name: "Get OTP" }).click();
        const otpInput = page.locator('input[placeholder="• • • • • •"]');
        await expect(otpInput).toBeVisible({ timeout: 10000 });
        await otpInput.fill('1234');
        await page.getByRole('button', { name: "Verify & Login" }).click();
        await expect(page).toHaveURL(/.*\/app\/dashboard/, { timeout: 10000 });
    });

    test('should display Smart Savings Widget', async ({ page }) => {
        // Wait for widget to load (it might be async)
        // First, check if loading skeleton is present, if so wait for it to detach
        // const skeleton = page.locator('.animate-pulse');
        // if (await skeleton.count() > 0) await skeleton.first().waitFor({ state: 'detached', timeout: 10000 });

        const widgetHeading = page.getByText(/predicted usage/i);
        await expect(widgetHeading).toBeVisible({ timeout: 15000 });

        // Check for Savings amount
        // It might be "₹0" initially, so just check for the currency symbol or label
        const savingsText = page.getByText(/pass savings/i);
        await expect(savingsText).toBeVisible();
    });
});
