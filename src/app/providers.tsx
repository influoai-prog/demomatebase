'use client';

import { CartProvider } from '@/components/cart/cart-provider';
import { BaseAccountProvider } from '@/components/wallet/base-account-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BaseAccountProvider>
      <CartProvider>{children}</CartProvider>
    </BaseAccountProvider>
  );
}
