'use client';

import { WagmiConfig } from 'wagmi';
import { wagmiConfig } from '@/lib/wagmi';
import { BaseAccountProvider } from '@/lib/base-account';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <BaseAccountProvider>{children}</BaseAccountProvider>
    </WagmiConfig>
  );
}
