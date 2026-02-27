import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should allow a user to login via OTP', async ({ page }) => {
        await page.goto('/login');

        // 1. Enter Phone
        const phoneInput = page.locator('input[type="tel"]').first();
        await expect(phoneInput).toBeVisible();
        await phoneInput.fill('9999999999');
        await page.getByRole('button', { name: /send otp/i }).click();

        // 2. Wait for OTP UI
        const otpInput = page.locator('input[type="text"]').first();
        await expect(otpInput).toBeVisible();

        // Use Dev Backdoor OTP '1234'
        await otpInput.fill('1234');
        await page.getByRole('button', { name: /verify & login/i }).click();

        // 3. Assert Redirect
        await expect(page).toHaveURL(/\/app/); // Could redirect to onboarding or dashboard
    });
});
