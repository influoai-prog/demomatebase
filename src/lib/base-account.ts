'use client';

import { createContext, useContext, useMemo } from 'react';
import { createBaseAccountSDK } from '@base-org/account';
import { baseSepolia, base } from 'viem/chains';

const appName = 'Glass Gift Shop';

type BaseAccountContextValue = ReturnType<typeof createBaseAccountSDK> | null;

const BaseAccountContext = createContext<BaseAccountContextValue>(null);

export function BaseAccountProvider({ children }: { children: React.ReactNode }) {
  const network = (process.env.NEXT_PUBLIC_NETWORK as 'base' | 'base-sepolia') ?? 'base-sepolia';

  const sdk = useMemo(() => {
    const chain = network === 'base' ? base : baseSepolia;
    return createBaseAccountSDK({
      appName,
      appLogoUrl: 'https://glass-gift-shop.vercel.app/icon.png',
      appChainIds: [chain.id],
      paymasterUrls: process.env.NEXT_PUBLIC_BASE_PAYMASTER_URL ? [process.env.NEXT_PUBLIC_BASE_PAYMASTER_URL] : undefined,
      subAccounts: {
        creation: 'manual',
        defaultAccount: 'universal'
      }
    });
  }, [network]);

  return <BaseAccountContext.Provider value={sdk}>{children}</BaseAccountContext.Provider>;
}

export function useBaseAccountSDK() {
  const ctx = useContext(BaseAccountContext);
  if (!ctx) {
    throw new Error('useBaseAccountSDK must be used within BaseAccountProvider');
  }
  return ctx;
}
