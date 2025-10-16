import { test, expect } from '@playwright/test';

test('homepage to cart flow', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Mate Shop' })).toBeVisible();
  await page.getByRole('link', { name: /Explore catalog/ }).click();
  await expect(page).toHaveURL(/shop/);
  const firstAddButton = page.getByRole('button', { name: /Add to Cart/ }).first();
  await firstAddButton.click();
  await page.getByRole('button', { name: /Cart/ }).click();
  await expect(page.getByRole('heading', { name: 'Your Cart' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Pay \$0\.10 Invoice/ })).toBeVisible();
});
