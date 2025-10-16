import { test, expect } from '@playwright/test';

test('homepage to cart flow', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Glass Gift Shop' })).toBeVisible();
  await page.getByRole('link', { name: 'Browse All' }).click();
  await expect(page).toHaveURL(/shop/);
  const firstAddButton = page.getByRole('button', { name: /Add/ }).first();
  await firstAddButton.click();
  await page.getByRole('link', { name: /Checkout with Base/ }).click();
  await expect(page).toHaveURL(/checkout/);
});
