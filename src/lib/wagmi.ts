'use client';

import { createConfig, http } from 'wagmi';
import { baseSepolia, base } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';

const network = process.env.NEXT_PUBLIC_NETWORK ?? 'base-sepolia';
const chain = network === 'base' ? base : baseSepolia;
const rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL?.trim();

const transports = {
  [chain.id]: http(rpcUrl && rpcUrl.length > 0 ? rpcUrl : chain.rpcUrls.default.http[0])
} as Record<typeof chain.id, ReturnType<typeof http>>;

export const wagmiConfig = createConfig({
  chains: [chain],
  transports,
  connectors: [
    injected({ shimDisconnect: true }),
    coinbaseWallet({ appName: 'Glass Gift Shop', preference: 'smartWalletOnly' })
  ]
});
