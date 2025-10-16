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

function isAddress(candidate: string | undefined): candidate is `0x${string}` {
  return candidate !== undefined && ADDRESS_PATTERN.test(candidate);
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

function buildSdk() {
  const paymasterUrl = process.env.NEXT_PUBLIC_BASE_PAYMASTER_URL;
  const sdk = createBaseAccountSDK({
    appName: process.env.NEXT_PUBLIC_BASE_APP_NAME ?? 'Mate Shop',
    appLogoUrl: process.env.NEXT_PUBLIC_BASE_APP_LOGO ?? 'https://mate-shop.vercel.app/icon.png',
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
  const [spendTokenBalance, setSpendTokenBalance] = useState<bigint | null>(null);
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
  }, [provider]);

  const fetchBalance = useCallback(
    async (target?: SubAccount | null) => {
      if (!provider?.request) {
        return null;
      }
      const accountAddress = target?.address ?? universalAddress ?? subAccount?.address;
      if (!accountAddress) {
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
    [provider, subAccount, universalAddress],
  );

  const refreshBalance = useCallback(() => fetchBalance(), [fetchBalance]);

  const resolveSubAccount = useCallback(async () => {
    if (!sdk) {
      return null;
    }
    try {
      const existing = await sdk.subAccount.get();
      if (existing) {
        setSubAccount(existing);
        setError(null);
        void fetchBalance(existing);
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
      void fetchBalance(created);
      return created;
    } catch (createError) {
      console.error('Failed to create sub account', createError);
      setError(createError instanceof Error ? createError.message : 'Unable to create sub account');
      return null;
    }
  }, [fetchBalance, sdk]);

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

    const fundingAddress = universalAddress ?? ensured.address;
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
  }, [ensureSubAccount, provider, autoSpendEnabled, requestAutoSpend, fetchBalance, universalAddress]);

  const disconnect = useCallback(async () => {
    if (!provider) return;
    try {
      await provider.disconnect?.();
    } catch (disconnectError) {
      console.warn('Failed to disconnect Base account', disconnectError);
    } finally {
      setUniversalAddress(null);
      setSubAccount(null);
      setSpendTokenBalance(null);
      setAutoSpendEnabled(false);
    }
  }, [provider]);

  const value = useMemo<BaseAccountContextValue>(
    () => ({
      provider,
      sdk,
      universalAddress,
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
