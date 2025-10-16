import { describe, expect, it, vi } from 'vitest';
import { createPaymentSummary } from './payment';
import { products } from '@/data/products';

vi.mock('@/lib/product-service', async () => {
  const actual = await vi.importActual<typeof import('./product-service')>('./product-service');
  return actual;
});

describe('payment summary', () => {
  it('computes totals with buffer', async () => {
    const summary = await createPaymentSummary([
      { productId: products[0].id, quantity: 2 },
      { productId: products[6].id, quantity: 1 }
    ]);
    expect(summary.subtotalCents).toBe(
      products[0].priceCents * 2 + products[6].priceCents,
    );
    expect(summary.bufferedTotal).toBe(Math.round(summary.totalCents * 1.05));
  });
});
