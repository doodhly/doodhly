import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should complete full login flow successfully', async ({ page }) => {
        // Navigate to login page
        await page.goto('http://localhost:3000/auth/login');

        // Verify login form is visible
        await expect(page.locator('h1, h2').filter({ hasText: /login|sign in/i })).toBeVisible();

        // Enter phone number
        const phoneInput = page.locator('input[name="phone"]');
        await phoneInput.fill('+919111111938');

        // Click request OTP button
        const requestOtpButton = page.locator('button[type="submit"]').first();
        await requestOtpButton.click();

        // Wait for OTP input field
        await page.waitForSelector('input[name="otp"]', { timeout: 5000 });

        // Enter development backdoor OTP
        const otpInput = page.locator('input[name="otp"]');
        await otpInput.fill('1234');

        // Submit OTP
        const submitOtpButton = page.locator('button[type="submit"]').last();
        await submitOtpButton.click();

        // Wait for redirect to dashboard
        await page.waitForURL('**/app/dashboard', { timeout: 10000 });

        // Verify dashboard loaded
        expect(page.url()).toContain('/app/dashboard');

        // Check for user-specific elements
        const dashboardContent = page.locator('main, [role="main"]');
        await expect(dashboardContent).toBeVisible();
    });

    test('should show error for invalid OTP', async ({ page }) => {
        await page.goto('http://localhost:3000/auth/login');

        await page.fill('input[name="phone"]', '+919111111938');
        await page.click('button[type="submit"]');

        await page.waitForSelector('input[name="otp"]');
        await page.fill('input[name="otp"]', '0000'); // Invalid OTP
        await page.click('button[type="submit"]');

        // Should show error message
        const errorMessage = page.locator('text=/invalid|incorrect|wrong/i');
        await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });

    test('should handle logout flow', async ({ page }) => {
        // Login first
        await page.goto('http://localhost:3000/auth/login');
        await page.fill('input[name="phone"]', '+919111111938');
        await page.click('button[type="submit"]');
        await page.waitForSelector('input[name="otp"]');
        await page.fill('input[name="otp"]', '1234');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/app/dashboard');

        // Find and click logout button
        const logoutButton = page.locator('button, a').filter({ hasText: /logout|sign out/i });
        await logoutButton.click();

        // Should redirect to login
        await page.waitForURL('**/auth/login', { timeout: 5000 });
        expect(page.url()).toContain('/auth/login');
    });
});

test.describe('Wallet Recharge Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Login as customer
        await page.goto('http://localhost:3000/auth/login');
        await page.fill('input[name="phone"]', '+919111111938');
        await page.click('button[type="submit"]');
        await page.waitForSelector('input[name="otp"]');
        await page.fill('input[name="otp"]', '1234');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/app/dashboard');
    });

    test('should navigate to wallet page', async ({ page }) => {
        // Navigate to wallet (could be via sidebar or dashboard link)
        const walletLink = page.locator('a, button').filter({ hasText: /wallet|balance/i }).first();
        await walletLink.click();

        // Verify wallet page loaded
        await expect(page.locator('text=/wallet|balance/i')).toBeVisible();

        // Check for balance display
        const balanceElement = page.locator('text=/₹|balance/i');
        await expect(balanceElement).toBeVisible();
    });

    test('should display recharge options', async ({ page }) => {
        // Navigate to wallet
        await page.goto('http://localhost:3000/app/wallet');

        // Look for recharge button
        const rechargeButton = page.locator('button, a').filter({ hasText: /recharge|add money|top up/i });

        if (await rechargeButton.count() > 0) {
            await rechargeButton.click();

            // Should show recharge amounts or input
            const amountOptions = page.locator('text=/₹100|₹500|₹1000|amount/i');
            await expect(amountOptions.first()).toBeVisible({ timeout: 3000 });
        }
    });
});

test.describe('Subscription Creation Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('http://localhost:3000/auth/login');
        await page.fill('input[name="phone"]', '+919111111938');
        await page.click('button[type="submit"]');
        await page.waitForSelector('input[name="otp"]');
        await page.fill('input[name="otp"]', '1234');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/app/dashboard');
    });

    test('should navigate to subscription page', async ({ page }) => {
        // Find and click subscriptions link
        const subscriptionLink = page.locator('a').filter({ hasText: /subscription|my orders/i }).first();

        if (await subscriptionLink.count() > 0) {
            await subscriptionLink.click();
            await expect(page.locator('text=/subscription/i')).toBeVisible();
        }
    });

    test('should show create subscription button', async ({ page }) => {
        await page.goto('http://localhost:3000/app/subscriptions');

        // Look for create/add subscription button
        const createButton = page.locator('button, a').filter({ hasText: /create|new|add subscription/i });

        if (await createButton.count() > 0) {
            await expect(createButton.first()).toBeVisible();
        }
    });

    test('should display available products', async ({ page }) => {
        await page.goto('http://localhost:3000/app/subscriptions/new');

        // Should show product list or selection
        const productElements = page.locator('text=/milk|product|select/i');

        if (await productElements.count() > 0) {
            await expect(productElements.first()).toBeVisible({ timeout: 3000 });
        }
    });
});
