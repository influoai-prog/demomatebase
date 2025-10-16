'use client';

import { BaseAccountProvider } from '@/components/wallet/base-account-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return <BaseAccountProvider>{children}</BaseAccountProvider>;
}
