'use client';

import { OnchainKitProvider, type AppConfig } from '@coinbase/onchainkit';
import { base, baseSepolia } from 'viem/chains';

const network = (process.env.NEXT_PUBLIC_NETWORK as 'base' | 'base-sepolia') ?? 'base-sepolia';
const chain = network === 'base' ? base : baseSepolia;

const appConfig: AppConfig = {
  analytics: true,
  appearance: {
    name: 'Glass Gift Shop',
    logo: 'https://glass-gift-shop.vercel.app/icon.png',
    mode: 'dark',
    theme: 'default'
  },
  wallet: {
    display: 'modal',
    preference: 'smartWalletOnly',
    supportedWallets: {
      rabby: true,
      trust: true,
      frame: true
    }
  }
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OnchainKitProvider
      chain={chain}
      apiKey={process.env.NEXT_PUBLIC_CDP_API_KEY ?? undefined}
      projectId={process.env.NEXT_PUBLIC_CDP_PROJECT_ID ?? undefined}
      rpcUrl={process.env.NEXT_PUBLIC_BASE_RPC_URL ?? undefined}
      config={appConfig}
    >
      {children}
    </OnchainKitProvider>
  );
}
