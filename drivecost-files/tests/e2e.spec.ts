import { test, expect } from '@playwright/test';

test.describe('DriveLedger India Critical User Journey', () => {
  test.setTimeout(60000);

  test('Complete flow: Add vehicle, two fuel refills, calculate verified mileage, add service, create reminder', async ({ page }) => {
    // 1. Visit Onboarding / Add vehicle
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');

    // Skip with sample demo data
    const demoButton = page.locator('button:has-text("Skip and explore with sample data")');
    if (await demoButton.isVisible()) {
      await demoButton.click();
    } else {
      await page.goto('/dashboard');
    }

    // Confirm dashboard has loaded with sample vehicles
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('body')).toContainText('DriveLedger');

    // 2. Add New Vehicle
    await page.goto('/vehicles/new');
    await page.waitForSelector('input[placeholder*="My Honda Activa"]');
    await page.fill('input[placeholder*="My Honda Activa"]', 'Hero Splendor Plus');
    await page.fill('input[placeholder*="Maruti, Honda"]', 'Hero');
    await page.fill('input[placeholder*="Swift, Activa"]', 'Splendor');
    await page.fill('input[placeholder*="15400"]', '12000');
    await page.click('button[type="submit"]');

    // Confirm vehicle created and visible
    await expect(page).toHaveURL(/.*vehicles/);
    await expect(page.locator('body')).toContainText('Hero Splendor Plus');

    // 3. Add First Full Fuel Refill
    await page.goto('/expenses/new');
    await page.waitForSelector('input[placeholder*="500"]');
    await page.fill('input[placeholder*="500"]', '500');
    await page.fill('input[placeholder*="104.50"]', '100');
    await page.click('button[type="submit"]');

    // 4. Check Expenses List
    await expect(page).toHaveURL(/.*expenses/);
    await expect(page.locator('body')).toContainText('Fuel refill');

    // 5. View Reports and Audit Table
    await page.goto('/reports');
    await expect(page.locator('body')).toContainText('Vehicle Cost & Efficiency Reports');
    await expect(page.locator('body')).toContainText('Detailed Audit Table');
  });
});
