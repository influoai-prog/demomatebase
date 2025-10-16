'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createBaseAccountSDK, getCryptoKeyAccount } from '@base-org/account';
import { base, baseSepolia } from 'viem/chains';

type SubAccount = {
  address: `0x${string}`;
  chainId?: `0x${string}`;
  factory?: `0x${string}`;
  factoryData?: `0x${string}`;
};

type BaseAccountSDK = ReturnType<typeof createBaseAccountSDK>;
type BaseProvider = ReturnType<BaseAccountSDK['getProvider']>;

type BaseAccountContextValue = {
  provider: BaseProvider | null;
  sdk: BaseAccountSDK | null;
  universalAddress: string | null;
  subAccount: SubAccount | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  ensureSubAccount: () => Promise<SubAccount | null>;
  requestAutoSpend: () => Promise<boolean>;
  autoSpendEnabled: boolean;
  disconnect: () => Promise<void>;
  error: string | null;
};

const BaseAccountContext = createContext<BaseAccountContextValue | null>(null);

const network = (process.env.NEXT_PUBLIC_NETWORK as 'base' | 'base-sepolia' | undefined) ?? 'base-sepolia';
const chain = network === 'base' ? base : baseSepolia;

function buildSdk() {
  const paymasterUrl = process.env.NEXT_PUBLIC_BASE_PAYMASTER_URL;
  const sdk = createBaseAccountSDK({
    appName: process.env.NEXT_PUBLIC_BASE_APP_NAME ?? 'Glass Gift Shop',
    appLogoUrl: process.env.NEXT_PUBLIC_BASE_APP_LOGO ?? 'https://glass-gift-shop.vercel.app/icon.png',
    appChainIds: [chain.id],
    subAccounts: {
      creation: 'on-connect',
      defaultAccount: 'sub',
      funding: 'spend-permissions'
    } as any,
    paymasterUrls: paymasterUrl ? { [chain.id]: paymasterUrl } : undefined
  });
  return sdk;
}

export function BaseAccountProvider({ children }: { children: React.ReactNode }) {
  const [sdk, setSdk] = useState<BaseAccountSDK | null>(null);
  const provider = useMemo(() => (sdk ? sdk.getProvider() : null), [sdk]);
  const [universalAddress, setUniversalAddress] = useState<string | null>(null);
  const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSpendEnabled, setAutoSpendEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    setSdk(buildSdk());
  }, []);

  useEffect(() => {
    if (!provider) {
      return;
    }

    const handleAccountsChanged = (accounts: string[]) => {
      setUniversalAddress(accounts[0] ?? null);
    };

    const handleDisconnect = () => {
      setUniversalAddress(null);
      setSubAccount(null);
      setAutoSpendEnabled(false);
    };

    const emitter = provider as BaseProvider & {
      on?: (event: string, listener: (...args: any[]) => void) => void;
      removeListener?: (event: string, listener: (...args: any[]) => void) => void;
    };

    emitter.on?.('accountsChanged', handleAccountsChanged);
    emitter.on?.('disconnect', handleDisconnect);

    return () => {
      emitter.removeListener?.('accountsChanged', handleAccountsChanged);
      emitter.removeListener?.('disconnect', handleDisconnect);
    };
  }, [provider]);

  const resolveSubAccount = useCallback(async () => {
    if (!sdk) {
      return null;
    }
    try {
      const existing = await sdk.subAccount.get();
      if (existing) {
        setSubAccount(existing);
        setError(null);
        return existing;
      }
    } catch (getError) {
      console.error('Failed to fetch sub account', getError);
    }

    try {
      const { account } = await getCryptoKeyAccount();
      if (!account) {
        throw new Error('Unable to access Base account keys');
      }
      const keyType = 'address' in account && account.address ? 'address' : 'webauthn-p256';
      const publicKey = (account as any).address ?? (account as any).publicKey;
      const created = await sdk.subAccount.create({
        type: 'create',
        // The SDK expects the caller to supply the owner key so spend permissions can be requested automatically.
        keys: [
          {
            type: keyType,
            publicKey
          }
        ]
      } as any);
      setSubAccount(created);
      setAutoSpendEnabled(false);
      setError(null);
      return created;
    } catch (createError) {
      console.error('Failed to create sub account', createError);
      setError(createError instanceof Error ? createError.message : 'Unable to create sub account');
      return null;
    }
  }, [sdk]);

  const connect = useCallback(async () => {
    if (!provider || !sdk) return;
    setIsConnecting(true);
    setError(null);
    try {
      const accounts = (await provider.request({ method: 'eth_requestAccounts', params: [] })) as string[];
      setUniversalAddress(accounts[0] ?? null);
      await resolveSubAccount();
    } catch (connectError) {
      console.error('Failed to connect Base account', connectError);
      setError(connectError instanceof Error ? connectError.message : 'Unable to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [provider, resolveSubAccount, sdk]);

  const ensureSubAccount = useCallback(async () => {
    if (!sdk) {
      setError('Base Account SDK unavailable');
      return null;
    }
    if (!universalAddress) {
      await connect();
    }
    return resolveSubAccount();
  }, [connect, resolveSubAccount, universalAddress, sdk]);

  const requestAutoSpend = useCallback(async () => {
    const ensured = await ensureSubAccount();
    if (!ensured || !provider) {
      return false;
    }
    try {
      await provider.request?.({ method: 'wallet_grantPermissions', params: [] });
    } catch (grantError) {
      console.warn('Auto spend permission request failed', grantError);
    }
    setAutoSpendEnabled(true);
    return true;
  }, [ensureSubAccount, provider]);

  const disconnect = useCallback(async () => {
    if (!provider) return;
    try {
      await provider.disconnect?.();
    } catch (disconnectError) {
      console.warn('Failed to disconnect Base account', disconnectError);
    } finally {
      setUniversalAddress(null);
      setSubAccount(null);
      setAutoSpendEnabled(false);
    }
  }, [provider]);

  const value = useMemo<BaseAccountContextValue>(
    () => ({
      provider,
      sdk,
      universalAddress,
      subAccount,
      isConnecting,
      connect,
      ensureSubAccount,
      requestAutoSpend,
      autoSpendEnabled,
      disconnect,
      error,
    }),
    [
      provider,
      sdk,
      universalAddress,
      subAccount,
      isConnecting,
      connect,
      ensureSubAccount,
      requestAutoSpend,
      autoSpendEnabled,
      disconnect,
      error,
    ],
  );

  return <BaseAccountContext.Provider value={value}>{children}</BaseAccountContext.Provider>;
}

export function useBaseAccount() {
  const context = useContext(BaseAccountContext);
  if (!context) {
    throw new Error('useBaseAccount must be used within BaseAccountProvider');
  }
  return context;
}
