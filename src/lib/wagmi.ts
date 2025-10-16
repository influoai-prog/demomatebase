'use client';

import { createConfig, http } from 'wagmi';
import { baseSepolia, base } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';

const network = (process.env.NEXT_PUBLIC_NETWORK as 'base' | 'base-sepolia') ?? 'base-sepolia';
const chain = network === 'base' ? base : baseSepolia;
const baseRpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL ?? base.rpcUrls.default.http[0];
const baseSepoliaRpcUrl =
  process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL ?? process.env.NEXT_PUBLIC_BASE_RPC_URL ?? baseSepolia.rpcUrls.default.http[0];

export const wagmiConfig = createConfig({
  chains: [chain],
  transports: {
    [base.id]: http(baseRpcUrl),
    [baseSepolia.id]: http(baseSepoliaRpcUrl)
  },
  connectors: [
    injected({
      shimDisconnect: true
    }),
    coinbaseWallet({ appName: 'Glass Gift Shop', preference: 'smartWalletOnly' })
  ]
});
