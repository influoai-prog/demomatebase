'use client';

import { BaseAccountProvider as Provider, useBaseAccount } from '@/components/wallet/base-account-provider';

export function BaseAccountProvider({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}

export function useBaseAccountSDK() {
  const { sdk } = useBaseAccount();
  if (!sdk) {
    throw new Error('Base account SDK unavailable');
  }
  return sdk;
}
