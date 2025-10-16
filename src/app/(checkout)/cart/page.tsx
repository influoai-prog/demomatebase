'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '@/lib/cart-store';
import { CartLine } from '@/components/cart/cart-line';
import { CartSummary } from '@/components/cart/cart-summary';
import { Button } from '@/components/ui/button';

export default function CartPage() {
  const lines = useCart((state) => state.lines);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  if (!hydrated) return null;

  if (lines.length === 0) {
    return (
      <div className="glass-card p-12 text-center text-white/70">
        Your cart is empty. <Link href="/shop" className="text-white underline">Explore the shop</Link>.
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr,1fr]">
      <div className="space-y-4">
        {lines.map((line) => (
          <CartLine key={line.productId} productId={line.productId} quantity={line.quantity} />
        ))}
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
      <div className="space-y-4">
        <CartSummary />
        <Button asChild className="w-full rounded-full">
          <Link href="/checkout">Checkout with Base</Link>
        </Button>
      </div>
    </div>
  );
}
