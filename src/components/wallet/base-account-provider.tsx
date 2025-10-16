'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createBaseAccountSDK, getCryptoKeyAccount } from '@base-org/account';
import { encodeFunctionData } from 'viem';
import { base, baseSepolia } from 'viem/chains';

type WalletPermission = {
  permissions?: {
    spend?: Array<{ limit: string }>;
  };
};

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
  fundingAddress: string | null;
  subAccount: SubAccount | null;
  spendTokenBalance: bigint | null;
  spendTokenDecimals: number;
  isConnecting: boolean;
  connect: () => Promise<void>;
  ensureSubAccount: () => Promise<SubAccount | null>;
  requestAutoSpend: () => Promise<boolean>;
  payInvoice: () => Promise<boolean>;
  autoSpendEnabled: boolean;
  disconnect: () => Promise<void>;
  error: string | null;
  refreshBalance: () => Promise<bigint | null>;
};

const BaseAccountContext = createContext<BaseAccountContextValue | null>(null);

const network = (process.env.NEXT_PUBLIC_NETWORK as 'base' | 'base-sepolia' | undefined) ?? 'base-sepolia';
const chain = network === 'base' ? base : baseSepolia;

const HEX_PATTERN = /^0x[0-9a-fA-F]+$/;
const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

function toHexAmount(value: string | undefined, fallback: bigint) {
  if (!value) {
    return `0x${fallback.toString(16)}`;
  }
  const trimmed = value.trim();
  if (HEX_PATTERN.test(trimmed)) {
    return trimmed;
  }
  try {
    return `0x${BigInt(trimmed).toString(16)}`;
  } catch {
    return `0x${fallback.toString(16)}`;
  }
}

function isAddress(candidate: string | null | undefined): candidate is `0x${string}` {
  return typeof candidate === 'string' && ADDRESS_PATTERN.test(candidate);
}

function addressesEqual(a: string | null | undefined, b: string | null | undefined) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  return a.toLowerCase() === b.toLowerCase();
}

function firstValidAddress(...candidates: Array<string | null | undefined>): `0x${string}` | null {
  for (const candidate of candidates) {
    if (isAddress(candidate)) {
      return candidate;
    }
  }
  return null;
}

function pickAddress(value: unknown): `0x${string}` | null {
  if (typeof value === 'string' && isAddress(value)) {
    return value;
  }
  if (!value) {
    return null;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      const address = pickAddress(entry);
      if (address) {
        return address;
      }
    }
    return null;
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const direct = record.address;
    if (typeof direct === 'string' && isAddress(direct)) {
      return direct;
    }
    for (const key of ['account', 'source', 'owner', 'from']) {
      const candidate = record[key];
      if (typeof candidate === 'string' && isAddress(candidate)) {
        return candidate;
      }
    }
    for (const nested of Object.values(record)) {
      const address = pickAddress(nested);
      if (address) {
        return address;
      }
    }
  }
  return null;
}

function checkSpendPermission(entry: WalletPermission | undefined) {
  if (!entry?.permissions?.spend?.length) {
    return false;
  }
  return entry.permissions.spend.some((permission) => Boolean(permission.limit));
}

const spendLimitHex = toHexAmount(process.env.NEXT_PUBLIC_BASE_AUTO_SPEND_LIMIT, 10n ** 15n);
const spendTokenAddress = process.env.NEXT_PUBLIC_BASE_AUTO_SPEND_TOKEN;
const parsedSpendTokenDecimals = Number.parseInt(
  process.env.NEXT_PUBLIC_BASE_AUTO_SPEND_TOKEN_DECIMALS ?? '6',
  10,
);
const spendTokenDecimals = Number.isNaN(parsedSpendTokenDecimals)
  ? 6
  : parsedSpendTokenDecimals;
const invoiceRecipientAddress = process.env.NEXT_PUBLIC_BASE_INVOICE_RECIPIENT;
const invoiceAmountHex = toHexAmount(process.env.NEXT_PUBLIC_BASE_INVOICE_WEI, 50_000_000_000_000n);
const configuredPaymasterUrl = process.env.NEXT_PUBLIC_BASE_PAYMASTER_URL;
const chainHex = `0x${chain.id.toString(16)}` as const;

const ERC20_BALANCE_OF_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
] as const;

function extractFundingAddressFromCapabilities(value: unknown): `0x${string}` | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const direct = pickAddress(record);
  if (direct) {
    return direct;
  }

  const chainKeys = new Set([
    chainHex,
    `0x${chain.id.toString(16)}` as const,
    chain.id.toString(),
  ]);
  for (const [key, entry] of Object.entries(record)) {
    if (!chainKeys.has(key)) {
      continue;
    }
    if (!entry || typeof entry !== 'object') {
      continue;
    }
    const chainEntry = entry as Record<string, unknown>;
    const fundingCapability = chainEntry.funding;
    const fundingAddress = pickAddress(fundingCapability);
    if (fundingAddress) {
      return fundingAddress;
    }

    const subAccounts = chainEntry.subAccounts;
    if (subAccounts) {
      const subAccountAddress = pickAddress(subAccounts);
      if (subAccountAddress) {
        return subAccountAddress;
      }
    }

    const nestedAddress = pickAddress(chainEntry);
    if (nestedAddress) {
      return nestedAddress;
    }
  }

  for (const entry of Object.values(record)) {
    const nestedAddress = pickAddress(entry);
    if (nestedAddress) {
      return nestedAddress;
    }
  }

  return null;
}

function buildSdk() {
  const paymasterUrl = process.env.NEXT_PUBLIC_BASE_PAYMASTER_URL;
  const sdk = createBaseAccountSDK({
    appName: process.env.NEXT_PUBLIC_BASE_APP_NAME ?? 'Mate Shop',
    appLogoUrl: process.env.NEXT_PUBLIC_BASE_APP_LOGO ?? 'https://mate-shop.vercel.app/icon.png',
    appChainIds: [chain.id],
    subAccounts: {
      creation: 'on-connect',
      defaultAccount: 'universal',
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
  const [fundingAddress, setFundingAddress] = useState<string | null>(null);
  const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
  const [spendTokenBalance, setSpendTokenBalance] = useState<bigint | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSpendEnabled, setAutoSpendEnabled] = useState(false);

  const getFallbackFundingAddress = useCallback(
    () => firstValidAddress(universalAddress, subAccount?.address),
    [subAccount?.address, universalAddress],
  );

  const hydrateFundingAddress = useCallback(
    async ({ force = false }: { force?: boolean } = {}) => {
      const fallback = getFallbackFundingAddress();
      const sdkWithAccount =
        sdk && (sdk as unknown as { account?: { get?: () => { accounts?: unknown; capabilities?: unknown } } });
      const accountState = sdkWithAccount?.account?.get ? sdkWithAccount.account.get() : null;
      const storedCandidate = extractFundingAddressFromCapabilities(accountState?.capabilities);
      if (storedCandidate) {
        setFundingAddress(storedCandidate);
        return storedCandidate;
      }

      if (!provider?.request) {
        setFundingAddress(fallback);
        return fallback;
      }

      const accountForCapabilities = ((): `0x${string}` | null => {
        if (isAddress(universalAddress)) {
          return universalAddress;
        }
        if (Array.isArray(accountState?.accounts)) {
          for (const entry of accountState.accounts) {
            if (isAddress(entry as string)) {
              return entry as `0x${string}`;
            }
          }
        }
        if (isAddress(fallback)) {
          return fallback;
        }
        return null;
      })();

      if (!force && !accountForCapabilities) {
        setFundingAddress(fallback);
        return fallback;
      }

      if (!accountForCapabilities) {
        setFundingAddress(fallback);
        return fallback;
      }

      try {
        const capabilities = (await provider.request({
          method: 'wallet_getCapabilities',
          params: [accountForCapabilities, [chainHex]],
        })) as Record<string, unknown> | null | undefined;
        const accountsFromState = Array.isArray(accountState?.accounts)
          ? (accountState.accounts as Array<unknown>).filter((entry): entry is `0x${string}` =>
              isAddress(typeof entry === 'string' ? entry : undefined),
            )
          : [];

        const candidate = firstValidAddress(
          extractFundingAddressFromCapabilities(capabilities),
          ...accountsFromState.filter((entry) => !addressesEqual(entry, subAccount?.address)),
          fallback,
        );
        setFundingAddress(candidate);
        return candidate;
      } catch (addressError) {
        console.warn('Failed to resolve Base funding address', addressError);
        setFundingAddress(fallback);
        return fallback;
      }
    },
    [
      getFallbackFundingAddress,
      provider,
      sdk,
      subAccount?.address,
      universalAddress,
    ],
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    setSdk(buildSdk());
  }, []);

  useEffect(() => {
    if (!provider) {
      setFundingAddress(null);
      return;
    }
    if (!universalAddress) {
      return;
    }
    void hydrateFundingAddress();
  }, [hydrateFundingAddress, provider, universalAddress]);

  useEffect(() => {
    if (!provider) {
      return;
    }

    const handleAccountsChanged = (accounts: string[]) => {
      const knownSubAddress = subAccount?.address ?? null;
      const nextUniversal =
        accounts.find((account) => !addressesEqual(account, knownSubAddress)) ?? accounts[0] ?? null;
      setUniversalAddress(nextUniversal);
      void hydrateFundingAddress({ force: true });
    };

    const handleDisconnect = () => {
      setUniversalAddress(null);
      setSubAccount(null);
      setFundingAddress(null);
      setSpendTokenBalance(null);
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
  }, [hydrateFundingAddress, provider, subAccount?.address]);

  const fetchBalance = useCallback(
    async (override?: `0x${string}` | null) => {
      if (!provider?.request) {
        return null;
      }
      const accountAddress = override ?? (isAddress(fundingAddress) ? fundingAddress : null);
      if (!isAddress(accountAddress)) {
        return null;
      }

      try {
        if (isAddress(spendTokenAddress)) {
          const data = encodeFunctionData({
            abi: ERC20_BALANCE_OF_ABI,
            functionName: 'balanceOf',
            args: [accountAddress],
          });
          const balanceHex = (await provider.request({
            method: 'eth_call',
            params: [
              {
                to: spendTokenAddress,
                data,
              },
              'latest',
            ],
          })) as string;
          if (typeof balanceHex === 'string' && balanceHex.length > 0) {
            const normalized = BigInt(balanceHex);
            setSpendTokenBalance(normalized);
            return normalized;
          }
        } else {
          const balanceHex = (await provider.request({
            method: 'eth_getBalance',
            params: [accountAddress, 'latest'],
          })) as string;
          if (typeof balanceHex === 'string') {
            const normalized = BigInt(balanceHex);
            setSpendTokenBalance(normalized);
            return normalized;
          }
        }
      } catch (balanceError) {
        console.warn('Failed to refresh Base balance', balanceError);
      }
      setSpendTokenBalance(null);
      return null;
    },
    [fundingAddress, provider],
  );

  const refreshBalance = useCallback(async () => {
    const ensuredAddress = isAddress(fundingAddress)
      ? fundingAddress
      : await hydrateFundingAddress();
    if (!isAddress(ensuredAddress)) {
      setSpendTokenBalance(null);
      return null;
    }
    return fetchBalance(ensuredAddress);
  }, [fetchBalance, fundingAddress, hydrateFundingAddress]);

  useEffect(() => {
    if (!fundingAddress) {
      setSpendTokenBalance(null);
      return;
    }
    void fetchBalance(isAddress(fundingAddress) ? fundingAddress : undefined);
  }, [fetchBalance, fundingAddress]);

  const resolveSubAccount = useCallback(
    async ({ createIfMissing = true }: { createIfMissing?: boolean } = {}) => {
      if (!sdk) {
        return null;
      }

      try {
        const existing = await sdk.subAccount.get();
        if (existing) {
          setSubAccount(existing);
          setError(null);
          await hydrateFundingAddress();
          return existing;
        }
      } catch (getError) {
        console.error('Failed to fetch sub account', getError);
      }

      if (!createIfMissing) {
        return null;
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
              publicKey,
            },
          ],
        } as any);

        setSubAccount(created);
        setAutoSpendEnabled(false);
        setError(null);
        await hydrateFundingAddress({ force: true });
        return created;
      } catch (createError) {
        console.error('Failed to create sub account', createError);
        setError(createError instanceof Error ? createError.message : 'Unable to create sub account');
      }

      return null;
    },
    [hydrateFundingAddress, sdk],
  );

  const connect = useCallback(async () => {
    if (!provider || !sdk) return;
    setIsConnecting(true);
    setError(null);
    try {
      const accounts = (await provider.request({ method: 'eth_requestAccounts', params: [] })) as string[];
      const knownSubAddress = subAccount?.address ?? null;
      const preferredAccount =
        accounts.find((account) => !addressesEqual(account, knownSubAddress)) ?? accounts[0] ?? null;
      setUniversalAddress(preferredAccount ?? null);
      setAutoSpendEnabled(false);
      const resolvedSub = await resolveSubAccount({ createIfMissing: false });
      if (resolvedSub?.address && preferredAccount && addressesEqual(preferredAccount, resolvedSub.address)) {
        const fallbackUniversal = accounts.find((account) => !addressesEqual(account, resolvedSub.address));
        if (fallbackUniversal) {
          setUniversalAddress(fallbackUniversal);
        }
      }
      await hydrateFundingAddress({ force: true });
    } catch (connectError) {
      console.error('Failed to connect Base account', connectError);
      setError(connectError instanceof Error ? connectError.message : 'Unable to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [hydrateFundingAddress, provider, resolveSubAccount, sdk, subAccount?.address]);

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
      throw new Error('Unable to access Base sub account');
    }
    if (!provider.request) {
      const message = 'Base provider unavailable for auto spend requests.';
      setAutoSpendEnabled(false);
      setError(message);
      throw new Error(message);
    }
    try {
      setError(null);
      const existing = (await provider.request?.({
        method: 'wallet_getPermissions',
        params: [{ address: ensured.address, chainIds: [chain.id] }],
      })) as WalletPermission[] | undefined;

      if (Array.isArray(existing) && existing.some((entry) => checkSpendPermission(entry))) {
        setAutoSpendEnabled(true);
        return true;
      }

      const destination = isAddress(invoiceRecipientAddress) ? invoiceRecipientAddress : ensured.address;
      const spendConfig: { limit: string; period: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'; token?: `0x${string}` } = {
        limit: spendLimitHex,
        period: 'day',
      };

      if (isAddress(spendTokenAddress)) {
        spendConfig.token = spendTokenAddress;
      }

      const params = {
        address: ensured.address,
        chainId: chain.id,
        expiry: 60 * 60 * 24 * 30,
        feeToken: null,
        permissions: {
          calls: [{ to: destination }],
          spend: [spendConfig],
        },
      };

      await provider.request?.({
        method: 'wallet_grantPermissions',
        params: [params],
      });
      setAutoSpendEnabled(true);
      return true;
    } catch (grantError) {
      console.warn('Auto spend permission request failed', grantError);
      setAutoSpendEnabled(false);
      const fallback = grantError instanceof Error ? grantError.message : 'Auto spend request failed';
      const message = fallback.includes('Unsupported method')
        ? 'Your Base wallet version does not yet support auto spend permissions.'
        : fallback;
      setError(message);
      throw new Error(message);
    }
  }, [ensureSubAccount, provider, setError]);

  const payInvoice = useCallback(async () => {
    const ensured = await ensureSubAccount();
    if (!ensured || !provider) {
      throw new Error('Unable to provision Base sub account');
    }
    if (!provider.request) {
      throw new Error('Base provider unavailable for invoices');
    }

    if (!fundingAddress) {
      throw new Error('No Base account available to fund invoice');
    }

    let permissionError: Error | null = null;
    if (!autoSpendEnabled) {
      try {
        await requestAutoSpend();
      } catch (error) {
        if (error instanceof Error) {
          permissionError = error;
        } else {
          permissionError = new Error('Auto spend request failed');
        }
      }
    }

    const destination = isAddress(invoiceRecipientAddress) ? invoiceRecipientAddress : ensured.address;
    const callRequest: Record<string, unknown> = {
      version: '2.0',
      atomicRequired: true,
      chainId: chainHex,
      from: fundingAddress,
      calls: [
        {
          to: destination,
          data: '0x',
          value: invoiceAmountHex,
        },
      ],
    };

    if (configuredPaymasterUrl) {
      callRequest.capabilities = { paymasterUrl: configuredPaymasterUrl };
    }

    const sendInvoice = async () => {
      try {
        await provider.request?.({
          method: 'wallet_sendCalls',
          params: [callRequest],
        });
      } catch (sendCallsError) {
        const message = sendCallsError instanceof Error ? sendCallsError.message : String(sendCallsError);
        if (!message.toLowerCase().includes('unsupported method')) {
          throw sendCallsError instanceof Error
            ? sendCallsError
            : new Error('Invoice payment failed');
        }
        await provider.request?.({
          method: 'eth_sendTransaction',
          params: [
            {
              from: fundingAddress,
              to: destination,
              value: invoiceAmountHex,
              data: '0x',
            },
          ],
        });
      }
    };

    try {
      await sendInvoice();
      await fetchBalance();
      return true;
    } catch (invoiceError) {
      if (permissionError) {
        throw permissionError;
      }
      throw invoiceError instanceof Error ? invoiceError : new Error('Invoice payment failed');
    }
  }, [ensureSubAccount, provider, autoSpendEnabled, requestAutoSpend, fetchBalance, fundingAddress]);

  const disconnect = useCallback(async () => {
    if (!provider) return;
    try {
      await provider.disconnect?.();
    } catch (disconnectError) {
      console.warn('Failed to disconnect Base account', disconnectError);
    } finally {
      setUniversalAddress(null);
      setSubAccount(null);
      setFundingAddress(null);
      setSpendTokenBalance(null);
      setAutoSpendEnabled(false);
    }
  }, [provider]);

  const value = useMemo<BaseAccountContextValue>(
    () => ({
      provider,
      sdk,
      universalAddress,
      fundingAddress,
      subAccount,
      spendTokenBalance,
      spendTokenDecimals,
      isConnecting,
      connect,
      ensureSubAccount,
      requestAutoSpend,
      payInvoice,
      autoSpendEnabled,
      disconnect,
      error,
      refreshBalance,
    }),
    [
      provider,
      sdk,
      universalAddress,
      fundingAddress,
      subAccount,
      spendTokenBalance,
      isConnecting,
      connect,
      ensureSubAccount,
      requestAutoSpend,
      payInvoice,
      autoSpendEnabled,
      disconnect,
      error,
      refreshBalance,
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
