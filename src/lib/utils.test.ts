import { describe, expect, it } from 'vitest';
import { bufferAmount, calculateCartTotals, formatCurrency, formatTokenEstimate } from './utils';

describe('utils', () => {
  it('formats currency', () => {
    expect(formatCurrency(1999)).toBe('$19.99');
  });

  it('estimates tokens', () => {
    expect(formatTokenEstimate(10000, 2500)).toBe('0.004000');
  });

  it('calculates cart totals', () => {
    const totals = calculateCartTotals([
      { priceCents: 1000, quantity: 2 },
      { priceCents: 500, quantity: 1 }
    ]);
    expect(totals.subtotalCents).toBe(2500);
    expect(totals.taxCents).toBe(Math.round(2500 * 0.0825));
    expect(totals.totalCents).toBe(totals.subtotalCents + totals.taxCents);
  });

  it('buffers amount', () => {
    expect(bufferAmount(1000)).toBe(1050);
  });
});
