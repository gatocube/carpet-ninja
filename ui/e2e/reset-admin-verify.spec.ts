
import { test, expect } from '@playwright/test';

test.describe('Admin User Verification', () => {
    const adminUrl = process.env.PROD_URL ? `${process.env.PROD_URL}/admin/login` : 'http://localhost:3445/admin/login';

    const users = [
        { email: 'admin@carpet-ninja.com', password: process.env.ADMIN_PASSWORD || 'admin123' },
        { email: 'alex@carpet-ninja.com', password: 'barducks' },
        { email: 'giorgi2510774@mail.ru', password: 'spaghetti39pass' },
        // The 4th user agagent was also added in seed? check seed.ts content I wrote.
        // Yes: agagent@carpet-ninja.com / AgAgent2026!
        { email: 'agagent@carpet-ninja.com', password: 'AgAgent2026!' }
    ];

    for (const user of users) {
        test(`should allow login for ${user.email}`, async ({ page }) => {
            await page.goto(adminUrl);
            await page.fill('input[name="email"]', user.email);
            await page.fill('input[name="password"]', user.password);
            await page.click('button[type="submit"]');

            // Wait for dashboard or logout button
            await expect(page.locator('a[href="/admin/logout"]')).toBeVisible({ timeout: 15000 });
            console.log(`✅ Login successful for ${user.email}`);
        });
    }
});
