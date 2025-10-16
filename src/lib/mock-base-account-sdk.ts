export type MockBaseAccountConfig = {
  appName: string;
  appLogoUrl?: string;
  appChainIds: number[];
  paymasterUrls?: string[];
  subAccounts?: {
    creation?: 'manual' | 'on-connect';
    defaultAccount?: 'universal' | 'sub';
  };
};

type RequestArguments = {
  method: string;
  params?: unknown[];
};

type SubAccountRecord = {
  address: `0x${string}`;
};

type WalletGetSubAccountsParams = {
  account: string;
  domain?: string;
};

function randomHex(bytes: number) {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const buffer = new Uint8Array(bytes);
    crypto.getRandomValues(buffer);
    return Array.from(buffer, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  let hex = '';
  for (let i = 0; i < bytes; i += 1) {
    hex += Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0');
  }
  return hex;
}

function createAddress(): `0x${string}` {
  return `0x${randomHex(20)}`;
}

class MockProvider {
  private universalAccount: `0x${string}`;

  private subAccount: SubAccountRecord | null = null;

  private domainCache: Record<string, SubAccountRecord | null> = {};

  constructor() {
    this.universalAccount = createAddress();
  }

  async request(args: RequestArguments): Promise<unknown> {
    switch (args.method) {
      case 'eth_requestAccounts':
      case 'eth_accounts':
        return this.resolveAccounts();
      case 'wallet_getSubAccounts':
        return this.getSubAccounts(args.params);
      case 'wallet_addSubAccount':
        return this.addSubAccount();
      case 'eth_sendTransaction':
        return this.sendTransaction(args.params);
      default:
        console.warn(`MockProvider: unhandled method ${args.method}`);
        return null;
    }
  }

  private async resolveAccounts(): Promise<string[]> {
    if (this.subAccount) {
      return [this.universalAccount, this.subAccount.address];
    }
    return [this.universalAccount];
  }

  private async getSubAccounts(params?: unknown[]): Promise<{ subAccounts: SubAccountRecord[] }> {
    const [first] = (params ?? []) as WalletGetSubAccountsParams[];
    const key = first?.domain ?? 'default';
    const cached = this.domainCache[key] ?? this.subAccount;
    if (cached) {
      this.domainCache[key] = cached;
      return { subAccounts: [cached] };
    }
    return { subAccounts: [] };
  }

  private async addSubAccount(): Promise<SubAccountRecord> {
    if (!this.subAccount) {
      this.subAccount = { address: createAddress() };
    }
    return this.subAccount;
  }

  private async sendTransaction(params?: unknown[]): Promise<`0x${string}`> {
    const [tx] = (params ?? []) as Array<{ from?: string; to?: string; value?: string }>;
    if (!tx?.from || !tx?.to) {
      throw new Error('MockProvider: missing transaction parameters');
    }
    return `0x${randomHex(32)}`;
  }
}

export function createBaseAccountSDK(_config: MockBaseAccountConfig) {
  const provider = new MockProvider();
  return {
    getProvider() {
      return provider;
    },
    subAccount: {
      async create() {
        return provider.request({ method: 'wallet_addSubAccount' }) as Promise<SubAccountRecord>;
      },
      async get() {
        const result = (await provider.request({
          method: 'wallet_getSubAccounts',
          params: [{}]
        })) as { subAccounts: SubAccountRecord[] };
        return result.subAccounts[0] ?? null;
      }
    }
  };
}
