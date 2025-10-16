'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createBaseAccountSDK, getCryptoKeyAccount } from '@base-org/account';
import { createPublicClient, encodeFunctionData, erc20Abi, http } from 'viem';
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
  ownerAddress: `0x${string}` | null;
  funderAddress: `0x${string}` | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  ensureSubAccount: () => Promise<SubAccount | null>;
  requestAutoSpend: () => Promise<boolean>;
  payInvoice: () => Promise<boolean>;
  autoSpendEnabled: boolean;
  disconnect: () => Promise<void>;
  error: string | null;
  network: 'base' | 'base-sepolia';
  isTestnet: boolean;
  checkoutRecipient: `0x${string}` | null;
  universalBalance: bigint | null;
  ownerBalance: bigint | null;
  subAccountBalance: bigint | null;
  refreshBalances: (overrides?: {
    owner?: `0x${string}` | null;
    subAccount?: `0x${string}` | null;
    universal?: `0x${string}` | null;
  }) => Promise<void>;
  isFetchingBalances: boolean;
  balanceError: string | null;
  walletUrl: string;
  fundSubAccount: (amount?: bigint) => Promise<void>;
  defaultSubAccountFundingAmount: bigint;
  balanceSymbol: string;
  balanceDecimals: number;
};

const BaseAccountContext = createContext<BaseAccountContextValue | null>(null);

const network = (process.env.NEXT_PUBLIC_NETWORK as 'base' | 'base-sepolia' | undefined) ?? 'base-sepolia';
const chain = network === 'base' ? base : baseSepolia;

const HEX_PATTERN = /^0x[0-9a-fA-F]+$/;
const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

function parseAmount(value: string | undefined, fallback: bigint) {
  if (!value) {
    return fallback;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }
  try {
    return BigInt(HEX_PATTERN.test(trimmed) ? trimmed : trimmed);
  } catch {
    return fallback;
  }
}

function parseDecimals(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
}

function toHex(value: bigint) {
  return `0x${value.toString(16)}` as const;
}

function isAddress(candidate: string | undefined): candidate is `0x${string}` {
  return candidate !== undefined && ADDRESS_PATTERN.test(candidate);
}

function normalizeAccounts(accounts: readonly string[]) {
  return accounts.filter((candidate): candidate is `0x${string}` => isAddress(candidate));
}

function findOwnerAccount(accounts: readonly `0x${string}`[], subAccountAddress?: `0x${string}` | null) {
  if (!accounts.length) {
    return null;
  }
  if (subAccountAddress) {
    const normalizedSubAccount = subAccountAddress.toLowerCase();
    const ownerCandidate = accounts.find((account) => account.toLowerCase() !== normalizedSubAccount);
    if (ownerCandidate) {
      return ownerCandidate;
    }
  }
  return accounts[0] ?? null;
}

function checkSpendPermission(entry: WalletPermission | undefined) {
  if (!entry?.permissions?.spend?.length) {
    return false;
  }
  return entry.permissions.spend.some((permission) => Boolean(permission.limit));
}

const spendLimitWei = parseAmount(process.env.NEXT_PUBLIC_BASE_AUTO_SPEND_LIMIT, 10n ** 15n);
const spendLimitHex = toHex(spendLimitWei);
const spendTokenAddress = process.env.NEXT_PUBLIC_BASE_AUTO_SPEND_TOKEN;
const spendToken = isAddress(spendTokenAddress) ? (spendTokenAddress as `0x${string}`) : null;
const spendTokenDecimals = spendToken
  ? parseDecimals(process.env.NEXT_PUBLIC_BASE_AUTO_SPEND_TOKEN_DECIMALS, 6)
  : 18;
const balanceSymbol = spendToken ? process.env.NEXT_PUBLIC_BASE_AUTO_SPEND_TOKEN_SYMBOL ?? 'USDC' : 'ETH';
const invoiceRecipientAddress = process.env.NEXT_PUBLIC_BASE_INVOICE_RECIPIENT;
const invoiceAmountWei = parseAmount(process.env.NEXT_PUBLIC_BASE_INVOICE_WEI, 50_000_000_000_000n);
const invoiceAmountHex = toHex(invoiceAmountWei);
const configuredPaymasterUrl = process.env.NEXT_PUBLIC_BASE_PAYMASTER_URL;
const chainHex = `0x${chain.id.toString(16)}` as const;
const isTestnet = network !== 'base';
const defaultCheckoutRecipient = isAddress(invoiceRecipientAddress) ? invoiceRecipientAddress : null;
const defaultWalletUrl = process.env.NEXT_PUBLIC_BASE_WALLET_URL ?? 'https://wallet.base.org';
const defaultSubAccountFundingAmount = parseAmount(
  process.env.NEXT_PUBLIC_BASE_SUBACCOUNT_FUND_WEI,
  spendToken ? 25n * 10n ** BigInt(spendTokenDecimals) : 500_000_000_000_000n,
);

const defaultRpcHttpUrls = chain.rpcUrls.default?.http ?? [];
const publicRpcHttpUrls =
  (chain.rpcUrls as typeof chain.rpcUrls & { public?: { http?: readonly string[] } }).public?.http ?? [];
const resolvedRpcUrl =
  process.env.NEXT_PUBLIC_BASE_RPC_URL ?? defaultRpcHttpUrls[0] ?? publicRpcHttpUrls[0] ?? null;

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
  sdk.subAccount.setToOwnerAccount(async () => {
    const { account } = await getCryptoKeyAccount();
    if (!account) {
      throw new Error('Unable to access Base account keys');
    }
    return { account } as any;
  });
  return sdk;
}

export function BaseAccountProvider({ children }: { children: React.ReactNode }) {
  const [sdk, setSdk] = useState<BaseAccountSDK | null>(null);
  const provider = useMemo(() => (sdk ? sdk.getProvider() : null), [sdk]);
  const [universalAddress, setUniversalAddress] = useState<string | null>(null);
  const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
  const [ownerAddress, setOwnerAddress] = useState<`0x${string}` | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<`0x${string}`[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSpendEnabled, setAutoSpendEnabled] = useState(false);
  const [ownerBalance, setOwnerBalance] = useState<bigint | null>(null);
  const [subAccountBalance, setSubAccountBalance] = useState<bigint | null>(null);
  const [universalBalance, setUniversalBalance] = useState<bigint | null>(null);
  const [isFetchingBalances, setIsFetchingBalances] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  const publicClient = useMemo(() => {
    if (!resolvedRpcUrl) {
      return null;
    }
    try {
      return createPublicClient({
        chain,
        transport: http(resolvedRpcUrl),
      });
    } catch (clientError) {
      console.warn('Failed to create Base public client', clientError);
      return null;
    }
  }, []);

  const refreshBalances = useCallback(
    async (
      overrides?: {
        owner?: `0x${string}` | null;
        subAccount?: `0x${string}` | null;
        universal?: `0x${string}` | null;
      },
    ) => {
      const owner = overrides?.owner ?? ownerAddress;
      const subAccountAddress = overrides?.subAccount ?? subAccount?.address ?? null;
      const universal = overrides?.universal ?? (isAddress(universalAddress ?? undefined)
        ? (universalAddress as `0x${string}`)
        : null);

      const canQuery = Boolean(provider?.request) || Boolean(publicClient);
      if (!canQuery) {
        setBalanceError('Base RPC unavailable. Set NEXT_PUBLIC_BASE_RPC_URL to enable balance lookups.');
        setOwnerBalance(null);
        setSubAccountBalance(null);
        setUniversalBalance(null);
        return;
      }

      if (!owner && !subAccountAddress && !universal) {
        setOwnerBalance(null);
        setSubAccountBalance(null);
        setUniversalBalance(null);
        setBalanceError(null);
        return;
      }

      setIsFetchingBalances(true);
      setBalanceError(null);
      let hadFailures = false;

      const fetchTokenBalance = async (address: `0x${string}`) => {
        if (!spendToken) {
          return null;
        }
        if (provider?.request) {
          try {
            const data = encodeFunctionData({
              abi: erc20Abi,
              functionName: 'balanceOf',
              args: [address],
            });
            const result = (await provider.request({
              method: 'eth_call',
              params: [
                {
                  to: spendToken,
                  data,
                },
                'latest',
              ],
            })) as string | null;
            if (typeof result === 'string' && HEX_PATTERN.test(result)) {
              return BigInt(result);
            }
          } catch (providerTokenError) {
            console.warn('Failed to fetch token balance from Base provider', providerTokenError);
          }
        }
        if (publicClient) {
          try {
            return await publicClient.readContract({
              address: spendToken,
              abi: erc20Abi,
              functionName: 'balanceOf',
              args: [address],
              blockTag: 'latest',
            });
          } catch (clientTokenError) {
            console.warn('Failed to fetch token balance from Base RPC', clientTokenError);
          }
        }
        return null;
      };

      const fetchNativeBalance = async (address: `0x${string}`) => {
        if (provider?.request) {
          try {
            const result = (await provider.request({
              method: 'eth_getBalance',
              params: [address, 'latest'],
            })) as string | null;
            if (typeof result === 'string' && HEX_PATTERN.test(result)) {
              return BigInt(result);
            }
          } catch (providerBalanceError) {
            console.warn('Failed to fetch native balance from Base provider', providerBalanceError);
          }
        }
        if (publicClient) {
          try {
            return await publicClient.getBalance({ address, blockTag: 'latest' });
          } catch (clientBalanceError) {
            console.warn('Failed to fetch native balance from Base RPC', clientBalanceError);
          }
        }
        return null;
      };

      try {
        const addresses = new Map<`0x${string}`, bigint | null>();
        const uniqueAddresses = [owner, subAccountAddress, universal]
          .filter((candidate): candidate is `0x${string}` => Boolean(candidate))
          .filter((value, index, array) => array.indexOf(value) === index);

        await Promise.all(
          uniqueAddresses.map(async (address) => {
            let balance: bigint | null = null;
            try {
              const tokenBalance = await fetchTokenBalance(address);
              balance = tokenBalance ?? (await fetchNativeBalance(address));
            } catch (balanceFetchError) {
              console.warn('Failed to fetch Base balance', balanceFetchError);
              hadFailures = true;
            }
            if (balance === null) {
              hadFailures = true;
            }
            addresses.set(address, balance);
          }),
        );

        setOwnerBalance(owner ? addresses.get(owner) ?? null : null);
        setSubAccountBalance(subAccountAddress ? addresses.get(subAccountAddress) ?? null : null);
        setUniversalBalance(universal ? addresses.get(universal) ?? null : null);
        setBalanceError(hadFailures ? 'Unable to load balances from Base RPC.' : null);
      } catch (balanceFetchError) {
        console.warn('Failed to fetch Base balances', balanceFetchError);
        setBalanceError(
          balanceFetchError instanceof Error ? balanceFetchError.message : 'Unable to load balances from Base RPC.',
        );
        setOwnerBalance(null);
        setSubAccountBalance(null);
        setUniversalBalance(null);
      } finally {
        setIsFetchingBalances(false);
      }
    },
    [ownerAddress, provider, publicClient, subAccount?.address, universalAddress],
  );

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
      const normalized = normalizeAccounts(accounts);
      setConnectedAccounts(normalized);
    };

    const handleDisconnect = () => {
      setUniversalAddress(null);
      setSubAccount(null);
      setAutoSpendEnabled(false);
      setOwnerAddress(null);
      setOwnerBalance(null);
      setSubAccountBalance(null);
      setUniversalBalance(null);
      setBalanceError(null);
      setConnectedAccounts([]);
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
        const universalCandidate = isAddress(universalAddress ?? undefined)
          ? (universalAddress as `0x${string}`)
          : null;
        const ownerCandidate = findOwnerAccount(connectedAccounts, existing.address);
        await refreshBalances({ owner: ownerCandidate, subAccount: existing.address, universal: universalCandidate });
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
      const universalCandidate = isAddress(universalAddress ?? undefined)
        ? (universalAddress as `0x${string}`)
        : null;
      const ownerCandidate = findOwnerAccount(connectedAccounts, created.address);
      await refreshBalances({ owner: ownerCandidate, subAccount: created.address, universal: universalCandidate });
      return created;
    } catch (createError) {
      console.error('Failed to create sub account', createError);
      setError(createError instanceof Error ? createError.message : 'Unable to create sub account');
      return null;
    }
  }, [connectedAccounts, refreshBalances, sdk, universalAddress]);

  const connect = useCallback(async () => {
    if (!provider || !sdk) return;
    setIsConnecting(true);
    setError(null);
    try {
      const accounts = (await provider.request({ method: 'eth_requestAccounts', params: [] })) as string[];
      const normalized = normalizeAccounts(accounts);
      setConnectedAccounts(normalized);
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
      from: ensured.address,
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
              from: ensured.address,
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
      await refreshBalances();
      return true;
    } catch (invoiceError) {
      if (permissionError) {
        throw permissionError;
      }
      throw invoiceError instanceof Error ? invoiceError : new Error('Invoice payment failed');
    }
  }, [ensureSubAccount, provider, autoSpendEnabled, requestAutoSpend, refreshBalances]);

  const fundSubAccount = useCallback(
    async (amount?: bigint) => {
      const ensured = await ensureSubAccount();
      if (!ensured || !provider) {
        throw new Error('Unable to access Base sub account for funding');
      }

      const owner = ownerAddress ?? (isAddress(universalAddress ?? undefined) ? (universalAddress as `0x${string}`) : null);
      if (!owner) {
        throw new Error('Unable to resolve signing wallet for funding');
      }

      const value = amount ?? defaultSubAccountFundingAmount;
      if (value <= 0n) {
        throw new Error('Funding amount must be greater than zero');
      }

      const valueHex = toHex(value);
      const transferData = spendToken
        ? encodeFunctionData({
            abi: erc20Abi,
            functionName: 'transfer',
            args: [ensured.address as `0x${string}`, value],
          })
        : '0x';

      const callRequest: Record<string, unknown> = {
        version: '2.0',
        atomicRequired: true,
        chainId: chainHex,
        from: owner,
        calls: [
          spendToken
            ? {
                to: spendToken,
                data: transferData,
                value: '0x0',
              }
            : {
                to: ensured.address,
                data: '0x',
                value: valueHex,
              },
        ],
      };

      try {
        await provider.request?.({
          method: 'wallet_sendCalls',
          params: [callRequest],
        });
      } catch (sendCallsError) {
        const message = sendCallsError instanceof Error ? sendCallsError.message : String(sendCallsError);
        if (!message.toLowerCase().includes('unsupported method')) {
          throw sendCallsError instanceof Error ? sendCallsError : new Error('Funding transfer failed');
        }
        await provider.request?.({
          method: 'eth_sendTransaction',
          params: [
            {
              from: owner,
              to: spendToken ?? ensured.address,
              value: spendToken ? '0x0' : valueHex,
              data: transferData,
            },
          ],
        });
      }

      const universal = isAddress(universalAddress ?? undefined)
        ? (universalAddress as `0x${string}`)
        : null;
      await refreshBalances({ owner, subAccount: ensured.address, universal });
    },
    [ensureSubAccount, ownerAddress, provider, refreshBalances, universalAddress],
  );

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
      setOwnerAddress(null);
      setOwnerBalance(null);
      setSubAccountBalance(null);
      setUniversalBalance(null);
      setBalanceError(null);
      setConnectedAccounts([]);
    }
  }, [provider]);

  useEffect(() => {
    if (!ownerAddress && !subAccount?.address && !isAddress(universalAddress ?? undefined)) {
      return;
    }
    void refreshBalances();
  }, [ownerAddress, refreshBalances, subAccount?.address, universalAddress]);

  useEffect(() => {
    if (!connectedAccounts.length) {
      setUniversalAddress(null);
      setOwnerAddress(null);
      return;
    }
    const primary = connectedAccounts[0] ?? null;
    const owner = findOwnerAccount(connectedAccounts, subAccount?.address ?? null);
    setUniversalAddress(primary ?? null);
    setOwnerAddress(owner ?? null);
  }, [connectedAccounts, subAccount?.address]);

  const value = useMemo<BaseAccountContextValue>(
    () => ({
      provider,
      sdk,
      universalAddress,
      subAccount,
      ownerAddress,
      funderAddress: ownerAddress,
      isConnecting,
      connect,
      ensureSubAccount,
      requestAutoSpend,
      payInvoice,
      autoSpendEnabled,
      disconnect,
      error,
      network,
      isTestnet,
      checkoutRecipient: defaultCheckoutRecipient,
      universalBalance,
      ownerBalance,
      subAccountBalance,
      refreshBalances,
      isFetchingBalances,
      balanceError,
      walletUrl: defaultWalletUrl,
      fundSubAccount,
      defaultSubAccountFundingAmount,
      balanceSymbol,
      balanceDecimals: spendToken ? spendTokenDecimals : 18,
    }),
    [
      provider,
      sdk,
      universalAddress,
      subAccount,
      ownerAddress,
      isConnecting,
      connect,
      ensureSubAccount,
      requestAutoSpend,
      payInvoice,
      autoSpendEnabled,
      disconnect,
      error,
      universalBalance,
      ownerBalance,
      subAccountBalance,
      refreshBalances,
      isFetchingBalances,
      balanceError,
      fundSubAccount,
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
