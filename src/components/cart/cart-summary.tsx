'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/lib/cart-store';
import { getProductById } from '@/lib/product-service';
import { formatCurrency } from '@/lib/utils';

export function CartSummary() {
  const lines = useCart((state) => state.lines);
  const [subtotalCents, setSubtotalCents] = useState(0);

  useEffect(() => {
    async function load() {
      const cents = await Promise.all(
        lines.map(async (line) => {
          const product = await getProductById(line.productId);
          if (!product) return 0;
          return product.priceCents * line.quantity;
        }),
      );
      setSubtotalCents(cents.reduce((acc, value) => acc + value, 0));
    }
    load();
  }, [lines]);

  const taxCents = Math.round(subtotalCents * 0.0825);
  const totalCents = subtotalCents + taxCents;

  return (
    <div className="glass-card flex flex-col gap-3 p-6">
      <div className="flex items-center justify-between text-sm text-white/70">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotalCents)}</span>
      </div>
      <div className="flex items-center justify-between text-sm text-white/70">
        <span>Taxes</span>
        <span>{formatCurrency(taxCents)}</span>
      </div>
      <div className="flex items-center justify-between text-base font-semibold text-white">
        <span>Total</span>
        <span>{formatCurrency(totalCents)}</span>
      </div>
    </div>
  );
}
